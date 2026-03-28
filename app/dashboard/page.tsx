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
  },
  reducers: {
    addTag(state, action: PayloadAction<string>) {
      if (!state.tags.includes(action.payload)) {
        state.tags = [...state.tags, action.payload];
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
      state.filteredNotes = state.notes.filter((note) => {
        const noteTags = state.noteTagMap[note.id];
        return action.payload.every((tag) => noteTags.includes(tag));
      });
    },
    clearTagFilter(state) {
      state.filteredNotes = [];
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

// Define the dashboard page
const DashboardPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
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
    tags,
    selectedTags,
    noteTags,
    tagInput,
    tagSuggestions,
    socket,
    collaborators,
    collaborativeEditorState,
    noteVersions,
    conflictResolution,
    realTimeCollaboration,
    folderNotes,
    folderTags,
    versionHistory,
    collaborativeNotes,
    folderStructure,
    noteSummaries,
    folderMap,
    draggedNote,
    draggedOverFolder,
    folderTree,
    noteTagMap,
    suggestedTags,
    filteredNotes,
    folderNotesMap,
    noteFolderMap,
    tagFilter,
    folderName,
    newFolderName,
    isFolderOpen,
    folderId,
    folderTags,
    subfolders,
    folderTagsMap,
    availableTags,
    tagInputValue,
    tagSuggestionsList,
    noteTagSuggestions,
    aiModel,
    noteCompletion,
    notePriorities,
    noteDueDates,
    noteReminders,
  } = useSelector((state: any) => state.app);

  useEffect(() => {
    // Initialize the available tags
    dispatch(updateAvailableTags(['tag1', 'tag2', 'tag3']));
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

  const handleUpdateTagSuggestions = (tagSuggestions: string[]) => {
    dispatch(updateTagSuggestions(tagSuggestions));
  };

  const handleFilterNotesByTags = (tags: string[]) => {
    dispatch(filterNotesByTags(tags));
  };

  const handleClearTagFilter = () => {
    dispatch(clearTagFilter());
  };

  const handleUpdateNoteTags = (noteId: string, tags: string[]) => {
    dispatch(updateNoteTags({ noteId, tags }));
  };

  const handleUpdateTagInputValue = (tagInputValue: string) => {
    dispatch(updateTagInputValue(tagInputValue));
  };

  const handleUpdateTagSuggestionsList = (tagSuggestionsList: string[]) => {
    dispatch(updateTagSuggestionsList(tagSuggestionsList));
  };

  const handleUpdateNoteTagSuggestions = (noteTagSuggestions: string[]) => {
    dispatch(updateNoteTagSuggestions(noteTagSuggestions));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h1>AutoNote: AI-Powered Note Taker</h1>
        <div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => handleUpdateTagInput(e.target.value)}
            placeholder="Enter a tag"
          />
          <button onClick={() => handleAddTag(tagInput)}>Add Tag</button>
          <ul>
            {tags.map((tag) => (
              <li key={tag}>
                {tag}
                <button onClick={() => handleRemoveTag(tag)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <input
            type="text"
            value={tagInputValue}
            onChange={(e) => handleUpdateTagInputValue(e.target.value)}
            placeholder="Enter a tag"
          />
          <ul>
            {tagSuggestionsList.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </div>
        <div>
          <button onClick={() => handleFilterNotesByTags(selectedTags)}>Filter Notes</button>
          <button onClick={handleClearTagFilter}>Clear Filter</button>
          <ul>
            {filteredNotes.map((note) => (
              <li key={note.id}>
                {note.title}
                <ul>
                  {noteTagMap[note.id].map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DndProvider>
  );
};

export default () => (
  <Provider store={store}>
    <DashboardPage />
  </Provider>
);