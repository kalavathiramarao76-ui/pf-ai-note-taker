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
import { createStore, combineReducers, applyMiddleware } from 'redux';
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
const reducer = (state = initialState, action) => {
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
    case 'ADD_TAG':
      return { ...state, tags: [...state.tags, action.tag] };
    case 'REMOVE_TAG':
      return { ...state, tags: state.tags.filter(tag => tag !== action.tag) };
    case 'ASSIGN_TAG_TO_NOTE':
      return { ...state, noteTags: { ...state.noteTags, [action.noteId]: [...(state.noteTags[action.noteId] || []), action.tag] } };
    case 'REMOVE_TAG_FROM_NOTE':
      return { ...state, noteTags: { ...state.noteTags, [action.noteId]: state.noteTags[action.noteId].filter(tag => tag !== action.tag) } };
    default:
      return state;
  }
};

// Create the store
const store = createStore(reducer, applyMiddleware(thunk));

// Define the page component
const DashboardPage = () => {
  const dispatch = useDispatch();
  const { notes, tags, noteTags } = useSelector(state => state);

  // Handle adding a new tag
  const handleAddTag = (tag) => {
    dispatch({ type: 'ADD_TAG', tag });
  };

  // Handle removing a tag
  const handleRemoveTag = (tag) => {
    dispatch({ type: 'REMOVE_TAG', tag });
  };

  // Handle assigning a tag to a note
  const handleAssignTagToNote = (noteId, tag) => {
    dispatch({ type: 'ASSIGN_TAG_TO_NOTE', noteId, tag });
  };

  // Handle removing a tag from a note
  const handleRemoveTagFromNote = (noteId, tag) => {
    dispatch({ type: 'REMOVE_TAG_FROM_NOTE', noteId, tag });
  };

  return (
    <div>
      <h1>AutoNote: AI-Powered Note Taker</h1>
      <Link href="/notes">
        <a>
          <AiOutlinePlus />
          Create a new note
        </a>
      </Link>
      <div>
        {notes.map(note => (
          <NoteCard key={note.id} note={note} tags={noteTags[note.id] || []} onAssignTag={handleAssignTagToNote} onRemoveTag={handleRemoveTagFromNote} />
        ))}
      </div>
      <div>
        <h2>Tags</h2>
        <ul>
          {tags.map(tag => (
            <li key={tag}>{tag} <button onClick={() => handleRemoveTag(tag)}>Remove</button></li>
          ))}
        </ul>
        <input type="text" placeholder="Add a new tag" onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleAddTag(e.target.value);
            e.target.value = '';
          }
        }} />
      </div>
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