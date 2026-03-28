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
    notePriorityLevels: {},
    noteTagSuggestionsMap: {},
  },
  reducers: {
    addNote(state, action: PayloadAction<any>) {
      state.notes[action.payload.id] = action.payload;
    },
    addMeeting(state, action: PayloadAction<any>) {
      state.meetings[action.payload.id] = action.payload;
    },
    addTemplate(state, action: PayloadAction<any>) {
      state.templates[action.payload.id] = action.payload;
    },
    updateNote(state, action: PayloadAction<any>) {
      state.notes[action.payload.id] = action.payload;
    },
    updateMeeting(state, action: PayloadAction<any>) {
      state.meetings[action.payload.id] = action.payload;
    },
    updateTemplate(state, action: PayloadAction<any>) {
      state.templates[action.payload.id] = action.payload;
    },
    deleteNote(state, action: PayloadAction<string>) {
      delete state.notes[action.payload];
    },
    deleteMeeting(state, action: PayloadAction<string>) {
      delete state.meetings[action.payload];
    },
    deleteTemplate(state, action: PayloadAction<string>) {
      delete state.templates[action.payload];
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
  const { notes, meetings, templates } = useSelector((state: any) => state.app);

  useEffect(() => {
    client.getNotes().then((notes) => {
      notes.forEach((note) => {
        dispatch(appSlice.actions.addNote(note));
      });
    });
    client.getMeetings().then((meetings) => {
      meetings.forEach((meeting) => {
        dispatch(appSlice.actions.addMeeting(meeting));
      });
    });
    client.getTemplates().then((templates) => {
      templates.forEach((template) => {
        dispatch(appSlice.actions.addTemplate(template));
      });
    });
  }, []);

  const handleAddNote = (note: any) => {
    dispatch(appSlice.actions.addNote(note));
  };

  const handleAddMeeting = (meeting: any) => {
    dispatch(appSlice.actions.addMeeting(meeting));
  };

  const handleAddTemplate = (template: any) => {
    dispatch(appSlice.actions.addTemplate(template));
  };

  const handleUpdateNote = (note: any) => {
    dispatch(appSlice.actions.updateNote(note));
  };

  const handleUpdateMeeting = (meeting: any) => {
    dispatch(appSlice.actions.updateMeeting(meeting));
  };

  const handleUpdateTemplate = (template: any) => {
    dispatch(appSlice.actions.updateTemplate(template));
  };

  const handleDeleteNote = (noteId: string) => {
    dispatch(appSlice.actions.deleteNote(noteId));
  };

  const handleDeleteMeeting = (meetingId: string) => {
    dispatch(appSlice.actions.deleteMeeting(meetingId));
  };

  const handleDeleteTemplate = (templateId: string) => {
    dispatch(appSlice.actions.deleteTemplate(templateId));
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
          <h2>Notes</h2>
          {Object.values(notes).map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
          <button onClick={() => handleAddNote({ id: 'new-note', title: 'New Note' })}>
            Add Note
          </button>
        </div>
        <div>
          <h2>Meetings</h2>
          {Object.values(meetings).map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
          <button onClick={() => handleAddMeeting({ id: 'new-meeting', title: 'New Meeting' })}>
            Add Meeting
          </button>
        </div>
        <div>
          <h2>Templates</h2>
          {Object.values(templates).map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
          <button onClick={() => handleAddTemplate({ id: 'new-template', title: 'New Template' })}>
            Add Template
          </button>
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