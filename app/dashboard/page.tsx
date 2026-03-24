import client from '../client';
import { useEffect } from 'react';
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
    default:
      return state;
  }
};

// Create the store
const store = configureStore({
  reducer: {
    app: appReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
});

// Define the actions
export const setNotes = (notes) => ({ type: 'SET_NOTES', notes });
export const setMeetings = (meetings) => ({ type: 'SET_MEETINGS', meetings });
export const setTemplates = (templates) => ({ type: 'SET_TEMPLATES', templates });
export const setSearchQuery = (searchQuery) => ({ type: 'SET_SEARCH_QUERY', searchQuery });
export const setGeneratedNotes = (generatedNotes) => ({ type: 'SET_GENERATED_NOTES', generatedNotes });
export const setFolders = (folders) => ({ type: 'SET_FOLDERS', folders });
export const setSelectedFolder = (selectedFolder) => ({ type: 'SET_SELECTED_FOLDER', selectedFolder });
export const setEditingNote = (editingNote) => ({ type: 'SET_EDITING_NOTE', editingNote });
export const setSortedNotes = (sortedNotes) => ({ type: 'SET_SORTED_NOTES', sortedNotes });
export const setSortedMeetings = (sortedMeetings) => ({ type: 'SET_SORTED_MEETINGS', sortedMeetings });
export const setSortedTemplates = (sortedTemplates) => ({ type: 'SET_SORTED_TEMPLATES', sortedTemplates });
export const setFilterType = (filterType) => ({ type: 'SET_FILTER_TYPE', filterType });
export const setSortBy = (sortBy) => ({ type: 'SET_SORT_BY', sortBy });
export const setSortOrder = (sortOrder) => ({ type: 'SET_SORT_ORDER', sortOrder });
export const setFilterByTags = (filterByTags) => ({ type: 'SET_FILTER_BY_TAGS', filterByTags });
export const setFilterByDate = (filterByDate) => ({ type: 'SET_FILTER_BY_DATE', filterByDate });
export const setAiSuggestions = (aiSuggestions) => ({ type: 'SET_AI_SUGGESTIONS', aiSuggestions });
export const setAutocompleteSuggestions = (autocompleteSuggestions) => ({ type: 'SET_AUTOCOMPLETE_SUGGESTIONS', autocompleteSuggestions });

// Define the page component
const Page = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.app);

  useEffect(() => {
    // Initialize the state
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
  }, [dispatch]);

  return (
    <div>
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

// Render the page component with the store
const App = () => {
  return (
    <Provider store={store}>
      <Page />
    </Provider>
  );
};

export default App;