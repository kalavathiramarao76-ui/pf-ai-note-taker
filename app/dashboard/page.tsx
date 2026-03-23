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

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMeetings = meetings.filter((meeting) =>
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTemplates = templates.filter((template) =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const folderNotes = selectedFolder ? selectedFolder.notes : [];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleCreateNote}
        >
          <AiOutlinePlus size={20} className="mr-2" />
          Create Note
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleCreateMeeting}
        >
          <AiOutlinePlus size={20} className="mr-2" />

          Create Meeting
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleCreateTemplate}
        >
          <AiOutlinePlus size={20} className="mr-2" />
          Create Template
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleCreateFolder}
        >
          <AiOutlinePlus size={20} className="mr-2" />
          Create Folder
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {folders.map((folder) => (
          <div key={folder.id} className="bg-gray-200 p-4 rounded">
            <h2 className="text-xl font-bold mb-2">{folder.name}</h2>
            <ul>
              {folder.notes.map((note) => (
                <li key={note.id}>{note.title}</li>
              ))}
            </ul>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleSelectFolder(folder)}
            >
              Select Folder
            </button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {filteredNotes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
        {filteredMeetings.map((meeting) => (
          <MeetingCard key={meeting.id} meeting={meeting} />
        ))}
        {filteredTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
        {folderNotes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}