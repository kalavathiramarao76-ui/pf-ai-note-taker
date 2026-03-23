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
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);

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
    setSortedNotes(filteredNotes);
    setSortedMeetings(filteredMeetings);
    setSortedTemplates(filteredTemplates);
  }, [notes, meetings, templates, searchQuery, filterByTags, filterByDate, priority, deadline]);

  const generateNote = async () => {
    setIsGeneratingNote(true);
    const response = await client.post('/generate-note', {
      title: noteTitle,
      content: noteContent,
    });
    setGeneratedNotes([response.data]);
    setIsGeneratingNote(false);
  };

  const getAiSuggestions = async () => {
    const response = await client.post('/get-ai-suggestions', {
      title: noteTitle,
      content: noteContent,
    });
    setAiSuggestions(response.data);
  };

  const getAutocompleteSuggestions = async () => {
    const response = await client.post('/get-autocomplete-suggestions', {
      title: noteTitle,
      content: noteContent,
    });
    setAutocompleteSuggestions(response.data);
  };

  useEffect(() => {
    if (noteTitle || noteContent) {
      getAiSuggestions();
      getAutocompleteSuggestions();
    }
  }, [noteTitle, noteContent]);

  return (
    <div>
      <h1>AutoNote: AI-Powered Note Taker</h1>
      <input
        type="text"
        value={noteTitle}
        onChange={(e) => setNoteTitle(e.target.value)}
        placeholder="Note title"
      />
      <textarea
        value={noteContent}
        onChange={(e) => setNoteContent(e.target.value)}
        placeholder="Note content"
      />
      <button onClick={generateNote} disabled={isGeneratingNote}>
        Generate Note
      </button>
      <ul>
        {aiSuggestions.map((suggestion) => (
          <li key={suggestion}>{suggestion}</li>
        ))}
      </ul>
      <ul>
        {autocompleteSuggestions.map((suggestion) => (
          <li key={suggestion}>{suggestion}</li>
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