import client from '../client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AiOutlinePlus } from 'react-icons/ai';
import Link from 'next/link';
import NoteCard from '../components/NoteCard';
import MeetingCard from '../components/MeetingCard';
import TemplateCard from '../components/TemplateCard';
import { Editor, EditorState, ContentState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { configureStore } from '@reduxjs/toolkit';
import { Provider, useSelector, useDispatch } from 'react-redux';
import thunk from 'redux-thunk';

// Define the initial state
const initialState = {
  notes: [],
  meetings: [],
  templates: [],
  searchQuery: '',
  generatedNotes: [],
  folders: [],
  selectedFolder: null,
  editingNote: null,
  sortedNotes: [],
  sortedMeetings: [],
  sortedTemplates: [],
  filterType: 'all',
  sortBy: 'title',
  sortOrder: 'asc',
  filterByTags: [],
  filterByDate: '',
  aiSuggestions: [],
  autocompleteSuggestions: [],
  priority: 'all',
  deadline: '',
  noteTitle: '',
  noteContent: '',
  isGeneratingNote: false,
  editorState: EditorState.createWithContent(ContentState.createFromText('')),
  quickNote: '',
  isQuickNoteOpen: false,
  tags: [],
  selectedTags: [],
  noteTags: {}, // store tags for each note
  tagInput: '', // input for tag autocomplete
};

// Define the reducer
const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_NOTES':
      return { ...state, notes: action.notes };
    case 'SET_MEETINGS':
      return { ...state, meetings: action.meetings };
    case 'SET_TEMPLATES':
      return { ...state, templates: action.templates };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.searchQuery };
    case 'SET_GENERATED_NOTES':
      return { ...state, generatedNotes: action.generatedNotes };
    case 'SET_FOLDERS':
      return { ...state, folders: action.folders };
    case 'SET_SELECTED_FOLDER':
      return { ...state, selectedFolder: action.selectedFolder };
    case 'SET_EDITING_NOTE':
      return { ...state, editingNote: action.editingNote };
    case 'SET_SORTED_NOTES':
      return { ...state, sortedNotes: action.sortedNotes };
    case 'SET_SORTED_MEETINGS':
      return { ...state, sortedMeetings: action.sortedMeetings };
    case 'SET_SORTED_TEMPLATES':
      return { ...state, sortedTemplates: action.sortedTemplates };
    case 'SET_FILTER_TYPE':
      return { ...state, filterType: action.filterType };
    case 'SET_SORT_BY':
      return { ...state, sortBy: action.sortBy };
    case 'SET_SORT_ORDER':
      return { ...state, sortOrder: action.sortOrder };
    case 'SET_FILTER_BY_TAGS':
      return { ...state, filterByTags: action.filterByTags };
    case 'SET_FILTER_BY_DATE':
      return { ...state, filterByDate: action.filterByDate };
    case 'SET_AI_SUGGESTIONS':
      return { ...state, aiSuggestions: action.aiSuggestions };
    case 'SET_AUTOCOMPLETE_SUGGESTIONS':
      return { ...state, autocompleteSuggestions: action.autocompleteSuggestions };
    case 'SET_TAGS':
      return { ...state, tags: action.tags };
    case 'SET_SELECTED_TAGS':
      return { ...state, selectedTags: action.selectedTags };
    case 'SET_NOTE_TAGS':
      return { ...state, noteTags: action.noteTags };
    case 'SET_TAG_INPUT':
      return { ...state, tagInput: action.tagInput };
    default:
      return state;
  }
};

// Create the store
const store = configureStore({
  reducer: {
    app: appReducer,
  },
  middleware: [thunk],
});

// Define the page component
const Page = () => {
  const dispatch = useDispatch();
  const { notes, tags, selectedTags, noteTags, tagInput } = useSelector((state) => state.app);
  const [tagSuggestions, setTagSuggestions] = useState([]);

  useEffect(() => {
    const suggestions = tags.filter((tag) => tag.includes(tagInput));
    setTagSuggestions(suggestions);
  }, [tagInput, tags]);

  const handleTagInput = (e) => {
    dispatch({ type: 'SET_TAG_INPUT', tagInput: e.target.value });
  };

  const handleTagSelect = (tag) => {
    dispatch({ type: 'SET_SELECTED_TAGS', selectedTags: [...selectedTags, tag] });
    dispatch({ type: 'SET_TAG_INPUT', tagInput: '' });
  };

  const handleNoteTagAdd = (noteId, tag) => {
    const newNoteTags = { ...noteTags };
    if (!newNoteTags[noteId]) {
      newNoteTags[noteId] = [];
    }
    newNoteTags[noteId].push(tag);
    dispatch({ type: 'SET_NOTE_TAGS', noteTags: newNoteTags });
  };

  return (
    <div>
      <h1>AutoNote: AI-Powered Note Taker</h1>
      <input
        type="text"
        value={tagInput}
        onChange={handleTagInput}
        placeholder="Add tag"
      />
      <ul>
        {tagSuggestions.map((suggestion) => (
          <li key={suggestion} onClick={() => handleTagSelect(suggestion)}>
            {suggestion}
          </li>
        ))}
      </ul>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <NoteCard note={note} />
            <input
              type="text"
              value={tagInput}
              onChange={handleTagInput}
              placeholder="Add tag to note"
            />
            <ul>
              {tagSuggestions.map((suggestion) => (
                <li key={suggestion} onClick={() => handleNoteTagAdd(note.id, suggestion)}>
                  {suggestion}
                </li>
              ))}
            </ul>
            <ul>
              {noteTags[note.id] && noteTags[note.id].map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Render the page component with the store
const App = () => {
  return (
    <Provider store={store}>
      <Page />
    </Provider>
  );
};

export default App;