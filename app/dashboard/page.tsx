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
    folderNotesMap: new Map(),
    noteFolderMap: new Map(),
    tagFilter: '',
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
    updateTagFilter(state, action: PayloadAction<string>) {
      state.tagFilter = action.payload;
    },
    filterNotesByTag(state) {
      if (state.tagFilter) {
        state.filteredNotes = Array.from(state.notes.values()).filter((note) => {
          const noteTags = state.noteTagMap.get(note.id);
          return noteTags && noteTags.includes(state.tagFilter);
        });
      } else {
        state.filteredNotes = Array.from(state.notes.values());
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
  const { notes, tags, tagInput, tagSuggestions, tagFilter, filteredNotes } = useSelector((state: AppState) => state);

  useEffect(() => {
    dispatch(appSlice.actions.filterNotesByTag());
  }, [tagFilter]);

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

  const handleUpdateTagFilter = (filter: string) => {
    dispatch(appSlice.actions.updateTagFilter(filter));
  };

  const handleFilterNotesByTag = () => {
    dispatch(appSlice.actions.filterNotesByTag());
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h1>AutoNote: AI-Powered Note Taker</h1>
        <Link href="/notes">
          <a>Notes</a>
        </Link>
        <Link href="/meetings">
          <a>Meetings</a>
        </Link>
        <Link href="/templates">
          <a>Templates</a>
        </Link>
        <div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => handleUpdateTagInput(e.target.value)}
            placeholder="Add tag"
          />
          <button onClick={() => handleAddTag(tagInput)}>Add Tag</button>
          <ul>
            {tags.map((tag) => (
              <li key={tag}>
                {tag}
                <button onClick={() => handleRemoveTag(tag)}>Remove</button>
              </li>
            ))}
          </ul>
          <input
            type="text"
            value={tagFilter}
            onChange={(e) => handleUpdateTagFilter(e.target.value)}
            placeholder="Filter by tag"
          />
          <button onClick={handleFilterNotesByTag}>Filter</button>
          <ul>
            {filteredNotes.map((note) => (
              <li key={note.id}>
                <NoteCard note={note} />
              </li>
            ))}
          </ul>
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