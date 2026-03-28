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
    addNoteTag(state, action: PayloadAction<{ noteId: string; tag: string }>) {
      if (!state.noteTagMap[action.payload.noteId]) {
        state.noteTagMap[action.payload.noteId] = [];
      }
      if (!state.noteTagMap[action.payload.noteId].includes(action.payload.tag)) {
        state.noteTagMap[action.payload.noteId].push(action.payload.tag);
      }
    },
    removeNoteTag(state, action: PayloadAction<{ noteId: string; tag: string }>) {
      if (state.noteTagMap[action.payload.noteId]) {
        state.noteTagMap[action.payload.noteId] = state.noteTagMap[action.payload.noteId].filter((tag) => tag !== action.payload.tag);
      }
    },
    updateNoteTags(state, action: PayloadAction<{ noteId: string; tags: string[] }>) {
      state.noteTagMap[action.payload.noteId] = action.payload.tags;
    },
    updateAvailableTags(state, action: PayloadAction<string[]>) {
      state.availableTags = action.payload;
    },
    updateTagInputValue(state, action: PayloadAction<string>) {
      state.tagInputValue = action.payload;
    },
    updateTagSuggestionsList(state, action: PayloadAction<string[]>) {
      state.tagSuggestionsList = action.payload;
    },
    updateNoteTagSuggestions(state, action: PayloadAction<string[]>) {
      state.noteTagSuggestions = action.payload;
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

// Define the page component
function Page() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [noteTagSuggestions, setNoteTagSuggestions] = useState([]);
  const [draggedNote, setDraggedNote] = useState(null);
  const [draggedOverFolder, setDraggedOverFolder] = useState(null);

  // Get the notes, meetings, and templates from the store
  const notes = useSelector((state: AppState) => state.notes);
  const meetings = useSelector((state: AppState) => state.meetings);
  const templates = useSelector((state: AppState) => state.templates);

  // Get the tags and note tags from the store
  const tags = useSelector((state: AppState) => state.tags);
  const noteTagMap = useSelector((state: AppState) => state.noteTagMap);

  // Handle tag input change
  const handleTagInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(event.target.value);
    dispatch(appSlice.actions.updateTagInput(event.target.value));
    const suggestions = availableTags.filter((tag) => tag.includes(event.target.value));
    setTagSuggestions(suggestions);
  };

  // Handle tag suggestion click
  const handleTagSuggestionClick = (tag: string) => {
    dispatch(appSlice.actions.addTag(tag));
    setTagInput('');
    setTagSuggestions([]);
  };

  // Handle note tag suggestion click
  const handleNoteTagSuggestionClick = (noteId: string, tag: string) => {
    dispatch(appSlice.actions.addNoteTag({ noteId, tag }));
  };

  // Handle drag and drop
  const handleDragStart = (note: any) => {
    setDraggedNote(note);
  };

  const handleDragOver = (folder: any) => {
    setDraggedOverFolder(folder);
  };

  const handleDrop = () => {
    if (draggedNote && draggedOverFolder) {
      // Update the note folder
      dispatch(appSlice.actions.updateNoteFolderMap({ noteId: draggedNote.id, folderId: draggedOverFolder.id }));
    }
  };

  // Render the page
  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h1>AutoNote: AI-Powered Note Taker</h1>
        <div>
          <input type="text" value={tagInput} onChange={handleTagInputChange} placeholder="Add tag" />
          <ul>
            {tagSuggestions.map((tag) => (
              <li key={tag} onClick={() => handleTagSuggestionClick(tag)}>
                {tag}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Notes</h2>
          <ul>
            {Array.from(notes.values()).map((note) => (
              <DraggableNoteCard key={note.id} note={note} onDragStart={handleDragStart} />
            ))}
          </ul>
        </div>
        <div>
          <h2>Meetings</h2>
          <ul>
            {Array.from(meetings.values()).map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </ul>
        </div>
        <div>
          <h2>Templates</h2>
          <ul>
            {Array.from(templates.values()).map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </ul>
        </div>
        <div>
          <h2>Folders</h2>
          <ul>
            {availableTags.map((folder) => (
              <li key={folder} onDragOver={() => handleDragOver({ id: folder, name: folder })}>
                {folder}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DndProvider>
  );
}

// Render the page with the store
function App() {
  return (
    <Provider store={store}>
      <Page />
    </Provider>
  );
}

export default App;