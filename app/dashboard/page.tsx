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
    default:
      return state;
  }
};

// Create the store
const store = configureStore({
  reducer: {
    app: appReducer,
  },
  middleware: [thunk],
});

// Define the socket connection
const socket = io('http://localhost:3001');

// Define the collaborative editor
const CollaborativeEditor = () => {
  const [editorState, setEditorState] = useState(EditorState.createWithContent(ContentState.createFromText('')));
  const [collaborators, setCollaborators] = useState([]);
  const [noteVersions, setNoteVersions] = useState({});

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to the server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from the server');
    });

    socket.on('collaborator-joined', (collaborator) => {
      setCollaborators((prevCollaborators) => [...prevCollaborators, collaborator]);
    });

    socket.on('collaborator-left', (collaborator) => {
      setCollaborators((prevCollaborators) => prevCollaborators.filter((c) => c !== collaborator));
    });

    socket.on('note-version', (noteVersion) => {
      setNoteVersions((prevNoteVersions) => ({ ...prevNoteVersions, [noteVersion.id]: noteVersion }));
    });
  }, []);

  const handleEditorChange = (newEditorState) => {
    setEditorState(newEditorState);
    socket.emit('editor-change', newEditorState);
  };

  return (
    <Editor
      editorState={editorState}
      onChange={handleEditorChange}
      placeholder="Type here..."
    />
  );
};

// Define the conflict resolution component
const ConflictResolution = () => {
  const [conflictResolution, setConflictResolution] = useState({});

  useEffect(() => {
    socket.on('conflict-resolution', (conflict) => {
      setConflictResolution(conflict);
    });
  }, []);

  const handleConflictResolution = (resolution) => {
    setConflictResolution(resolution);
    socket.emit('conflict-resolution', resolution);
  };

  return (
    <div>
      <h2>Conflict Resolution</h2>
      <p>{conflictResolution.message}</p>
      <button onClick={() => handleConflictResolution('accept')}>Accept</button>
      <button onClick={() => handleConflictResolution('reject')}>Reject</button>
    </div>
  );
};

// Define the real-time collaboration component
const RealTimeCollaboration = () => {
  const [collaborators, setCollaborators] = useState([]);
  const [noteVersions, setNoteVersions] = useState({});

  useEffect(() => {
    socket.on('collaborator-joined', (collaborator) => {
      setCollaborators((prevCollaborators) => [...prevCollaborators, collaborator]);
    });

    socket.on('collaborator-left', (collaborator) => {
      setCollaborators((prevCollaborators) => prevCollaborators.filter((c) => c !== collaborator));
    });

    socket.on('note-version', (noteVersion) => {
      setNoteVersions((prevNoteVersions) => ({ ...prevNoteVersions, [noteVersion.id]: noteVersion }));
    });
  }, []);

  return (
    <div>
      <h2>Real-Time Collaboration</h2>
      <ul>
        {collaborators.map((collaborator) => (
          <li key={collaborator}>{collaborator}</li>
        ))}
      </ul>
      <ul>
        {Object.keys(noteVersions).map((noteVersionId) => (
          <li key={noteVersionId}>{noteVersions[noteVersionId].content}</li>
        ))}
      </ul>
    </div>
  );
};

// Define the note editing system
const NoteEditingSystem = () => {
  const [note, setNote] = useState({});

  useEffect(() => {
    socket.on('note-edited', (editedNote) => {
      setNote(editedNote);
    });
  }, []);

  const handleNoteEdit = (editedNote) => {
    setNote(editedNote);
    socket.emit('note-edited', editedNote);
  };

  return (
    <div>
      <h2>Note Editing System</h2>
      <Editor
        editorState={EditorState.createWithContent(ContentState.createFromText(note.content))}
        onChange={(newEditorState) => handleNoteEdit({ ...note, content: newEditorState.getCurrentContent().getPlainText() })}
        placeholder="Type here..."
      />
    </div>
  );
};

