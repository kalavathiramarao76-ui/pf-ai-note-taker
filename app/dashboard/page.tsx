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
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
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

    let sortedNotesList = filteredNotes;
    let sortedMeetingsList = filteredMeetings;
    let sortedTemplatesList = filteredTemplates;

    if (filterType === 'notes') {
      sortedNotesList = filteredNotes;
    } else if (filterType === 'meetings') {
      sortedMeetingsList = filteredMeetings;
    } else if (filterType === 'templates') {
      sortedTemplatesList = filteredTemplates;
    }

    if (sortBy === 'title') {
      sortedNotesList = sortedNotesList.sort((a, b) =>
        sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title)
      );
      sortedMeetingsList = sortedMeetingsList.sort((a, b) =>
        sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title)
      );
      sortedTemplatesList = sortedTemplatesList.sort((a, b) =>
        sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title)
      );
    } else if (sortBy === 'date') {
      sortedNotesList = sortedNotesList.sort((a, b) =>
        sortOrder === 'asc'
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt)
      );
      sortedMeetingsList = sortedMeetingsList.sort((a, b) =>
        sortOrder === 'asc'
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt)
      );
      sortedTemplatesList = sortedTemplatesList.sort((a, b) =>
        sortOrder === 'asc'
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    setSortedNotes(sortedNotesList);
    setSortedMeetings(sortedMeetingsList);
    setSortedTemplates(sortedTemplatesList);
  }, [searchQuery, notes, meetings, templates, filterType, sortBy, sortOrder]);

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

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(event.target.value);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value);
  };

  const handleSortOrderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(event.target.value);
  };

  return (
    <div>
      <div>
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search"
        />
        <select value={filterType} onChange={handleFilterChange}>
          <option value="all">All</option>
          <option value="notes">Notes</option>
          <option value="meetings">Meetings</option>
          <option value="templates">Templates</option>
        </select>
        <select value={sortBy} onChange={handleSortChange}>
          <option value="title">Title</option>
          <option value="date">Date</option>
        </select>
        <select value={sortOrder} onChange={handleSortOrderChange}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
      <div>
        <button onClick={handleCreateNote}>
          <AiOutlinePlus /> Create Note
        </button>
        <button onClick={handleCreateMeeting}>
          <AiOutlinePlus /> Create Meeting
        </button>
        <button onClick={handleCreateTemplate}>
          <AiOutlinePlus /> Create Template
        </button>
      </div>
      <div>
        {sortedNotes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
        {sortedMeetings.map((meeting) => (
          <MeetingCard key={meeting.id} meeting={meeting} />
        ))}
        {sortedTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}