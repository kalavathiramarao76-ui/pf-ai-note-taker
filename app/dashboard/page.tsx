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
    folderStructure: {
      root: {
        id: 'root',
        name: 'Root',
        children: [],
      },
    },
    noteSummaries: [],
    folderMap: new Map(),
  },
  reducers: {
    addFolder(state, action: PayloadAction<any>) {
      const folder = action.payload;
      state.folders.push(folder);
      state.folderMap.set(folder.id, folder);
      state.folderStructure.root.children.push(folder);
    },
    removeFolder(state, action: PayloadAction<any>) {
      const folderId = action.payload;
      state.folders = state.folders.filter((folder) => folder.id !== folderId);
      state.folderMap.delete(folderId);
      state.folderStructure.root.children = state.folderStructure.root.children.filter((folder) => folder.id !== folderId);
    },
    addNoteToFolder(state, action: PayloadAction<any>) {
      const { noteId, folderId } = action.payload;
      const folder = state.folderMap.get(folderId);
      if (folder) {
        folder.notes.push(noteId);
      }
    },
    removeNoteFromFolder(state, action: PayloadAction<any>) {
      const { noteId, folderId } = action.payload;
      const folder = state.folderMap.get(folderId);
      if (folder) {
        folder.notes = folder.notes.filter((id) => id !== noteId);
      }
    },
    addTagToFolder(state, action: PayloadAction<any>) {
      const { tag, folderId } = action.payload;
      const folder = state.folderMap.get(folderId);
      if (folder) {
        folder.tags.push(tag);
      }
    },
    removeTagFromFolder(state, action: PayloadAction<any>) {
      const { tag, folderId } = action.payload;
      const folder = state.folderMap.get(folderId);
      if (folder) {
        folder.tags = folder.tags.filter((t) => t !== tag);
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
  const { folders, folderMap, folderStructure } = useSelector((state: AppState) => state);

  useEffect(() => {
    // Initialize folder structure
    const rootFolder = folderStructure.root;
    rootFolder.children = folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      children: [],
    }));
  }, [folders, folderStructure]);

  const handleAddFolder = (folder) => {
    dispatch(appSlice.actions.addFolder(folder));
  };

  const handleRemoveFolder = (folderId) => {
    dispatch(appSlice.actions.removeFolder(folderId));
  };

  const handleAddNoteToFolder = (noteId, folderId) => {
    dispatch(appSlice.actions.addNoteToFolder({ noteId, folderId }));
  };

  const handleRemoveNoteFromFolder = (noteId, folderId) => {
    dispatch(appSlice.actions.removeNoteFromFolder({ noteId, folderId }));
  };

  const handleAddTagToFolder = (tag, folderId) => {
    dispatch(appSlice.actions.addTagToFolder({ tag, folderId }));
  };

  const handleRemoveTagFromFolder = (tag, folderId) => {
    dispatch(appSlice.actions.removeTagFromFolder({ tag, folderId }));
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={() => handleAddFolder({ id: 'new-folder', name: 'New Folder' })}>
        Add Folder
      </button>
      <ul>
        {folders.map((folder) => (
          <li key={folder.id}>
            {folder.name}
            <button onClick={() => handleRemoveFolder(folder.id)}>Remove</button>
            <ul>
              {folder.notes.map((noteId) => (
                <li key={noteId}>{noteId}</li>
              ))}
            </ul>
            <button onClick={() => handleAddNoteToFolder('new-note', folder.id)}>
              Add Note
            </button>
            <button onClick={() => handleRemoveNoteFromFolder('new-note', folder.id)}>
              Remove Note
            </button>
            <ul>
              {folder.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
            <button onClick={() => handleAddTagToFolder('new-tag', folder.id)}>
              Add Tag
            </button>
            <button onClick={() => handleRemoveTagFromFolder('new-tag', folder.id)}>
              Remove Tag
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <DashboardPage />
    </Provider>
  );
};

export default App;