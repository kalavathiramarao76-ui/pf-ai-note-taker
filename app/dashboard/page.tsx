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

interface AppState {
  noteState: NoteState;
  meetingState: MeetingState;
  templateState: TemplateState;
  searchState: SearchState;
  editorState: EditorState;
  tagState: TagState;
  folderState: FolderState;
  aiState: AIState;
  collaborativeState: CollaborativeState;
  priorityState: PriorityState;
  isGeneratingNote: boolean;
  draggedNote: any;
  draggedOverFolder: any;
  versionHistory: any;
  noteTitle: string;
  noteContent: string;
}

// ... rest of the code remains the same ...