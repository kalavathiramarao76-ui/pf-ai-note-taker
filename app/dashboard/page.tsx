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
  notes: { [key: string]: any };
  meetings: { [key: string]: any };
  templates: { [key: string]: any };
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
  folderMap: { [key: string]: any };
  draggedNote: any;
  draggedOverFolder: any;
  folderTree: any[];
  noteTagMap: { [key: string]: string[] };
  suggestedTags: any[];
  filteredNotes: any[];
  folderNotesMap: { [key: string]: any[] };
  noteFolderMap: { [key: string]: string };
  tagFilter: string;
  folderName: string;
  newFolderName: string;
  isFolderOpen: boolean;
  folderId: string;
  folderTags: any[];
  subfolders: any[];
  folderTagsMap: { [key: string]: string[] };
  availableTags: string[];
  tagInputValue: string;
  tagSuggestionsList: string[];
  noteTagSuggestions: string[];
  aiModel: any;
  noteCompletion: string;
}

// Define the reducer using createSlice
const appSlice = createSlice({
  name: 'app',
  initialState: {
    notes: {},
    meetings: {},
    templates: {},
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
    priority: '',
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
    collaborativeEditorState: null,
    noteVersions: null,
    conflictResolution: null,
    realTimeCollaboration: null,
    folderNotes: {},
    folderTags: {},
    versionHistory: null,
    collaborativeNotes: null,
    folderStructure: null,
    noteSummaries: [],
    folderMap: {},
    draggedNote: null,
    draggedOverFolder: null,
    folderTree: [],
    noteTagMap: {},
    suggestedTags: [],
    filteredNotes: [],
    folderNotesMap: {},
    noteFolderMap: {},
    tagFilter: '',
    folderName: '',
    newFolderName: '',
    isFolderOpen: false,
    folderId: '',
    folderTags: [],
    subfolders: [],
    folderTagsMap: {},
    availableTags: [],
    tagInputValue: '',
    tagSuggestionsList: [],
    noteTagSuggestions: [],
    aiModel: null,
    noteCompletion: '',
  },
  reducers: {
    addFolder(state, action: PayloadAction<{ folderName: string }>) {
      const newFolder = {
        id: Date.now().toString(),
        name: action.payload.folderName,
        notes: [],
        tags: [],
      };
      state.folders.push(newFolder);
      state.folderMap[newFolder.id] = newFolder;
      state.folderNotesMap[newFolder.id] = [];
    },
    addNoteToFolder(state, action: PayloadAction<{ noteId: string; folderId: string }>) {
      const noteId = action.payload.noteId;
      const folderId = action.payload.folderId;
      const note = state.notes[noteId];
      const folder = state.folderMap[folderId];
      if (note && folder) {
        folder.notes.push(noteId);
        state.folderNotesMap[folderId].push(noteId);
        state.noteFolderMap[noteId] = folderId;
      }
    },
    addTagToFolder(state, action: PayloadAction<{ folderId: string; tag: string }>) {
      const folderId = action.payload.folderId;
      const tag = action.payload.tag;
      const folder = state.folderMap[folderId];
      if (folder) {
        folder.tags.push(tag);
        state.folderTagsMap[folderId].push(tag);
      }
    },
    addTagToNote(state, action: PayloadAction<{ noteId: string; tag: string }>) {
      const noteId = action.payload.noteId;
      const tag = action.payload.tag;
      const note = state.notes[noteId];
      if (note) {
        note.tags.push(tag);
        state.noteTagMap[noteId].push(tag);
      }
    },
    removeNoteFromFolder(state, action: PayloadAction<{ noteId: string; folderId: string }>) {
      const noteId = action.payload.noteId;
      const folderId = action.payload.folderId;
      const folder = state.folderMap[folderId];
      if (folder) {
        const index = folder.notes.indexOf(noteId);
        if (index !== -1) {
          folder.notes.splice(index, 1);
          state.folderNotesMap[folderId] = state.folderNotesMap[folderId].filter((id) => id !== noteId);
          delete state.noteFolderMap[noteId];
        }
      }
    },
    removeTagFromFolder(state, action: PayloadAction<{ folderId: string; tag: string }>) {
      const folderId = action.payload.folderId;
      const tag = action.payload.tag;
      const folder = state.folderMap[folderId];
      if (folder) {
        const index = folder.tags.indexOf(tag);
        if (index !== -1) {
          folder.tags.splice(index, 1);
          state.folderTagsMap[folderId] = state.folderTagsMap[folderId].filter((t) => t !== tag);
        }
      }
    },
    removeTagFromNote(state, action: PayloadAction<{ noteId: string; tag: string }>) {
      const noteId = action.payload.noteId;
      const tag = action.payload.tag;
      const note = state.notes[noteId];
      if (note) {
        const index = note.tags.indexOf(tag);
        if (index !== -1) {
          note.tags.splice(index, 1);
          state.noteTagMap[noteId] = state.noteTagMap[noteId].filter((t) => t !== tag);
        }
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
  const { folders, notes, selectedFolder, editingNote } = useSelector((state: AppState) => state);

  const handleAddFolder = (folderName: string) => {
    dispatch(appSlice.actions.addFolder({ folderName }));
  };

  const handleAddNoteToFolder = (noteId: string, folderId: string) => {
    dispatch(appSlice.actions.addNoteToFolder({ noteId, folderId }));
  };

  const handleAddTagToFolder = (folderId: string, tag: string) => {
    dispatch(appSlice.actions.addTagToFolder({ folderId, tag }));
  };

  const handleAddTagToNote = (noteId: string, tag: string) => {
    dispatch(appSlice.actions.addTagToNote({ noteId, tag }));
  };

  const handleRemoveNoteFromFolder = (noteId: string, folderId: string) => {
    dispatch(appSlice.actions.removeNoteFromFolder({ noteId, folderId }));
  };

  const handleRemoveTagFromFolder = (folderId: string, tag: string) => {
    dispatch(appSlice.actions.removeTagFromFolder({ folderId, tag }));
  };

  const handleRemoveTagFromNote = (noteId: string, tag: string) => {
    dispatch(appSlice.actions.removeTagFromNote({ noteId, tag }));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h1>AutoNote: AI-Powered Note Taker</h1>
        <button onClick={() => handleAddFolder('New Folder')}>Add Folder</button>
        {folders.map((folder) => (
          <div key={folder.id}>
            <h2>{folder.name}</h2>
            <ul>
              {folder.notes.map((noteId) => (
                <li key={noteId}>
                  <NoteCard noteId={noteId} />
                  <button onClick={() => handleRemoveNoteFromFolder(noteId, folder.id)}>Remove from Folder</button>
                </li>
              ))}
            </ul>
            <button onClick={() => handleAddTagToFolder(folder.id, 'New Tag')}>Add Tag to Folder</button>
            <ul>
              {folder.tags.map((tag) => (
                <li key={tag}>
                  {tag}
                  <button onClick={() => handleRemoveTagFromFolder(folder.id, tag)}>Remove Tag from Folder</button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {notes.map((note) => (
          <div key={note.id}>
            <NoteCard noteId={note.id} />
            <button onClick={() => handleAddTagToNote(note.id, 'New Tag')}>Add Tag to Note</button>
            <ul>
              {note.tags.map((tag) => (
                <li key={tag}>
                  {tag}
                  <button onClick={() => handleRemoveTagFromNote(note.id, tag)}>Remove Tag from Note</button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </DndProvider>
  );
};

export default () => (
  <Provider store={store}>
    <DashboardPage />
  </Provider>
);