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

    let sortedNotesList = filteredNotes;
    let sortedMeetingsList = filteredMeetings;
    let sortedTemplatesList = filteredTemplates;

    if (filterType === 'notes') {
      sortedNotesList = filteredNotes.sort((a, b) => {
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
      });
    } else if (filterType === 'meetings') {
      sortedMeetingsList = filteredMeetings.sort((a, b) => {
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
      });
    } else if (filterType === 'templates') {
      sortedTemplatesList = filteredTemplates.sort((a, b) => {
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
      });
    }

    setSortedNotes(sortedNotesList);
    setSortedMeetings(sortedMeetingsList);
    setSortedTemplates(sortedTemplatesList);
  }, [searchQuery, filterByTags, filterByDate, filterType, sortBy, sortOrder, priority, deadline]);

  const handlePriorityChange = (e) => {
    setPriority(e.target.value);
  };

  const handleDeadlineChange = (e) => {
    setDeadline(e.target.value);
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <div>
        <label>Priority:</label>
        <select value={priority} onChange={handlePriorityChange}>
          <option value="all">All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      <div>
        <label>Deadline:</label>
        <input type="date" value={deadline} onChange={handleDeadlineChange} />
      </div>
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