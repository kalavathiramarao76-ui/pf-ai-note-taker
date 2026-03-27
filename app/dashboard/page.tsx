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
  subfolders: any[];
  folderTagsMap: Map<string, string[]>;
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
    editorState: EditorState.createEmpty(),
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
    subfolders: [],
    folderTagsMap: new Map(),
  },
  reducers: {
    addFolder(state, action: PayloadAction<any>) {
      state.folders.push(action.payload);
    },
    removeFolder(state, action: PayloadAction<string>) {
      state.folders = state.folders.filter((folder) => folder.id !== action.payload);
    },
    addSubfolder(state, action: PayloadAction<any>) {
      const folder = state.folders.find((folder) => folder.id === action.payload.folderId);
      if (folder) {
        folder.subfolders.push(action.payload.subfolder);
      }
    },
    removeSubfolder(state, action: PayloadAction<any>) {
      const folder = state.folders.find((folder) => folder.id === action.payload.folderId);
      if (folder) {
        folder.subfolders = folder.subfolders.filter((subfolder) => subfolder.id !== action.payload.subfolderId);
      }
    },
    addTagToFolder(state, action: PayloadAction<any>) {
      const folder = state.folders.find((folder) => folder.id === action.payload.folderId);
      if (folder) {
        folder.tags.push(action.payload.tag);
      }
    },
    removeTagFromFolder(state, action: PayloadAction<any>) {
      const folder = state.folders.find((folder) => folder.id === action.payload.folderId);
      if (folder) {
        folder.tags = folder.tags.filter((tag) => tag !== action.payload.tag);
      }
    },
    addNoteToFolder(state, action: PayloadAction<any>) {
      const folder = state.folders.find((folder) => folder.id === action.payload.folderId);
      if (folder) {
        folder.notes.push(action.payload.note);
      }
    },
    removeNoteFromFolder(state, action: PayloadAction<any>) {
      const folder = state.folders.find((folder) => folder.id === action.payload.folderId);
      if (folder) {
        folder.notes = folder.notes.filter((note) => note.id !== action.payload.noteId);
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
  const { folders, selectedFolder, notes, folderNotesMap, folderTagsMap } = useSelector((state: AppState) => state);

  useEffect(() => {
    // Initialize folders and notes
    const initializeData = async () => {
      const response = await client.get('/api/folders');
      const foldersData = response.data;
      dispatch(appSlice.actions.addFolder(foldersData));
    };
    initializeData();
  }, []);

  const handleAddFolder = (folderName: string) => {
    const newFolder = { id: Math.random().toString(), name: folderName, notes: [], tags: [] };
    dispatch(appSlice.actions.addFolder(newFolder));
  };

  const handleRemoveFolder = (folderId: string) => {
    dispatch(appSlice.actions.removeFolder(folderId));
  };

  const handleAddSubfolder = (folderId: string, subfolderName: string) => {
    const newSubfolder = { id: Math.random().toString(), name: subfolderName, notes: [], tags: [] };
    dispatch(appSlice.actions.addSubfolder({ folderId, subfolder: newSubfolder }));
  };

  const handleRemoveSubfolder = (folderId: string, subfolderId: string) => {
    dispatch(appSlice.actions.removeSubfolder({ folderId, subfolderId }));
  };

  const handleAddTagToFolder = (folderId: string, tagName: string) => {
    dispatch(appSlice.actions.addTagToFolder({ folderId, tag: tagName }));
  };

  const handleRemoveTagFromFolder = (folderId: string, tagName: string) => {
    dispatch(appSlice.actions.removeTagFromFolder({ folderId, tag: tagName }));
  };

  const handleAddNoteToFolder = (folderId: string, noteId: string) => {
    dispatch(appSlice.actions.addNoteToFolder({ folderId, note: { id: noteId, title: 'New Note', content: 'New Note Content' } }));
  };

  const handleRemoveNoteFromFolder = (folderId: string, noteId: string) => {
    dispatch(appSlice.actions.removeNoteFromFolder({ folderId, noteId }));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="dashboard-page">
        <h1>AutoNote: AI-Powered Note Taker</h1>
        <div className="folder-list">
          {folders.map((folder) => (
            <div key={folder.id} className="folder">
              <h2>{folder.name}</h2>
              <ul>
                {folder.notes.map((note) => (
                  <li key={note.id}>
                    <NoteCard note={note} />
                  </li>
                ))}
              </ul>
              <button onClick={() => handleAddNoteToFolder(folder.id, Math.random().toString())}>Add Note</button>
              <button onClick={() => handleRemoveFolder(folder.id)}>Remove Folder</button>
            </div>
          ))}
        </div>
        <div className="note-list">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
        <div className="folder-tree">
          {folderTree.map((folder) => (
            <div key={folder.id} className="folder-tree-node">
              <h2>{folder.name}</h2>
              <ul>
                {folder.subfolders.map((subfolder) => (
                  <li key={subfolder.id}>
                    <div className="folder-tree-node">
                      <h3>{subfolder.name}</h3>
                      <ul>
                        {subfolder.notes.map((note) => (
                          <li key={note.id}>
                            <NoteCard note={note} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default () => (
  <Provider store={store}>
    <DashboardPage />
  </Provider>
);