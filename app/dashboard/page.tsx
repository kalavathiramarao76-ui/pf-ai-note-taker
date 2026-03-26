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
  },
  reducers: {
    addTag(state, action: PayloadAction<{ noteId: string; tag: string }>) {
      const { noteId, tag } = action.payload;
      if (!state.noteTagMap.has(noteId)) {
        state.noteTagMap.set(noteId, []);
      }
      const noteTags = state.noteTagMap.get(noteId);
      if (!noteTags.includes(tag)) {
        noteTags.push(tag);
      }
    },
    removeTag(state, action: PayloadAction<{ noteId: string; tag: string }>) {
      const { noteId, tag } = action.payload;
      if (state.noteTagMap.has(noteId)) {
        const noteTags = state.noteTagMap.get(noteId);
        const index = noteTags.indexOf(tag);
        if (index !== -1) {
          noteTags.splice(index, 1);
        }
      }
    },
    updateTags(state, action: PayloadAction<{ noteId: string; tags: string[] }>) {
      const { noteId, tags } = action.payload;
      state.noteTagMap.set(noteId, tags);
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
  const { notes, noteTagMap } = useSelector((state: AppState) => state);

  const handleAddTag = (noteId: string, tag: string) => {
    dispatch(appSlice.actions.addTag({ noteId, tag }));
  };

  const handleRemoveTag = (noteId: string, tag: string) => {
    dispatch(appSlice.actions.removeTag({ noteId, tag }));
  };

  const handleUpdateTags = (noteId: string, tags: string[]) => {
    dispatch(appSlice.actions.updateTags({ noteId, tags }));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            tags={noteTagMap.get(note.id) || []}
            onAddTag={(tag) => handleAddTag(note.id, tag)}
            onRemoveTag={(tag) => handleRemoveTag(note.id, tag)}
            onUpdateTags={(tags) => handleUpdateTags(note.id, tags)}
          />
        ))}
      </div>
    </DndProvider>
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