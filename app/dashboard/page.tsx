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
        children: [],
        notes: []
      }
    },
    noteSummaries: []
  },
  reducers: {
    generateNoteSummary(state, action: PayloadAction<{ noteId: string, summary: string }>) {
      const noteId = action.payload.noteId;
      const summary = action.payload.summary;
      state.noteSummaries = [...state.noteSummaries, { noteId, summary }];
    }
  }
});

// Create the store
const store = configureStore({
  reducer: {
    app: appSlice.reducer
  },
  middleware: [thunk]
});

// Define the AI-powered note summarization function
const generateNoteSummary = async (noteId: string, noteContent: string) => {
  try {
    const response = await client.post('/api/summarize-note', {
      noteId,
      noteContent
    });
    const summary = response.data.summary;
    return summary;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Define the component
const DashboardPage = () => {
  const dispatch = useDispatch();
  const { notes, noteSummaries } = useSelector((state: any) => state.app);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    const generateSummaries = async () => {
      for (const [noteId, note] of notes) {
        const summary = await generateNoteSummary(noteId, note.content);
        if (summary) {
          dispatch(appSlice.actions.generateNoteSummary({ noteId, summary }));
        }
      }
    };
    generateSummaries();
  }, [notes]);

  const handleNoteClick = (noteId: string) => {
    setSelectedNote(noteId);
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <ul>
        {Array.from(notes).map(([noteId, note]) => (
          <li key={noteId}>
            <Link href={`/notes/${noteId}`}>
              <a onClick={() => handleNoteClick(noteId)}>{note.title}</a>
            </Link>
            {noteSummaries.find((summary) => summary.noteId === noteId) && (
              <p>Summary: {noteSummaries.find((summary) => summary.noteId === noteId).summary}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardPage;