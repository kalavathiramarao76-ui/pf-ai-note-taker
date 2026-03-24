import client from '../client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AiOutlinePlus } from 'react-icons/ai';
import Link from 'next/link';
import NoteCard from '../components/NoteCard';
import MeetingCard from '../components/MeetingCard';
import TemplateCard from '../components/TemplateCard';
import { Editor, EditorState, ContentState } from 'draft-js';
import 'draft-js/dist/Draft.css';

export default function DashboardPage() {
  const [notes, setNotes] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [generatedNotes, setGeneratedNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [sortedNotes, setSortedNotes] = useState([]);
  const [sortedMeetings, setSortedMeetings] = useState([]);
  const [sortedTemplates, setSortedTemplates] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterByTags, setFilterByTags] = useState([]);
  const [filterByDate, setFilterByDate] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [priority, setPriority] = useState('all');
  const [deadline, setDeadline] = useState('');
  const router = useRouter();
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [editorState, setEditorState] = useState(
    EditorState.createWithContent(ContentState.createFromText(''))
  );
  const [quickNote, setQuickNote] = useState('');
  const [isQuickNoteOpen, setIsQuickNoteOpen] = useState(false);

  useEffect(() => {
    const storedNotes = localStorage.getItem('notes');
    const storedMeetings = localStorage.getItem('meetings');
    const storedTemplates = localStorage.getItem('templates');
    const storedFolders = localStorage.getItem('folders');

    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    }
    if (storedMeetings) {
      setMeetings(JSON.parse(storedMeetings));
    }
    if (storedTemplates) {
      setTemplates(JSON.parse(storedTemplates));
    }
    if (storedFolders) {
      setFolders(JSON.parse(storedFolders));
    }
  }, []);

  useEffect(() => {
    const filteredNotes = notes.filter((note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      filterByTags.every((tag) => note.tags.includes(tag)) &&
      (filterByDate === '' || note.date.includes(filterByDate)) &&
      (priority === 'all' || note.priority === priority) &&
      (deadline === '' || note.deadline.includes(deadline)) &&
      (selectedFolder === null || note.folder === selectedFolder.id)
    );

    setSortedNotes(filteredNotes.sort((a, b) => {
      if (sortBy === 'title') {
        return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      } else if (sortBy === 'date') {
        return sortOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
      } else {
        return 0;
      }
    }));
  }, [notes, searchQuery, filterByTags, filterByDate, priority, deadline, selectedFolder, sortBy, sortOrder]);

  useEffect(() => {
    const filteredMeetings = meetings.filter((meeting) =>
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      filterByTags.every((tag) => meeting.tags.includes(tag)) &&
      (filterByDate === '' || meeting.date.includes(filterByDate)) &&
      (priority === 'all' || meeting.priority === priority) &&
      (deadline === '' || meeting.deadline.includes(deadline))
    );

    setSortedMeetings(filteredMeetings.sort((a, b) => {
      if (sortBy === 'title') {
        return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      } else if (sortBy === 'date') {
        return sortOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
      } else {
        return 0;
      }
    }));
  }, [meetings, searchQuery, filterByTags, filterByDate, priority, deadline, sortBy, sortOrder]);

  useEffect(() => {
    const filteredTemplates = templates.filter((template) =>
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      filterByTags.every((tag) => template.tags.includes(tag)) &&
      (filterByDate === '' || template.date.includes(filterByDate)) &&
      (priority === 'all' || template.priority === priority) &&
      (deadline === '' || template.deadline.includes(deadline))
    );

    setSortedTemplates(filteredTemplates.sort((a, b) => {
      if (sortBy === 'title') {
        return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      } else if (sortBy === 'date') {
        return sortOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
      } else {
        return 0;
      }
    }));
  }, [templates, searchQuery, filterByTags, filterByDate, priority, deadline, sortBy, sortOrder]);

  const handleFolderChange = (folder) => {
    setSelectedFolder(folder);
  };

  const handleNoteCreate = (note) => {
    const newNote = { ...note, folder: selectedFolder ? selectedFolder.id : null };
    setNotes([...notes, newNote]);
    localStorage.setItem('notes', JSON.stringify([...notes, newNote]));
  };

  const handleNoteUpdate = (note) => {
    const updatedNotes = notes.map((n) => (n.id === note.id ? note : n));
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
  };

  const handleNoteDelete = (noteId) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
  };

  const handleFolderCreate = (folder) => {
    setFolders([...folders, folder]);
    localStorage.setItem('folders', JSON.stringify([...folders, folder]));
  };

  const handleFolderUpdate = (folder) => {
    const updatedFolders = folders.map((f) => (f.id === folder.id ? folder : f));
    setFolders(updatedFolders);
    localStorage.setItem('folders', JSON.stringify(updatedFolders));
  };

  const handleFolderDelete = (folderId) => {
    const updatedFolders = folders.filter((folder) => folder.id !== folderId);
    setFolders(updatedFolders);
    localStorage.setItem('folders', JSON.stringify(updatedFolders));
  };

  return (
    <div>
      <h1>AutoNote: AI-Powered Note Taker</h1>
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes"
        />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All</option>
          <option value="notes">Notes</option>
          <option value="meetings">Meetings</option>
          <option value="templates">Templates</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="title">Title</option>
          <option value="date">Date</option>
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
        <button onClick={() => setFilterByTags([])}>Clear tags</button>
        <button onClick={() => setFilterByDate('')}>Clear date</button>
        <button onClick={() => setPriority('all')}>Clear priority</button>
        <button onClick={() => setDeadline('')}>Clear deadline</button>
      </div>
      <div>
        <h2>Folders</h2>
        <ul>
          {folders.map((folder) => (
            <li key={folder.id}>
              <button onClick={() => handleFolderChange(folder)}>{folder.name}</button>
              <button onClick={() => handleFolderUpdate({ ...folder, name: prompt('Enter new folder name') })}>
                Update
              </button>
              <button onClick={() => handleFolderDelete(folder.id)}>Delete</button>
            </li>
          ))}
          <li>
            <button onClick={() => handleFolderCreate({ id: Math.random(), name: prompt('Enter new folder name') })}>
              Create new folder
            </button>
          </li>
        </ul>
      </div>
      <div>
        <h2>Notes</h2>
        <ul>
          {sortedNotes.map((note) => (
            <li key={note.id}>
              <NoteCard note={note} />
              <button onClick={() => handleNoteUpdate({ ...note, title: prompt('Enter new note title') })}>
                Update
              </button>
              <button onClick={() => handleNoteDelete(note.id)}>Delete</button>
            </li>
          ))}
          <li>
            <button onClick={() => handleNoteCreate({ id: Math.random(), title: prompt('Enter new note title') })}>
              Create new note
            </button>
          </li>
        </ul>
      </div>
      <div>
        <h2>Meetings</h2>
        <ul>
          {sortedMeetings.map((meeting) => (
            <li key={meeting.id}>
              <MeetingCard meeting={meeting} />
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Templates</h2>
        <ul>
          {sortedTemplates.map((template) => (
            <li key={template.id}>
              <TemplateCard template={template} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}