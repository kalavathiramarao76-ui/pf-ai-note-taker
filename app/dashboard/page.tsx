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

// Simplify the initial state by grouping related properties into objects
interface SimplifiedAppState {
  notes: { [key: string]: any };
  meetings: { [key: string]: any };
  templates: { [key: string]: any };
  search: {
    query: string;
    filterType: string;
    sortBy: string;
    sortOrder: string;
    filterByTags: any[];
    filterByDate: string;
  };
  editing: {
    note: any;
    title: string;
    content: string;
    isGeneratingNote: boolean;
    editorState: EditorState;
  };
  tags: {
    all: any[];
    selected: any[];
    noteTags: any;
    tagInput: string;
    tagSuggestions: any[];
  };
  folders: {
    all: any[];
    selected: any;
    folderNotes: any;
    folderTags: any;
    folderStructure: any;
    folderMap: { [key: string]: any };
    folderNotesMap: { [key: string]: any[] };
    noteFolderMap: { [key: string]: string };
  };
  collaboration: {
    socket: Socket | null;
    collaborators: any[];
    collaborativeEditorState: any;
    noteVersions: any;
    conflictResolution: any;
    realTimeCollaboration: any;
  };
  ai: {
    suggestions: any[];
    autocompleteSuggestions: any[];
    model: any;
    noteCompletion: string;
  };
  reminders: {
    priorities: { [key: string]: string };
    dueDates: { [key: string]: string };
    reminders: { [key: string]: string };
    priorityLevels: { [key: string]: string[] };
  };
}

const initialState: SimplifiedAppState = {
  notes: {},
  meetings: {},
  templates: {},
  search: {
    query: '',
    filterType: '',
    sortBy: '',
    sortOrder: '',
    filterByTags: [],
    filterByDate: '',
  },
  editing: {
    note: null,
    title: '',
    content: '',
    isGeneratingNote: false,
    editorState: EditorState.createEmpty(),
  },
  tags: {
    all: [],
    selected: [],
    noteTags: null,
    tagInput: '',
    tagSuggestions: [],
  },
  folders: {
    all: [],
    selected: null,
    folderNotes: null,
    folderTags: null,
    folderStructure: null,
    folderMap: {},
    folderNotesMap: {},
    noteFolderMap: {},
  },
  collaboration: {
    socket: null,
    collaborators: [],
    collaborativeEditorState: null,
    noteVersions: null,
    conflictResolution: null,
    realTimeCollaboration: null,
  },
  ai: {
    suggestions: [],
    autocompleteSuggestions: [],
    model: null,
    noteCompletion: '',
  },
  reminders: {
    priorities: {},
    dueDates: {},
    reminders: {},
    priorityLevels: {},
  },
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // Add reducers as needed
  },
});

const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
  middleware: [thunk],
});

const DashboardPage = () => {
  const dispatch = useDispatch();
  const state = useSelector((state: any) => state.app);

  // Use the simplified state
  const notes = state.notes;
  const meetings = state.meetings;
  const templates = state.templates;
  const searchQuery = state.search.query;
  const editingNote = state.editing.note;
  const tags = state.tags.all;
  const folders = state.folders.all;
  const collaborators = state.collaboration.collaborators;
  const aiSuggestions = state.ai.suggestions;

  // Rest of the code remains the same
  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <Link href="/notes">
          <a>Notes</a>
        </Link>
        <Link href="/meetings">
          <a>Meetings</a>
        </Link>
        <Link href="/templates">
          <a>Templates</a>
        </Link>
        <div>
          <AiOutlinePlus />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => dispatch(appSlice.actions.updateSearchQuery(e.target.value))}
            placeholder="Search"
          />
        </div>
        <div>
          {notes.map((note: any) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
        <div>
          {meetings.map((meeting: any) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
        <div>
          {templates.map((template: any) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
        <div>
          {folders.map((folder: any) => (
            <div key={folder.id}>
              <h2>{folder.name}</h2>
              {folder.notes.map((note: any) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          ))}
        </div>
        <div>
          {collaborators.map((collaborator: any) => (
            <div key={collaborator.id}>
              <h2>{collaborator.name}</h2>
            </div>
          ))}
        </div>
        <div>
          {aiSuggestions.map((suggestion: any) => (
            <div key={suggestion.id}>
              <h2>{suggestion.text}</h2>
            </div>
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default () => (
  <Provider store={store}>
    <DashboardPage />
  </Provider>
);