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
    addTag(state, action: PayloadAction<string>) {
      if (!state.tags.includes(action.payload)) {
        state.tags.push(action.payload);
      }
    },
    removeTag(state, action: PayloadAction<string>) {
      state.tags = state.tags.filter(tag => tag !== action.payload);
    },
    updateTagInput(state, action: PayloadAction<string>) {
      state.tagInput = action.payload;
    },
    updateTagSuggestions(state, action: PayloadAction<string[]>) {
      state.tagSuggestions = action.payload;
    },
    addNoteTag(state, action: PayloadAction<{ noteId: string, tag: string }>) {
      if (!state.noteTags[action.payload.noteId]) {
        state.noteTags[action.payload.noteId] = [];
      }
      if (!state.noteTags[action.payload.noteId].includes(action.payload.tag)) {
        state.noteTags[action.payload.noteId].push(action.payload.tag);
      }
    },
    removeNoteTag(state, action: PayloadAction<{ noteId: string, tag: string }>) {
      if (state.noteTags[action.payload.noteId]) {
        state.noteTags[action.payload.noteId] = state.noteTags[action.payload.noteId].filter(tag => tag !== action.payload.tag);
      }
    },
    filterNotesByTags(state, action: PayloadAction<string[]>) {
      state.filterByTags = action.payload;
    }
  }
});

// Create the store
const store = configureStore({
  reducer: {
    app: appSlice.reducer
  },
  middleware: [thunk]
});

// Define the component
function DashboardPage() {
  const dispatch = useDispatch();
  const { notes, tags, tagInput, tagSuggestions, noteTags, filterByTags } = useSelector((state: AppState) => state);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      const response = await client.get('/tags');
      dispatch(updateTagSuggestions(response.data));
    };
    fetchTags();
  }, []);

  const handleAddTag = (tag: string) => {
    dispatch(addTag(tag));
  };

  const handleRemoveTag = (tag: string) => {
    dispatch(removeTag(tag));
  };

  const handleUpdateTagInput = (tagInput: string) => {
    dispatch(updateTagInput(tagInput));
  };

  const handleAddNoteTag = (noteId: string, tag: string) => {
    dispatch(addNoteTag({ noteId, tag }));
  };

  const handleRemoveNoteTag = (noteId: string, tag: string) => {
    dispatch(removeNoteTag({ noteId, tag }));
  };

  const handleFilterNotesByTags = (tags: string[]) => {
    dispatch(filterNotesByTags(tags));
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <div>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => handleUpdateTagInput(e.target.value)}
          placeholder="Add a tag"
        />
        <ul>
          {tagSuggestions.map((tag) => (
            <li key={tag}>
              <button onClick={() => handleAddTag(tag)}>{tag}</button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Notes</h2>
        <ul>
          {Array.from(notes.values()).map((note) => (
            <li key={note.id}>
              <NoteCard note={note} />
              <div>
                <input
                  type="text"
                  value={noteTags[note.id] ? noteTags[note.id].join(', ') : ''}
                  onChange={(e) => handleAddNoteTag(note.id, e.target.value)}
                  placeholder="Add a tag"
                />
                <ul>
                  {noteTags[note.id] && noteTags[note.id].map((tag) => (
                    <li key={tag}>
                      <button onClick={() => handleRemoveNoteTag(note.id, tag)}>{tag}</button>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Filter by tags</h2>
        <ul>
          {tags.map((tag) => (
            <li key={tag}>
              <button onClick={() => handleFilterNotesByTags([tag])}>{tag}</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <DashboardPage />
    </Provider>
  );
}