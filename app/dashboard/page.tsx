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
  noteVersions: {}, // store versions of each note
  conflictResolution: {}, // store conflict resolution data for each note
  realTimeCollaboration: {}, // store real-time collaboration data for each note
  folderNotes: {}, // store notes for each folder
  folderTags: {}, // store tags for each folder
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
    case 'SET_TAG_INPUT':
      return { ...state, tagInput: action.tagInput };
    case 'SET_TAG_SUGGESTIONS':
      return { ...state, tagSuggestions: action.tagSuggestions };
    case 'ADD_TAG':
      return { ...state, tags: [...state.tags, action.tag], noteTags: { ...state.noteTags, [action.noteId]: [...(state.noteTags[action.noteId] || []), action.tag] } };
    case 'REMOVE_TAG':
      return { ...state, tags: state.tags.filter(tag => tag !== action.tag), noteTags: { ...state.noteTags, [action.noteId]: (state.noteTags[action.noteId] || []).filter(tag => tag !== action.tag) } };
    case 'SET_FILTER_BY_TAGS':
      return { ...state, filterByTags: action.tags };
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
  const { notes, tagInput, tagSuggestions, filterByTags } = useSelector((state) => state.app);
  const [isTagInputFocused, setIsTagInputFocused] = useState(false);

  // Handle tag input change
  const handleTagInputChange = (e) => {
    const tagInput = e.target.value;
    dispatch({ type: 'SET_TAG_INPUT', tagInput });
    const tagSuggestions = notes.reduce((acc, note) => {
      const noteTags = note.tags || [];
      return [...acc, ...noteTags.filter(tag => tag.startsWith(tagInput))].filter((tag, index, self) => self.indexOf(tag) === index);
    }, []);
    dispatch({ type: 'SET_TAG_SUGGESTIONS', tagSuggestions });
  };

  // Handle tag suggestion click
  const handleTagSuggestionClick = (tag) => {
    dispatch({ type: 'ADD_TAG', tag, noteId: notes[0].id });
  };

  // Handle filter by tags change
  const handleFilterByTagsChange = (tags) => {
    dispatch({ type: 'SET_FILTER_BY_TAGS', tags });
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <input
        type="text"
        value={tagInput}
        onChange={handleTagInputChange}
        placeholder="Enter a tag"
        onFocus={() => setIsTagInputFocused(true)}
        onBlur={() => setIsTagInputFocused(false)}
      />
      {isTagInputFocused && tagSuggestions.length > 0 && (
        <ul>
          {tagSuggestions.map((tag) => (
            <li key={tag} onClick={() => handleTagSuggestionClick(tag)}>
              {tag}
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => handleFilterByTagsChange(filterByTags)}>Filter by tags</button>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
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