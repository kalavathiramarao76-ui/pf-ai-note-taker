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
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

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
    conflictResolution: {},
    realTimeCollaboration: {},
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
    selectedNoteTags: {},
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
    updateNoteTagSuggestions(state, action: PayloadAction<{ noteId: string; suggestions: string[] }>) {
      state.noteTagSuggestions[action.payload.noteId] = action.payload.suggestions;
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
  const [draggingNote, setDraggingNote] = useState(null);
  const [droppedNote, setDroppedNote] = useState(null);

  useEffect(() => {
    client.get('/notes').then((response) => {
      dispatch(noteSlice.actions.addNote(response.data));
    });
  }, []);

  const handleDragStart = (note: any) => {
    setDraggingNote(note);
  };

  const handleDragEnd = () => {
    setDraggingNote(null);
  };

  const handleDrop = (note: any) => {
    setDroppedNote(note);
    if (draggingNote && droppedNote) {
      // Update note tags
      dispatch(noteSlice.actions.addTagToNote({ noteId: draggingNote.id, tag: droppedNote.tag }));
    }
  };

  const handleTagInput = (event: any) => {
    dispatch(tagSlice.actions.updateTagInput(event.target.value));
    // Get tag suggestions
    client.get('/tags/suggestions', { params: { query: event.target.value } }).then((response) => {
      dispatch(tagSlice.actions.updateTagSuggestions(response.data));
    });
  };

  const handleTagSelect = (event: any, value: any) => {
    dispatch(tagSlice.actions.updateSelectedTags(value));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h1>Notes</h1>
        <ul>
          {Object.values(notes.notes).map((note: any) => (
            <DraggableNoteCard key={note.id} note={note} onDragStart={handleDragStart} onDragEnd={handleDragEnd} />
          ))}
        </ul>
        <h1>Tags</h1>
        <Autocomplete
          options={tags.tags}
          value={tags.selectedTags}
          onChange={handleTagSelect}
          renderInput={(params) => (
            <TextField {...params} label="Tags" onChange={handleTagInput} />
          )}
        />
        <h1>Tag Suggestions</h1>
        <ul>
          {tags.tagSuggestions.map((suggestion: any) => (
            <li key={suggestion}>{suggestion}</li>
          ))}
        </ul>
      </div>
    </DndProvider>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <DashboardPage />
    </Provider>
  );
};

export default App;