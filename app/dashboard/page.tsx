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
    setCollaborativeNoteId(state, action: PayloadAction<string>) {
      state.collaborativeNoteId = action.payload;
    },
    setCollaborativeNoteContent(state, action: PayloadAction<string>) {
      state.collaborativeNoteContent = action.payload;
    },
    setCollaborativeNoteVersion(state, action: PayloadAction<number>) {
      state.collaborativeNoteVersion = action.payload;
    },
    updateCollaborativeNote(state, action: PayloadAction<{ content: string; version: number }>) {
      if (action.payload.version > state.collaborativeNoteVersion) {
        state.collaborativeNoteContent = action.payload.content;
        state.collaborativeNoteVersion = action.payload.version;
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

// Initialize the socket
const socket = io();

// Establish real-time collaboration connection
socket.on('connect', () => {
  console.log('Connected to the server');
});

socket.on('collaborative-note-update', (data: { noteId: string; content: string; version: number }) => {
  store.dispatch(appSlice.actions.updateCollaborativeNote(data));
});

// Send updates to the server
const sendCollaborativeNoteUpdate = (noteId: string, content: string, version: number) => {
  socket.emit('collaborative-note-update', { noteId, content, version });
};

// Conflict resolution
const resolveConflict = (localVersion: number, remoteVersion: number, localContent: string, remoteContent: string) => {
  if (localVersion > remoteVersion) {
    return localContent;
  } else if (localVersion < remoteVersion) {
    return remoteContent;
  } else {
    // Merge the changes
    return mergeChanges(localContent, remoteContent);
  }
};

const mergeChanges = (localContent: string, remoteContent: string) => {
  // Implement a merge strategy (e.g., three-way merge)
  // For simplicity, we'll just concatenate the changes
  return localContent + remoteContent;
};

// Real-time collaboration
const CollaborativeEditor = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [collaborativeNoteId, setCollaborativeNoteId] = useState('');
  const [collaborativeNoteContent, setCollaborativeNoteContent] = useState('');
  const [collaborativeNoteVersion, setCollaborativeNoteVersion] = useState(0);

  useEffect(() => {
    socket.on('collaborative-note-update', (data: { noteId: string; content: string; version: number }) => {
      if (data.noteId === collaborativeNoteId) {
        const updatedContent = resolveConflict(collaborativeNoteVersion, data.version, collaborativeNoteContent, data.content);
        setCollaborativeNoteContent(updatedContent);
        setCollaborativeNoteVersion(data.version);
      }
    });
  }, [collaborativeNoteId, collaborativeNoteContent, collaborativeNoteVersion]);

  const handleEditorChange = (newState: EditorState) => {
    setEditorState(newState);
    const content = newState.getCurrentContent().getPlainText();
    sendCollaborativeNoteUpdate(collaborativeNoteId, content, collaborativeNoteVersion + 1);
  };

  return (
    <Editor
      editorState={editorState}
      onChange={handleEditorChange}
      placeholder="Type here..."
    />
  );
};

const DashboardPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { notes, meetings, templates, searchQuery, generatedNotes, folders, selectedFolder, editingNote, sortedNotes, sortedMeetings, sortedTemplates, filterType, sortBy, sortOrder, filterByTags, filterByDate, aiSuggestions, autocompleteSuggestions, priority, deadline, noteTitle, noteContent, isGeneratingNote, editorState, quickNote, isQuickNoteOpen, tags, selectedTags, noteTags, tagInput, tagSuggestions, socket, collaborators, collaborativeEditorState, noteVersions, conflictResolution, realTimeCollaboration, folderNotes, folderTags, versionHistory, collaborativeNotes, folderStructure, noteSummaries, folderMap, draggedNote, draggedOverFolder, folderTree, noteTagMap, suggestedTags, filteredNotes, folderNotesMap, noteFolderMap, tagFilter, folderName, newFolderName, isFolderOpen, folderId, folderTags, subfolders, folderTagsMap, availableTags, tagInputValue, tagSuggestionsList, noteTagSuggestions, aiModel, noteCompletion, notePriorities, noteDueDates, noteReminders, notePriorityLevels, noteTagSuggestionsMap, collaborativeNoteId, collaborativeNoteContent, collaborativeNoteVersion } = useSelector((state: AppState) => state);

  return (
    <div>
      <h1>AutoNote: AI-Powered Note Taker</h1>
      <CollaborativeEditor />
      <NoteCard />
      <MeetingCard />
      <TemplateCard />
    </div>
  );
};

export default DashboardPage;