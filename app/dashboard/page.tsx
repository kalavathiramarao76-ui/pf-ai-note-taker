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
  noteSummarizationModel: any;
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
  noteSummarizationModel: null,
};

const store = configureStore({
  reducer: {
    appState: (state = initialState, action: PayloadAction<any>) => {
      switch (action.type) {
        default:
          return state;
      }
    },
  },
  middleware: [thunk],
});

const App = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [noteSummarizationModel, setNoteSummarizationModel] = useState(null);

  useEffect(() => {
    const loadNoteSummarizationModel = async () => {
      const response = await client.get('/api/note-summarization-model');
      setNoteSummarizationModel(response.data);
    };
    loadNoteSummarizationModel();
  }, []);

  const summarizeNote = async (noteContent: string) => {
    if (noteSummarizationModel) {
      const response = await client.post('/api/summarize-note', {
        noteContent,
        model: noteSummarizationModel,
      });
      return response.data;
    } else {
      return null;
    }
  };

  const handleNoteSummarization = async (noteId: string) => {
    const note = store.getState().appState.notes[noteId];
    if (note) {
      const summary = await summarizeNote(note.content);
      if (summary) {
        dispatch({
          type: 'UPDATE_NOTE_SUMMARY',
          payload: { noteId, summary },
        });
      }
    }
  };

  return (
    <Provider store={store}>
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
            {store.getState().appState.notes.map((note: any) => (
              <NoteCard
                key={note.id}
                note={note}
                onSummarize={handleNoteSummarization}
              />
            ))}
          </div>
          <div>
            {store.getState().appState.meetings.map((meeting: any) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
          <div>
            {store.getState().appState.templates.map((template: any) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
          <div>
            <Editor
              editorState={store.getState().appState.editorState}
              onChange={(editorState) =>
                dispatch({
                  type: 'UPDATE_EDITOR_STATE',
                  payload: editorState,
                })
              }
            />
          </div>
          <div>
            <button onClick={() => handleNoteSummarization('note-1')}>
              Summarize Note
            </button>
          </div>
        </div>
      </DndProvider>
    </Provider>
  );
};

export default App;