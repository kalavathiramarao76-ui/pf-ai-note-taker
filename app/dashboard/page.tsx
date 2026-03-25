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

// Define the initial state
interface AppState {
  notes: any[];
  meetings: any[];
  templates: any[];
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
}

// Define the reducer using createSlice
const appSlice = createSlice({
  name: 'app',
  initialState: {
    notes: [],
    meetings: [],
    templates: [],
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
  },
  reducers: {
    setNotes(state, action: PayloadAction<any[]>) {
      state.notes = action.payload;
    },
    setMeetings(state, action: PayloadAction<any[]>) {
      state.meetings = action.payload;
    },
    setTemplates(state, action: PayloadAction<any[]>) {
      state.templates = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setGeneratedNotes(state, action: PayloadAction<any[]>) {
      state.generatedNotes = action.payload;
    },
    setFolders(state, action: PayloadAction<any[]>) {
      state.folders = action.payload;
    },
    setSelectedFolder(state, action: PayloadAction<any>) {
      state.selectedFolder = action.payload;
    },
    setEditingNote(state, action: PayloadAction<any>) {
      state.editingNote = action.payload;
    },
    setSortedNotes(state, action: PayloadAction<any[]>) {
      state.sortedNotes = action.payload;
    },
    setSortedMeetings(state, action: PayloadAction<any[]>) {
      state.sortedMeetings = action.payload;
    },
    setSortedTemplates(state, action: PayloadAction<any[]>) {
      state.sortedTemplates = action.payload;
    },
    setFilterType(state, action: PayloadAction<string>) {
      state.filterType = action.payload;
    },
    setSortBy(state, action: PayloadAction<string>) {
      state.sortBy = action.payload;
    },
    setSortOrder(state, action: PayloadAction<string>) {
      state.sortOrder = action.payload;
    },
    setFilterByTags(state, action: PayloadAction<any[]>) {
      state.filterByTags = action.payload;
    },
    setFilterByDate(state, action: PayloadAction<string>) {
      state.filterByDate = action.payload;
    },
    setAiSuggestions(state, action: PayloadAction<any[]>) {
      state.aiSuggestions = action.payload;
    },
    setAutocompleteSuggestions(state, action: PayloadAction<any[]>) {
      state.autocompleteSuggestions = action.payload;
    },
    setPriority(state, action: PayloadAction<string>) {
      state.priority = action.payload;
    },
    setDeadline(state, action: PayloadAction<string>) {
      state.deadline = action.payload;
    },
    setNoteTitle(state, action: PayloadAction<string>) {
      state.noteTitle = action.payload;
    },
    setNoteContent(state, action: PayloadAction<string>) {
      state.noteContent = action.payload;
    },
    setIsGeneratingNote(state, action: PayloadAction<boolean>) {
      state.isGeneratingNote = action.payload;
    },
    setEditorState(state, action: PayloadAction<EditorState>) {
      state.editorState = action.payload;
    },
    setQuickNote(state, action: PayloadAction<string>) {
      state.quickNote = action.payload;
    },
    setIsQuickNoteOpen(state, action: PayloadAction<boolean>) {
      state.isQuickNoteOpen = action.payload;
    },
    setTags(state, action: PayloadAction<any[]>) {
      state.tags = action.payload;
    },
    setSelectedTags(state, action: PayloadAction<any[]>) {
      state.selectedTags = action.payload;
    },
    setNoteTags(state, action: PayloadAction<any>) {
      state.noteTags = action.payload;
    },
    setTagInput(state, action: PayloadAction<string>) {
      state.tagInput = action.payload;
    },
    setTagSuggestions(state, action: PayloadAction<any[]>) {
      state.tagSuggestions = action.payload;
    },
    setSocket(state, action: PayloadAction<Socket | null>) {
      state.socket = action.payload;
    },
    setCollaborators(state, action: PayloadAction<any[]>) {
      state.collaborators = action.payload;
    },
    setCollaborativeEditorState(state, action: PayloadAction<any>) {
      state.collaborativeEditorState = action.payload;
    },
    setNoteVersions(state, action: PayloadAction<any>) {
      state.noteVersions = action.payload;
    },
    setConflictResolution(state, action: PayloadAction<any>) {
      state.conflictResolution = action.payload;
    },
    setRealTimeCollaboration(state, action: PayloadAction<any>) {
      state.realTimeCollaboration = action.payload;
    },
    setFolderNotes(state, action: PayloadAction<any>) {
      state.folderNotes = action.payload;
    },
    setFolderTags(state, action: PayloadAction<any>) {
      state.folderTags = action.payload;
    },
    setVersionHistory(state, action: PayloadAction<any>) {
      state.versionHistory = action.payload;
    },
    setCollaborativeNotes(state, action: PayloadAction<any>) {
      state.collaborativeNotes = action.payload;
    },
  },
});

// Create the store
const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
});

// Use the store in the component
function DashboardPage() {
  const dispatch = useDispatch();
  const state = useSelector((state: any) => state.app);

  // Use the state and dispatch in the component
  useEffect(() => {
    // Initialize the state
    dispatch(appSlice.actions.setNotes([]));
    dispatch(appSlice.actions.setMeetings([]));
    dispatch(appSlice.actions.setTemplates([]));
  }, [dispatch]);

  return (
    // Render the component
    <div>
      <NoteCard />
      <MeetingCard />
      <TemplateCard />
      <Editor editorState={state.editorState} />
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <DashboardPage />
    </Provider>
  );
}