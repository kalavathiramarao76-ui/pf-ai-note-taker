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
  noteReminders: { [key: string]: string };
  notePriorityLevels: { [key: string]: string[] };
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
    conflictResolution: null,
    realTimeCollaboration: null,
    collaborativeNotes: [],
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
    addFolder(state, action: PayloadAction<any>) {
      state.folderNotesMap[action.payload.id] = [];
    },
    addNoteToFolder(state, action: PayloadAction<{ noteId: string; folderId: string }>) {
      state.folderNotesMap[action.payload.folderId].push(action.payload.noteId);
    },
    removeNoteFromFolder(state, action: PayloadAction<{ noteId: string; folderId: string }>) {
      state.folderNotesMap[action.payload.folderId] = state.folderNotesMap[action.payload.folderId].filter((id) => id !== action.payload.noteId);
    },
  },
});

const folderSlice = createSlice({
  name: 'folders',
  initialState: {
    folders: [],
    selectedFolder: null,
    folderTags: {},
    folderTagsMap: {},
    subfolders: [],
    folderName: '',
    newFolderName: '',
    isFolderOpen: false,
    folderId: '',
    folderTree: [],
  } as FolderState,
  reducers: {
    addFolder(state, action: PayloadAction<any>) {
      state.folders.push(action.payload);
    },
    updateFolder(state, action: PayloadAction<any>) {
      state.folders = state.folders.map((folder) => (folder.id === action.payload.id ? action.payload : folder));
    },
    deleteFolder(state, action: PayloadAction<string>) {
      state.folders = state.folders.filter((folder) => folder.id !== action.payload);
    },
    selectFolder(state, action: PayloadAction<any>) {
      state.selectedFolder = action.payload;
    },
    addSubfolder(state, action: PayloadAction<{ folderId: string; subfolderId: string }>) {
      state.subfolders.push({ folderId: action.payload.folderId, subfolderId: action.payload.subfolderId });
    },
    removeSubfolder(state, action: PayloadAction<{ folderId: string; subfolderId: string }>) {
      state.subfolders = state.subfolders.filter((subfolder) => subfolder.folderId !== action.payload.folderId || subfolder.subfolderId !== action.payload.subfolderId);
    },
  },
});

const store = configureStore({
  reducer: {
    notes: noteSlice.reducer,
    folders: folderSlice.reducer,
  },
  middleware: [thunk],
});

const DashboardPage = () => {
  const dispatch = useDispatch();
  const notes = useSelector((state: any) => state.notes);
  const folders = useSelector((state: any) => state.folders);
  const [draggingNote, setDraggingNote] = useState(null);

  const handleDragStart = (noteId: string) => {
    setDraggingNote(noteId);
  };

  const handleDragEnd = () => {
    setDraggingNote(null);
  };

  const handleDrop = (folderId: string) => {
    if (draggingNote) {
      dispatch(noteSlice.actions.addNoteToFolder({ noteId: draggingNote, folderId }));
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        {folders.folders.map((folder) => (
          <div key={folder.id} onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(folder.id)}>
            <h2>{folder.name}</h2>
            {notes.folderNotesMap[folder.id].map((noteId) => (
              <DraggableNoteCard key={noteId} noteId={noteId} onDragStart={handleDragStart} onDragEnd={handleDragEnd} />
            ))}
          </div>
        ))}
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