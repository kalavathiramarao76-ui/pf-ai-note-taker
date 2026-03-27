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
      if (!state.tags.includes(action.payload)) {
        state.tags.push(action.payload);
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
    addNoteTag(state, action: PayloadAction<{ noteId: string; tag: string }>) {
      if (!state.noteTagMap.has(action.payload.noteId)) {
        state.noteTagMap.set(action.payload.noteId, [action.payload.tag]);
      } else {
        const existingTags = state.noteTagMap.get(action.payload.noteId);
        if (!existingTags.includes(action.payload.tag)) {
          existingTags.push(action.payload.tag);
        }
      }
    },
    removeNoteTag(state, action: PayloadAction<{ noteId: string; tag: string }>) {
      if (state.noteTagMap.has(action.payload.noteId)) {
        const existingTags = state.noteTagMap.get(action.payload.noteId);
        state.noteTagMap.set(
          action.payload.noteId,
          existingTags.filter((tag) => tag !== action.payload.tag)
        );
      }
    },
    updateTagFilter(state, action: PayloadAction<string>) {
      state.tagFilter = action.payload;
    },
    filterNotesByTags(state) {
      const filteredNotes = [];
      for (const note of state.notes.values()) {
        if (note.tags.includes(state.tagFilter)) {
          filteredNotes.push(note);
        }
      }
      state.filteredNotes = filteredNotes;
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
    tags,
    tagInput,
    tagSuggestions,
    noteTagMap,
    tagFilter,
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

  const handleAddNoteTag = (noteId: string, tag: string) => {
    dispatch(appSlice.actions.addNoteTag({ noteId, tag }));
  };

  const handleRemoveNoteTag = (noteId: string, tag: string) => {
    dispatch(appSlice.actions.removeNoteTag({ noteId, tag }));
  };

  const handleUpdateTagFilter = (tagFilter: string) => {
    dispatch(appSlice.actions.updateTagFilter(tagFilter));
    dispatch(appSlice.actions.filterNotesByTags());
  };

  useEffect(() => {
    const availableTags = Array.from(new Set(notes.values().flatMap((note) => note.tags)));
    dispatch(appSlice.actions.updateTagSuggestions(availableTags));
  }, [notes]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h1>AutoNote: AI-Powered Note Taker</h1>
        <div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => handleUpdateTagInput(e.target.value)}
            placeholder="Add a tag"
          />
          <ul>
            {tagSuggestions.map((tag) => (
              <li key={tag}>
                <button onClick={() => handleAddTag(tag)}>{tag}</button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Notes</h2>
          <ul>
            {filteredNotes.map((note) => (
              <li key={note.id}>
                <NoteCard note={note} />
                <ul>
                  {noteTagMap.get(note.id).map((tag) => (
                    <li key={tag}>
                      <button onClick={() => handleRemoveNoteTag(note.id, tag)}>{tag}</button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Tags</h2>
          <ul>
            {tags.map((tag) => (
              <li key={tag}>
                <button onClick={() => handleRemoveTag(tag)}>{tag}</button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Filter by tag</h2>
          <input
            type="text"
            value={tagFilter}
            onChange={(e) => handleUpdateTagFilter(e.target.value)}
            placeholder="Filter by tag"
          />
        </div>
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