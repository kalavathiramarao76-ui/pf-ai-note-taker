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
  },
  reducers: {
    addFolder: (state, action: PayloadAction<string>) => {
      state.folders.push({ id: action.payload, name: action.payload, notes: [] });
    },
    removeFolder: (state, action: PayloadAction<string>) => {
      state.folders = state.folders.filter((folder) => folder.id !== action.payload);
    },
    addNoteToFolder: (state, action: PayloadAction<{ noteId: string; folderId: string }>) => {
      const folder = state.folders.find((folder) => folder.id === action.payload.folderId);
      if (folder) {
        folder.notes.push(action.payload.noteId);
      }
    },
    removeNoteFromFolder: (state, action: PayloadAction<{ noteId: string; folderId: string }>) => {
      const folder = state.folders.find((folder) => folder.id === action.payload.folderId);
      if (folder) {
        folder.notes = folder.notes.filter((noteId) => noteId !== action.payload.noteId);
      }
    },
    dragNote: (state, action: PayloadAction<string>) => {
      state.draggedNote = action.payload;
    },
    dragOverFolder: (state, action: PayloadAction<string>) => {
      state.draggedOverFolder = action.payload;
    },
    dropNote: (state) => {
      if (state.draggedNote && state.draggedOverFolder) {
        const noteId = state.draggedNote;
        const folderId = state.draggedOverFolder;
        const folder = state.folders.find((folder) => folder.id === folderId);
        if (folder) {
          folder.notes.push(noteId);
        }
        state.draggedNote = null;
        state.draggedOverFolder = null;
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
  const { folders, notes, draggedNote, draggedOverFolder } = useSelector((state: AppState) => state);

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

  const handleDragNote = (noteId: string) => {
    dispatch(appSlice.actions.dragNote(noteId));
  };

  const handleDragOverFolder = (folderId: string) => {
    dispatch(appSlice.actions.dragOverFolder(folderId));
  };

  const handleDropNote = () => {
    dispatch(appSlice.actions.dropNote());
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h1>AutoNote: AI-Powered Note Taker</h1>
        <button onClick={() => handleAddFolder('New Folder')}>Add Folder</button>
        <ul>
          {folders.map((folder) => (
            <li key={folder.id}>
              <span>{folder.name}</span>
              <button onClick={() => handleRemoveFolder(folder.id)}>Remove</button>
              <ul>
                {folder.notes.map((noteId) => (
                  <li key={noteId}>
                    <DraggableNoteCard noteId={noteId} onDragStart={() => handleDragNote(noteId)} />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        {draggedNote && (
          <div>
            <span>Dragged Note: {draggedNote}</span>
            {folders.map((folder) => (
              <button key={folder.id} onClick={() => handleAddNoteToFolder(draggedNote, folder.id)}>
                Add to {folder.name}
              </button>
            ))}
          </div>
        )}
        {draggedOverFolder && (
          <div>
            <span>Dragged Over Folder: {draggedOverFolder}</span>
            <button onClick={handleDropNote}>Drop Note</button>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default () => (
  <Provider store={store}>
    <DashboardPage />
  </Provider>
);