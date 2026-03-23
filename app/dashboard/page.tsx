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
  const [filterByTag, setFilterByTag] = useState('');
  const [filterByDate, setFilterByDate] = useState('');
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
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterByTag === '' || note.tags.includes(filterByTag)) &&
      (filterByDate === '' || note.date.includes(filterByDate))
    );
    const filteredMeetings = meetings.filter((meeting) =>
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterByTag === '' || meeting.tags.includes(filterByTag)) &&
      (filterByDate === '' || meeting.date.includes(filterByDate))
    );
    const filteredTemplates = templates.filter((template) =>
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterByTag === '' || template.tags.includes(filterByTag)) &&
      (filterByDate === '' || template.date.includes(filterByDate))
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
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date)
      );
      sortedMeetingsList = sortedMeetingsList.sort((a, b) =>
        sortOrder === 'asc'
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date)
      );
      sortedTemplatesList = sortedTemplatesList.sort((a, b) =>
        sortOrder === 'asc'
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date)
      );
    }

    setSortedNotes(sortedNotesList);
    setSortedMeetings(sortedMeetingsList);
    setSortedTemplates(sortedTemplatesList);
  }, [searchQuery, filterType, sortBy, sortOrder, filterByTag, filterByDate, notes, meetings, templates]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterByTag = (e) => {
    setFilterByTag(e.target.value);
  };

  const handleFilterByDate = (e) => {
    setFilterByDate(e.target.value);
  };

  const handleSortBy = (e) => {
    setSortBy(e.target.value);
  };

  const handleSortOrder = (e) => {
    setSortOrder(e.target.value);
  };

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearch}
        placeholder="Search"
      />
      <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
        <option value="all">All</option>
        <option value="notes">Notes</option>
        <option value="meetings">Meetings</option>
        <option value="templates">Templates</option>
      </select>
      <select value={sortBy} onChange={handleSortBy}>
        <option value="title">Title</option>
        <option value="date">Date</option>
      </select>
      <select value={sortOrder} onChange={handleSortOrder}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
      <input
        type="text"
        value={filterByTag}
        onChange={handleFilterByTag}
        placeholder="Filter by tag"
      />
      <input
        type="date"
        value={filterByDate}
        onChange={handleFilterByDate}
        placeholder="Filter by date"
      />
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
  );
}