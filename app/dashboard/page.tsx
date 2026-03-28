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

const store = configureStore({
  reducer: {
    appState: createSlice({
      name: 'appState',
      initialState: {
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
      } as AppState,
      reducers: {
        // Add reducers as needed
      },
    }).reducer,
  },
  middleware: [thunk],
});

const DashboardPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const appState = useSelector((state: any) => state.appState);

  const [folderTree, setFolderTree] = useState(appState.folderTree);
  const [draggedNote, setDraggedNote] = useState(appState.draggedNote);
  const [draggedOverFolder, setDraggedOverFolder] = useState(appState.draggedOverFolder);

  useEffect(() => {
    // Initialize folder tree and notes
    const initializeFolderTree = async () => {
      const response = await client.get('/api/folders');
      const folders = response.data;
      setFolderTree(folders);
    };
    initializeFolderTree();
  }, []);

  const handleDragStart = (note: any) => {
    setDraggedNote(note);
  };

  const handleDragOver = (folder: any) => {
    setDraggedOverFolder(folder);
  };

  const handleDrop = () => {
    if (draggedNote && draggedOverFolder) {
      // Move note to folder
      const updatedFolderTree = folderTree.map((folder) => {
        if (folder.id === draggedOverFolder.id) {
          folder.notes = [...folder.notes, draggedNote];
        }
        return folder;
      });
      setFolderTree(updatedFolderTree);
      setDraggedNote(null);
      setDraggedOverFolder(null);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="dashboard-page">
        <div className="folder-tree">
          {folderTree.map((folder) => (
            <div key={folder.id} className="folder">
              <div className="folder-name">{folder.name}</div>
              <div className="folder-notes">
                {folder.notes.map((note) => (
                  <DraggableNoteCard key={note.id} note={note} onDragStart={handleDragStart} />
                ))}
              </div>
              <div className="folder-subfolders">
                {folder.subfolders.map((subfolder) => (
                  <div key={subfolder.id} className="subfolder">
                    <div className="subfolder-name">{subfolder.name}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="note-list">
          {appState.notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
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