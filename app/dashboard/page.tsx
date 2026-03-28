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
  notePriorities: { [key: string]: string };
  noteDueDates: { [key: string]: string };
  noteReminders: { [key: string]: string };
  notePriorityLevels: { [key: string]: string[] };
  noteTagSuggestionsMap: { [key: string]: string[] };
  collaborativeNoteId: string;
  collaborativeNoteContent: string;
  collaborativeNoteVersion: number;
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
    noteVersions: {},
    conflictResolution: null,
    realTimeCollaboration: null,
    folderNotes: {},
    folderTags: {},
    versionHistory: {},
    collaborativeNotes: {},
    folderStructure: {},
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
    noteTagSuggestionsMap: {},
    collaborativeNoteId: '',
    collaborativeNoteContent: '',
    collaborativeNoteVersion: 0,
  },
  reducers: {
    setNotes(state, action: PayloadAction<{ [key: string]: any }>) {
      state.notes = action.payload;
    },
    setMeetings(state, action: PayloadAction<{ [key: string]: any }>) {
      state.meetings = action.payload;
    },
    setTemplates(state, action: PayloadAction<{ [key: string]: any }>) {
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
    setFolderStructure(state, action: PayloadAction<any>) {
      state.folderStructure = action.payload;
    },
    setNoteSummaries(state, action: PayloadAction<any[]>) {
      state.noteSummaries = action.payload;
    },
    setFolderMap(state, action: PayloadAction<{ [key: string]: any }>) {
      state.folderMap = action.payload;
    },
    setDraggedNote(state, action: PayloadAction<any>) {
      state.draggedNote = action.payload;
    },
    setDraggedOverFolder(state, action: PayloadAction<any>) {
      state.draggedOverFolder = action.payload;
    },
    setFolderTree(state, action: PayloadAction<any[]>) {
      state.folderTree = action.payload;
    },
    setNoteTagMap(state, action: PayloadAction<{ [key: string]: string[] }>) {
      state.noteTagMap = action.payload;
    },
    setSuggestedTags(state, action: PayloadAction<any[]>) {
      state.suggestedTags = action.payload;
    },
    setFilteredNotes(state, action: PayloadAction<any[]>) {
      state.filteredNotes = action.payload;
    },
    setFolderNotesMap(state, action: PayloadAction<{ [key: string]: any[] }>) {
      state.folderNotesMap = action.payload;
    },
    setNoteFolderMap(state, action: PayloadAction<{ [key: string]: string }>) {
      state.noteFolderMap = action.payload;
    },
    setTagFilter(state, action: PayloadAction<string>) {
      state.tagFilter = action.payload;
    },
    setFolderName(state, action: PayloadAction<string>) {
      state.folderName = action.payload;
    },
    setNewFolderName(state, action: PayloadAction<string>) {
      state.newFolderName = action.payload;
    },
    setIsFolderOpen(state, action: PayloadAction<boolean>) {
      state.isFolderOpen = action.payload;
    },
    setFolderId(state, action: PayloadAction<string>) {
      state.folderId = action.payload;
    },
    setFolderTags(state, action: PayloadAction<any[]>) {
      state.folderTags = action.payload;
    },
    setSubfolders(state, action: PayloadAction<any[]>) {
      state.subfolders = action.payload;
    },
    setFolderTagsMap(state, action: PayloadAction<{ [key: string]: string[] }>) {
      state.folderTagsMap = action.payload;
    },
    setAvailableTags(state, action: PayloadAction<string[]>) {
      state.availableTags = action.payload;
    },
    setTagInputValue(state, action: PayloadAction<string>) {
      state.tagInputValue = action.payload;
    },
    setTagSuggestionsList(state, action: PayloadAction<string[]>) {
      state.tagSuggestionsList = action.payload;
    },
    setNoteTagSuggestions(state, action: PayloadAction<string[]>) {
      state.noteTagSuggestions = action.payload;
    },
    setAiModel(state, action: PayloadAction<any>) {
      state.aiModel = action.payload;
    },
    setNoteCompletion(state, action: PayloadAction<string>) {
      state.noteCompletion = action.payload;
    },
    setNotePriorities(state, action: PayloadAction<{ [key: string]: string }>) {
      state.notePriorities = action.payload;
    },
    setNoteDueDates(state, action: PayloadAction<{ [key: string]: string }>) {
      state.noteDueDates = action.payload;
    },
    setNoteReminders(state, action: PayloadAction<{ [key: string]: string }>) {
      state.noteReminders = action.payload;
    },
    setNotePriorityLevels(state, action: PayloadAction<{ [key: string]: string[] }>) {
      state.notePriorityLevels = action.payload;
    },
    setNoteTagSuggestionsMap(state, action: PayloadAction<{ [key: string]: string[] }>) {
      state.noteTagSuggestionsMap = action.payload;
    },
    setCollaborativeNoteId(state, action: PayloadAction<string>) {
      state.collaborativeNoteId = action.payload;
    },
    setCollaborativeNoteContent(state, action: PayloadAction<string>) {
      state.collaborativeNoteContent = action.payload;
    },
    setCollaborativeNoteVersion(state, action: PayloadAction<number>) {
      state.collaborativeNoteVersion = action.payload;
    },
    // New reducer for real-time collaboration
    updateCollaborativeNote(state, action: PayloadAction<{ noteId: string, content: string, version: number }>) {
      const { noteId, content, version } = action.payload;
      if (state.collaborativeNotes[noteId]) {
        if (version > state.collaborativeNotes[noteId].version) {
          state.collaborativeNotes[noteId] = { content, version };
        } else {
          // Handle conflict resolution
          state.conflictResolution = { noteId, content, version };
        }
      } else {
        state.collaborativeNotes[noteId] = { content, version };
      }
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

// Create a socket connection for real-time collaboration
const socket = new Socket('https://example.com');

// Establish a connection to the server
socket.on('connect', () => {
  console.log('Connected to the server');
});

// Handle incoming messages from the server
socket.on('message', (message) => {
  console.log('Received message from the server:', message);
  if (message.type === 'updateCollaborativeNote') {
    store.dispatch(appSlice.actions.updateCollaborativeNote(message.data));
  }
});

// Send messages to the server
const sendMessage = (message) => {
  socket.emit('message', message);
};

// Use the store and socket in the component
const DashboardPage = () => {
  const dispatch = useDispatch();
  const { collaborativeNotes, conflictResolution } = useSelector((state: AppState) => state);

  useEffect(() => {
    // Initialize the collaborative notes
    dispatch(appSlice.actions.setCollaborativeNotes({}));

    // Establish a connection to the server
    socket.on('connect', () => {
      console.log('Connected to the server');
    });

    // Handle incoming messages from the server
    socket.on('message', (message) => {
      console.log('Received message from the server:', message);
      if (message.type === 'updateCollaborativeNote') {
        dispatch(appSlice.actions.updateCollaborativeNote(message.data));
      }
    });
  }, []);

  const handleNoteChange = (noteId, content, version) => {
    // Send the updated note to the server
    sendMessage({ type: 'updateCollaborativeNote', data: { noteId, content, version } });
  };

  return (
    <div>
      <h1>Dashboard Page</h1>
      <NoteCard
        noteId="example-note"
        content="This is an example note"
        version={1}
        onChange={handleNoteChange}
      />
      {conflictResolution && (
        <div>
          <h2>Conflict Resolution</h2>
          <p>
            There is a conflict with note {conflictResolution.noteId}. Please resolve the conflict by
            selecting one of the versions.
          </p>
          <button onClick={() => dispatch(appSlice.actions.setConflictResolution(null))}>
            Resolve Conflict
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;