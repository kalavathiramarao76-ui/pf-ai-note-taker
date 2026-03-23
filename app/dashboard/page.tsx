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
  const [filterByTags, setFilterByTags] = useState([]);
  const [filterByDate, setFilterByDate] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [priority, setPriority] = useState('all');
  const [deadline, setDeadline] = useState('');
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
      filterByTags.every((tag) => note.tags.includes(tag)) &&
      (filterByDate === '' || note.date.includes(filterByDate)) &&
      (priority === 'all' || note.priority === priority) &&
      (deadline === '' || note.deadline.includes(deadline))
    );
    const filteredMeetings = meetings.filter((meeting) =>
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      filterByTags.every((tag) => meeting.tags.includes(tag)) &&
      (filterByDate === '' || meeting.date.includes(filterByDate))
    );
    const filteredTemplates = templates.filter((template) =>
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      filterByTags.every((tag) => template.tags.includes(tag)) &&
      (filterByDate === '' || template.date.includes(filterByDate))
    );

    const sortedFilteredNotes = filteredNotes.sort((a, b) => {
      if (sortBy === 'title') {
        if (sortOrder === 'asc') {
          return a.title.localeCompare(b.title);
        } else {
          return b.title.localeCompare(a.title);
        }
      } else if (sortBy === 'date') {
        if (sortOrder === 'asc') {
          return new Date(a.date) - new Date(b.date);
        } else {
          return new Date(b.date) - new Date(a.date);
        }
      } else if (sortBy === 'priority') {
        if (sortOrder === 'asc') {
          return a.priority.localeCompare(b.priority);
        } else {
          return b.priority.localeCompare(a.priority);
        }
      }
      return 0;
    });

    const sortedFilteredMeetings = filteredMeetings.sort((a, b) => {
      if (sortBy === 'title') {
        if (sortOrder === 'asc') {
          return a.title.localeCompare(b.title);
        } else {
          return b.title.localeCompare(a.title);
        }
      } else if (sortBy === 'date') {
        if (sortOrder === 'asc') {
          return new Date(a.date) - new Date(b.date);
        } else {
          return new Date(b.date) - new Date(a.date);
        }
      }
      return 0;
    });

    const sortedFilteredTemplates = filteredTemplates.sort((a, b) => {
      if (sortBy === 'title') {
        if (sortOrder === 'asc') {
          return a.title.localeCompare(b.title);
        } else {
          return b.title.localeCompare(a.title);
        }
      } else if (sortBy === 'date') {
        if (sortOrder === 'asc') {
          return new Date(a.date) - new Date(b.date);
        } else {
          return new Date(b.date) - new Date(a.date);
        }
      }
      return 0;
    });

    setSortedNotes(sortedFilteredNotes);
    setSortedMeetings(sortedFilteredMeetings);
    setSortedTemplates(sortedFilteredTemplates);
  }, [notes, meetings, templates, searchQuery, filterByTags, filterByDate, priority, deadline, sortBy, sortOrder]);

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search"
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
        <option value="priority">Priority</option>
      </select>
      <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
      <input
        type="text"
        value={filterByDate}
        onChange={(e) => setFilterByDate(e.target.value)}
        placeholder="Filter by date"
      />
      <input
        type="text"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        placeholder="Filter by priority"
      />
      <input
        type="text"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        placeholder="Filter by deadline"
      />
      <button onClick={() => setFilterByTags([...filterByTags, 'new-tag'])}>Add tag filter</button>
      <ul>
        {filterByTags.map((tag, index) => (
          <li key={index}>
            {tag}
            <button onClick={() => setFilterByTags(filterByTags.filter((t) => t !== tag))}>Remove</button>
          </li>
        ))}
      </ul>
      <h2>Notes</h2>
      <ul>
        {sortedNotes.map((note) => (
          <li key={note.id}>
            <NoteCard note={note} />
          </li>
        ))}
      </ul>
      <h2>Meetings</h2>
      <ul>
        {sortedMeetings.map((meeting) => (
          <li key={meeting.id}>
            <MeetingCard meeting={meeting} />
          </li>
        ))}
      </ul>
      <h2>Templates</h2>
      <ul>
        {sortedTemplates.map((template) => (
          <li key={template.id}>
            <TemplateCard template={template} />
          </li>
        ))}
      </ul>
    </div>
  );
}