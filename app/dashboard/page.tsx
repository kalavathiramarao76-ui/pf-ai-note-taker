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
    noteTags: null,
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
  },
  reducers: {
    addNote(state, action: PayloadAction<any>) {
      state.notes.set(action.payload.id, action.payload);
    },
    removeNote(state, action: PayloadAction<string>) {
      state.notes.delete(action.payload);
    },
    addMeeting(state, action: PayloadAction<any>) {
      state.meetings.set(action.payload.id, action.payload);
    },
    removeMeeting(state, action: PayloadAction<string>) {
      state.meetings.delete(action.payload);
    },
    addTemplate(state, action: PayloadAction<any>) {
      state.templates.set(action.payload.id, action.payload);
    },
    removeTemplate(state, action: PayloadAction<string>) {
      state.templates.delete(action.payload);
    },
    // Add other reducers as needed
  },
});

const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
  middleware: [thunk],
});

function DashboardPage() {
  const dispatch = useDispatch();
  const state = useSelector((state: any) => state.app);

  useEffect(() => {
    // Initialize the notes, meetings, and templates maps
    const notes = new Map();
    const meetings = new Map();
    const templates = new Map();

    // Fetch data from the API and populate the maps
    client.get('/notes').then((response) => {
      response.data.forEach((note: any) => {
        notes.set(note.id, note);
      });
      dispatch(appSlice.actions.addNote({ id: 'initial', notes }));
    });

    client.get('/meetings').then((response) => {
      response.data.forEach((meeting: any) => {
        meetings.set(meeting.id, meeting);
      });
      dispatch(appSlice.actions.addMeeting({ id: 'initial', meetings }));
    });

    client.get('/templates').then((response) => {
      response.data.forEach((template: any) => {
        templates.set(template.id, template);
      });
      dispatch(appSlice.actions.addTemplate({ id: 'initial', templates }));
    });
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h1>AutoNote: AI-Powered Note Taker</h1>
        <Link href="/notes">
          <a>
            <AiOutlinePlus size={24} />
            Create a new note
          </a>
        </Link>
        <div>
          {Array.from(state.notes.values()).map((note: any) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
        <div>
          {Array.from(state.meetings.values()).map((meeting: any) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
        <div>
          {Array.from(state.templates.values()).map((template: any) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <DashboardPage />
    </Provider>
  );
}