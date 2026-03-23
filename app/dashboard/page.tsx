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
      (filterByDate === '' || note.date.includes(filterByDate))
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
      sortedNotesList = sortedNotesList.sort((a, b) => {
        if (sortBy === 'title') {
          return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        } else if (sortBy === 'date') {
          return sortOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
        }
      });
    } else if (filterType === 'meetings') {
      sortedMeetingsList = sortedMeetingsList.sort((a, b) => {
        if (sortBy === 'title') {
          return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        } else if (sortBy === 'date') {
          return sortOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
        }
      });
    } else if (filterType === 'templates') {
      sortedTemplatesList = sortedTemplatesList.sort((a, b) => {
        if (sortBy === 'title') {
          return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        } else if (sortBy === 'date') {
          return sortOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
        }
      });
    }

    setSortedNotes(sortedNotesList);
    setSortedMeetings(sortedMeetingsList);
    setSortedTemplates(sortedTemplatesList);
  }, [notes, meetings, templates, searchQuery, filterByTags, filterByDate, filterType, sortBy, sortOrder]);

  const handleSearchQueryChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    const suggestions = notes
      .filter((note) => note.title.toLowerCase().includes(query.toLowerCase()))
      .map((note) => note.title);
    setAutocompleteSuggestions(suggestions);
  };

  const handleFilterByTagsChange = (tags) => {
    setFilterByTags(tags);
  };

  return (
    <div>
      <input
        type="search"
        value={searchQuery}
        onChange={handleSearchQueryChange}
        placeholder="Search notes, meetings, and templates"
        list="autocomplete-suggestions"
      />
      <datalist id="autocomplete-suggestions">
        {autocompleteSuggestions.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>
      <div>
        <label>Filter by tags:</label>
        <select multiple value={filterByTags} onChange={(event) => handleFilterByTagsChange(Array.from(event.target.selectedOptions, (option) => option.value))}>
          {notes
            .map((note) => note.tags)
            .flat()
            .filter((tag, index, self) => self.indexOf(tag) === index)
            .map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
        </select>
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