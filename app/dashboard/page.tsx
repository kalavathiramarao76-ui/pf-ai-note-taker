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
  tagFilter: string;
  folderName: string;
  newFolderName: string;
  isFolderOpen: boolean;
  folderId: string;
  folderTags: any[];
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
    noteTagMap: new Map(),
    suggestedTags: [],
    filteredNotes: [],
    folderNotesMap: new Map(),
    noteFolderMap: new Map(),
    tagFilter: '',
    folderName: '',
    newFolderName: '',
    isFolderOpen: false,
    folderId: '',
    folderTags: [],
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
      }
    },
    removeNoteFromFolder(state, action: PayloadAction<{ noteId: string; folderId: string }>) {
      const folder = state.folders.find((folder) => folder.id === action.payload.folderId);
      if (folder) {
        folder.notes = folder.notes.filter((noteId) => noteId !== action.payload.noteId);
      }
    },
    addTagToFolder(state, action: PayloadAction<{ folderId: string; tag: string }>) {
      const folder = state.folders.find((folder) => folder.id === action.payload.folderId);
      if (folder) {
        folder.tags = folder.tags || [];
        folder.tags.push(action.payload.tag);
      }
    },
    removeTagFromFolder(state, action: PayloadAction<{ folderId: string; tag: string }>) {
      const folder = state.folders.find((folder) => folder.id === action.payload.folderId);
      if (folder) {
        folder.tags = folder.tags.filter((tag) => tag !== action.payload.tag);
      }
    },
  },
});

const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
  middleware: [thunk],
});

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { folders, selectedFolder, editingNote, notes, tags } = useSelector((state: AppState) => state);
  const [folderName, setFolderName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [folderId, setFolderId] = useState('');
  const [folderTags, setFolderTags] = useState([]);

  useEffect(() => {
    if (selectedFolder) {
      setFolderId(selectedFolder.id);
      setFolderTags(selectedFolder.tags || []);
    }
  }, [selectedFolder]);

  const handleAddFolder = () => {
    dispatch(appSlice.actions.addFolder(folderName));
    setFolderName('');
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

  const handleAddTagToFolder = (folderId: string, tag: string) => {
    dispatch(appSlice.actions.addTagToFolder({ folderId, tag }));
  };

  const handleRemoveTagFromFolder = (folderId: string, tag: string) => {
    dispatch(appSlice.actions.removeTagFromFolder({ folderId, tag }));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h1>AutoNote: AI-Powered Note Taker</h1>
        <div>
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Enter folder name"
          />
          <button onClick={handleAddFolder}>Add Folder</button>
        </div>
        <div>
          {folders.map((folder) => (
            <div key={folder.id}>
              <h2>{folder.name}</h2>
              <button onClick={() => handleRemoveFolder(folder.id)}>Remove Folder</button>
              <ul>
                {folder.notes.map((noteId) => (
                  <li key={noteId}>
                    <NoteCard noteId={noteId} />
                    <button onClick={() => handleRemoveNoteFromFolder(noteId, folder.id)}>Remove Note</button>
                  </li>
                ))}
              </ul>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter note name"
              />
              <button onClick={() => handleAddNoteToFolder(newFolderName, folder.id)}>Add Note</button>
              <ul>
                {folder.tags.map((tag) => (
                  <li key={tag}>
                    <span>{tag}</span>
                    <button onClick={() => handleRemoveTagFromFolder(folder.id, tag)}>Remove Tag</button>
                  </li>
                ))}
              </ul>
              <input
                type="text"
                value={folderTags.join(', ')}
                onChange={(e) => setFolderTags(e.target.value.split(', '))}
                placeholder="Enter tags"
              />
              <button onClick={() => handleAddTagToFolder(folder.id, folderTags.join(', '))}>Add Tag</button>
            </div>
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default DashboardPage;