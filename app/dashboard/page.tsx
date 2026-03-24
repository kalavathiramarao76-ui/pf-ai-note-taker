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
    case 'SET_TAGS':
      return { ...state, tags: action.tags };
    case 'SET_SELECTED_TAGS':
      return { ...state, selectedTags: action.selectedTags };
    default:
      return state;
  }
};

// Create the store
const store = createStore(reducer, applyMiddleware(thunk));

// Define the NoteCard component with tag functionality
const NoteCardWithTags = () => {
  const dispatch = useDispatch();
  const notes = useSelector((state) => state.notes);
  const selectedTags = useSelector((state) => state.selectedTags);

  const handleTagClick = (tag) => {
    dispatch({ type: 'SET_SELECTED_TAGS', selectedTags: [...selectedTags, tag] });
  };

  return (
    <div>
      {notes.map((note) => (
        <NoteCard key={note.id} note={note}>
          {note.tags.map((tag) => (
            <span key={tag} onClick={() => handleTagClick(tag)}>
              {tag}
            </span>
          ))}
        </NoteCard>
      ))}
    </div>
  );
};

// Define the TagInput component
const TagInput = () => {
  const dispatch = useDispatch();
  const tags = useSelector((state) => state.tags);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    dispatch({ type: 'SET_TAGS', tags: [...tags, newTag] });
    setNewTag('');
  };

  return (
    <div>
      <input
        type="text"
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        placeholder="Add new tag"
      />
      <button onClick={handleAddTag}>Add</button>
    </div>
  );
};

// Define the TagFilter component
const TagFilter = () => {
  const dispatch = useDispatch();
  const selectedTags = useSelector((state) => state.selectedTags);
  const tags = useSelector((state) => state.tags);

  const handleTagClick = (tag) => {
    dispatch({ type: 'SET_SELECTED_TAGS', selectedTags: [...selectedTags, tag] });
  };

  const handleRemoveTag = (tag) => {
    dispatch({ type: 'SET_SELECTED_TAGS', selectedTags: selectedTags.filter((t) => t !== tag) });
  };

  return (
    <div>
      {tags.map((tag) => (
        <span key={tag} onClick={() => handleTagClick(tag)}>
          {tag}
        </span>
      ))}
      {selectedTags.map((tag) => (
        <span key={tag} onClick={() => handleRemoveTag(tag)}>
          {tag}
        </span>
      ))}
    </div>
  );
};

// Define the page component
const Page = () => {
  const dispatch = useDispatch();
  const notes = useSelector((state) => state.notes);
  const meetings = useSelector((state) => state.meetings);
  const templates = useSelector((state) => state.templates);
  const searchQuery = useSelector((state) => state.searchQuery);
  const selectedFolder = useSelector((state) => state.selectedFolder);
  const editingNote = useSelector((state) => state.editingNote);
  const sortedNotes = useSelector((state) => state.sortedNotes);
  const sortedMeetings = useSelector((state) => state.sortedMeetings);
  const sortedTemplates = useSelector((state) => state.sortedTemplates);
  const filterType = useSelector((state) => state.filterType);
  const sortBy = useSelector((state) => state.sortBy);
  const sortOrder = useSelector((state) => state.sortOrder);
  const filterByTags = useSelector((state) => state.filterByTags);
  const filterByDate = useSelector((state) => state.filterByDate);
  const aiSuggestions = useSelector((state) => state.aiSuggestions);
  const autocompleteSuggestions = useSelector((state) => state.autocompleteSuggestions);
  const priority = useSelector((state) => state.priority);
  const deadline = useSelector((state) => state.deadline);
  const noteTitle = useSelector((state) => state.noteTitle);
  const noteContent = useSelector((state) => state.noteContent);
  const isGeneratingNote = useSelector((state) => state.isGeneratingNote);
  const editorState = useSelector((state) => state.editorState);
  const quickNote = useSelector((state) => state.quickNote);
  const isQuickNoteOpen = useSelector((state) => state.isQuickNoteOpen);
  const tags = useSelector((state) => state.tags);
  const selectedTags = useSelector((state) => state.selectedTags);

  useEffect(() => {
    // Fetch notes, meetings, and templates from the API
    client.getNotes().then((notes) => dispatch({ type: 'SET_NOTES', notes }));
    client.getMeetings().then((meetings) => dispatch({ type: 'SET_MEETINGS', meetings }));
    client.getTemplates().then((templates) => dispatch({ type: 'SET_TEMPLATES', templates }));
  }, []);

  return (
    <Provider store={store}>
      <div>
        <h1>AutoNote: AI-Powered Note Taker</h1>
        <Link href="/new-note">
          <a>
            <AiOutlinePlus size={24} />
            New Note
          </a>
        </Link>
        <TagInput />
        <TagFilter />
        <NoteCardWithTags />
        <MeetingCard />
        <TemplateCard />
        <Editor editorState={editorState} />
      </div>
    </Provider>
  );
};

export default Page;