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
    case 'SET_TAGS':
      return { ...state, tags: action.tags };
    case 'SET_SELECTED_TAGS':
      return { ...state, selectedTags: action.selectedTags };
    case 'SET_NOTE_TAGS':
      return { ...state, noteTags: action.noteTags };
    case 'ADD_TAG_TO_NOTE':
      const noteId = action.noteId;
      const tag = action.tag;
      const updatedNoteTags = { ...state.noteTags };
      if (!updatedNoteTags[noteId]) {
        updatedNoteTags[noteId] = [];
      }
      updatedNoteTags[noteId].push(tag);
      return { ...state, noteTags: updatedNoteTags };
    case 'REMOVE_TAG_FROM_NOTE':
      const noteIdToRemove = action.noteId;
      const tagToRemove = action.tag;
      const updatedNoteTagsRemove = { ...state.noteTags };
      if (updatedNoteTagsRemove[noteIdToRemove]) {
        updatedNoteTagsRemove[noteIdToRemove] = updatedNoteTagsRemove[noteIdToRemove].filter((t) => t !== tagToRemove);
      }
      return { ...state, noteTags: updatedNoteTagsRemove };
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

// Define the page component
const DashboardPage = () => {
  const dispatch = useDispatch();
  const { notes, tags, selectedTags, noteTags } = useSelector((state) => state.app);

  useEffect(() => {
    // Load initial data
    client.getNotes().then((notes) => dispatch({ type: 'SET_NOTES', notes }));
    client.getTags().then((tags) => dispatch({ type: 'SET_TAGS', tags }));
  }, []);

  const handleAddTagToNote = (noteId, tag) => {
    dispatch({ type: 'ADD_TAG_TO_NOTE', noteId, tag });
  };

  const handleRemoveTagFromNote = (noteId, tag) => {
    dispatch({ type: 'REMOVE_TAG_FROM_NOTE', noteId, tag });
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <NoteCard note={note} />
            <ul>
              {noteTags[note.id] && noteTags[note.id].map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
            <input
              type="text"
              placeholder="Add tag"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddTagToNote(note.id, e.target.value);
                  e.target.value = '';
                }
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

// Render the page component with the store
const App = () => {
  return (
    <Provider store={store}>
      <DashboardPage />
    </Provider>
  );
};

export default App;