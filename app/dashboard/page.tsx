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
const initialState = {
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
  noteTags: {}, // store tags for each note
  tagInput: '', // input for tag autocomplete
  tagSuggestions: [], // suggestions for tag autocomplete
  socket: null,
  collaborators: [], // store collaborators for each note
  collaborativeEditorState: {}, // store collaborative editor state for each note
  noteVersions: {}, // store versions of each note
  conflictResolution: {}, // store conflict resolution data for each note
  realTimeCollaboration: {}, // store real-time collaboration data for each note
  folderNotes: {}, // store notes for each folder
  folderTags: {}, // store tags for each folder
  versionHistory: {}, // store version history for each note
  collaborativeNotes: {}, // store collaborative notes
};

// Define the reducer
const appReducer = (state = initialState, action) => {
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

// Create a store with the reducer
const store = configureStore({
  reducer: {
    app: appReducer,
  },
  middleware: [thunk],
});

// Define actions
const setNotes = (notes) => ({ type: 'SET_NOTES', notes });
const setMeetings = (meetings) => ({ type: 'SET_MEETINGS', meetings });
const setTemplates = (templates) => ({ type: 'SET_TEMPLATES', templates });
const setSearchQuery = (searchQuery) => ({ type: 'SET_SEARCH_QUERY', searchQuery });
const setGeneratedNotes = (generatedNotes) => ({ type: 'SET_GENERATED_NOTES', generatedNotes });
const setFolders = (folders) => ({ type: 'SET_FOLDERS', folders });
const setSelectedFolder = (selectedFolder) => ({ type: 'SET_SELECTED_FOLDER', selectedFolder });
const setEditingNote = (editingNote) => ({ type: 'SET_EDITING_NOTE', editingNote });
const setSortedNotes = (sortedNotes) => ({ type: 'SET_SORTED_NOTES', sortedNotes });
const setSortedMeetings = (sortedMeetings) => ({ type: 'SET_SORTED_MEETINGS', sortedMeetings });
const setSortedTemplates = (sortedTemplates) => ({ type: 'SET_SORTED_TEMPLATES', sortedTemplates });
const setFilterType = (filterType) => ({ type: 'SET_FILTER_TYPE', filterType });
const setSortBy = (sortBy) => ({ type: 'SET_SORT_BY', sortBy });
const setSortOrder = (sortOrder) => ({ type: 'SET_SORT_ORDER', sortOrder });
const setFilterByTags = (filterByTags) => ({ type: 'SET_FILTER_BY_TAGS', filterByTags });
const setFilterByDate = (filterByDate) => ({ type: 'SET_FILTER_BY_DATE', filterByDate });
const setAiSuggestions = (aiSuggestions) => ({ type: 'SET_AI_SUGGESTIONS', aiSuggestions });
const setAutocompleteSuggestions = (autocompleteSuggestions) => ({ type: 'SET_AUTOCOMPLETE_SUGGESTIONS', autocompleteSuggestions });
const setPriority = (priority) => ({ type: 'SET_PRIORITY', priority });
const setDeadline = (deadline) => ({ type: 'SET_DEADLINE', deadline });
const setNoteTitle = (noteTitle) => ({ type: 'SET_NOTE_TITLE', noteTitle });
const setNoteContent = (noteContent) => ({ type: 'SET_NOTE_CONTENT', noteContent });
const setIsGeneratingNote = (isGeneratingNote) => ({ type: 'SET_IS_GENERATING_NOTE', isGeneratingNote });
const setEditorState = (editorState) => ({ type: 'SET_EDITOR_STATE', editorState });
const setQuickNote = (quickNote) => ({ type: 'SET_QUICK_NOTE', quickNote });
const setIsQuickNoteOpen = (isQuickNoteOpen) => ({ type: 'SET_IS_QUICK_NOTE_OPEN', isQuickNoteOpen });
const setTags = (tags) => ({ type: 'SET_TAGS', tags });
const setSelectedTags = (selectedTags) => ({ type: 'SET_SELECTED_TAGS', selectedTags });
const setNoteTags = (noteTags) => ({ type: 'SET_NOTE_TAGS', noteTags });
const setTagInput = (tagInput) => ({ type: 'SET_TAG_INPUT', tagInput });
const setTagSuggestions = (tagSuggestions) => ({ type: 'SET_TAG_SUGGESTIONS', tagSuggestions });
const setSocket = (socket) => ({ type: 'SET_SOCKET', socket });
const setCollaborators = (collaborators) => ({ type: 'SET_COLLABORATORS', collaborators });
const setCollaborativeEditorState = (collaborativeEditorState) => ({ type: 'SET_COLLABORATIVE_EDITOR_STATE', collaborativeEditorState });
const setNoteVersions = (noteVersions) => ({ type: 'SET_NOTE_VERSIONS', noteVersions });
const setConflictResolution = (conflictResolution) => ({ type: 'SET_CONFLICT_RESOLUTION', conflictResolution });
const setRealTimeCollaboration = (realTimeCollaboration) => ({ type: 'SET_REAL_TIME_COLLABORATION', realTimeCollaboration });
const setFolderNotes = (folderNotes) => ({ type: 'SET_FOLDER_NOTES', folderNotes });
const setFolderTags = (folderTags) => ({ type: 'SET_FOLDER_TAGS', folderTags });
const setVersionHistory = (versionHistory) => ({ type: 'SET_VERSION_HISTORY', versionHistory });
const setCollaborativeNotes = (collaborativeNotes) => ({ type: 'SET_COLLABORATIVE_NOTES', collaborativeNotes });

// Define a hook to use the store
const useAppStore = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.app);

  return {
    state,
    dispatch,
    setNotes: (notes) => dispatch(setNotes(notes)),
    setMeetings: (meetings) => dispatch(setMeetings(meetings)),
    setTemplates: (templates) => dispatch(setTemplates(templates)),
    setSearchQuery: (searchQuery) => dispatch(setSearchQuery(searchQuery)),
    setGeneratedNotes: (generatedNotes) => dispatch(setGeneratedNotes(generatedNotes)),
    setFolders: (folders) => dispatch(setFolders(folders)),
    setSelectedFolder: (selectedFolder) => dispatch(setSelectedFolder(selectedFolder)),
    setEditingNote: (editingNote) => dispatch(setEditingNote(editingNote)),
    setSortedNotes: (sortedNotes) => dispatch(setSortedNotes(sortedNotes)),
    setSortedMeetings: (sortedMeetings) => dispatch(setSortedMeetings(sortedMeetings)),
    setSortedTemplates: (sortedTemplates) => dispatch(setSortedTemplates(sortedTemplates)),
    setFilterType: (filterType) => dispatch(setFilterType(filterType)),
    setSortBy: (sortBy) => dispatch(setSortBy(sortBy)),
    setSortOrder: (sortOrder) => dispatch(setSortOrder(sortOrder)),
    setFilterByTags: (filterByTags) => dispatch(setFilterByTags(filterByTags)),
    setFilterByDate: (filterByDate) => dispatch(setFilterByDate(filterByDate)),
    setAiSuggestions: (aiSuggestions) => dispatch(setAiSuggestions(aiSuggestions)),
    setAutocompleteSuggestions: (autocompleteSuggestions) => dispatch(setAutocompleteSuggestions(autocompleteSuggestions)),
    setPriority: (priority) => dispatch(setPriority(priority)),
    setDeadline: (deadline) => dispatch(setDeadline(deadline)),
    setNoteTitle: (noteTitle) => dispatch(setNoteTitle(noteTitle)),
    setNoteContent: (noteContent) => dispatch(setNoteContent(noteContent)),
    setIsGeneratingNote: (isGeneratingNote) => dispatch(setIsGeneratingNote(isGeneratingNote)),
    setEditorState: (editorState) => dispatch(setEditorState(editorState)),
    setQuickNote: (quickNote) => dispatch(setQuickNote(quickNote)),
    setIsQuickNoteOpen: (isQuickNoteOpen) => dispatch(setIsQuickNoteOpen(isQuickNoteOpen)),
    setTags: (tags) => dispatch(setTags(tags)),
    setSelectedTags: (selectedTags) => dispatch(setSelectedTags(selectedTags)),
    setNoteTags: (noteTags) => dispatch(setNoteTags(noteTags)),
    setTagInput: (tagInput) => dispatch(setTagInput(tagInput)),
    setTagSuggestions: (tagSuggestions) => dispatch(setTagSuggestions(tagSuggestions)),
    setSocket: (socket) => dispatch(setSocket(socket)),
    setCollaborators: (collaborators) => dispatch(setCollaborators(collaborators)),
    setCollaborativeEditorState: (collaborativeEditorState) => dispatch(setCollaborativeEditorState(collaborativeEditorState)),
    setNoteVersions: (noteVersions) => dispatch(setNoteVersions(noteVersions)),
    setConflictResolution: (conflictResolution) => dispatch(setConflictResolution(conflictResolution)),
    setRealTimeCollaboration: (realTimeCollaboration) => dispatch(setRealTimeCollaboration(realTimeCollaboration)),
    setFolderNotes: (folderNotes) => dispatch(setFolderNotes(folderNotes)),
    setFolderTags: (folderTags) => dispatch(setFolderTags(folderTags)),
    setVersionHistory: (versionHistory) => dispatch(setVersionHistory(versionHistory)),
    setCollaborativeNotes: (collaborativeNotes) => dispatch(setCollaborativeNotes(collaborativeNotes)),
  };
};

const DashboardPage = () => {
  const { state, dispatch } = useAppStore();

  // Use the state and dispatch as needed
  useEffect(() => {
    // Initialize the state
    dispatch(setNotes([]));
    dispatch(setMeetings([]));
    dispatch(setTemplates([]));
  }, [dispatch]);

  return (
    <Provider store={store}>
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
        <NoteCard />
        <MeetingCard />
        <TemplateCard />
        <Editor editorState={state.editorState} />
      </div>
    </Provider>
  );
};

export default DashboardPage;