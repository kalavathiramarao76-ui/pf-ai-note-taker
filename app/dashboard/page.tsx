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
  notes: { [key: string]: any };
  meetings: { [key: string]: any };
  templates: { [key: string]: any };
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
}

// Define the reducer using createSlice
const appSlice = createSlice({
  name: 'app',
  initialState: {
    notes: {},
    meetings: {},
    templates: {},
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
  },
  reducers: {
    generateNote(state, action: PayloadAction<string>) {
      state.isGeneratingNote = true;
      state.noteContent = action.payload;
      // Call AI model to generate note
      const aiModel = state.aiModel;
      if (aiModel) {
        const generatedNote = aiModel.generateNote(state.noteContent);
        state.generatedNotes.push(generatedNote);
        state.isGeneratingNote = false;
      }
    },
    getAiSuggestions(state, action: PayloadAction<string>) {
      state.aiSuggestions = [];
      // Call AI model to get suggestions
      const aiModel = state.aiModel;
      if (aiModel) {
        const suggestions = aiModel.getSuggestions(action.payload);
        state.aiSuggestions = suggestions;
      }
    },
    getAutocompleteSuggestions(state, action: PayloadAction<string>) {
      state.autocompleteSuggestions = [];
      // Call AI model to get autocomplete suggestions
      const aiModel = state.aiModel;
      if (aiModel) {
        const suggestions = aiModel.getAutocompleteSuggestions(action.payload);
        state.autocompleteSuggestions = suggestions;
      }
    },
    completeNote(state, action: PayloadAction<string>) {
      state.noteCompletion = '';
      // Call AI model to complete note
      const aiModel = state.aiModel;
      if (aiModel) {
        const completion = aiModel.completeNote(action.payload);
        state.noteCompletion = completion;
      }
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

// Initialize the AI model
const initializeAiModel = async () => {
  // Load the AI model
  const aiModel = await import('../ai-model');
  return aiModel.default;
};

// Load the AI model on mount
useEffect(() => {
  initializeAiModel().then((aiModel) => {
    store.dispatch({ type: 'app/setAiModel', payload: aiModel });
  });
}, []);

// Define the page component
const Page = () => {
  const dispatch = useDispatch();
  const state = useSelector((state: any) => state.app);
  const router = useRouter();

  // Handle note generation
  const handleGenerateNote = (noteContent: string) => {
    dispatch({ type: 'app/generateNote', payload: noteContent });
  };

  // Handle AI suggestions
  const handleGetAiSuggestions = (query: string) => {
    dispatch({ type: 'app/getAiSuggestions', payload: query });
  };

  // Handle autocomplete suggestions
  const handleGetAutocompleteSuggestions = (query: string) => {
    dispatch({ type: 'app/getAutocompleteSuggestions', payload: query });
  };

  // Handle note completion
  const handleCompleteNote = (noteContent: string) => {
    dispatch({ type: 'app/completeNote', payload: noteContent });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h1>AutoNote: AI-Powered Note Taker</h1>
        <Editor
          editorState={state.editorState}
          onChange={(editorState) => dispatch({ type: 'app/setEditorState', payload: editorState })}
        />
        <button onClick={() => handleGenerateNote(state.noteContent)}>Generate Note</button>
        <button onClick={() => handleGetAiSuggestions(state.noteContent)}>Get AI Suggestions</button>
        <button onClick={() => handleGetAutocompleteSuggestions(state.noteContent)}>Get Autocomplete Suggestions</button>
        <button onClick={() => handleCompleteNote(state.noteContent)}>Complete Note</button>
        <div>
          {state.generatedNotes.map((note, index) => (
            <NoteCard key={index} note={note} />
          ))}
        </div>
        <div>
          {state.aiSuggestions.map((suggestion, index) => (
            <div key={index}>{suggestion}</div>
          ))}
        </div>
        <div>
          {state.autocompleteSuggestions.map((suggestion, index) => (
            <div key={index}>{suggestion}</div>
          ))}
        </div>
        <div>
          {state.noteCompletion}
        </div>
      </div>
    </DndProvider>
  );
};

// Render the page
const App = () => {
  return (
    <Provider store={store}>
      <Page />
    </Provider>
  );
};

export default App;