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
    folderNotes: null,
    folderTags: null,
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
    addTag(state, action: PayloadAction<string>) {
      if (!state.tags.includes(action.payload)) {
        state.tags = [...state.tags, action.payload];
      }
    },
    removeTag(state, action: PayloadAction<string>) {
      state.tags = state.tags.filter((tag) => tag !== action.payload);
    },
    updateTagInput(state, action: PayloadAction<string>) {
      state.tagInput = action.payload;
    },
    updateTagSuggestions(state, action: PayloadAction<string[]>) {
      state.tagSuggestions = action.payload;
    },
    filterNotesByTags(state, action: PayloadAction<string[]>) {
      state.filterByTags = action.payload;
      state.filteredNotes = Object.values(state.notes).filter((note) => {
        const noteTags = state.noteTagMap[note.id];
        return action.payload.every((tag) => noteTags.includes(tag));
      });
    },
    clearTagFilter(state) {
      state.filterByTags = [];
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
const DashboardPage = () => {
  const dispatch = useDispatch();
  const {
    notes,
    tags,
    tagInput,
    tagSuggestions,
    filterByTags,
    filteredNotes,
  } = useSelector((state: AppState) => state);

  const handleAddTag = (tag: string) => {
    dispatch(appSlice.actions.addTag(tag));
  };

  const handleRemoveTag = (tag: string) => {
    dispatch(appSlice.actions.removeTag(tag));
  };

  const handleUpdateTagInput = (tagInput: string) => {
    dispatch(appSlice.actions.updateTagInput(tagInput));
  };

  const handleUpdateTagSuggestions = (tagSuggestions: string[]) => {
    dispatch(appSlice.actions.updateTagSuggestions(tagSuggestions));
  };

  const handleFilterNotesByTags = (tags: string[]) => {
    dispatch(appSlice.actions.filterNotesByTags(tags));
  };

  const handleClearTagFilter = () => {
    dispatch(appSlice.actions.clearTagFilter());
  };

  const handleTagInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const tag = event.currentTarget.value.trim();
      if (tag) {
        handleAddTag(tag);
        event.currentTarget.value = '';
      }
    }
  };

  const handleTagSuggestionClick = (tag: string) => {
    handleAddTag(tag);
  };

  return (
    <div>
      <h1>AutoNote: AI-Powered Note Taker</h1>
      <input
        type="text"
        value={tagInput}
        onChange={(event) => handleUpdateTagInput(event.target.value)}
        onKeyDown={handleTagInputKeyDown}
        placeholder="Add tag"
      />
      <ul>
        {tagSuggestions.map((tag) => (
          <li key={tag} onClick={() => handleTagSuggestionClick(tag)}>
            {tag}
          </li>
        ))}
      </ul>
      <ul>
        {tags.map((tag) => (
          <li key={tag}>
            {tag}
            <button onClick={() => handleRemoveTag(tag)}>Remove</button>
          </li>
        ))}
      </ul>
      <button onClick={handleClearTagFilter}>Clear tag filter</button>
      <h2>Notes</h2>
      <ul>
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <li key={note.id}>
              <NoteCard note={note} />
            </li>
          ))
        ) : (
          <li>No notes found</li>
        )}
      </ul>
    </div>
  );
};

export default () => (
  <Provider store={store}>
    <DndProvider backend={HTML5Backend}>
      <DashboardPage />
    </DndProvider>
  </Provider>
);