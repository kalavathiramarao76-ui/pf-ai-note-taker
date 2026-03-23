use client;

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Note } from '../types';
import NoteCard from '../components/NoteCard';
import NoteForm from '../components/NoteForm';
import { getNotes, saveNote } from '../utils/localStorage';

export default function NotesPage() {
  const pathname = usePathname();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  useEffect(() => {
    const storedNotes = getNotes();
    setNotes(storedNotes);
  }, []);

  const handleAddNote = () => {
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    saveNote(updatedNotes);
    setNewNote({ title: '', content: '' });
  };

  const handleDeleteNote = (id: number) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    setNotes(updatedNotes);
    saveNote(updatedNotes);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-4">Notes</h1>
      <NoteForm
        newNote={newNote}
        setNewNote={setNewNote}
        handleAddNote={handleAddNote}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            handleDeleteNote={handleDeleteNote}
          />
        ))}
      </div>
    </div>
  );
}