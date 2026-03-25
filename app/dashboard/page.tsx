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
    }
  }
});

const store = configureStore({
  reducer: {
    app: appSlice.reducer
  },
  middleware: [thunk]
});

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { notes, tags, tagInput, tagSuggestions, noteTags } = useSelector((state: AppState) => state);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);

  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    dispatch(updateTagInput(inputValue));
    const suggestions = tags.filter(tag => tag.includes(inputValue));
    dispatch(updateTagSuggestions(suggestions));
    setAutocompleteOpen(true);
  };

  const handleTagSelect = (tag: string) => {
    dispatch(addTag(tag));
    setAutocompleteOpen(false);
  };

  const handleNoteTagAdd = (noteId: string, tag: string) => {
    dispatch(addNoteTag({ noteId, tag }));
  };

  const handleNoteTagRemove = (noteId: string, tag: string) => {
    dispatch(removeNoteTag({ noteId, tag }));
  };

  return (
    <div>
      <input type="text" value={tagInput} onChange={handleTagInput} placeholder="Add tag" />
      {autocompleteOpen && (
        <ul>
          {tagSuggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleTagSelect(suggestion)}>{suggestion}</li>
          ))}
        </ul>
      )}
      {notes.map((note, index) => (
        <NoteCard key={index} note={note} tags={noteTags[note.id]} onTagAdd={(tag) => handleNoteTagAdd(note.id, tag)} onTagRemove={(tag) => handleNoteTagRemove(note.id, tag)} />
      ))}
    </div>
  );
};

export default () => (
  <Provider store={store}>
    <DashboardPage />
  </Provider>
);