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
  noteSummaries: any[];
  folderMap: { [key: string]: any };
  draggedNote: any;
  draggedOverFolder: any;
  folderTree: any[];
  noteTagMap: { [key: string]: string[] };
  suggestedTags: any[];
  filteredNotes: any[];
  folderNotesMap: { [key: string]: any[] };
  noteFolderMap: { [key: string]: string };
  tagFilter: string;
  folderName: string;
  newFolderName: string;
  isFolderOpen: boolean;
  folderId: string;
  folderTags: any[];
  subfolders: any[];
  folderTagsMap: { [key: string]: string[] };
  availableTags: string[];
  tagInputValue: string;
  tagSuggestionsList: string[];
  noteTagSuggestions: string[];
  aiModel: any;
  noteCompletion: string;
  notePriorities: { [key: string]: string };
  noteDueDates: { [key: string]: string };
  noteReminders: { [key: string]: string };
  notePriorityLevels: { [key: string]: string[] };
  noteTagSuggestionsMap: { [key: string]: string[] };
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
    filterType: '',
    sortBy: '',
    sortOrder: '',
    filterByTags: [],
    filterByDate: '',
    aiSuggestions: [],
    autocompleteSuggestions: [],
    priority: '',
    deadline: '',
    noteTitle: '',
    noteContent: '',
    isGeneratingNote: false,
    editorState: EditorState.createEmpty(),
    quickNote: '',
    isQuickNoteOpen: false,
    tags: [],
    selectedTags: [],
    noteTags: {},
    tagInput: '',
    tagSuggestions: [],
    socket: null,
    collaborators: [],
    collaborativeEditorState: null,
    noteVersions: null,
    conflictResolution: null,
    realTimeCollaboration: null,
    folderNotes: null,
    folderTags: null,
    versionHistory: null,
    collaborativeNotes: null,
    folderStructure: null,
    noteSummaries: [],
    folderMap: {},
    draggedNote: null,
    draggedOverFolder: null,
    folderTree: [],
    noteTagMap: {},
    suggestedTags: [],
    filteredNotes: [],
    folderNotesMap: {},
    noteFolderMap: {},
    tagFilter: '',
    folderName: '',
    newFolderName: '',
    isFolderOpen: false,
    folderId: '',
    folderTags: [],
    subfolders: [],
    folderTagsMap: {},
    availableTags: [],
    tagInputValue: '',
    tagSuggestionsList: [],
    noteTagSuggestions: [],
    aiModel: null,
    noteCompletion: '',
    notePriorities: {},
    noteDueDates: {},
    noteReminders: {},
    notePriorityLevels: {},
    noteTagSuggestionsMap: {},
  },
  reducers: {
    addTag(state, action: PayloadAction<string>) {
      state.tags.push(action.payload);
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
    addNoteTag(state, action: PayloadAction<{ noteId: string; tag: string }>) {
      if (!state.noteTagMap[action.payload.noteId]) {
        state.noteTagMap[action.payload.noteId] = [];
      }
      state.noteTagMap[action.payload.noteId].push(action.payload.tag);
    },
    removeNoteTag(state, action: PayloadAction<{ noteId: string; tag: string }>) {
      if (state.noteTagMap[action.payload.noteId]) {
        state.noteTagMap[action.payload.noteId] = state.noteTagMap[action.payload.noteId].filter((tag) => tag !== action.payload.tag);
      }
    },
    updateNoteTagSuggestions(state, action: PayloadAction<{ noteId: string; suggestions: string[] }>) {
      state.noteTagSuggestionsMap[action.payload.noteId] = action.payload.suggestions;
    },
    filterNotesByTags(state, action: PayloadAction<string[]>) {
      state.filteredNotes = state.notes.filter((note) => {
        const noteTags = state.noteTagMap[note.id];
        return action.payload.every((tag) => noteTags.includes(tag));
      });
    },
  },
});

// Create the store
const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
  middleware: [thunk],
});

// Define the component
function DashboardPage() {
  const dispatch = useDispatch();
  const { notes, tags, tagInput, tagSuggestions, noteTagMap, noteTagSuggestionsMap } = useSelector((state: AppState) => state);
  const [tagInputValue, setTagInputValue] = useState('');

  useEffect(() => {
    const fetchTags = async () => {
      const response = await client.get('/tags');
      dispatch(updateTagSuggestions(response.data));
    };
    fetchTags();
  }, []);

  const handleTagInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTagInputValue(event.target.value);
    dispatch(updateTagInput(event.target.value));
  };

  const handleAddTag = (tag: string) => {
    dispatch(addTag(tag));
  };

  const handleRemoveTag = (tag: string) => {
    dispatch(removeTag(tag));
  };

  const handleAddNoteTag = (noteId: string, tag: string) => {
    dispatch(addNoteTag({ noteId, tag }));
  };

  const handleRemoveNoteTag = (noteId: string, tag: string) => {
    dispatch(removeNoteTag({ noteId, tag }));
  };

  const handleUpdateNoteTagSuggestions = (noteId: string, suggestions: string[]) => {
    dispatch(updateNoteTagSuggestions({ noteId, suggestions }));
  };

  const handleFilterNotesByTags = (tags: string[]) => {
    dispatch(filterNotesByTags(tags));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h1>Dashboard</h1>
        <input type="text" value={tagInputValue} onChange={handleTagInput} placeholder="Enter a tag" />
        <ul>
          {tagSuggestions.map((tag) => (
            <li key={tag}>
              <button onClick={() => handleAddTag(tag)}>{tag}</button>
            </li>
          ))}
        </ul>
        <ul>
          {tags.map((tag) => (
            <li key={tag}>
              <button onClick={() => handleRemoveTag(tag)}>{tag}</button>
            </li>
          ))}
        </ul>
        <h2>Notes</h2>
        <ul>
          {notes.map((note) => (
            <li key={note.id}>
              <NoteCard note={note} />
              <input type="text" value={noteTagMap[note.id].join(', ')} onChange={(event) => handleAddNoteTag(note.id, event.target.value)} placeholder="Enter a tag" />
              <ul>
                {noteTagMap[note.id].map((tag) => (
                  <li key={tag}>
                    <button onClick={() => handleRemoveNoteTag(note.id, tag)}>{tag}</button>
                  </li>
                ))}
              </ul>
              <button onClick={() => handleUpdateNoteTagSuggestions(note.id, noteTagSuggestionsMap[note.id])}>Update suggestions</button>
            </li>
          ))}
        </ul>
        <h2>Filtered Notes</h2>
        <ul>
          {notes.map((note) => (
            <li key={note.id}>
              <NoteCard note={note} />
            </li>
          ))}
        </ul>
        <button onClick={() => handleFilterNotesByTags(tags)}>Filter by tags</button>
      </div>
    </DndProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <DashboardPage />
    </Provider>
  );
}