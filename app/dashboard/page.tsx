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
    conflictResolution: null,
    realTimeCollaboration: null,
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
    addFolder(state, action: PayloadAction<string>) {
      state.folderNotesMap[action.payload] = [];
    },
    addNoteToFolder(state, action: PayloadAction<{ noteId: string; folderId: string }>) {
      state.folderNotesMap[action.payload.folderId].push(action.payload.noteId);
      state.noteFolderMap[action.payload.noteId] = action.payload.folderId;
    },
    removeNoteFromFolder(state, action: PayloadAction<{ noteId: string; folderId: string }>) {
      state.folderNotesMap[action.payload.folderId] = state.folderNotesMap[action.payload.folderId].filter((id) => id !== action.payload.noteId);
      delete state.noteFolderMap[action.payload.noteId];
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
    addFolder(state, action: PayloadAction<string>) {
      state.folders.push(action.payload);
    },
    selectFolder(state, action: PayloadAction<string>) {
      state.selectedFolder = action.payload;
    },
    addSubfolder(state, action: PayloadAction<{ folderId: string; subfolderId: string }>) {
      state.subfolders.push(action.payload.subfolderId);
      state.folderTree.push({ id: action.payload.subfolderId, parentId: action.payload.folderId });
    },
    removeSubfolder(state, action: PayloadAction<{ folderId: string; subfolderId: string }>) {
      state.subfolders = state.subfolders.filter((id) => id !== action.payload.subfolderId);
      state.folderTree = state.folderTree.filter((folder) => folder.id !== action.payload.subfolderId);
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
  const [draggingFolder, setDraggingFolder] = useState(null);

  useEffect(() => {
    // Initialize notes and folders
  }, []);

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

  const handleFolderDragStart = (folderId: string) => {
    setDraggingFolder(folderId);
  };

  const handleFolderDragEnd = () => {
    setDraggingFolder(null);
  };

  const handleFolderDrop = (folderId: string) => {
    if (draggingFolder) {
      dispatch(folderSlice.actions.addSubfolder({ folderId, subfolderId: draggingFolder }));
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h1>Notes</h1>
        <ul>
          {Object.keys(notes.notes).map((noteId) => (
            <DraggableNoteCard key={noteId} noteId={noteId} onDragStart={handleDragStart} onDragEnd={handleDragEnd} />
          ))}
        </ul>
        <h1>Folders</h1>
        <ul>
          {folders.folders.map((folderId) => (
            <div key={folderId} onDragStart={() => handleFolderDragStart(folderId)} onDragEnd={handleFolderDragEnd} onDrop={() => handleFolderDrop(folderId)}>
              <span>{folderId}</span>
              <ul>
                {folders.subfolders.map((subfolderId) => (
                  <li key={subfolderId}>{subfolderId}</li>
                ))}
              </ul>
            </div>
          ))}
        </ul>
      </div>
    </DndProvider>
  );
};

export default () => (
  <Provider store={store}>
    <DashboardPage />
  </Provider>
);