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
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableNoteCard } from '../components/DraggableNoteCard';

// Define the initial state
interface AppState {
  notes: Map<string, any>;
  meetings: Map<string, any>;
  templates: Map<string, any>;
  searchQuery: string;
  generatedNotes: any[];
  folders: any[];
  selectedFolder: any;
  editingNote: any;
  sortedNotes: any[];
  sortedMeetings: any[];
  sortedTemplates: any[];
  filterType: string;
  sortBy: string;
  sortOrder: string;
  filterByTags: any[];
  filterByDate: string;
  aiSuggestions: any[];
  autocompleteSuggestions: any[];
  priority: string;
  deadline: string;
  noteTitle: string;
  noteContent: string;
  isGeneratingNote: boolean;
  editorState: EditorState;
  quickNote: string;
  isQuickNoteOpen: boolean;
  tags: any[];
  selectedTags: any[];
  noteTags: any;
  tagInput: string;
  tagSuggestions: any[];
  socket: Socket | null;
  collaborators: any[];
  collaborativeEditorState: any;
  noteVersions: any;
  conflictResolution: any;
  realTimeCollaboration: any;
  folderNotes: any;
  folderTags: any;
  versionHistory: any;
  collaborativeNotes: any;
  folderStructure: any;
  noteSummaries: any[];
  folderMap: Map<string, any>;
  draggedNote: any;
  draggedOverFolder: any;
  folderTree: any[];
  noteTagMap: Map<string, string[]>;
  suggestedTags: any[];
  filteredNotes: any[];
  folderNotesMap: Map<string, any[]>;
  noteFolderMap: Map<string, string>;
}

// Define the reducer using createSlice
const appSlice = createSlice({
  name: 'app',
  initialState: {
    notes: new Map(),
    meetings: new Map(),
    templates: new Map(),
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
    noteTags: {},
    tagInput: '',
    tagSuggestions: [],
    socket: null,
    collaborators: [],
    collaborativeEditorState: null,
    noteVersions: null,
    conflictResolution: null,
    realTimeCollaboration: null,
    folderNotes: null,
    folderTags: null,
    versionHistory: null,
    collaborativeNotes: null,
    folderStructure: null,
    noteSummaries: [],
    folderMap: new Map(),
    draggedNote: null,
    draggedOverFolder: null,
    folderTree: [],
    noteTagMap: new Map(),
    suggestedTags: [],
    filteredNotes: [],
    folderNotesMap: new Map(),
    noteFolderMap: new Map(),
  },
  reducers: {
    addFolder(state, action: PayloadAction<string>) {
      state.folders.push({ id: action.payload, name: action.payload, notes: [] });
    },
    removeFolder(state, action: PayloadAction<string>) {
      state.folders = state.folders.filter((folder) => folder.id !== action.payload);
    },
    addNoteToFolder(state, action: PayloadAction<{ noteId: string; folderId: string }>) {
      const folder = state.folders.find((folder) => folder.id === action.payload.folderId);
      if (folder) {
        folder.notes.push(action.payload.noteId);
        state.folderNotesMap.set(action.payload.folderId, folder.notes);
        state.noteFolderMap.set(action.payload.noteId, action.payload.folderId);
      }
    },
    removeNoteFromFolder(state, action: PayloadAction<{ noteId: string; folderId: string }>) {
      const folder = state.folders.find((folder) => folder.id === action.payload.folderId);
      if (folder) {
        folder.notes = folder.notes.filter((noteId) => noteId !== action.payload.noteId);
        state.folderNotesMap.set(action.payload.folderId, folder.notes);
        state.noteFolderMap.delete(action.payload.noteId);
      }
    },
    addTagToNote(state, action: PayloadAction<{ noteId: string; tag: string }>) {
      const noteTags = state.noteTags[action.payload.noteId];
      if (noteTags) {
        noteTags.push(action.payload.tag);
      } else {
        state.noteTags[action.payload.noteId] = [action.payload.tag];
      }
      state.noteTagMap.set(action.payload.noteId, state.noteTags[action.payload.noteId]);
    },
    removeTagFromNote(state, action: PayloadAction<{ noteId: string; tag: string }>) {
      const noteTags = state.noteTags[action.payload.noteId];
      if (noteTags) {
        state.noteTags[action.payload.noteId] = noteTags.filter((tag) => tag !== action.payload.tag);
        state.noteTagMap.set(action.payload.noteId, state.noteTags[action.payload.noteId]);
      }
    },
  },
});

// Create the store
const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
  middleware: [thunk],
});

// Define the dashboard page component
function DashboardPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [editorState, setEditorState] = useState(EditorState.createWithContent(ContentState.createFromText('')));
  const [quickNote, setQuickNote] = useState('');
  const [isQuickNoteOpen, setIsQuickNoteOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [folderNotesMap, setFolderNotesMap] = useState(new Map());
  const [noteFolderMap, setNoteFolderMap] = useState(new Map());

  // Get the state from the store
  const state = useSelector((state: any) => state.app);

  // Handle folder and note operations
  const handleAddFolder = (folderName: string) => {
    dispatch(appSlice.actions.addFolder(folderName));
  };

  const handleRemoveFolder = (folderId: string) => {
    dispatch(appSlice.actions.removeFolder(folderId));
  };

  const handleAddNoteToFolder = (noteId: string, folderId: string) => {
    dispatch(appSlice.actions.addNoteToFolder({ noteId, folderId }));
  };

  const handleRemoveNoteFromFolder = (noteId: string, folderId: string) => {
    dispatch(appSlice.actions.removeNoteFromFolder({ noteId, folderId }));
  };

  const handleAddTagToNote = (noteId: string, tag: string) => {
    dispatch(appSlice.actions.addTagToNote({ noteId, tag }));
  };

  const handleRemoveTagFromNote = (noteId: string, tag: string) => {
    dispatch(appSlice.actions.removeTagFromNote({ noteId, tag }));
  };

  // Render the dashboard page
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="dashboard-page">
        <div className="folder-list">
          {state.folders.map((folder: any) => (
            <div key={folder.id} className="folder">
              <span>{folder.name}</span>
              <button onClick={() => handleRemoveFolder(folder.id)}>Remove</button>
            </div>
          ))}
          <button onClick={() => handleAddFolder('New Folder')}>Add Folder</button>
        </div>
        <div className="note-list">
          {state.notes.size > 0 ? (
            Array.from(state.notes.values()).map((note: any) => (
              <NoteCard key={note.id} note={note} />
            ))
          ) : (
            <p>No notes found.</p>
          )}
        </div>
        <div className="tag-list">
          {state.tags.map((tag: any) => (
            <div key={tag} className="tag">
              <span>{tag}</span>
              <button onClick={() => handleRemoveTagFromNote(note.id, tag)}>Remove</button>
            </div>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add tag"
          />
          <button onClick={() => handleAddTagToNote(note.id, tagInput)}>Add Tag</button>
        </div>
        <div className="quick-note">
          <input
            type="text"
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            placeholder="Quick note"
          />
          <button onClick={() => setIsQuickNoteOpen(true)}>Open Quick Note</button>
          {isQuickNoteOpen && (
            <div className="quick-note-editor">
              <Editor editorState={editorState} onChange={setEditorState} />
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
}

// Render the dashboard page with the store
function App() {
  return (
    <Provider store={store}>
      <DashboardPage />
    </Provider>
  );
}

export default App;