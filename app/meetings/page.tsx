use client;

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Meeting } from '../types/meeting';
import { getMeetings, addMeeting, deleteMeeting } from '../utils/meetings';
import MeetingCard from '../components/MeetingCard';
import Button from '../components/Button';
import Layout from '../layout';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingDescription, setNewMeetingDescription] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedMeetings = getMeetings();
    setMeetings(storedMeetings);
  }, []);

  const handleAddMeeting = () => {
    const newMeeting: Meeting = {
      id: Date.now(),
      title: newMeetingTitle,
      description: newMeetingDescription,
      date: new Date(),
    };
    addMeeting(newMeeting);
    setMeetings((prevMeetings) => [...prevMeetings, newMeeting]);
    setNewMeetingTitle('');
    setNewMeetingDescription('');
  };

  const handleDeleteMeeting = (id: number) => {
    deleteMeeting(id);
    setMeetings((prevMeetings) => prevMeetings.filter((meeting) => meeting.id !== id));
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 pt-6 md:p-6 lg:p-12 xl:p-24">
        <h1 className="text-3xl font-bold mb-4">Meetings</h1>
        <div className="flex flex-col mb-4">
          <input
            type="text"
            value={newMeetingTitle}
            onChange={(e) => setNewMeetingTitle(e.target.value)}
            placeholder="Meeting title"
            className="p-2 pl-10 text-sm text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 w-full"
          />
          <textarea
            value={newMeetingDescription}
            onChange={(e) => setNewMeetingDescription(e.target.value)}
            placeholder="Meeting description"
            className="p-2 pl-10 text-sm text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 w-full mt-4"
          />
          <Button onClick={handleAddMeeting} className="mt-4">
            Add Meeting
          </Button>
        </div>
        <div className="flex flex-col">
          {meetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onDelete={() => handleDeleteMeeting(meeting.id)}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}