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
  }, [
    notes,
    searchQuery,
    filterByTags,
    filterByDate,
    priority,
    deadline,
    meetings,
    templates,
  ]);

  const handleEditNote = (note) => {
    setEditingNote(note);
    setEditorState(
      EditorState.createWithContent(ContentState.createFromText(note.content))
    );
  };

  const handleSaveNote = () => {
    const newNotes = notes.map((note) =>
      note.id === editingNote.id
        ? { ...note, content: editorState.getCurrentContent().getPlainText() }
        : note
    );
    setNotes(newNotes);
    localStorage.setItem('notes', JSON.stringify(newNotes));
    setEditingNote(null);
  };

  return (
    <div>
      {editingNote && (
        <div>
          <input
            type="text"
            value={editingNote.title}
            onChange={(e) => setNoteTitle(e.target.value)}
          />
          <Editor editorState={editorState} onChange={setEditorState} />
          <button onClick={handleSaveNote}>Save Note</button>
        </div>
      )}
      {sortedNotes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={() => handleEditNote(note)}
        />
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