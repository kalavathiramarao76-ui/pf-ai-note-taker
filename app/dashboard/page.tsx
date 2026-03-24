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
    case 'SET_PRIORITY':
      return { ...state, priority: action.priority };
    case 'SET_DEADLINE':
      return { ...state, deadline: action.deadline };
    case 'SET_NOTE_TITLE':
      return { ...state, noteTitle: action.noteTitle };
    case 'SET_NOTE_CONTENT':
      return { ...state, noteContent: action.noteContent };
    case 'SET_IS_GENERATING_NOTE':
      return { ...state, isGeneratingNote: action.isGeneratingNote };
    case 'SET_EDITOR_STATE':
      return { ...state, editorState: action.editorState };
    case 'SET_QUICK_NOTE':
      return { ...state, quickNote: action.quickNote };
    case 'SET_IS_QUICK_NOTE_OPEN':
      return { ...state, isQuickNoteOpen: action.isQuickNoteOpen };
    case 'SET_TAGS':
      return { ...state, tags: action.tags };
    case 'SET_SELECTED_TAGS':
      return { ...state, selectedTags: action.selectedTags };
    case 'SET_NOTE_TAGS':
      return { ...state, noteTags: action.noteTags };
    case 'SET_TAG_INPUT':
      return { ...state, tagInput: action.tagInput };
    case 'SET_TAG_SUGGESTIONS':
      return { ...state, tagSuggestions: action.tagSuggestions };
    case 'SET_SOCKET':
      return { ...state, socket: action.socket };
    case 'SET_COLLABORATORS':
      return { ...state, collaborators: action.collaborators };
    case 'SET_COLLABORATIVE_EDITOR_STATE':
      return { ...state, collaborativeEditorState: action.collaborativeEditorState };
    case 'SET_NOTE_VERSIONS':
      return { ...state, noteVersions: action.noteVersions };
    case 'SET_CONFLICT_RESOLUTION':
      return { ...state, conflictResolution: action.conflictResolution };
    case 'SET_REAL_TIME_COLLABORATION':
      return { ...state, realTimeCollaboration: action.realTimeCollaboration };
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

// Define the socket connection
const socket = io.connect('http://localhost:3001');

// Define the real-time collaboration functionality
const handleRealTimeCollaboration = (noteId, userId, editorState) => {
  socket.emit('real-time-collaboration', { noteId, userId, editorState });
};

// Define the conflict resolution functionality
const handleConflictResolution = (noteId, userId, editorState) => {
  socket.emit('conflict-resolution', { noteId, userId, editorState });
};

// Define the note editing system with real-time collaboration and conflict resolution
const NoteEditingSystem = () => {
  const dispatch = useDispatch();
  const { editingNote, collaborativeEditorState, realTimeCollaboration } = useSelector((state) => state.app);
  const [editorState, setEditorState] = useState(EditorState.createWithContent(ContentState.createFromText('')));

  useEffect(() => {
    if (editingNote) {
      setEditorState(collaborativeEditorState[editingNote.id]);
    }
  }, [editingNote, collaborativeEditorState]);

  const handleEditorStateChange = (newEditorState) => {
    setEditorState(newEditorState);
    handleRealTimeCollaboration(editingNote.id, 'user1', newEditorState);
  };

  const handleConflictResolutionChange = (newEditorState) => {
    setEditorState(newEditorState);
    handleConflictResolution(editingNote.id, 'user1', newEditorState);
  };

  return (
    <div>
      <Editor
        editorState={editorState}
        onChange={handleEditorStateChange}
        placeholder="Type here..."
      />
      <button onClick={handleConflictResolutionChange}>Resolve Conflict</button>
    </div>
  );
};

// Define the dashboard page
const DashboardPage = () => {
  const dispatch = useDispatch();
  const { notes, meetings, templates, searchQuery, folders, selectedFolder, editingNote } = useSelector((state) => state.app);

  return (
    <div>
      <h1>Dashboard</h1>
      <NoteCard notes={notes} />
      <MeetingCard meetings={meetings} />
      <TemplateCard templates={templates} />
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', searchQuery: e.target.value })}
        placeholder="Search..."
      />
      <select
        value={selectedFolder}
        onChange={(e) => dispatch({ type: 'SET_SELECTED_FOLDER', selectedFolder: e.target.value })}
      >
        {folders.map((folder) => (
          <option key={folder.id} value={folder.id}>
            {folder.name}
          </option>
        ))}
      </select>
      {editingNote && <NoteEditingSystem />}
    </div>
  );
};

// Render the dashboard page
const App = () => {
  return (
    <Provider store={store}>
      <DashboardPage />
    </Provider>
  );
};

export default App;