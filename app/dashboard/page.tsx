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
    addSelectedTag(state, action: PayloadAction<string>) {
      if (!state.selectedTags.includes(action.payload)) {
        state.selectedTags = [...state.selectedTags, action.payload];
      }
    },
    removeSelectedTag(state, action: PayloadAction<string>) {
      state.selectedTags = state.selectedTags.filter((tag) => tag !== action.payload);
    },
    filterNotesByTags(state) {
      state.filteredNotes = state.notes.filter((note) => {
        const noteTags = state.noteTagMap.get(note.id);
        return state.selectedTags.every((tag) => noteTags.includes(tag));
      });
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
  const { notes, tags, selectedTags, tagInput, tagSuggestions, filteredNotes } = useSelector((state: AppState) => state);

  useEffect(() => {
    dispatch(appSlice.actions.filterNotesByTags());
  }, [selectedTags]);

  const handleAddTag = (tag: string) => {
    dispatch(appSlice.actions.addTag(tag));
  };

  const handleRemoveTag = (tag: string) => {
    dispatch(appSlice.actions.removeTag(tag));
  };

  const handleUpdateTagInput = (input: string) => {
    dispatch(appSlice.actions.updateTagInput(input));
  };

  const handleUpdateTagSuggestions = (suggestions: string[]) => {
    dispatch(appSlice.actions.updateTagSuggestions(suggestions));
  };

  const handleAddSelectedTag = (tag: string) => {
    dispatch(appSlice.actions.addSelectedTag(tag));
  };

  const handleRemoveSelectedTag = (tag: string) => {
    dispatch(appSlice.actions.removeSelectedTag(tag));
  };

  return (
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <div>
          <h1>AutoNote: AI-Powered Note Taker</h1>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => handleUpdateTagInput(e.target.value)}
            placeholder="Add a tag"
          />
          <ul>
            {tagSuggestions.map((suggestion) => (
              <li key={suggestion}>
                <button onClick={() => handleAddTag(suggestion)}>{suggestion}</button>
              </li>
            ))}
          </ul>
          <ul>
            {tags.map((tag) => (
              <li key={tag}>
                <button onClick={() => handleRemoveTag(tag)}>{tag}</button>
              </li>
            ))}
          </ul>
          <ul>
            {selectedTags.map((tag) => (
              <li key={tag}>
                <button onClick={() => handleRemoveSelectedTag(tag)}>{tag}</button>
              </li>
            ))}
          </ul>
          <h2>Notes</h2>
          <ul>
            {filteredNotes.map((note) => (
              <li key={note.id}>
                <NoteCard note={note} />
              </li>
            ))}
          </ul>
        </div>
      </DndProvider>
    </Provider>
  );
};

export default DashboardPage;