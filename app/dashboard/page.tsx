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
    priority: 'all',
    deadline: '',
    noteTitle: '',
    noteContent: '',
    isGeneratingNote: false,
    editorState: EditorState.createWithContent(ContentState.createFromText('')),
    quickNote: '',
    isQuickNoteOpen: false,
    tags: [],
    selectedTags: [],
    noteTags: {},
    tagInput: '',
    tagSuggestions: [],
    socket: null,
    collaborators: [],
    collaborativeEditorState: {},
    noteVersions: {},
    conflictResolution: {},
    realTimeCollaboration: {},
    folderNotes: {},
    folderTags: {},
    versionHistory: {},
    collaborativeNotes: {},
    folderStructure: {
      root: {
        id: 'root',
        name: 'Root',
        children: []
      }
    },
    noteSummaries: [],
    folderMap: new Map(),
    draggedNote: null,
    draggedOverFolder: null
  },
  reducers: {
    moveNote(state, action: PayloadAction<{ noteId: string, folderId: string }>) {
      const { noteId, folderId } = action.payload;
      const note = state.notes.get(noteId);
      if (note) {
        note.folderId = folderId;
        state.notes.set(noteId, note);
      }
    },
    dragNote(state, action: PayloadAction<{ noteId: string }>) {
      const { noteId } = action.payload;
      state.draggedNote = state.notes.get(noteId);
    },
    dragOverFolder(state, action: PayloadAction<{ folderId: string }>) {
      const { folderId } = action.payload;
      state.draggedOverFolder = state.folderMap.get(folderId);
    },
    dropNote(state) {
      if (state.draggedNote && state.draggedOverFolder) {
        state.draggedNote.folderId = state.draggedOverFolder.id;
        state.notes.set(state.draggedNote.id, state.draggedNote);
        state.draggedNote = null;
        state.draggedOverFolder = null;
      }
    }
  }
});

const store = configureStore({
  reducer: {
    app: appSlice.reducer
  },
  middleware: [thunk]
});

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { notes, folders, draggedNote, draggedOverFolder } = useSelector((state: AppState) => state);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (draggedNote && draggedOverFolder) {
      setIsDragging(true);
    } else {
      setIsDragging(false);
    }
  }, [draggedNote, draggedOverFolder]);

  const handleDragNote = (noteId: string) => {
    dispatch(appSlice.actions.dragNote({ noteId }));
  };

  const handleDragOverFolder = (folderId: string) => {
    dispatch(appSlice.actions.dragOverFolder({ folderId }));
  };

  const handleDropNote = () => {
    dispatch(appSlice.actions.dropNote());
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        {folders.map((folder) => (
          <div key={folder.id} onDragOver={() => handleDragOverFolder(folder.id)}>
            {folder.name}
            {notes.map((note) => (
              <DraggableNoteCard key={note.id} note={note} onDragStart={() => handleDragNote(note.id)} />
            ))}
          </div>
        ))}
      </div>
    </DndProvider>
  );
};

const DraggableNoteCard = ({ note, onDragStart }) => {
  const { title, content } = note;

  return (
    <div draggable onDragStart={onDragStart}>
      <h2>{title}</h2>
      <p>{content}</p>
    </div>
  );
};

export default () => (
  <Provider store={store}>
    <DashboardPage />
  </Provider>
);