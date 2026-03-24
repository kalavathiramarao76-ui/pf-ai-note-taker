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
  tagSuggestions: [], // suggestions for tag autocomplete
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
    case 'SET_TAG_INPUT':
      return { ...state, tagInput: action.tagInput };
    case 'SET_TAG_SUGGESTIONS':
      return { ...state, tagSuggestions: action.tagSuggestions };
    case 'ADD_TAG':
      return { ...state, tags: [...state.tags, action.tag], tagInput: '' };
    case 'REMOVE_TAG':
      return { ...state, tags: state.tags.filter(tag => tag !== action.tag) };
    case 'SET_NOTE_TAGS':
      return { ...state, noteTags: { ...state.noteTags, [action.noteId]: action.tags } };
    default:
      return state;
  }
};

const store = configureStore({
  reducer: appReducer,
  middleware: [thunk],
});

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { notes, tagInput, tagSuggestions, tags, noteTags } = useSelector(state => state);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      const response = await client.get('/notes');
      dispatch({ type: 'SET_NOTES', notes: response.data });
    };
    fetchNotes();
  }, []);

  const handleTagInput = (e) => {
    const input = e.target.value;
    dispatch({ type: 'SET_TAG_INPUT', tagInput: input });
    const suggestions = tags.filter(tag => tag.includes(input));
    dispatch({ type: 'SET_TAG_SUGGESTIONS', tagSuggestions: suggestions });
  };

  const handleAddTag = (tag) => {
    dispatch({ type: 'ADD_TAG', tag });
  };

  const handleRemoveTag = (tag) => {
    dispatch({ type: 'REMOVE_TAG', tag });
  };

  const handleNoteTagChange = (noteId, tags) => {
    dispatch({ type: 'SET_NOTE_TAGS', noteId, tags });
  };

  return (
    <Provider store={store}>
      <div>
        <h1>AutoNote: AI-Powered Note Taker</h1>
        <input type="text" value={tagInput} onChange={handleTagInput} placeholder="Enter a tag" />
        <ul>
          {tagSuggestions.map((suggestion, index) => (
            <li key={index}>
              <span>{suggestion}</span>
              <button onClick={() => handleAddTag(suggestion)}>Add</button>
            </li>
          ))}
        </ul>
        <ul>
          {tags.map((tag, index) => (
            <li key={index}>
              <span>{tag}</span>
              <button onClick={() => handleRemoveTag(tag)}>Remove</button>
            </li>
          ))}
        </ul>
        <div>
          {notes.map((note, index) => (
            <NoteCard key={index} note={note} tags={noteTags[note.id]} onChange={(tags) => handleNoteTagChange(note.id, tags)} />
          ))}
        </div>
      </div>
    </Provider>
  );
};

export default DashboardPage;