// Define the dashboard page
const DashboardPage = () => {
  const dispatch = useDispatch();
  const { notes, meetings, templates, searchQuery, generatedNotes, folders, selectedFolder, editingNote, sortedNotes, sortedMeetings, sortedTemplates, filterType, sortBy, sortOrder, filterByTags, filterByDate, aiSuggestions, autocompleteSuggestions, priority, deadline, noteTitle, noteContent, isGeneratingNote, editorState, quickNote, isQuickNoteOpen, tags, selectedTags, noteTags, tagInput, tagSuggestions, socket, collaborators, collaborativeEditorState, noteVersions, conflictResolution } = useSelector((state) => state.app);

  useEffect(() => {
    client.get('/notes')
      .then((response) => {
        dispatch({ type: 'SET_NOTES', notes: response.data });
      })
      .catch((error) => {
        console.error(error);
      });

    client.get('/meetings')
      .then((response) => {
        dispatch({ type: 'SET_MEETINGS', meetings: response.data });
      })
      .catch((error) => {
        console.error(error);
      });

    client.get('/templates')
      .then((response) => {
        dispatch({ type: 'SET_TEMPLATES', templates: response.data });
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleSearchQueryChange = (newSearchQuery) => {
    dispatch({ type: 'SET_SEARCH_QUERY', searchQuery: newSearchQuery });
  };

  const handleFilterTypeChange = (newFilterType) => {
    dispatch({ type: 'SET_FILTER_TYPE', filterType: newFilterType });
  };

  const handleSortByChange = (newSortBy) => {
    dispatch({ type: 'SET_SORT_BY', sortBy: newSortBy });
  };

  const handleSortOrderChange = (newSortOrder) => {
    dispatch({ type: 'SET_SORT_ORDER', sortOrder: newSortOrder });
  };

  const handleFilterByTagsChange = (newFilterByTags) => {
    dispatch({ type: 'SET_FILTER_BY_TAGS', filterByTags: newFilterByTags });
  };

  const handleFilterByDateChange = (newFilterByDate) => {
    dispatch({ type: 'SET_FILTER_BY_DATE', filterByDate: newFilterByDate });
  };

  const handleAiSuggestionsChange = (newAiSuggestions) => {
    dispatch({ type: 'SET_AI_SUGGESTIONS', aiSuggestions: newAiSuggestions });
  };

  const handleAutocompleteSuggestionsChange = (newAutocompleteSuggestions) => {
    dispatch({ type: 'SET_AUTOCOMPLETE_SUGGESTIONS', autocompleteSuggestions: newAutocompleteSuggestions });
  };

  const handlePriorityChange = (newPriority) => {
    dispatch({ type: 'SET_PRIORITY', priority: newPriority });
  };

  const handleDeadlineChange = (newDeadline) => {
    dispatch({ type: 'SET_DEADLINE', deadline: newDeadline });
  };

  const handleNoteTitleChange = (newNoteTitle) => {
    dispatch({ type: 'SET_NOTE_TITLE', noteTitle: newNoteTitle });
  };

  const handleNoteContentChange = (newNoteContent) => {
    dispatch({ type: 'SET_NOTE_CONTENT', noteContent: newNoteContent });
  };

  const handleIsGeneratingNoteChange = (newIsGeneratingNote) => {
    dispatch({ type: 'SET_IS_GENERATING_NOTE', isGeneratingNote: newIsGeneratingNote });
  };

  const handleEditorStateChange = (newEditorState) => {
    dispatch({ type: 'SET_EDITOR_STATE', editorState: newEditorState });
  };

  const handleQuickNoteChange = (newQuickNote) => {
    dispatch({ type: 'SET_QUICK_NOTE', quickNote: newQuickNote });
  };

  const handleIsQuickNoteOpenChange = (newIsQuickNoteOpen) => {
    dispatch({ type: 'SET_IS_QUICK_NOTE_OPEN', isQuickNoteOpen: newIsQuickNoteOpen });
  };

  const handleTagsChange = (newTags) => {
    dispatch({ type: 'SET_TAGS', tags: newTags });
  };

  const handleSelectedTagsChange = (newSelectedTags) => {
    dispatch({ type: 'SET_SELECTED_TAGS', selectedTags: newSelectedTags });
  };

  const handleNoteTagsChange = (newNoteTags) => {
    dispatch({ type: 'SET_NOTE_TAGS', noteTags: newNoteTags });
  };

  const handleTagInputChange = (newTagInput) => {
    dispatch({ type: 'SET_TAG_INPUT', tagInput: newTagInput });
  };

  const handleTagSuggestionsChange = (newTagSuggestions) => {
    dispatch({ type: 'SET_TAG_SUGGESTIONS', tagSuggestions: newTagSuggestions });
  };

  const handleSocketChange = (newSocket) => {
    dispatch({ type: 'SET_SOCKET', socket: newSocket });
  };

  const handleCollaboratorsChange = (newCollaborators) => {
    dispatch({ type: 'SET_COLLABORATORS', collaborators: newCollaborators });
  };

  const handleCollaborativeEditorStateChange = (newCollaborativeEditorState) => {
    dispatch({ type: 'SET_COLLABORATIVE_EDITOR_STATE', collaborativeEditorState: newCollaborativeEditorState });
  };

  const handleNoteVersionsChange = (newNoteVersions) => {
    dispatch({ type: 'SET_NOTE_VERSIONS', noteVersions: newNoteVersions });
  };

  const handleConflictResolutionChange = (newConflictResolution) => {
    dispatch({ type: 'SET_CONFLICT_RESOLUTION', conflictResolution: newConflictResolution });
  };

  return (
    <div>
      <h1>AutoNote: AI-Powered Note Taker</h1>
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => handleSearchQueryChange(e.target.value)}
        placeholder="Search notes..."
      />
      <select
        value={filterType}
        onChange={(e) => handleFilterTypeChange(e.target.value)}
      >
        <option value="all">All</option>
        <option value="notes">Notes</option>
        <option value="meetings">Meetings</option>
        <option value="templates">Templates</option>
      </select>
      <select
        value={sortBy}
        onChange={(e) => handleSortByChange(e.target.value)}
      >
        <option value="title">Title</option>
        <option value="date">Date</option>
      </select>
      <select
        value={sortOrder}
        onChange={(e) => handleSortOrderChange(e.target.value)}
      >
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
      <input
        type="checkbox"
        checked={filterByTags.includes('tag1')}
        onChange={(e) => handleFilterByTagsChange(e.target.checked ? [...filterByTags, 'tag1'] : filterByTags.filter((tag) => tag !== 'tag1'))}
      />
      <input
        type="checkbox"
        checked={filterByTags.includes('tag2')}
        onChange={(e) => handleFilterByTagsChange(e.target.checked ? [...filterByTags, 'tag2'] : filterByTags.filter((tag) => tag !== 'tag2'))}
      />
      <input
        type="date"
        value={filterByDate}
        onChange={(e) => handleFilterByDateChange(e.target.value)}
      />
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <NoteCard note={note} />
          </li>
        ))}
      </ul>
      <ul>
        {meetings.map((meeting) => (
          <li key={meeting.id}>
            <MeetingCard meeting={meeting} />
          </li>
        ))}
      </ul>
      <ul>
        {templates.map((template) => (
          <li key={template.id}>
            <TemplateCard template={template} />
          </li>
        ))}
      </ul>
      <button onClick={() => handleIsGeneratingNoteChange(true)}>Generate Note</button>
      {isGeneratingNote && (
        <div>
          <h2>Generating Note...</h2>
          <p>Please wait...</p>
        </div>
      )}
      <Editor
        editorState={editorState}
        onChange={handleEditorStateChange}
        placeholder="Type here..."
      />
      <input
        type="text"
        value={quickNote}
        onChange={(e) => handleQuickNoteChange(e.target.value)}
        placeholder="Quick Note..."
      />
      <button onClick={() => handleIsQuickNoteOpenChange(true)}>Open Quick Note</button>
      {isQuickNoteOpen && (
        <div>
          <h2>Quick Note</h2>
          <p>{quickNote}</p>
        </div>
      )}
      <ul>
        {tags.map((tag) => (
          <li key={tag}>
            <input
              type="checkbox"
              checked={selectedTags.includes(tag)}
              onChange={(e) => handleSelectedTagsChange(e.target.checked ? [...selectedTags, tag] : selectedTags.filter((t) => t !== tag))}
            />
            {tag}
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={tagInput}
        onChange={(e) => handleTagInputChange(e.target.value)}
        placeholder="Add Tag..."
      />
      <ul>
        {tagSuggestions.map((suggestion) => (
          <li key={suggestion}>
            {suggestion}
          </li>
        ))}
      </ul>
      <CollaborativeEditor />
      <RealTimeCollaboration />
      <ConflictResolution />
      <NoteEditingSystem />
    </div>
  );
};

export default () => (
  <Provider store={store}>
    <DashboardPage />
  </Provider>
);