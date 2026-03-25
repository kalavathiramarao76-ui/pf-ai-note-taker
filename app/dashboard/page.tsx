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
    collaborativeEditorState: {}, 
    noteVersions: {}, 
    conflictResolution: {}, 
    realTimeCollaboration: {}, 
    folderNotes: {}, 
    folderTags: {}, 
    versionHistory: {}, 
    collaborativeNotes: {}, 
    folderStructure: {
      root: {
        id: 'root',
        name: 'Root',
        children: [],
        notes: []
      }
    }
  },
  reducers: {
    setNotes(state, action: PayloadAction<{ id: string, note: any }>) {
      state.notes.set(action.payload.id, action.payload.note);
    },
    addNote(state, action: PayloadAction<{ id: string, note: any }>) {
      state.notes.set(action.payload.id, action.payload.note);
    },
    removeNote(state, action: PayloadAction<string>) {
      state.notes.delete(action.payload);
    },
    setMeetings(state, action: PayloadAction<{ id: string, meeting: any }>) {
      state.meetings.set(action.payload.id, action.payload.meeting);
    },
    addMeeting(state, action: PayloadAction<{ id: string, meeting: any }>) {
      state.meetings.set(action.payload.id, action.payload.meeting);
    },
    removeMeeting(state, action: PayloadAction<string>) {
      state.meetings.delete(action.payload);
    },
    setTemplates(state, action: PayloadAction<{ id: string, template: any }>) {
      state.templates.set(action.payload.id, action.payload.template);
    },
    addTemplate(state, action: PayloadAction<{ id: string, template: any }>) {
      state.templates.set(action.payload.id, action.payload.template);
    },
    removeTemplate(state, action: PayloadAction<string>) {
      state.templates.delete(action.payload);
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
    }
  }
});

const store = configureStore({
  reducer: {
    app: appSlice.reducer
  },
  middleware: [thunk]
});

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { notes, meetings, templates, searchQuery, generatedNotes, folders, selectedFolder, editingNote, sortedNotes, sortedMeetings, sortedTemplates, filterType, sortBy, sortOrder, filterByTags, filterByDate, aiSuggestions, autocompleteSuggestions, priority, deadline, noteTitle, noteContent, isGeneratingNote, editorState, quickNote, isQuickNoteOpen, tags, selectedTags, noteTags, tagInput, tagSuggestions, socket, collaborators, collaborativeEditorState, noteVersions, conflictResolution, realTimeCollaboration, folderNotes, folderTags, versionHistory, collaborativeNotes, folderStructure } = useSelector((state: any) => state.app);

  useEffect(() => {
    // Initialize notes, meetings, and templates with some data
    const notesData = [
      { id: 'note1', title: 'Note 1', content: 'This is note 1' },
      { id: 'note2', title: 'Note 2', content: 'This is note 2' },
      { id: 'note3', title: 'Note 3', content: 'This is note 3' }
    ];
    const meetingsData = [
      { id: 'meeting1', title: 'Meeting 1', date: '2024-01-01' },
      { id: 'meeting2', title: 'Meeting 2', date: '2024-01-02' },
      { id: 'meeting3', title: 'Meeting 3', date: '2024-01-03' }
    ];
    const templatesData = [
      { id: 'template1', title: 'Template 1', content: 'This is template 1' },
      { id: 'template2', title: 'Template 2', content: 'This is template 2' },
      { id: 'template3', title: 'Template 3', content: 'This is template 3' }
    ];

    notesData.forEach((note) => dispatch(appSlice.actions.addNote({ id: note.id, note })));
    meetingsData.forEach((meeting) => dispatch(appSlice.actions.addMeeting({ id: meeting.id, meeting })));
    templatesData.forEach((template) => dispatch(appSlice.actions.addTemplate({ id: template.id, template })));
  }, [dispatch]);

  return (
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
        {Array.from(notes.values()).map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
      <div>
        <h2>Meetings</h2>
        {Array.from(meetings.values()).map((meeting) => (
          <MeetingCard key={meeting.id} meeting={meeting} />
        ))}
      </div>
      <div>
        <h2>Templates</h2>
        {Array.from(templates.values()).map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
      <Editor editorState={editorState} />
    </div>
  );
};

export default () => (
  <Provider store={store}>
    <DashboardPage />
  </Provider>
);