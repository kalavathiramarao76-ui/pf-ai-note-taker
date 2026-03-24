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
    case 'SET_FILTER_BY_DATE':
      return { ...state, filterByDate: action.filterByDate };
    case 'SET_AI_SUGGESTIONS':
      return { ...state, aiSuggestions: action.aiSuggestions };
    case 'SET_SOCKET':
      return { ...state, socket: action.socket };
    case 'SET_COLLABORATORS':
      return { ...state, collaborators: action.collaborators };
    case 'SET_COLLABORATIVE_EDITOR_STATE':
      return { ...state, collaborativeEditorState: action.collaborativeEditorState };
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

// Create a socket connection
const socket = new Socket('http://localhost:3001');

// Set up socket event listeners
socket.on('connect', () => {
  console.log('Connected to the server');
});

socket.on('collaborative-editing', (data) => {
  const { noteId, editorState } = data;
  store.dispatch({
    type: 'SET_COLLABORATIVE_EDITOR_STATE',
    collaborativeEditorState: { ...store.getState().collaborativeEditorState, [noteId]: editorState },
  });
});

socket.on('collaborators', (data) => {
  const { noteId, collaborators } = data;
  store.dispatch({
    type: 'SET_COLLABORATORS',
    collaborators: { ...store.getState().collaborators, [noteId]: collaborators },
  });
});

// Set up the store and socket in the component
const DashboardPage = () => {
  const dispatch = useDispatch();
  const { editingNote, collaborativeEditorState, collaborators } = useSelector((state) => state.app);
  const [editorState, setEditorState] = useState(EditorState.createWithContent(ContentState.createFromText('')));

  useEffect(() => {
    dispatch({
      type: 'SET_SOCKET',
      socket: socket,
    });
  }, [dispatch, socket]);

  useEffect(() => {
    if (editingNote) {
      socket.emit('join-collaborative-editing', editingNote.id);
    }
  }, [editingNote, socket]);

  const handleEditorChange = (newEditorState) => {
    setEditorState(newEditorState);
    if (editingNote) {
      socket.emit('collaborative-editing', { noteId: editingNote.id, editorState: newEditorState });
    }
  };

  return (
    <div>
      {editingNote && (
        <Editor
          editorState={collaborativeEditorState[editingNote.id] || editorState}
          onChange={handleEditorChange}
        />
      )}
      {/* Rest of the component remains the same */}
    </div>
  );
};

export default () => (
  <Provider store={store}>
    <DashboardPage />
  </Provider>
);