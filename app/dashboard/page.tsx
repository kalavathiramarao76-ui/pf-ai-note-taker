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

// Define the reducer
const appReducer = (state: AppState = {
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
}, action: any) => {
  switch (action.type) {
    case 'SET_NOTES':
      return { ...state, notes: action.notes };
    case 'SET_MEETINGS':
      return { ...state, meetings: action.meetings };
    case 'SET_TEMPLATES':
      return { ...state, templates: action.templates };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.searchQuery };
    case 'SET_GENERATED_NOTES':
      return { ...state, generatedNotes: action.generatedNotes };
    case 'SET_FOLDERS':
      return { ...state, folders: action.folders };
    case 'SET_SELECTED_FOLDER':
      return { ...state, selectedFolder: action.selectedFolder };
    case 'SET_EDITING_NOTE':
      return { ...state, editingNote: action.editingNote };
    case 'SET_SORTED_NOTES':
      return { ...state, sortedNotes: action.sortedNotes };
    case 'SET_SORTED_MEETINGS':
      return { ...state, sortedMeetings: action.sortedMeetings };
    case 'SET_SORTED_TEMPLATES':
      return { ...state, sortedTemplates: action.sortedTemplates };
    case 'SET_FILTER_TYPE':
      return { ...state, filterType: action.filterType };
    case 'SET_SORT_BY':
      return { ...state, sortBy: action.sortBy };
    case 'SET_SORT_ORDER':
      return { ...state, sortOrder: action.sortOrder };
    case 'SET_FILTER_BY_TAGS':
      return { ...state, filterByTags: action.filterByTags };
    case 'SET_FILTER_BY_DATE':
      return { ...state, filterByDate: action.filterByDate };
    case 'SET_AI_SUGGESTIONS':
      return { ...state, aiSuggestions: action.aiSuggestions };
    case 'SET_AUTOCOMPLETE_SUGGESTIONS':
      return { ...state, autocompleteSuggestions: action.autocompleteSuggestions };
    case 'SET_PRIORITY':
      return { ...state, priority: action.priority };
    case 'SET_DEADLINE':
      return { ...state, deadline: action.deadline };
    case 'SET_NOTE_TITLE':
      return { ...state, noteTitle: action.noteTitle };
    case 'SET_NOTE_CONTENT':
      return { ...state, noteContent: action.noteContent };
    case 'SET_IS_GENERATING_NOTE':
      return { ...state, isGeneratingNote: action.isGeneratingNote };
    case 'SET_EDITOR_STATE':
      return { ...state, editorState: action.editorState };
    case 'SET_QUICK_NOTE':
      return { ...state, quickNote: action.quickNote };
    case 'SET_IS_QUICK_NOTE_OPEN':
      return { ...state, isQuickNoteOpen: action.isQuickNoteOpen };
    case 'SET_TAGS':
      return { ...state, tags: action.tags };
    case 'SET_SELECTED_TAGS':
      return { ...state, selectedTags: action.selectedTags };
    case 'SET_NOTE_TAGS':
      return { ...state, noteTags: action.noteTags };
    case 'SET_TAG_INPUT':
      return { ...state, tagInput: action.tagInput };
    case 'SET_TAG_SUGGESTIONS':
      return { ...state, tagSuggestions: action.tagSuggestions };
    case 'SET_SOCKET':
      return { ...state, socket: action.socket };
    case 'SET_COLLABORATORS':
      return { ...state, collaborators: action.collaborators };
    case 'SET_COLLABORATIVE_EDITOR_STATE':
      return { ...state, collaborativeEditorState: action.collaborativeEditorState };
    case 'SET_NOTE_VERSIONS':
      return { ...state, noteVersions: action.noteVersions };
    case 'SET_CONFLICT_RESOLUTION':
      return { ...state, conflictResolution: action.conflictResolution };
    case 'SET_REAL_TIME_COLLABORATION':
      return { ...state, realTimeCollaboration: action.realTimeCollaboration };
    case 'SET_FOLDER_NOTES':
      return { ...state, folderNotes: action.folderNotes };
    case 'SET_FOLDER_TAGS':
      return { ...state, folderTags: action.folderTags };
    case 'SET_VERSION_HISTORY':
      return { ...state, versionHistory: action.versionHistory };
    case 'SET_COLLABORATIVE_NOTES':
      return { ...state, collaborativeNotes: action.collaborativeNotes };
    default:
      return state;
  }
};

