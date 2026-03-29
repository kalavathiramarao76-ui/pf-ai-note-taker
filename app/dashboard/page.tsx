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
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

// Define the initial state
interface NoteState {
  notes: { [key: string]: any };
  editingNote: any;
  sortedNotes: any[];
  filteredNotes: any[];
  folderNotes: any;
  folderNotesMap: { [key: string]: any[] };
  noteFolderMap: { [key: string]: string };
  noteTagMap: { [key: string]: string[] };
  noteTagSuggestionsMap: { [key: string]: string[] };
  noteTags: any;
  noteVersions: any;
  conflictResolution: any;
  realTimeCollaboration: any;
  collaborativeNotes: any;
  noteSummaries: any[];
}

interface MeetingState {
  meetings: { [key: string]: any };
  sortedMeetings: any[];
}

interface TemplateState {
  templates: { [key: string]: any };
  sortedTemplates: any[];
}

interface SearchState {
  searchQuery: string;
  filterType: string;
  sortBy: string;
  sortOrder: string;
  filterByTags: any[];
  filterByDate: string;
  tagFilter: string;
}

interface EditorState {
  editorState: EditorState;
  quickNote: string;
  isQuickNoteOpen: boolean;
}

interface TagState {
  tags: any[];
  selectedTags: any[];
  tagInput: string;
  tagSuggestions: any[];
  suggestedTags: any[];
  availableTags: string[];
  tagInputValue: string;
  tagSuggestionsList: string[];
  noteTagSuggestions: string[];
  tagAutoSuggestions: string[];
  selectedNoteTags: any;
}

interface FolderState {
  folders: any[];
  selectedFolder: any;
  folderTags: any;
  folderTagsMap: { [key: string]: string[] };
  subfolders: any[];
  folderName: string;
  newFolderName: string;
  isFolderOpen: boolean;
  folderId: string;
  folderTree: any[];
}

interface AIState {
  aiSuggestions: any[];
  autocompleteSuggestions: any[];
  aiModel: any;
  noteCompletion: string;
}

interface CollaborativeState {
  socket: Socket | null;
  collaborators: any[];
  collaborativeEditorState: any;
  collaborativeNoteId: string;
  collaborativeNoteContent: string;
  collaborativeNoteVersion: number;
}

interface PriorityState {
  priority: string;
  deadline: string;
  notePriorities: { [key: string]: string };
  noteDueDates: { [key: string]: string };
}

const noteSlice = createSlice({
  name: 'notes',
  initialState: {
    notes: {},
    editingNote: null,
    sortedNotes: [],
    filteredNotes: [],
    folderNotes: {},
    folderNotesMap: {},
    noteFolderMap: {},
    noteTagMap: {},
    noteTagSuggestionsMap: {},
    noteTags: [],
    noteVersions: {},
    conflictResolution: {},
    realTimeCollaboration: {},
    collaborativeNotes: {},
    noteSummaries: [],
  } as NoteState,
  reducers: {
    addNote(state, action: PayloadAction<any>) {
      state.notes[action.payload.id] = action.payload;
    },
    updateNote(state, action: PayloadAction<any>) {
      state.notes[action.payload.id] = action.payload;
    },
    deleteNote(state, action: PayloadAction<string>) {
      delete state.notes[action.payload];
    },
    addTagToNote(state, action: PayloadAction<{ noteId: string; tag: string }>) {
      if (!state.noteTagMap[action.payload.noteId]) {
        state.noteTagMap[action.payload.noteId] = [];
      }
      state.noteTagMap[action.payload.noteId].push(action.payload.tag);
    },
    removeTagFromNote(state, action: PayloadAction<{ noteId: string; tag: string }>) {
      if (state.noteTagMap[action.payload.noteId]) {
        state.noteTagMap[action.payload.noteId] = state.noteTagMap[action.payload.noteId].filter((tag) => tag !== action.payload.tag);
      }
    },
  },
});

