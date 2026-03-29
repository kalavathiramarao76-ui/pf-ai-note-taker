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
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

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
  customTemplates: { [key: string]: any };
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
}

interface Template {
  id: string;
  name: string;
  content: string;
}

const initialTemplateState: TemplateState = {
  templates: {},
  sortedTemplates: [],
  customTemplates: {},
};

const templateSlice = createSlice({
  name: 'template',
  initialState: initialTemplateState,
  reducers: {
    addCustomTemplate(state, action: PayloadAction<Template>) {
      state.customTemplates[action.payload.id] = action.payload;
    },
    removeCustomTemplate(state, action: PayloadAction<string>) {
      delete state.customTemplates[action.payload];
    },
  },
});

const store = configureStore({
  reducer: {
    template: templateSlice.reducer,
  },
  middleware: [thunk],
});

const TemplatePage = () => {
  const dispatch = useDispatch();
  const templateState = useSelector((state: any) => state.template);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');

  const handleAddCustomTemplate = () => {
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: newTemplateName,
      content: newTemplateContent,
    };
    dispatch(templateSlice.actions.addCustomTemplate(newTemplate));
    setNewTemplateName('');
    setNewTemplateContent('');
  };

  const handleRemoveCustomTemplate = (id: string) => {
    dispatch(templateSlice.actions.removeCustomTemplate(id));
  };

  return (
    <div>
      <h1>Custom Templates</h1>
      <ul>
        {Object.values(templateState.customTemplates).map((template: Template) => (
          <li key={template.id}>
            {template.name}
            <button onClick={() => handleRemoveCustomTemplate(template.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={newTemplateName}
        onChange={(e) => setNewTemplateName(e.target.value)}
        placeholder="New template name"
      />
      <textarea
        value={newTemplateContent}
        onChange={(e) => setNewTemplateContent(e.target.value)}
        placeholder="New template content"
      />
      <button onClick={handleAddCustomTemplate}>Add Custom Template</button>
    </div>
  );
};

const DashboardPage = () => {
  return (
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <TemplatePage />
        {/* Other components */}
      </DndProvider>
    </Provider>
  );
};

export default DashboardPage;