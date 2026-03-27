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
  folderMap: Map<string, any>;
  draggedNote: any;
  draggedOverFolder: any;
  folderTree: any[];
  noteTagMap: Map<string, string[]>;
  suggestedTags: any[];
  filteredNotes: any[];
  folderNotesMap: Map<string, any[]>;
  noteFolderMap: Map<string, string>;
  tagFilter: string;
  folderName: string;
  newFolderName: string;
  isFolderOpen: boolean;
  folderId: string;
  folderTags: any[];
  subfolders: any[];
  folderTagsMap: Map<string, string[]>;
  availableTags: string[];
  tagInputValue: string;
  tagSuggestionsList: string[];
  noteTagSuggestions: string[];
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
    folderMap: new Map(),
    draggedNote: null,
    draggedOverFolder: null,
    folderTree: [],
    noteTagMap: new Map(),
    suggestedTags: [],
    filteredNotes: [],
    folderNotesMap: new Map(),
    noteFolderMap: new Map(),
    tagFilter: '',
    folderName: '',
    newFolderName: '',
    isFolderOpen: false,
    folderId: '',
    folderTags: [],
    subfolders: [],
    folderTagsMap: new Map(),
    availableTags: [],
    tagInputValue: '',
    tagSuggestionsList: [],
    noteTagSuggestions: [],
  },
  reducers: {
    addTag: (state, action: PayloadAction<string>) => {
      if (!state.tags.includes(action.payload)) {
        state.tags.push(action.payload);
      }
    },
    removeTag: (state, action: PayloadAction<string>) => {
      state.tags = state.tags.filter((tag) => tag !== action.payload);
    },
    updateTagInput: (state, action: PayloadAction<string>) => {
      state.tagInput = action.payload;
    },
    updateTagSuggestions: (state, action: PayloadAction<string[]>) => {
      state.tagSuggestions = action.payload;
    },
    addNoteTag: (state, action: PayloadAction<{ noteId: string; tag: string }>) => {
      if (!state.noteTagMap.has(action.payload.noteId)) {
        state.noteTagMap.set(action.payload.noteId, [action.payload.tag]);
      } else {
        const existingTags = state.noteTagMap.get(action.payload.noteId);
        if (!existingTags.includes(action.payload.tag)) {
          existingTags.push(action.payload.tag);
        }
      }
    },
    removeNoteTag: (state, action: PayloadAction<{ noteId: string; tag: string }>) => {
      if (state.noteTagMap.has(action.payload.noteId)) {
        const existingTags = state.noteTagMap.get(action.payload.noteId);
        state.noteTagMap.set(
          action.payload.noteId,
          existingTags.filter((tag) => tag !== action.payload.tag)
        );
      }
    },
    updateNoteTagSuggestions: (state, action: PayloadAction<string[]>) => {
      state.noteTagSuggestions = action.payload;
    },
    dragNoteOverFolder: (state, action: PayloadAction<{ noteId: string; folderId: string }>) => {
      state.draggedNote = action.payload.noteId;
      state.draggedOverFolder = action.payload.folderId;
    },
    dropNoteIntoFolder: (state, action: PayloadAction<{ noteId: string; folderId: string }>) => {
      if (state.folderNotesMap.has(action.payload.folderId)) {
        const existingNotes = state.folderNotesMap.get(action.payload.folderId);
        if (!existingNotes.includes(action.payload.noteId)) {
          existingNotes.push(action.payload.noteId);
        }
      } else {
        state.folderNotesMap.set(action.payload.folderId, [action.payload.noteId]);
      }
      state.noteFolderMap.set(action.payload.noteId, action.payload.folderId);
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
const DashboardPage = () => {
  const dispatch = useDispatch();
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
  } = useSelector((state: any) => state.app);

  // Handle tag input changes
  const handleTagInputChange = (event: any) => {
    dispatch(updateTagInput(event.target.value));
    const suggestions = availableTags.filter((tag) => tag.includes(event.target.value));
    dispatch(updateTagSuggestions(suggestions));
  };

  // Handle note tag input changes
  const handleNoteTagInputChange = (event: any, noteId: string) => {
    const noteTagInput = event.target.value;
    const noteTagSuggestions = availableTags.filter((tag) => tag.includes(noteTagInput));
    dispatch(updateNoteTagSuggestions(noteTagSuggestions));
  };

  // Handle tag addition
  const handleAddTag = (tag: string) => {
    dispatch(addTag(tag));
  };

  // Handle note tag addition
  const handleAddNoteTag = (noteId: string, tag: string) => {
    dispatch(addNoteTag({ noteId, tag }));
  };

  // Handle tag removal
  const handleRemoveTag = (tag: string) => {
    dispatch(removeTag(tag));
  };

  // Handle note tag removal
  const handleRemoveNoteTag = (noteId: string, tag: string) => {
    dispatch(removeNoteTag({ noteId, tag }));
  };

  // Handle note drag over folder
  const handleDragNoteOverFolder = (noteId: string, folderId: string) => {
    dispatch(dragNoteOverFolder({ noteId, folderId }));
  };

  // Handle note drop into folder
  const handleDropNoteIntoFolder = (noteId: string, folderId: string) => {
    dispatch(dropNoteIntoFolder({ noteId, folderId }));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h1>AutoNote: AI-Powered Note Taker</h1>
        <div>
          <input
            type="text"
            value={tagInput}
            onChange={handleTagInputChange}
            placeholder="Add tag"
          />
          <ul>
            {tagSuggestions.map((suggestion) => (
              <li key={suggestion}>
                <button onClick={() => handleAddTag(suggestion)}>{suggestion}</button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          {notes.map((note) => (
            <div key={note.id}>
              <h2>{note.title}</h2>
              <p>{note.content}</p>
              <input
                type="text"
                value={noteTagInput}
                onChange={(event) => handleNoteTagInputChange(event, note.id)}
                placeholder="Add note tag"
              />
              <ul>
                {noteTagSuggestions.map((suggestion) => (
                  <li key={suggestion}>
                    <button onClick={() => handleAddNoteTag(note.id, suggestion)}>
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
              <ul>
                {noteTagMap.get(note.id).map((tag) => (
                  <li key={tag}>
                    <button onClick={() => handleRemoveNoteTag(note.id, tag)}>{tag}</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div>
          {folders.map((folder) => (
            <div key={folder.id}>
              <h2>{folder.name}</h2>
              <ul>
                {folderNotesMap.get(folder.id).map((noteId) => (
                  <li key={noteId}>
                    <DraggableNoteCard
                      noteId={noteId}
                      folderId={folder.id}
                      onDragOver={(noteId, folderId) => handleDragNoteOverFolder(noteId, folderId)}
                      onDrop={(noteId, folderId) => handleDropNoteIntoFolder(noteId, folderId)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default () => {
  return (
    <Provider store={store}>
      <DashboardPage />
    </Provider>
  );
};