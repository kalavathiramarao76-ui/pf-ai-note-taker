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
    addTagToNote(state, action: PayloadAction<{ noteId: string; tag: string }>) {
      if (!state.selectedNoteTags[action.payload.noteId]) {
        state.selectedNoteTags[action.payload.noteId] = [];
      }
      state.selectedNoteTags[action.payload.noteId].push(action.payload.tag);
    },
    removeTagFromNote(state, action: PayloadAction<{ noteId: string; tag: string }>) {
      if (state.selectedNoteTags[action.payload.noteId]) {
        state.selectedNoteTags[action.payload.noteId] = state.selectedNoteTags[action.payload.noteId].filter((tag) => tag !== action.payload.tag);
      }
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterByTags, setFilterByTags] = useState([] as string[]);
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState([] as string[]);
  const [selectedNoteTags, setSelectedNoteTags] = useState({} as { [key: string]: string[] });

  useEffect(() => {
    const fetchNotes = async () => {
      const response = await client.get('/notes');
      dispatch(noteSlice.actions.addNote(response.data));
    };
    fetchNotes();
  }, []);

  const handleAddTagToNote = (noteId: string, tag: string) => {
    dispatch(noteSlice.actions.addTagToNote({ noteId, tag }));
    dispatch(tagSlice.actions.addTagToNote({ noteId, tag }));
  };

  const handleRemoveTagFromNote = (noteId: string, tag: string) => {
    dispatch(noteSlice.actions.removeTagFromNote({ noteId, tag }));
    dispatch(tagSlice.actions.removeTagFromNote({ noteId, tag }));
  };

  const handleUpdateTagInput = (tagInput: string) => {
    setTagInput(tagInput);
    const suggestions = tags.tags.filter((tag) => tag.includes(tagInput));
    setTagSuggestions(suggestions);
  };

  const handleAddTag = (tag: string) => {
    dispatch(tagSlice.actions.addTag(tag));
  };

  const handleRemoveTag = (tag: string) => {
    dispatch(tagSlice.actions.removeTag(tag));
  };

  const handleFilterByTags = (tags: string[]) => {
    setFilterByTags(tags);
  };

  return (
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <div>
          <h1>AutoNote: AI-Powered Note Taker</h1>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes"
          />
          <input
            type="text"
            value={tagInput}
            onChange={(e) => handleUpdateTagInput(e.target.value)}
            placeholder="Add tag"
          />
          <ul>
            {tagSuggestions.map((tag) => (
              <li key={tag}>
                <button onClick={() => handleAddTag(tag)}>{tag}</button>
              </li>
            ))}
          </ul>
          <ul>
            {filterByTags.map((tag) => (
              <li key={tag}>
                <button onClick={() => handleRemoveTag(tag)}>{tag}</button>
              </li>
            ))}
          </ul>
          <div>
            {notes.sortedNotes.map((note) => (
              <DraggableNoteCard key={note.id} note={note}>
                <NoteCard note={note}>
                  <ul>
                    {selectedNoteTags[note.id] && selectedNoteTags[note.id].map((tag) => (
                      <li key={tag}>
                        <button onClick={() => handleRemoveTagFromNote(note.id, tag)}>{tag}</button>
                      </li>
                    ))}
                  </ul>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => handleUpdateTagInput(e.target.value)}
                    placeholder="Add tag to note"
                  />
                  <ul>
                    {tagSuggestions.map((tag) => (
                      <li key={tag}>
                        <button onClick={() => handleAddTagToNote(note.id, tag)}>{tag}</button>
                      </li>
                    ))}
                  </ul>
                </NoteCard>
              </DraggableNoteCard>
            ))}
          </div>
        </div>
      </DndProvider>
    </Provider>
  );
};

export default DashboardPage;