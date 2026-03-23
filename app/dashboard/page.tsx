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
      setEditingNote(null);
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
    }
  };

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMeetings = meetings.filter((meeting) =>
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h1>Dashboard</h1>
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
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search notes and meetings"
      />
      <div>
        {filteredNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={() => handleEditNote(note)}
            onAddToFolder={(folder) => handleAddNoteToFolder(note, folder)}
          />
        ))}
      </div>
      <div>
        {filteredMeetings.map((meeting) => (
          <MeetingCard
            key={meeting.id}
            meeting={meeting}
            onGenerateNotes={() => handleGenerateNotes(meeting.id)}
          />
        ))}
      </div>
      {editingNote && (
        <div>
          <h2>Edit Note</h2>
          <input
            type="text"
            value={editingNote.title}
            onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
          />
          <textarea
            value={editingNote.content}
            onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
          />
          <button onClick={() => handleSaveEditedNote(editingNote)}>Save</button>
        </div>
      )}
    </div>
  );
}