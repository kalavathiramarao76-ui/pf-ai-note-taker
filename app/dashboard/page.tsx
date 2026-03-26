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
  },
  reducers: {
    addTag(state, action: PayloadAction<string>) {
      if (!state.tags.includes(action.payload)) {
        state.tags.push(action.payload);
      }
    },
    removeTag(state, action: PayloadAction<string>) {
      state.tags = state.tags.filter((tag) => tag !== action.payload);
    },
    updateTagInput(state, action: PayloadAction<string>) {
      state.tagInput = action.payload;
      const suggestions = state.tags.filter((tag) =>
        tag.toLowerCase().includes(action.payload.toLowerCase())
      );
      state.tagSuggestions = suggestions;
    },
    clearTagInput(state) {
      state.tagInput = '';
      state.tagSuggestions = [];
    },
    addNoteTag(state, action: PayloadAction<{ noteId: string; tag: string }>) {
      if (!state.noteTags[action.payload.noteId]) {
        state.noteTags[action.payload.noteId] = [];
      }
      if (!state.noteTags[action.payload.noteId].includes(action.payload.tag)) {
        state.noteTags[action.payload.noteId].push(action.payload.tag);
      }
    },
    removeNoteTag(state, action: PayloadAction<{ noteId: string; tag: string }>) {
      if (state.noteTags[action.payload.noteId]) {
        state.noteTags[action.payload.noteId] = state.noteTags[action.payload.noteId].filter(
          (tag) => tag !== action.payload.tag
        );
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
  const {
    notes,
    meetings,
    templates,
    searchQuery,
    generatedNotes,
    folders,
    selectedFolder,
    editingNote,
    sortedNotes,
    sortedMeetings,
    sortedTemplates,
    filterType,
    sortBy,
    sortOrder,
    filterByTags,
    filterByDate,
    aiSuggestions,
    autocompleteSuggestions,
    priority,
    deadline,
    noteTitle,
    noteContent,
    isGeneratingNote,
    editorState,
    quickNote,
    isQuickNoteOpen,
    tags,
    selectedTags,
    noteTags,
    tagInput,
    tagSuggestions,
    socket,
    collaborators,
    collaborativeEditorState,
    noteVersions,
    conflictResolution,
    realTimeCollaboration,
    folderNotes,
    folderTags,
    versionHistory,
    collaborativeNotes,
    folderStructure,
    noteSummaries,
    folderMap,
    draggedNote,
    draggedOverFolder,
    folderTree,
    noteTagMap,
    suggestedTags,
    filteredNotes,
  } = useSelector((state: any) => state.app);

  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(appSlice.actions.updateTagInput(e.target.value));
  };

  const handleAddTag = (tag: string) => {
    dispatch(appSlice.actions.addTag(tag));
    dispatch(appSlice.actions.clearTagInput());
  };

  const handleRemoveTag = (tag: string) => {
    dispatch(appSlice.actions.removeTag(tag));
  };

  const handleAddNoteTag = (noteId: string, tag: string) => {
    dispatch(appSlice.actions.addNoteTag({ noteId, tag }));
  };

  const handleRemoveNoteTag = (noteId: string, tag: string) => {
    dispatch(appSlice.actions.removeNoteTag({ noteId, tag }));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h1>AutoNote: AI-Powered Note Taker</h1>
        <input
          type="text"
          value={tagInput}
          onChange={handleTagInput}
          placeholder="Add tag"
        />
        <ul>
          {tagSuggestions.map((tag: string) => (
            <li key={tag}>
              <button onClick={() => handleAddTag(tag)}>{tag}</button>
            </li>
          ))}
        </ul>
        <ul>
          {tags.map((tag: string) => (
            <li key={tag}>
              <button onClick={() => handleRemoveTag(tag)}>{tag}</button>
            </li>
          ))}
        </ul>
        {notes.map((note: any) => (
          <NoteCard key={note.id} note={note}>
            <ul>
              {noteTags[note.id].map((tag: string) => (
                <li key={tag}>
                  <button onClick={() => handleRemoveNoteTag(note.id, tag)}>
                    {tag}
                  </button>
                </li>
              ))}
            </ul>
            <input
              type="text"
              value={tagInput}
              onChange={handleTagInput}
              placeholder="Add tag to note"
            />
            <ul>
              {tagSuggestions.map((tag: string) => (
                <li key={tag}>
                  <button onClick={() => handleAddNoteTag(note.id, tag)}>
                    {tag}
                  </button>
                </li>
              ))}
            </ul>
          </NoteCard>
        ))}
      </div>
    </DndProvider>
  );
};

export default () => {
  return (
    <Provider store={store}>
      <DashboardPage />
    </Provider>
  );
};