// Create the store
const store = configureStore({
  reducer: {
    app: appReducer,
  },
  middleware: [thunk],
});

// Define the actions
export const setNotes = (notes: any[]) => ({ type: 'SET_NOTES', notes });
export const setMeetings = (meetings: any[]) => ({ type: 'SET_MEETINGS', meetings });
export const setTemplates = (templates: any[]) => ({ type: 'SET_TEMPLATES', templates });
export const setSearchQuery = (searchQuery: string) => ({ type: 'SET_SEARCH_QUERY', searchQuery });
export const setGeneratedNotes = (generatedNotes: any[]) => ({ type: 'SET_GENERATED_NOTES', generatedNotes });
export const setFolders = (folders: any[]) => ({ type: 'SET_FOLDERS', folders });
export const setSelectedFolder = (selectedFolder: any) => ({ type: 'SET_SELECTED_FOLDER', selectedFolder });
export const setEditingNote = (editingNote: any) => ({ type: 'SET_EDITING_NOTE', editingNote });
export const setSortedNotes = (sortedNotes: any[]) => ({ type: 'SET_SORTED_NOTES', sortedNotes });
export const setSortedMeetings = (sortedMeetings: any[]) => ({ type: 'SET_SORTED_MEETINGS', sortedMeetings });
export const setSortedTemplates = (sortedTemplates: any[]) => ({ type: 'SET_SORTED_TEMPLATES', sortedTemplates });
export const setFilterType = (filterType: string) => ({ type: 'SET_FILTER_TYPE', filterType });
export const setSortBy = (sortBy: string) => ({ type: 'SET_SORT_BY', sortBy });
export const setSortOrder = (sortOrder: string) => ({ type: 'SET_SORT_ORDER', sortOrder });
export const setFilterByTags = (filterByTags: any[]) => ({ type: 'SET_FILTER_BY_TAGS', filterByTags });
export const setFilterByDate = (filterByDate: string) => ({ type: 'SET_FILTER_BY_DATE', filterByDate });
export const setAiSuggestions = (aiSuggestions: any[]) => ({ type: 'SET_AI_SUGGESTIONS', aiSuggestions });
export const setAutocompleteSuggestions = (autocompleteSuggestions: any[]) => ({ type: 'SET_AUTOCOMPLETE_SUGGESTIONS', autocompleteSuggestions });
export const setPriority = (priority: string) => ({ type: 'SET_PRIORITY', priority });
export const setDeadline = (deadline: string) => ({ type: 'SET_DEADLINE', deadline });
export const setNoteTitle = (noteTitle: string) => ({ type: 'SET_NOTE_TITLE', noteTitle });
export const setNoteContent = (noteContent: string) => ({ type: 'SET_NOTE_CONTENT', noteContent });
export const setIsGeneratingNote = (isGeneratingNote: boolean) => ({ type: 'SET_IS_GENERATING_NOTE', isGeneratingNote });
export const setEditorState = (editorState: EditorState) => ({ type: 'SET_EDITOR_STATE', editorState });
export const setQuickNote = (quickNote: string) => ({ type: 'SET_QUICK_NOTE', quickNote });
export const setIsQuickNoteOpen = (isQuickNoteOpen: boolean) => ({ type: 'SET_IS_QUICK_NOTE_OPEN', isQuickNoteOpen });
export const setTags = (tags: any[]) => ({ type: 'SET_TAGS', tags });
export const setSelectedTags = (selectedTags: any[]) => ({ type: 'SET_SELECTED_TAGS', selectedTags });
export const setNoteTags = (noteTags: any) => ({ type: 'SET_NOTE_TAGS', noteTags });
export const setTagInput = (tagInput: string) => ({ type: 'SET_TAG_INPUT', tagInput });
export const setTagSuggestions = (tagSuggestions: any[]) => ({ type: 'SET_TAG_SUGGESTIONS', tagSuggestions });
export const setSocket = (socket: Socket | null) => ({ type: 'SET_SOCKET', socket });
export const setCollaborators = (collaborators: any[]) => ({ type: 'SET_COLLABORATORS', collaborators });
export const setCollaborativeEditorState = (collaborativeEditorState: any) => ({ type: 'SET_COLLABORATIVE_EDITOR_STATE', collaborativeEditorState });
export const setNoteVersions = (noteVersions: any) => ({ type: 'SET_NOTE_VERSIONS', noteVersions });
export const setConflictResolution = (conflictResolution: any) => ({ type: 'SET_CONFLICT_RESOLUTION', conflictResolution });
export const setRealTimeCollaboration = (realTimeCollaboration: any) => ({ type: 'SET_REAL_TIME_COLLABORATION', realTimeCollaboration });
export const setFolderNotes = (folderNotes: any) => ({ type: 'SET_FOLDER_NOTES', folderNotes });
export const setFolderTags = (folderTags: any) => ({ type: 'SET_FOLDER_TAGS', folderTags });
export const setVersionHistory = (versionHistory: any) => ({ type: 'SET_VERSION_HISTORY', versionHistory });
export const setCollaborativeNotes = (collaborativeNotes: any) => ({ type: 'SET_COLLABORATIVE_NOTES', collaborativeNotes });

