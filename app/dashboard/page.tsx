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
    },
    updateTagSuggestions(state, action: PayloadAction<any[]>) {
      state.tagSuggestions = action.payload;
    },
    updateSuggestedTags(state, action: PayloadAction<any[]>) {
      state.suggestedTags = action.payload;
    },
    updateFilteredNotes(state, action: PayloadAction<any[]>) {
      state.filteredNotes = action.payload;
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
  } = useSelector((state: any) => state.app);

  useEffect(() => {
    const fetchNotes = async () => {
      const response = await client.get('/notes');
      dispatch({
        type: 'app/setNotes',
        payload: response.data,
      });
    };
    fetchNotes();
  }, []);

  const handleTagInput = (e: any) => {
    dispatch(updateTagInput(e.target.value));
    const suggestions = tags.filter((tag) =>
      tag.toLowerCase().includes(e.target.value.toLowerCase())
    );
    dispatch(updateTagSuggestions(suggestions));
  };

  const handleTagSelect = (tag: string) => {
    dispatch(addTag(tag));
    dispatch(updateTagInput(''));
    dispatch(updateTagSuggestions([]));
  };

  const handleTagRemove = (tag: string) => {
    dispatch(removeTag(tag));
  };

  const handleFilterByTags = () => {
    const filteredNotes = notes.filter((note: any) => {
      return note.tags.some((tag: string) => selectedTags.includes(tag));
    });
    dispatch(updateFilteredNotes(filteredNotes));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="dashboard-page">
        <div className="note-list">
          {filteredNotes.map((note: any) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
        <div className="tag-input">
          <input
            type="text"
            value={tagInput}
            onChange={handleTagInput}
            placeholder="Add tag"
          />
          <ul>
            {tagSuggestions.map((suggestion: string) => (
              <li key={suggestion} onClick={() => handleTagSelect(suggestion)}>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
        <div className="selected-tags">
          {selectedTags.map((tag: string) => (
            <span key={tag} onClick={() => handleTagRemove(tag)}>
              {tag}
            </span>
          ))}
        </div>
        <button onClick={handleFilterByTags}>Filter by tags</button>
      </div>
    </DndProvider>
  );
};

export default () => (
  <Provider store={store}>
    <DashboardPage />
  </Provider>
);