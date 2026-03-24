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
    default:
      return state;
  }
};

// Create the store
const store = createStore(reducer, applyMiddleware(thunk));

export default function DashboardPage() {
  const dispatch = useDispatch();
  const {
    notes,
    meetings,
    templates,
    searchQuery,
    generatedNotes,
    folders,
    selectedFolder,
    editingNote,
    sortedNotes,
    sortedMeetings,
    sortedTemplates,
    filterType,
    sortBy,
    sortOrder,
    filterByTags,
    filterByDate,
    aiSuggestions,
    autocompleteSuggestions,
    priority,
    deadline,
    noteTitle,
    noteContent,
    isGeneratingNote,
    editorState,
    quickNote,
    isQuickNoteOpen,
  } = useSelector((state) => state);

  useEffect(() => {
    const storedNotes = localStorage.getItem('notes');
    const storedMeetings = localStorage.getItem('meetings');
    const storedTemplates = localStorage.getItem('templates');
    const storedFolders = localStorage.getItem('folders');

    if (storedNotes) {
      dispatch({ type: 'SET_NOTES', notes: JSON.parse(storedNotes) });
    }
    if (storedMeetings) {
      dispatch({ type: 'SET_MEETINGS', meetings: JSON.parse(storedMeetings) });
    }
    if (storedTemplates) {
      dispatch({ type: 'SET_TEMPLATES', templates: JSON.parse(storedTemplates) });
    }
    if (storedFolders) {
      dispatch({ type: 'SET_FOLDERS', folders: JSON.parse(storedFolders) });
    }
  }, []);

  useEffect(() => {
    const filteredNotes = notes.filter((note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      filterByTags.every((tag) => note.tags.includes(tag)) &&
      (filterByDate === '' || note.date.includes(filterByDate)) &&
      (priority === 'all' || note.priority === priority) &&
      (deadline === '' || note.deadline.includes(deadline))
    );
    dispatch({ type: 'SET_SORTED_NOTES', sortedNotes: filteredNotes });
  }, [notes, searchQuery, filterByTags, filterByDate, priority, deadline]);

  return (
    <Provider store={store}>
      <div>
        <Link href="/notes">
          <a>
            <AiOutlinePlus />
            Create Note
          </a>
        </Link>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', searchQuery: e.target.value })}
          placeholder="Search notes"
        />
        <div>
          {sortedNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
        <div>
          {sortedMeetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
        <div>
          {sortedTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
        <Editor editorState={editorState} onChange={(editorState) => dispatch({ type: 'SET_EDITOR_STATE', editorState })} />
        <input
          type="text"
          value={quickNote}
          onChange={(e) => dispatch({ type: 'SET_QUICK_NOTE', quickNote: e.target.value })}
          placeholder="Quick note"
        />
        <button onClick={() => dispatch({ type: 'SET_IS_QUICK_NOTE_OPEN', isQuickNoteOpen: !isQuickNoteOpen })}>
          {isQuickNoteOpen ? 'Close' : 'Open'} Quick Note
        </button>
      </div>
    </Provider>
  );
}