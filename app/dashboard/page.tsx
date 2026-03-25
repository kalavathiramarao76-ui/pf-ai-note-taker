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

// Define the initial state
const initialState = {
  notes: [],
  meetings: [],
  templates: [],
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
  noteTags: {}, // store tags for each note
  tagInput: '', // input for tag autocomplete
  tagSuggestions: [], // suggestions for tag autocomplete
  socket: null,
  collaborators: [], // store collaborators for each note
  collaborativeEditorState: {}, // store collaborative editor state for each note
  noteVersions: {}, // store versions of each note
  conflictResolution: {}, // store conflict resolution data for each note
  realTimeCollaboration: {}, // store real-time collaboration data for each note
  folderNotes: {}, // store notes for each folder
  folderTags: {}, // store tags for each folder
  versionHistory: {}, // store version history for each note
  collaborativeNotes: {}, // store collaborative notes
};

// Define the reducer
const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_NOTES':
      return { ...state, notes: action.notes };
    case 'SET_MEETINGS':
      return { ...state, meetings: action.meetings };
    case 'SET_TEMPLATES':
      return { ...state, templates: action.templates };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.searchQuery };
    case 'SET_GENERATED_NOTES':
      return { ...state, generatedNotes: action.generatedNotes };
    case 'SET_FOLDERS':
      return { ...state, folders: action.folders };
    case 'SET_SELECTED_FOLDER':
      return { ...state, selectedFolder: action.selectedFolder };
    case 'SET_EDITING_NOTE':
      return { ...state, editingNote: action.editingNote };
    case 'SET_SORTED_NOTES':
      return { ...state, sortedNotes: action.sortedNotes };
    case 'SET_SORTED_MEETINGS':
      return { ...state, sortedMeetings: action.sortedMeetings };
    case 'SET_SORTED_TEMPLATES':
      return { ...state, sortedTemplates: action.sortedTemplates };
    case 'SET_FILTER_TYPE':
      return { ...state, filterType: action.filterType };
    case 'SET_SORT_BY':
      return { ...state, sortBy: action.sortBy };
    case 'SET_SORT_ORDER':
      return { ...state, sortOrder: action.sortOrder };
    case 'SET_FILTER_BY_TAGS':
      return { ...state, filterByTags: action.filterByTags };
    case 'SET_FILTER_BY_DATE':
      return { ...state, filterByDate: action.filterByDate };
    case 'SET_AI_SUGGESTIONS':
      return { ...state, aiSuggestions: action.aiSuggestions };
    case 'SET_AUTOCOMPLETE_SUGGESTIONS':
      return { ...state, autocompleteSuggestions: action.autocompleteSuggestions };
    case 'SET_PRIORITY':
      return { ...state, priority: action.priority };
    case 'SET_DEADLINE':
      return { ...state, deadline: action.deadline };
    case 'SET_NOTE_TITLE':
      return { ...state, noteTitle: action.noteTitle };
    case 'SET_NOTE_CONTENT':
      return { ...state, noteContent: action.noteContent };
    case 'SET_IS_GENERATING_NOTE':
      return { ...state, isGeneratingNote: action.isGeneratingNote };
    case 'SET_EDITOR_STATE':
      return { ...state, editorState: action.editorState };
    case 'SET_QUICK_NOTE':
      return { ...state, quickNote: action.quickNote };
    case 'SET_IS_QUICK_NOTE_OPEN':
      return { ...state, isQuickNoteOpen: action.isQuickNoteOpen };
    case 'SET_TAGS':
      return { ...state, tags: action.tags };
    case 'SET_SELECTED_TAGS':
      return { ...state, selectedTags: action.selectedTags };
    case 'SET_NOTE_TAGS':
      return { ...state, noteTags: action.noteTags };
    case 'SET_TAG_INPUT':
      return { ...state, tagInput: action.tagInput };
    case 'SET_TAG_SUGGESTIONS':
      return { ...state, tagSuggestions: action.tagSuggestions };
    case 'SET_SOCKET':
      return { ...state, socket: action.socket };
    case 'SET_COLLABORATORS':
      return { ...state, collaborators: action.collaborators };
    case 'SET_COLLABORATIVE_EDITOR_STATE':
      return { ...state, collaborativeEditorState: action.collaborativeEditorState };
    case 'SET_NOTE_VERSIONS':
      return { ...state, noteVersions: action.noteVersions };
    case 'SET_CONFLICT_RESOLUTION':
      return { ...state, conflictResolution: action.conflictResolution };
    case 'SET_REAL_TIME_COLLABORATION':
      return { ...state, realTimeCollaboration: action.realTimeCollaboration };
    case 'SET_FOLDER_NOTES':
      return { ...state, folderNotes: action.folderNotes };
    case 'SET_FOLDER_TAGS':
      return { ...state, folderTags: action.folderTags };
    case 'SET_VERSION_HISTORY':
      return { ...state, versionHistory: action.versionHistory };
    case 'SET_COLLABORATIVE_NOTES':
      return { ...state, collaborativeNotes: action.collaborativeNotes };
    default:
      return state;
  }
};

