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
  versionHistory: {}, // store version history for each note
  collaborativeNotes: {}, // store collaborative notes
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
    case 'SET_VERSION_HISTORY':
      return { ...state, versionHistory: action.versionHistory };
    case 'SET_COLLABORATIVE_NOTES':
      return { ...state, collaborativeNotes: action.collaborativeNotes };
    case 'SET_COLLABORATIVE_EDITOR_STATE':
      return { ...state, collaborativeEditorState: action.collaborativeEditorState };
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
const socket = Socket('http://localhost:3001');

// Define the collaborative editor
const CollaborativeEditor = () => {
  const dispatch = useDispatch();
  const collaborativeEditorState = useSelector((state) => state.app.collaborativeEditorState);
  const noteId = useSelector((state) => state.app.editingNote);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to the server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from the server');
    });

    socket.on('collaborative-editor-state', (data) => {
      dispatch({ type: 'SET_COLLABORATIVE_EDITOR_STATE', collaborativeEditorState: data });
    });

    socket.on('conflict-resolution', (data) => {
      dispatch({ type: 'SET_CONFLICT_RESOLUTION', conflictResolution: data });
    });

    socket.on('real-time-collaboration', (data) => {
      dispatch({ type: 'SET_REAL_TIME_COLLABORATION', realTimeCollaboration: data });
    });
  }, []);

  const handleEditorChange = (editorState) => {
    dispatch({ type: 'SET_COLLABORATIVE_EDITOR_STATE', collaborativeEditorState: editorState });
    socket.emit('collaborative-editor-state', editorState);
  };

  return (
    <Editor
      editorState={collaborativeEditorState}
      onChange={handleEditorChange}
      placeholder="Type here..."
    />
  );
};

// Define the version history component
const VersionHistory = () => {
  const versionHistory = useSelector((state) => state.app.versionHistory);
  const noteId = useSelector((state) => state.app.editingNote);

  return (
    <div>
      <h2>Version History</h2>
      {versionHistory[noteId] && versionHistory[noteId].map((version, index) => (
        <div key={index}>
          <p>Version {index + 1}</p>
          <p>{version.content}</p>
        </div>
      ))}
    </div>
  );
};

// Define the real-time collaboration component
const RealTimeCollaboration = () => {
  const realTimeCollaboration = useSelector((state) => state.app.realTimeCollaboration);
  const noteId = useSelector((state) => state.app.editingNote);

  return (
    <div>
      <h2>Real-Time Collaboration</h2>
      {realTimeCollaboration[noteId] && realTimeCollaboration[noteId].map((collaborator, index) => (
        <div key={index}>
          <p>Collaborator {index + 1}</p>
          <p>{collaborator.name}</p>
        </div>
      ))}
    </div>
  );
};

// Define the note editing system
const NoteEditingSystem = () => {
  const dispatch = useDispatch();
  const editingNote = useSelector((state) => state.app.editingNote);
  const collaborativeEditorState = useSelector((state) => state.app.collaborativeEditorState);
  const versionHistory = useSelector((state) => state.app.versionHistory);
  const realTimeCollaboration = useSelector((state) => state.app.realTimeCollaboration);

  const handleSaveNote = () => {
    // Save the note to the database
    client.post('/notes', {
      title: editingNote.title,
      content: collaborativeEditorState,
    })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleVersionHistory = () => {
    // Get the version history from the database
    client.get(`/notes/${editingNote.id}/version-history`)
      .then((response) => {
        dispatch({ type: 'SET_VERSION_HISTORY', versionHistory: response.data });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleRealTimeCollaboration = () => {
    // Get the real-time collaboration data from the database
    client.get(`/notes/${editingNote.id}/real-time-collaboration`)
      .then((response) => {
        dispatch({ type: 'SET_REAL_TIME_COLLABORATION', realTimeCollaboration: response.data });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div>
      <h2>Note Editing System</h2>
      <CollaborativeEditor />
      <button onClick={handleSaveNote}>Save Note</button>
      <button onClick={handleVersionHistory}>Version History</button>
      <button onClick={handleRealTimeCollaboration}>Real-Time Collaboration</button>
      <VersionHistory />
      <RealTimeCollaboration />
    </div>
  );
};

// Define the dashboard page
const DashboardPage = () => {
  const dispatch = useDispatch();
  const notes = useSelector((state) => state.app.notes);
  const meetings = useSelector((state) => state.app.meetings);
  const templates = useSelector((state) => state.app.templates);

  return (
    <div>
      <h1>Dashboard</h1>
      <NoteEditingSystem />
      <NoteCard notes={notes} />
      <MeetingCard meetings={meetings} />
      <TemplateCard templates={templates} />
    </div>
  );
};

export default () => (
  <Provider store={store}>
    <DashboardPage />
  </Provider>
);