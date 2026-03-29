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
  noteReminders: { [key: string]: string };
  notePriorityLevels: { [key: string]: string[] };
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
    conflictResolution: null,
    realTimeCollaboration: null,
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
    selectedNoteTags: null,
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
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      const response = await client.get('/notes');
      dispatch(noteSlice.actions.addNote(response.data));
    };
    fetchNotes();
  }, []);

  const handleTagInput = (event: any) => {
    setTagInput(event.target.value);
    const suggestions = tags.tags.filter((tag) => tag.includes(event.target.value));
    setTagSuggestions(suggestions);
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTags([...selectedTags, tag]);
    dispatch(noteSlice.actions.addTagToNote({ noteId: 'note1', tag }));
  };

  const handleTagRemove = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
    dispatch(noteSlice.actions.removeTagFromNote({ noteId: 'note1', tag }));
  };

  const handleFilterByTags = () => {
    const filteredNotes = notes.notes.filter((note) => {
      const noteTags = notes.noteTagMap[note.id];
      return selectedTags.every((tag) => noteTags.includes(tag));
    });
    dispatch(noteSlice.actions.updateNote({ id: 'note1', filteredNotes }));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h1>AutoNote: AI-Powered Note Taker</h1>
        <Link href="/notes">
          <a>
            <AiOutlinePlus size={24} />
            Create Note
          </a>
        </Link>
        <input
          type="text"
          value={tagInput}
          onChange={handleTagInput}
          placeholder="Enter tag"
          list="tag-suggestions"
        />
        <datalist id="tag-suggestions">
          {tagSuggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
        <ul>
          {selectedTags.map((tag) => (
            <li key={tag}>
              {tag}
              <button onClick={() => handleTagRemove(tag)}>Remove</button>
            </li>
          ))}
        </ul>
        <button onClick={handleFilterByTags}>Filter by tags</button>
        {notes.sortedNotes.map((note) => (
          <DraggableNoteCard key={note.id} note={note} />
        ))}
      </div>
    </DndProvider>
  );
};

export default () => (
  <Provider store={store}>
    <DashboardPage />
  </Provider>
);