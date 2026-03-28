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
  notes: { [key: string]: any };
  meetings: { [key: string]: any };
  templates: { [key: string]: any };
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
  noteTagSuggestionsMap: { [key: string]: string[] };
  collaborativeNoteId: string;
  collaborativeNoteContent: string;
  collaborativeNoteVersion: number;
  tagAutoSuggestions: string[];
  selectedNoteTags: string[];
}

const initialState: AppState = {
  notes: {},
  meetings: {},
  templates: {},
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
  noteTagSuggestionsMap: {},
  collaborativeNoteId: '',
  collaborativeNoteContent: '',
  collaborativeNoteVersion: 0,
  tagAutoSuggestions: [],
  selectedNoteTags: [],
};

const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    addNote(state, action: PayloadAction<any>) {
      state.notes[action.payload.id] = action.payload;
    },
    removeNote(state, action: PayloadAction<string>) {
      delete state.notes[action.payload];
    },
    updateNote(state, action: PayloadAction<any>) {
      state.notes[action.payload.id] = action.payload;
    },
    addFolder(state, action: PayloadAction<any>) {
      state.folders.push(action.payload);
    },
    removeFolder(state, action: PayloadAction<string>) {
      state.folders = state.folders.filter((folder) => folder.id !== action.payload);
    },
    updateFolder(state, action: PayloadAction<any>) {
      const folderIndex = state.folders.findIndex((folder) => folder.id === action.payload.id);
      if (folderIndex !== -1) {
        state.folders[folderIndex] = action.payload;
      }
    },
    addTag(state, action: PayloadAction<string>) {
      state.tags.push(action.payload);
    },
    removeTag(state, action: PayloadAction<string>) {
      state.tags = state.tags.filter((tag) => tag !== action.payload);
    },
    updateTag(state, action: PayloadAction<any>) {
      const tagIndex = state.tags.findIndex((tag) => tag === action.payload.oldTag);
      if (tagIndex !== -1) {
        state.tags[tagIndex] = action.payload.newTag;
      }
    },
    searchNotes(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
      state.filteredNotes = Object.values(state.notes).filter((note) =>
        note.title.toLowerCase().includes(action.payload.toLowerCase()) ||
        note.content.toLowerCase().includes(action.payload.toLowerCase())
      );
    },
    filterNotesByTag(state, action: PayloadAction<string>) {
      state.tagFilter = action.payload;
      state.filteredNotes = Object.values(state.notes).filter((note) =>
        note.tags.includes(action.payload)
      );
    },
    filterNotesByFolder(state, action: PayloadAction<string>) {
      state.folderId = action.payload;
      state.filteredNotes = state.folderNotesMap[action.payload];
    },
  },
});

const store = configureStore({
  reducer: {
    notes: noteSlice.reducer,
  },
  middleware: [thunk],
});

const DashboardPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [folderId, setFolderId] = useState('');
  const [folderTags, setFolderTags] = useState([]);
  const [subfolders, setSubfolders] = useState([]);
  const [folderTagsMap, setFolderTagsMap] = useState({});
  const [availableTags, setAvailableTags] = useState([]);
  const [tagInputValue, setTagInputValue] = useState('');
  const [tagSuggestionsList, setTagSuggestionsList] = useState([]);
  const [noteTagSuggestions, setNoteTagSuggestions] = useState([]);
  const [selectedNoteTags, setSelectedNoteTags] = useState([]);
  const [tagAutoSuggestions, setTagAutoSuggestions] = useState([]);

  const notes = useSelector((state: any) => state.notes.notes);
  const folders = useSelector((state: any) => state.notes.folders);
  const tags = useSelector((state: any) => state.notes.tags);
  const filteredNotes = useSelector((state: any) => state.notes.filteredNotes);

  useEffect(() => {
    client.get('/api/notes').then((response) => {
      dispatch(noteSlice.actions.addNote(response.data));
    });
    client.get('/api/folders').then((response) => {
      dispatch(noteSlice.actions.addFolder(response.data));
    });
    client.get('/api/tags').then((response) => {
      dispatch(noteSlice.actions.addTag(response.data));
    });
  }, []);

  const handleAddNote = (note: any) => {
    dispatch(noteSlice.actions.addNote(note));
  };

  const handleRemoveNote = (noteId: string) => {
    dispatch(noteSlice.actions.removeNote(noteId));
  };

  const handleUpdateNote = (note: any) => {
    dispatch(noteSlice.actions.updateNote(note));
  };

  const handleAddFolder = (folder: any) => {
    dispatch(noteSlice.actions.addFolder(folder));
  };

  const handleRemoveFolder = (folderId: string) => {
    dispatch(noteSlice.actions.removeFolder(folderId));
  };

  const handleUpdateFolder = (folder: any) => {
    dispatch(noteSlice.actions.updateFolder(folder));
  };

  const handleAddTag = (tag: string) => {
    dispatch(noteSlice.actions.addTag(tag));
  };

  const handleRemoveTag = (tag: string) => {
    dispatch(noteSlice.actions.removeTag(tag));
  };

  const handleUpdateTag = (oldTag: string, newTag: string) => {
    dispatch(noteSlice.actions.updateTag({ oldTag, newTag }));
  };

  const handleSearchNotes = (searchQuery: string) => {
    dispatch(noteSlice.actions.searchNotes(searchQuery));
  };

  const handleFilterNotesByTag = (tag: string) => {
    dispatch(noteSlice.actions.filterNotesByTag(tag));
  };

  const handleFilterNotesByFolder = (folderId: string) => {
    dispatch(noteSlice.actions.filterNotesByFolder(folderId));
  };

  const handleToggleFolder = () => {
    setIsFolderOpen(!isFolderOpen);
  };

  const handleCreateFolder = () => {
    client.post('/api/folders', { name: folderName }).then((response) => {
      dispatch(noteSlice.actions.addFolder(response.data));
      setFolderName('');
    });
  };

  const handleUpdateFolderName = () => {
    client.put(`/api/folders/${folderId}`, { name: newFolderName }).then((response) => {
      dispatch(noteSlice.actions.updateFolder(response.data));
      setNewFolderName('');
    });
  };

  const handleAddFolderTag = (tag: string) => {
    setFolderTags([...folderTags, tag]);
  };

  const handleRemoveFolderTag = (tag: string) => {
    setFolderTags(folderTags.filter((t) => t !== tag));
  };

  const handleAddSubfolder = (subfolder: any) => {
    setSubfolders([...subfolders, subfolder]);
  };

  const handleRemoveSubfolder = (subfolderId: string) => {
    setSubfolders(subfolders.filter((subfolder) => subfolder.id !== subfolderId));
  };

  const handleUpdateFolderTags = () => {
    client.put(`/api/folders/${folderId}`, { tags: folderTags }).then((response) => {
      dispatch(noteSlice.actions.updateFolder(response.data));
    });
  };

  const handleUpdateAvailableTags = () => {
    client.get('/api/tags').then((response) => {
      setAvailableTags(response.data);
    });
  };

  const handleUpdateTagInputValue = (value: string) => {
    setTagInputValue(value);
    const suggestions = availableTags.filter((tag) => tag.includes(value));
    setTagSuggestionsList(suggestions);
  };

  const handleAddTagToNote = (noteId: string, tag: string) => {
    client.put(`/api/notes/${noteId}`, { tags: [...notes[noteId].tags, tag] }).then((response) => {
      dispatch(noteSlice.actions.updateNote(response.data));
    });
  };

  const handleRemoveTagFromNote = (noteId: string, tag: string) => {
    client.put(`/api/notes/${noteId}`, { tags: notes[noteId].tags.filter((t) => t !== tag) }).then((response) => {
      dispatch(noteSlice.actions.updateNote(response.data));
    });
  };

  const handleUpdateNoteTagSuggestions = (noteId: string) => {
    client.get(`/api/notes/${noteId}/tag-suggestions`).then((response) => {
      setNoteTagSuggestions(response.data);
    });
  };

  const handleUpdateSelectedNoteTags = (noteId: string, tags: string[]) => {
    setSelectedNoteTags(tags);
  };

  const handleUpdateTagAutoSuggestions = () => {
    client.get('/api/tags/auto-suggestions').then((response) => {
      setTagAutoSuggestions(response.data);
    });
  };

  return (
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <div>
          <h1>AutoNote: AI-Powered Note Taker</h1>
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchNotes(e.target.value)}
              placeholder="Search notes"
            />
            <button onClick={handleToggleFolder}>Toggle Folder</button>
            {isFolderOpen && (
              <div>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Create new folder"
                />
                <button onClick={handleCreateFolder}>Create Folder</button>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Update folder name"
                />
                <button onClick={handleUpdateFolderName}>Update Folder Name</button>
                <div>
                  <h2>Folder Tags</h2>
                  <ul>
                    {folderTags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                  <input
                    type="text"
                    value={tagInputValue}
                    onChange={(e) => handleUpdateTagInputValue(e.target.value)}
                    placeholder="Add tag to folder"
                  />
                  <ul>
                    {tagSuggestionsList.map((suggestion) => (
                      <li key={suggestion}>{suggestion}</li>
                    ))}
                  </ul>
                  <button onClick={() => handleAddFolderTag(tagInputValue)}>Add Tag</button>
                </div>
                <div>
                  <h2>Subfolders</h2>
                  <ul>
                    {subfolders.map((subfolder) => (
                      <li key={subfolder.id}>{subfolder.name}</li>
                    ))}
                  </ul>
                  <button onClick={() => handleAddSubfolder({ name: 'New Subfolder' })}>
                    Add Subfolder
                  </button>
                </div>
              </div>
            )}
            <div>
              <h2>Notes</h2>
              <ul>
                {filteredNotes.map((note) => (
                  <li key={note.id}>
                    <NoteCard note={note} />
                    <button onClick={() => handleRemoveNote(note.id)}>Remove Note</button>
                    <button onClick={() => handleUpdateNoteTagSuggestions(note.id)}>Update Tag Suggestions</button>
                    <ul>
                      {noteTagSuggestions.map((suggestion) => (
                        <li key={suggestion}>{suggestion}</li>
                      ))}
                    </ul>
                    <input
                      type="text"
                      value={tagInputValue}
                      onChange={(e) => handleUpdateTagInputValue(e.target.value)}
                      placeholder="Add tag to note"
                    />
                    <button onClick={() => handleAddTagToNote(note.id, tagInputValue)}>Add Tag</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </DndProvider>
    </Provider>
  );
};

export default DashboardPage;