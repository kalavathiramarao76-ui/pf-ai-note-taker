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
  const [aiSuggestions, setAiSuggestions] = useState([]);
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
    }

    if (sortBy === 'title') {
      sortedNotesList = sortedNotesList.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.title.localeCompare(b.title);
        } else {
          return b.title.localeCompare(a.title);
        }
      });
      sortedMeetingsList = sortedMeetingsList.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.title.localeCompare(b.title);
        } else {
          return b.title.localeCompare(a.title);
        }
      });
      sortedTemplatesList = sortedTemplatesList.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.title.localeCompare(b.title);
        } else {
          return b.title.localeCompare(a.title);
        }
      });
    } else if (sortBy === 'date') {
      sortedNotesList = sortedNotesList.sort((a, b) => {
        if (sortOrder === 'asc') {
          return new Date(a.date) - new Date(b.date);
        } else {
          return new Date(b.date) - new Date(a.date);
        }
      });
      sortedMeetingsList = sortedMeetingsList.sort((a, b) => {
        if (sortOrder === 'asc') {
          return new Date(a.date) - new Date(b.date);
        } else {
          return new Date(b.date) - new Date(a.date);
        }
      });
      sortedTemplatesList = sortedTemplatesList.sort((a, b) => {
        if (sortOrder === 'asc') {
          return new Date(a.date) - new Date(b.date);
        } else {
          return new Date(b.date) - new Date(a.date);
        }
      });
    }

    setSortedNotes(sortedNotesList);
    setSortedMeetings(sortedMeetingsList);
    setSortedTemplates(sortedTemplatesList);
  }, [searchQuery, filterType, sortBy, sortOrder, filterByTag, filterByDate, notes, meetings, templates]);

  const handleEditNote = (note) => {
    setEditingNote(note);
    const aiSuggestionsResponse = client.getAiSuggestions(note.content);
    aiSuggestionsResponse.then((response) => {
      setAiSuggestions(response.data);
    });
  };

  const handleSaveNote = (note) => {
    const updatedNotes = notes.map((n) => {
      if (n.id === note.id) {
        return note;
      }
      return n;
    });
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
    setEditingNote(null);
  };

  return (
    <div>
      {editingNote ? (
        <div>
          <h2>Edit Note</h2>
          <input
            type="text"
            value={editingNote.title}
            onChange={(e) => {
              const updatedNote = { ...editingNote, title: e.target.value };
              setEditingNote(updatedNote);
            }}
          />
          <textarea
            value={editingNote.content}
            onChange={(e) => {
              const updatedNote = { ...editingNote, content: e.target.value };
              setEditingNote(updatedNote);
            }}
          />
          <h3>AI Suggestions:</h3>
          <ul>
            {aiSuggestions.map((suggestion) => (
              <li key={suggestion.id}>{suggestion.text}</li>
            ))}
          </ul>
          <button onClick={() => handleSaveNote(editingNote)}>Save</button>
        </div>
      ) : (
        <div>
          <h2>Notes</h2>
          <ul>
            {sortedNotes.map((note) => (
              <li key={note.id}>
                <NoteCard note={note} onEdit={() => handleEditNote(note)} />
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
      )}
    </div>
  );
}