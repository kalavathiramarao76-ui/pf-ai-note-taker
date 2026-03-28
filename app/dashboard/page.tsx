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
  const { notes, tags, tagInput, tagSuggestions, filteredNotes, noteTagMap } = useSelector((state: AppState) => state);
  const [isTagInputFocused, setIsTagInputFocused] = useState(false);

  useEffect(() => {
    const handleTagInputFocus = () => {
      setIsTagInputFocused(true);
    };
    const handleTagInputBlur = () => {
      setIsTagInputFocused(false);
    };
    document.addEventListener('focus', handleTagInputFocus, true);
    document.addEventListener('blur', handleTagInputBlur, true);
    return () => {
      document.removeEventListener('focus', handleTagInputFocus, true);
      document.removeEventListener('blur', handleTagInputBlur, true);
    };
  }, []);

  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateTagInput(e.target.value));
    const suggestions = tags.filter((tag) => tag.includes(e.target.value));
    dispatch(updateTagSuggestions(suggestions));
  };

  const handleTagSelect = (tag: string) => {
    dispatch(addTag(tag));
    dispatch(updateTagInput(''));
    dispatch(updateTagSuggestions([]));
  };

  const handleNoteTagSelect = (noteId: string, tag: string) => {
    dispatch(addNoteTag({ noteId, tag }));
  };

  const handleNoteTagRemove = (noteId: string, tag: string) => {
    dispatch(removeNoteTag({ noteId, tag }));
  };

  const handleFilterNotesByTags = (tags: string[]) => {
    dispatch(filterNotesByTags(tags));
  };

  const handleClearTagFilter = () => {
    dispatch(clearTagFilter());
  };

  return (
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <div>
          <h1>AutoNote: AI-Powered Note Taker</h1>
          <input
            type="text"
            value={tagInput}
            onChange={handleTagInput}
            placeholder="Add tag"
            onFocus={() => setIsTagInputFocused(true)}
            onBlur={() => setIsTagInputFocused(false)}
          />
          {isTagInputFocused && tagSuggestions.length > 0 && (
            <ul>
              {tagSuggestions.map((suggestion) => (
                <li key={suggestion} onClick={() => handleTagSelect(suggestion)}>
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => handleFilterNotesByTags(tags)}>Filter notes by tags</button>
          <button onClick={handleClearTagFilter}>Clear tag filter</button>
          <div>
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <NoteCard key={note.id} note={note} tags={noteTagMap[note.id]} onTagSelect={handleNoteTagSelect} onTagRemove={handleNoteTagRemove} />
              ))
            ) : (
              <p>No notes found</p>
            )}
          </div>
        </div>
      </DndProvider>
    </Provider>
  );
};

export default DashboardPage;