const tagSlice = createSlice({
  name: 'tags',
  initialState: {
    tags: [],
    selectedTags: [],
    tagInput: '',
    tagSuggestions: [],
    suggestedTags: [],
    availableTags: [],
    tagInputValue: '',
    tagSuggestionsList: [],
    noteTagSuggestions: [],
    tagAutoSuggestions: [],
    selectedNoteTags: {},
  } as TagState,
  reducers: {
    addTag(state, action: PayloadAction<string>) {
      if (!state.tags.includes(action.payload)) {
        state.tags.push(action.payload);
      }
    },
    removeTag(state, action: PayloadAction<string>) {
      state.tags = state.tags.filter((tag) => tag !== action.payload);
    },
    updateTagInput(state, action: PayloadAction<string>) {
      state.tagInput = action.payload;
    },
    updateTagSuggestions(state, action: PayloadAction<string[]>) {
      state.tagSuggestions = action.payload;
    },
    updateSelectedTags(state, action: PayloadAction<string[]>) {
      state.selectedTags = action.payload;
    },
    updateNoteTagSuggestions(state, action: PayloadAction<{ noteId: string; tagSuggestions: string[] }>) {
      state.noteTagSuggestions[action.payload.noteId] = action.payload.tagSuggestions;
    },
  },
});

const store = configureStore({
  reducer: {
    notes: noteSlice.reducer,
    tags: tagSlice.reducer,
  },
  middleware: [thunk],
});

const DashboardPage = () => {
  const dispatch = useDispatch();
  const notes = useSelector((state: any) => state.notes);
  const tags = useSelector((state: any) => state.tags);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [filterByTags, setFilterByTags] = useState([]);
  const [filterByDate, setFilterByDate] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      const response = await client.get('/notes');
      dispatch(noteSlice.actions.addNote(response.data));
    };
    fetchNotes();
  }, []);

  const handleAddNote = async () => {
    const response = await client.post('/notes', { title: 'New Note', content: '' });
    dispatch(noteSlice.actions.addNote(response.data));
  };

  const handleUpdateNote = async (noteId: string, note: any) => {
    const response = await client.put(`/notes/${noteId}`, note);
    dispatch(noteSlice.actions.updateNote(response.data));
  };

  const handleDeleteNote = async (noteId: string) => {
    await client.delete(`/notes/${noteId}`);
    dispatch(noteSlice.actions.deleteNote(noteId));
  };

  const handleAddTagToNote = (noteId: string, tag: string) => {
    dispatch(noteSlice.actions.addTagToNote({ noteId, tag }));
  };

  const handleRemoveTagFromNote = (noteId: string, tag: string) => {
    dispatch(noteSlice.actions.removeTagFromNote({ noteId, tag }));
  };

  const handleUpdateTagInput = (tagInput: string) => {
    dispatch(tagSlice.actions.updateTagInput(tagInput));
  };

  const handleUpdateTagSuggestions = (tagSuggestions: string[]) => {
    dispatch(tagSlice.actions.updateTagSuggestions(tagSuggestions));
  };

  const handleUpdateSelectedTags = (selectedTags: string[]) => {
    dispatch(tagSlice.actions.updateSelectedTags(selectedTags));
  };

  const handleUpdateNoteTagSuggestions = (noteId: string, tagSuggestions: string[]) => {
    dispatch(tagSlice.actions.updateNoteTagSuggestions({ noteId, tagSuggestions }));
  };

  const filteredNotes = notes.sortedNotes.filter((note) => {
    if (filterByTags.length > 0) {
      return filterByTags.every((tag) => note.tags.includes(tag));
    }
    if (filterByDate) {
      return note.createdAt >= new Date(filterByDate);
    }
    if (tagFilter) {
      return note.tags.includes(tagFilter);
    }
    return true;
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="dashboard-page">
        <h1>AutoNote: AI-Powered Note Taker</h1>
        <button onClick={handleAddNote}>
          <AiOutlinePlus />
          Add Note
        </button>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes"
        />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All</option>
          <option value="tag">Tag</option>
          <option value="date">Date</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="">Title</option>
          <option value="createdAt">Created At</option>
          <option value="updatedAt">Updated At</option>
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="">Ascending</option>
          <option value="descending">Descending</option>
        </select>
        <Autocomplete
          multiple
          id="tags"
          options={tags.tags}
          value={filterByTags}
          onChange={(e, value) => setFilterByTags(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Filter by tags"
              placeholder="Select tags"
            />
          )}
        />
        <input
          type="date"
          value={filterByDate}
          onChange={(e) => setFilterByDate(e.target.value)}
          placeholder="Filter by date"
        />
        <input
          type="search"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          placeholder="Filter by tag"
        />
        <div className="notes-list">
          {filteredNotes.map((note) => (
            <DraggableNoteCard key={note.id} note={note} />
          ))}
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