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
    collaborativeEditorState: {},
    noteVersions: {},
    conflictResolution: {},
    realTimeCollaboration: {},
    folderNotes: {},
    folderTags: {},
    versionHistory: {},
    collaborativeNotes: {},
    folderStructure: {},
    noteSummaries: [],
    folderMap: new Map(),
    draggedNote: null,
    draggedOverFolder: null,
    folderTree: [],
  },
  reducers: {
    addFolder(state, action: PayloadAction<any>) {
      state.folders.push(action.payload);
      state.folderMap.set(action.payload.id, action.payload);
    },
    removeFolder(state, action: PayloadAction<any>) {
      state.folders = state.folders.filter((folder) => folder.id !== action.payload.id);
      state.folderMap.delete(action.payload.id);
    },
    addNoteToFolder(state, action: PayloadAction<any>) {
      const folder = state.folderMap.get(action.payload.folderId);
      if (folder) {
        folder.notes.push(action.payload.note);
      }
    },
    removeNoteFromFolder(state, action: PayloadAction<any>) {
      const folder = state.folderMap.get(action.payload.folderId);
      if (folder) {
        folder.notes = folder.notes.filter((note) => note.id !== action.payload.noteId);
      }
    },
    addTagToNote(state, action: PayloadAction<any>) {
      const note = state.notes.get(action.payload.noteId);
      if (note) {
        note.tags.push(action.payload.tag);
      }
    },
    removeTagFromNote(state, action: PayloadAction<any>) {
      const note = state.notes.get(action.payload.noteId);
      if (note) {
        note.tags = note.tags.filter((tag) => tag !== action.payload.tag);
      }
    },
    updateFolderTree(state, action: PayloadAction<any>) {
      state.folderTree = action.payload;
    },
  },
});

const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
  middleware: [thunk],
});

function DashboardPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folderTree, setFolderTree] = useState([]);
  const [notes, setNotes] = useState(new Map());
  const [folders, setFolders] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [noteTags, setNoteTags] = useState({});

  useEffect(() => {
    const fetchNotes = async () => {
      const response = await client.get('/notes');
      setNotes(new Map(response.data));
    };
    fetchNotes();
  }, []);

  useEffect(() => {
    const fetchFolders = async () => {
      const response = await client.get('/folders');
      setFolders(response.data);
    };
    fetchFolders();
  }, []);

  useEffect(() => {
    const fetchTags = async () => {
      const response = await client.get('/tags');
      setTags(response.data);
    };
    fetchTags();
  }, []);

  const handleCreateFolder = async () => {
    const response = await client.post('/folders', { name: newFolderName });
    dispatch(appSlice.actions.addFolder(response.data));
    setIsCreatingFolder(false);
    setNewFolderName('');
  };

  const handleCreateNote = async () => {
    const response = await client.post('/notes', { title: newNoteTitle, content: newNoteContent });
    dispatch(appSlice.actions.addNoteToFolder({ folderId: selectedFolder.id, note: response.data }));
    setIsCreatingNote(false);
    setNewNoteTitle('');
    setNewNoteContent('');
  };

  const handleAddTagToNote = async (noteId, tag) => {
    await client.post(`/notes/${noteId}/tags`, { tag });
    dispatch(appSlice.actions.addTagToNote({ noteId, tag }));
  };

  const handleRemoveTagFromNote = async (noteId, tag) => {
    await client.delete(`/notes/${noteId}/tags/${tag}`);
    dispatch(appSlice.actions.removeTagFromNote({ noteId, tag }));
  };

  const handleUpdateFolderTree = async () => {
    const response = await client.get('/folders/tree');
    dispatch(appSlice.actions.updateFolderTree(response.data));
    setFolderTree(response.data);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="dashboard-page">
        <h1>AutoNote: AI-Powered Note Taker</h1>
        <div className="folder-tree">
          {folderTree.map((folder) => (
            <div key={folder.id} className="folder">
              <span>{folder.name}</span>
              <ul>
                {folder.notes.map((note) => (
                  <li key={note.id}>
                    <NoteCard note={note} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="note-list">
          {notes.size > 0 ? (
            Array.from(notes.values()).map((note) => (
              <NoteCard key={note.id} note={note} />
            ))
          ) : (
            <p>No notes found.</p>
          )}
        </div>
        <div className="create-folder">
          {isCreatingFolder ? (
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name"
            />
          ) : (
            <button onClick={() => setIsCreatingFolder(true)}>Create Folder</button>
          )}
          {isCreatingFolder && (
            <button onClick={handleCreateFolder}>Create</button>
          )}
        </div>
        <div className="create-note">
          {isCreatingNote ? (
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="Enter note title"
            />
          ) : (
            <button onClick={() => setIsCreatingNote(true)}>Create Note</button>
          )}
          {isCreatingNote && (
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Enter note content"
            />
          )}
          {isCreatingNote && (
            <button onClick={handleCreateNote}>Create</button>
          )}
        </div>
        <div className="tag-list">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="selected-tags">
          {selectedTags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="note-tags">
          {noteTags && Object.keys(noteTags).map((noteId) => (
            <div key={noteId}>
              <span>{noteId}</span>
              <ul>
                {noteTags[noteId].map((tag) => (
                  <li key={tag}>
                    <span>{tag}</span>
                    <button onClick={() => handleRemoveTagFromNote(noteId, tag)}>Remove</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </DndProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <DashboardPage />
    </Provider>
  );
}