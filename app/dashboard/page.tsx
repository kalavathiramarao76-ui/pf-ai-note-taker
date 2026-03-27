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
  availableTags: string[];
  tagInputValue: string;
  tagSuggestionsList: string[];
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
    tagFilter: '',
    folderName: '',
    newFolderName: '',
    isFolderOpen: false,
    folderId: '',
    folderTags: [],
    subfolders: [],
    folderTagsMap: new Map(),
    availableTags: [],
    tagInputValue: '',
    tagSuggestionsList: [],
  },
  reducers: {
    addTag(state, action: PayloadAction<string>) {
      if (!state.availableTags.includes(action.payload)) {
        state.availableTags.push(action.payload);
      }
    },
    removeTag(state, action: PayloadAction<string>) {
      state.availableTags = state.availableTags.filter((tag) => tag !== action.payload);
    },
    updateTagInputValue(state, action: PayloadAction<string>) {
      state.tagInputValue = action.payload;
      state.tagSuggestionsList = state.availableTags.filter((tag) => tag.includes(action.payload));
    },
    clearTagInputValue(state) {
      state.tagInputValue = '';
      state.tagSuggestionsList = [];
    },
    filterNotesByTag(state, action: PayloadAction<string>) {
      state.filteredNotes = state.notes.filter((note) => note.tags.includes(action.payload));
    },
    clearFilter(state) {
      state.filteredNotes = [];
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

// Define the component
function DashboardPage() {
  const dispatch = useDispatch();
  const {
    notes,
    availableTags,
    tagInputValue,
    tagSuggestionsList,
    filteredNotes,
  } = useSelector((state: AppState) => state);

  const handleAddTag = (tag: string) => {
    dispatch(appSlice.actions.addTag(tag));
  };

  const handleRemoveTag = (tag: string) => {
    dispatch(appSlice.actions.removeTag(tag));
  };

  const handleUpdateTagInputValue = (value: string) => {
    dispatch(appSlice.actions.updateTagInputValue(value));
  };

  const handleClearTagInputValue = () => {
    dispatch(appSlice.actions.clearTagInputValue());
  };

  const handleFilterNotesByTag = (tag: string) => {
    dispatch(appSlice.actions.filterNotesByTag(tag));
  };

  const handleClearFilter = () => {
    dispatch(appSlice.actions.clearFilter());
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h1>AutoNote: AI-Powered Note Taker</h1>
        <div>
          <input
            type="text"
            value={tagInputValue}
            onChange={(e) => handleUpdateTagInputValue(e.target.value)}
            placeholder="Add tag"
          />
          <ul>
            {tagSuggestionsList.map((tag) => (
              <li key={tag}>
                <span>{tag}</span>
                <button onClick={() => handleAddTag(tag)}>Add</button>
              </li>
            ))}
          </ul>
          <button onClick={handleClearTagInputValue}>Clear</button>
        </div>
        <div>
          <h2>Available Tags</h2>
          <ul>
            {availableTags.map((tag) => (
              <li key={tag}>
                <span>{tag}</span>
                <button onClick={() => handleRemoveTag(tag)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Notes</h2>
          <ul>
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <li key={note.id}>
                  <NoteCard note={note} />
                </li>
              ))
            ) : (
              notes.map((note) => (
                <li key={note.id}>
                  <NoteCard note={note} />
                </li>
              ))
            )}
          </ul>
          <button onClick={handleClearFilter}>Clear Filter</button>
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