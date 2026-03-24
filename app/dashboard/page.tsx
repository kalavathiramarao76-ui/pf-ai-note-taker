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
import { Socket } from 'socket.io-client';

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
  socket: null,
  collaborators: [], // store collaborators for each note
  collaborativeEditorState: {}, // store collaborative editor state for each note
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
    case 'SET_TAG_INPUT':
      return { ...state, tagInput: action.tagInput };
    case 'SET_TAG_SUGGESTIONS':
      return { ...state, tagSuggestions: action.tagSuggestions };
    case 'ADD_TAG':
      return { ...state, tags: [...state.tags, action.tag] };
    case 'REMOVE_TAG':
      return { ...state, tags: state.tags.filter(tag => tag !== action.tag) };
    case 'SET_SELECTED_TAGS':
      return { ...state, selectedTags: action.selectedTags };
    case 'SET_NOTE_TAGS':
      return { ...state, noteTags: { ...state.noteTags, [action.noteId]: action.tags } };
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

// Define the Dashboard page
const Dashboard = () => {
  const dispatch = useDispatch();
  const { notes, filterByTags, tagInput, tagSuggestions, selectedTags, noteTags } = useSelector(state => state.app);
  const [tagInputValue, setTagInputValue] = useState('');

  // Handle tag input change
  const handleTagInputChange = (e) => {
    setTagInputValue(e.target.value);
    dispatch({ type: 'SET_TAG_INPUT', tagInput: e.target.value });
    const suggestions = notes.reduce((acc, note) => {
      if (noteTags[note.id]) {
        return [...acc, ...noteTags[note.id].filter(tag => tag.includes(e.target.value))];
      }
      return acc;
    }, []);
    dispatch({ type: 'SET_TAG_SUGGESTIONS', tagSuggestions: [...new Set(suggestions)] });
  };

  // Handle tag selection
  const handleTagSelect = (tag) => {
    dispatch({ type: 'ADD_TAG', tag });
    dispatch({ type: 'SET_SELECTED_TAGS', selectedTags: [...selectedTags, tag] });
    dispatch({ type: 'SET_FILTER_BY_TAGS', filterByTags: [...filterByTags, tag] });
  };

  // Handle tag removal
  const handleTagRemove = (tag) => {
    dispatch({ type: 'REMOVE_TAG', tag });
    dispatch({ type: 'SET_SELECTED_TAGS', selectedTags: selectedTags.filter(t => t !== tag) });
    dispatch({ type: 'SET_FILTER_BY_TAGS', filterByTags: filterByTags.filter(t => t !== tag) });
  };

  // Filter notes by tags
  const filteredNotes = notes.filter(note => {
    if (filterByTags.length === 0) return true;
    if (!noteTags[note.id]) return false;
    return filterByTags.every(tag => noteTags[note.id].includes(tag));
  });

  return (
    <div>
      <h1>Dashboard</h1>
      <input
        type="text"
        value={tagInputValue}
        onChange={handleTagInputChange}
        placeholder="Search tags"
      />
      <ul>
        {tagSuggestions.map((suggestion, index) => (
          <li key={index}>
            <button onClick={() => handleTagSelect(suggestion)}>{suggestion}</button>
          </li>
        ))}
      </ul>
      <ul>
        {selectedTags.map((tag, index) => (
          <li key={index}>
            <button onClick={() => handleTagRemove(tag)}>{tag}</button>
          </li>
        ))}
      </ul>
      <h2>Notes</h2>
      <ul>
        {filteredNotes.map((note, index) => (
          <li key={index}>
            <NoteCard note={note} />
          </li>
        ))}
      </ul>
    </div>
  );
};

// Render the Dashboard page
const App = () => {
  return (
    <Provider store={store}>
      <Dashboard />
    </Provider>
  );
};

export default App;