import client from '../client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AiOutlinePlus } from 'react-icons/ai';
import Link from 'next/link';
import NoteCard from '../components/NoteCard';
import MeetingCard from '../components/MeetingCard';
import TemplateCard from '../components/TemplateCard';

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
  const router = useRouter();

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
      note.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredMeetings = meetings.filter((meeting) =>
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredTemplates = templates.filter((template) =>
      template.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSortedNotes(filteredNotes);
    setSortedMeetings(filteredMeetings);
    setSortedTemplates(filteredTemplates);
  }, [searchQuery, notes, meetings, templates]);

  const handleCreateNote = () => {
    router.push('/notes/create');
  };

  const handleCreateMeeting = () => {
    router.push('/meetings/create');
  };

  const handleCreateTemplate = () => {
    router.push('/templates/create');
  };

  const handleGenerateNotes = async (meetingId: string) => {
    try {
      const response = await client.post('/api/generate-notes', {
        meetingId,
      });
      const generatedNote = response.data;
      setGeneratedNotes((prevNotes) => [...prevNotes, generatedNote]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateFolder = () => {
    const newFolder = {
      id: Date.now(),
      name: 'New Folder',
      notes: [],
    };
    setFolders((prevFolders) => [...prevFolders, newFolder]);
    localStorage.setItem('folders', JSON.stringify([...folders, newFolder]));
  };

  const handleSelectFolder = (folder) => {
    setSelectedFolder(folder);
  };

  const handleAddNoteToFolder = (note, folder) => {
    const updatedFolders = folders.map((f) => {
      if (f.id === folder.id) {
        return { ...f, notes: [...f.notes, note] };
      }
      return f;
    });
    setFolders(updatedFolders);
    localStorage.setItem('folders', JSON.stringify(updatedFolders));
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    router.push(`/notes/${note.id}/edit`);
  };

  const handleSaveEditedNote = async (note) => {
    try {
      const response = await client.put(`/api/notes/${note.id}`, note);
      const updatedNotes = notes.map((n) => (n.id === note.id ? response.data : n));
      setNotes(updatedNotes);
      localStorage.setItem('notes', JSON.stringify(updatedNotes));
    } catch (error) {
      console.error(error);
    }
  };

  const handleSortNotes = (sortBy) => {
    if (sortBy === 'title') {
      setSortedNotes(sortedNotes.sort((a, b) => a.title.localeCompare(b.title)));
    } else if (sortBy === 'date') {
      setSortedNotes(sortedNotes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
    }
  };

  const handleSortMeetings = (sortBy) => {
    if (sortBy === 'title') {
      setSortedMeetings(sortedMeetings.sort((a, b) => a.title.localeCompare(b.title)));
    } else if (sortBy === 'date') {
      setSortedMeetings(sortedMeetings.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
    }
  };

  const handleSortTemplates = (sortBy) => {
    if (sortBy === 'title') {
      setSortedTemplates(sortedTemplates.sort((a, b) => a.title.localeCompare(b.title)));
    } else if (sortBy === 'date') {
      setSortedTemplates(sortedTemplates.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
    }
  };

  return (
    <div>
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search notes, meetings, and templates"
      />
      <button onClick={handleCreateNote}>
        <AiOutlinePlus /> Create Note
      </button>
      <button onClick={handleCreateMeeting}>
        <AiOutlinePlus /> Create Meeting
      </button>
      <button onClick={handleCreateTemplate}>
        <AiOutlinePlus /> Create Template
      </button>
      <button onClick={handleCreateFolder}>
        <AiOutlinePlus /> Create Folder
      </button>
      <div>
        <h2>Notes</h2>
        <select onChange={(e) => handleSortNotes(e.target.value)}>
          <option value="title">Sort by Title</option>
          <option value="date">Sort by Date</option>
        </select>
        {sortedNotes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
      <div>
        <h2>Meetings</h2>
        <select onChange={(e) => handleSortMeetings(e.target.value)}>
          <option value="title">Sort by Title</option>
          <option value="date">Sort by Date</option>
        </select>
        {sortedMeetings.map((meeting) => (
          <MeetingCard key={meeting.id} meeting={meeting} />
        ))}
      </div>
      <div>
        <h2>Templates</h2>
        <select onChange={(e) => handleSortTemplates(e.target.value)}>
          <option value="title">Sort by Title</option>
          <option value="date">Sort by Date</option>
        </select>
        {sortedTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}