const store = configureStore({
  reducer: {
    app: appReducer,
  },
  middleware: [thunk],
});

const DashboardPage = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.app);
  const router = useRouter();

  const handleTagInput = (e) => {
    const tagInput = e.target.value;
    dispatch({ type: 'SET_TAG_INPUT', tagInput });
    const tagSuggestions = state.tags.filter((tag) => tag.includes(tagInput));
    dispatch({ type: 'SET_TAG_SUGGESTIONS', tagSuggestions });
  };

  const handleTagSelect = (tag) => {
    const selectedTags = [...state.selectedTags, tag];
    dispatch({ type: 'SET_SELECTED_TAGS', selectedTags });
    dispatch({ type: 'SET_TAG_INPUT', tagInput: '' });
    dispatch({ type: 'SET_TAG_SUGGESTIONS', tagSuggestions: [] });
  };

  const handleNoteTagAdd = (noteId, tag) => {
    const noteTags = { ...state.noteTags };
    if (!noteTags[noteId]) {
      noteTags[noteId] = [];
    }
    noteTags[noteId].push(tag);
    dispatch({ type: 'SET_NOTE_TAGS', noteTags });
  };

  const handleNoteTagRemove = (noteId, tag) => {
    const noteTags = { ...state.noteTags };
    if (noteTags[noteId]) {
      noteTags[noteId] = noteTags[noteId].filter((t) => t !== tag);
    }
    dispatch({ type: 'SET_NOTE_TAGS', noteTags });
  };

  return (
    <div>
      <h1>AutoNote: AI-Powered Note Taker</h1>
      <input
        type="text"
        value={state.tagInput}
        onChange={handleTagInput}
        placeholder="Add tag"
      />
      <ul>
        {state.tagSuggestions.map((tag) => (
          <li key={tag} onClick={() => handleTagSelect(tag)}>
            {tag}
          </li>
        ))}
      </ul>
      <ul>
        {state.notes.map((note) => (
          <li key={note.id}>
            <NoteCard note={note} />
            <ul>
              {state.noteTags[note.id] && state.noteTags[note.id].map((tag) => (
                <li key={tag}>
                  {tag}
                  <button onClick={() => handleNoteTagRemove(note.id, tag)}>Remove</button>
                </li>
              ))}
            </ul>
            <input
              type="text"
              value={state.tagInput}
              onChange={handleTagInput}
              placeholder="Add tag to note"
            />
            <ul>
              {state.tagSuggestions.map((tag) => (
                <li key={tag} onClick={() => handleNoteTagAdd(note.id, tag)}>
                  {tag}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default () => (
  <Provider store={store}>
    <DashboardPage />
  </Provider>
);