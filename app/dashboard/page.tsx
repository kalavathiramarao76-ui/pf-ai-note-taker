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
  notePriorities: { [key: string]: string };
  noteDueDates: { [key: string]: string };
  noteReminders: { [key: string]: string };
  notePriorityLevels: { [key: string]: string[] };
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
    filterType: '',
    sortBy: '',
    sortOrder: '',
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
    notePriorities: {},
    noteDueDates: {},
    noteReminders: {},
    notePriorityLevels: {},
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
    updateNoteTags(state, action: PayloadAction<{ noteId: string; tags: string[] }>) {
      state.noteTags[action.payload.noteId] = action.payload.tags;
    },
    updateFilteredNotes(state, action: PayloadAction<any[]>) {
      state.filteredNotes = action.payload;
    },
    updateTagFilter(state, action: PayloadAction<string>) {
      state.tagFilter = action.payload;
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
  const router = useRouter();
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
    folderNotesMap,
    noteFolderMap,
    tagFilter,
    folderName,
    newFolderName,
    isFolderOpen,
    folderId,
    folderTags,
    subfolders,
    folderTagsMap,
    availableTags,
    tagInputValue,
    tagSuggestionsList,
    noteTagSuggestions,
    aiModel,
    noteCompletion,
    notePriorities,
    noteDueDates,
    noteReminders,
    notePriorityLevels,
  } = useSelector((state: any) => state.app);

  // Auto-suggest tags
  useEffect(() => {
    const suggestTags = async () => {
      if (tagInputValue.length > 0) {
        const response = await client.get('/api/tags', {
          params: { query: tagInputValue },
        });
        dispatch(updateTagSuggestions(response.data));
      } else {
        dispatch(updateTagSuggestions([]));
      }
    };
    suggestTags();
  }, [tagInputValue]);

  // Filter notes by tags
  useEffect(() => {
    const filterNotes = () => {
      if (tagFilter.length > 0) {
        const filteredNotes = notes.filter((note: any) => {
          return note.tags.includes(tagFilter);
        });
        dispatch(updateFilteredNotes(filteredNotes));
      } else {
        dispatch(updateFilteredNotes(notes));
      }
    };
    filterNotes();
  }, [tagFilter, notes]);

  // Render the component
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="dashboard-page">
        <h1>AutoNote: AI-Powered Note Taker</h1>
        <div className="note-list">
          {filteredNotes.map((note: any) => (
            <DraggableNoteCard key={note.id} note={note} />
          ))}
        </div>
        <div className="tag-input">
          <input
            type="text"
            value={tagInputValue}
            onChange={(e) => dispatch(updateTagInput(e.target.value))}
            placeholder="Enter a tag"
          />
          <ul>
            {tagSuggestionsList.map((suggestion: string) => (
              <li key={suggestion}>
                <button onClick={() => dispatch(addTag(suggestion))}>
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="tag-filter">
          <select
            value={tagFilter}
            onChange={(e) => dispatch(updateTagFilter(e.target.value))}
          >
            <option value="">All notes</option>
            {availableTags.map((tag: string) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>
    </DndProvider>
  );
}

// Export the component
export default function App() {
  return (
    <Provider store={store}>
      <DashboardPage />
    </Provider>
  );
}