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
    filterNotesByTags(state, action: PayloadAction<string[]>) {
      state.filterByTags = action.payload;
    },
    clearFilterByTags(state) {
      state.filterByTags = [];
    },
    updateNoteTags(state, action: PayloadAction<{ noteId: string; tags: string[] }>) {
      state.noteTags[action.payload.noteId] = action.payload.tags;
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
    updateNoteTagSuggestions(state, action: PayloadAction<{ noteId: string; suggestions: string[] }>) {
      state.noteTagSuggestionsMap[action.payload.noteId] = action.payload.suggestions;
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
const Page = () => {
  const dispatch = useDispatch();
  const {
    notes,
    tags,
    tagInput,
    tagSuggestions,
    filterByTags,
    noteTags,
    availableTags,
    tagInputValue,
    tagSuggestionsList,
    noteTagSuggestionsMap,
  } = useSelector((state: AppState) => state);

  useEffect(() => {
    const loadTags = async () => {
      const response = await client.get('/tags');
      dispatch(updateAvailableTags(response.data));
    };
    loadTags();
  }, []);

  const handleAddTag = (tag: string) => {
    dispatch(addTag(tag));
  };

  const handleRemoveTag = (tag: string) => {
    dispatch(removeTag(tag));
  };

  const handleUpdateTagInput = (value: string) => {
    dispatch(updateTagInput(value));
  };

  const handleUpdateTagSuggestions = (suggestions: string[]) => {
    dispatch(updateTagSuggestions(suggestions));
  };

  const handleFilterNotesByTags = (tags: string[]) => {
    dispatch(filterNotesByTags(tags));
  };

  const handleClearFilterByTags = () => {
    dispatch(clearFilterByTags());
  };

  const handleUpdateNoteTags = (noteId: string, tags: string[]) => {
    dispatch(updateNoteTags({ noteId, tags }));
  };

  const handleUpdateTagInputValue = (value: string) => {
    dispatch(updateTagInputValue(value));
  };

  const handleUpdateTagSuggestionsList = (suggestions: string[]) => {
    dispatch(updateTagSuggestionsList(suggestions));
  };

  const handleUpdateNoteTagSuggestions = (noteId: string, suggestions: string[]) => {
    dispatch(updateNoteTagSuggestions({ noteId, suggestions }));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h1>AutoNote: AI-Powered Note Taker</h1>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => handleUpdateTagInput(e.target.value)}
          placeholder="Enter a tag"
        />
        <ul>
          {tags.map((tag) => (
            <li key={tag}>
              {tag}
              <button onClick={() => handleRemoveTag(tag)}>Remove</button>
            </li>
          ))}
        </ul>
        <button onClick={() => handleAddTag(tagInput)}>Add Tag</button>
        <ul>
          {tagSuggestions.map((suggestion) => (
            <li key={suggestion}>
              {suggestion}
              <button onClick={() => handleAddTag(suggestion)}>Add</button>
            </li>
          ))}
        </ul>
        <input
          type="text"
          value={tagInputValue}
          onChange={(e) => handleUpdateTagInputValue(e.target.value)}
          placeholder="Enter a tag"
        />
        <ul>
          {tagSuggestionsList.map((suggestion) => (
            <li key={suggestion}>
              {suggestion}
              <button onClick={() => handleAddTag(suggestion)}>Add</button>
            </li>
          ))}
        </ul>
        <button onClick={() => handleFilterNotesByTags(filterByTags)}>Filter Notes</button>
        <button onClick={() => handleClearFilterByTags()}>Clear Filter</button>
        <ul>
          {notes.map((note) => (
            <li key={note.id}>
              {note.title}
              <ul>
                {noteTags[note.id].map((tag) => (
                  <li key={tag}>
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)}>Remove</button>
                  </li>
                ))}
              </ul>
              <input
                type="text"
                value={noteTagSuggestionsMap[note.id].join(', ')}
                onChange={(e) => handleUpdateNoteTagSuggestions(note.id, e.target.value.split(', '))}
                placeholder="Enter tags"
              />
            </li>
          ))}
        </ul>
      </div>
    </DndProvider>
  );
};

// Render the page component
const App = () => {
  return (
    <Provider store={store}>
      <Page />
    </Provider>
  );
};

export default App;