// Define the Dashboard component
const Dashboard = () => {
  const dispatch = useDispatch();
  const state = useSelector((state: any) => state.app);

  useEffect(() => {
    // Initialize the store with default values
    dispatch(setNotes([]));
    dispatch(setMeetings([]));
    dispatch(setTemplates([]));
    dispatch(setSearchQuery(''));
    dispatch(setGeneratedNotes([]));
    dispatch(setFolders([]));
    dispatch(setSelectedFolder(null));
    dispatch(setEditingNote(null));
    dispatch(setSortedNotes([]));
    dispatch(setSortedMeetings([]));
    dispatch(setSortedTemplates([]));
    dispatch(setFilterType('all'));
    dispatch(setSortBy('title'));
    dispatch(setSortOrder('asc'));
    dispatch(setFilterByTags([]));
    dispatch(setFilterByDate(''));
    dispatch(setAiSuggestions([]));
    dispatch(setAutocompleteSuggestions([]));
    dispatch(setPriority('all'));
    dispatch(setDeadline(''));
    dispatch(setNoteTitle(''));
    dispatch(setNoteContent(''));
    dispatch(setIsGeneratingNote(false));
    dispatch(setEditorState(EditorState.createWithContent(ContentState.createFromText(''))));
    dispatch(setQuickNote(''));
    dispatch(setIsQuickNoteOpen(false));
    dispatch(setTags([]));
    dispatch(setSelectedTags([]));
    dispatch(setNoteTags({}));
    dispatch(setTagInput(''));
    dispatch(setTagSuggestions([]));
    dispatch(setSocket(null));
    dispatch(setCollaborators([]));
    dispatch(setCollaborativeEditorState({}));
    dispatch(setNoteVersions({}));
    dispatch(setConflictResolution({}));
    dispatch(setRealTimeCollaboration({}));
    dispatch(setFolderNotes({}));
    dispatch(setFolderTags({}));
    dispatch(setVersionHistory({}));
    dispatch(setCollaborativeNotes({}));
  }, [dispatch]);

  return (
    <div>
      <h1>Dashboard</h1>
      <Link href="/notes">
        <a>Notes</a>
      </Link>
      <Link href="/meetings">
        <a>Meetings</a>
      </Link>
      <Link href="/templates">
        <a>Templates</a>
      </Link>
      <NoteCard />
      <MeetingCard />
      <TemplateCard />
      <Editor editorState={state.editorState} />
    </div>
  );
};

// Wrap the Dashboard component with the Provider
const App = () => {
  return (
    <Provider store={store}>
      <Dashboard />
    </Provider>
  );
};

export default App;