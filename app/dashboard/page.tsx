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
    }
  },
  reducers: {
    addTag(state, action: PayloadAction<string>) {
      if (!state.tags.includes(action.payload)) {
        state.tags.push(action.payload);
      }
    },
    removeTag(state, action: PayloadAction<string>) {
      state.tags = state.tags.filter(tag => tag !== action.payload);
    },
    updateTagInput(state, action: PayloadAction<string>) {
      state.tagInput = action.payload;
      state.tagSuggestions = state.tags.filter(tag => tag.includes(action.payload));
    },
    clearTagInput(state) {
      state.tagInput = '';
      state.tagSuggestions = [];
    },
    addNoteTag(state, action: PayloadAction<{ noteId: string, tag: string }>) {
      if (!state.noteTags[action.payload.noteId]) {
        state.noteTags[action.payload.noteId] = [];
      }
      if (!state.noteTags[action.payload.noteId].includes(action.payload.tag)) {
        state.noteTags[action.payload.noteId].push(action.payload.tag);
      }
    },
    removeNoteTag(state, action: PayloadAction<{ noteId: string, tag: string }>) {
      if (state.noteTags[action.payload.noteId]) {
        state.noteTags[action.payload.noteId] = state.noteTags[action.payload.noteId].filter(tag => tag !== action.payload.tag);
      }
    },
    filterByTags(state, action: PayloadAction<string[]>) {
      state.filterByTags = action.payload;
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
  const { notes, tags, selectedTags, noteTags, tagInput, tagSuggestions, filterByTags } = useSelector((state: AppState) => state);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);

  const handleAddTag = (tag: string) => {
    dispatch(appSlice.actions.addTag(tag));
  };

  const handleRemoveTag = (tag: string) => {
    dispatch(appSlice.actions.removeTag(tag));
  };

  const handleUpdateTagInput = (tagInput: string) => {
    dispatch(appSlice.actions.updateTagInput(tagInput));
  };

  const handleClearTagInput = () => {
    dispatch(appSlice.actions.clearTagInput());
  };

  const handleAddNoteTag = (noteId: string, tag: string) => {
    dispatch(appSlice.actions.addNoteTag({ noteId, tag }));
  };

  const handleRemoveNoteTag = (noteId: string, tag: string) => {
    dispatch(appSlice.actions.removeNoteTag({ noteId, tag }));
  };

  const handleFilterByTags = (tags: string[]) => {
    dispatch(appSlice.actions.filterByTags(tags));
  };

  const filteredNotes = Object.values(notes).filter(note => {
    if (filterByTags.length === 0) return true;
    return filterByTags.every(tag => noteTags[note.id] && noteTags[note.id].includes(tag));
  });

  return (
    <Provider store={store}>
      <div>
        <h1>AutoNote: AI-Powered Note Taker</h1>
        <div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => handleUpdateTagInput(e.target.value)}
            placeholder="Add tag"
          />
          {autocompleteOpen && (
            <ul>
              {tagSuggestions.map((tag) => (
                <li key={tag} onClick={() => handleAddTag(tag)}>
                  {tag}
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => handleClearTagInput()}>Clear</button>
        </div>
        <div>
          <h2>Notes</h2>
          <ul>
            {filteredNotes.map((note) => (
              <li key={note.id}>
                <NoteCard note={note} />
                <div>
                  {noteTags[note.id] && noteTags[note.id].map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => handleUpdateTagInput(e.target.value)}
                    placeholder="Add tag"
                  />
                  {autocompleteOpen && (
                    <ul>
                      {tagSuggestions.map((tag) => (
                        <li key={tag} onClick={() => handleAddNoteTag(note.id, tag)}>
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Meetings</h2>
          <ul>
            {Object.values(meetings).map((meeting) => (
              <li key={meeting.id}>
                <MeetingCard meeting={meeting} />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Templates</h2>
          <ul>
            {Object.values(templates).map((template) => (
              <li key={template.id}>
                <TemplateCard template={template} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Provider>
  );
};

export default DashboardPage;