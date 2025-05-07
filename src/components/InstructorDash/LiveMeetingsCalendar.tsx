// src/components/InstructorDash/LiveMeetingsCalendar.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FaVideo, FaTimes } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

interface Meeting {
  id: string;
  title: string;
  start: Date;
  end: Date;
  meetingLink: string;
}

const locales = { fr: require('date-fns/locale/fr') };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const LiveMeetingsCalendar: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const cid = courseId ? parseInt(courseId, 10) : undefined;

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [form, setForm] = useState({ title: '', meetingLink: '', duration: 60 });

  // Load existing meetings
  useEffect(() => {
    if (!cid) return;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const resp = await axios.get(
          `http://localhost:5135/api/Meetings/course/${cid}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const serverMeetings: Meeting[] = resp.data.map((m: any) => ({
          id: m.id.toString(),
          title: m.title,
          start: new Date(m.start),
          end: new Date(m.end),
          meetingLink: m.meetingLink
        }));
        setMeetings(serverMeetings);
      } catch (err) {
        console.error('Error fetching meetings', err);
      }
    })();
  }, [cid]);

  // Click on empty slot → new meeting
  const handleSelectSlot = (slotInfo: any) => {
    setEditingMeeting(null);
    setSelectedDate(slotInfo.start);
    setForm({ title: '', meetingLink: '', duration: 60 });
    setShowModal(true);
  };

  // Click on existing event → edit
  const handleSelectEvent = (event: Meeting) => {
    setEditingMeeting(event);
    setSelectedDate(event.start);
    const diff = (event.end.getTime() - event.start.getTime()) / 60000;
    setForm({ title: event.title, meetingLink: event.meetingLink, duration: diff });
    setShowModal(true);
  };

  // Create or update meeting
  const handleSubmit = async () => {
    if (!cid || !selectedDate || !form.title || !form.meetingLink) return;
    const startIso = selectedDate.toISOString();
    const endIso = new Date(selectedDate.getTime() + form.duration * 60000).toISOString();
    const payload = { title: form.title, start: startIso, end: endIso, meetingLink: form.meetingLink, courseId: cid };

    try {
      const token = localStorage.getItem('token');
      if (editingMeeting) {
        // Update
        const resp = await axios.put(
          `http://localhost:5135/api/Meetings/${editingMeeting.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const updated = resp.data;
        setMeetings(ms =>
          ms.map(m =>
            m.id === updated.id.toString()
              ? {
                  id: updated.id.toString(),
                  title: updated.title,
                  start: new Date(updated.start),
                  end: new Date(updated.end),
                  meetingLink: updated.meetingLink
                }
              : m
          )
        );
      } else {
        // Create
        const resp = await axios.post(
          'http://localhost:5135/api/Meetings',
          { ...payload, durationMinutes: form.duration },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const created = resp.data;
        setMeetings(ms => [
          ...ms,
          {
            id: created.id.toString(),
            title: created.title,
            start: new Date(created.start),
            end: new Date(created.end),
            meetingLink: created.meetingLink
          }
        ]);
      }
      setShowModal(false);
      setEditingMeeting(null);
    } catch (err) {
      console.error('Error saving meeting', err);
      alert('Could not save meeting. Check console for details.');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Live Meetings Calendar</h1>
        <p className="text-gray-600">Schedule and manage your live sessions</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <Calendar
          localizer={localizer}
          events={meetings}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          views={['month', 'week', 'day']}
          className="font-sans"
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingMeeting ? 'Edit Meeting' : 'Schedule New Meeting'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingMeeting(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                <input
                  type="url"
                  value={form.meetingLink}
                  onChange={e => setForm(f => ({ ...f, meetingLink: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <select
                  value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={30}>30</option>
                  <option value={60}>60</option>
                  <option value={90}>90</option>
                  <option value={120}>120</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingMeeting(null);
                  }}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <FaVideo className="mr-2" />
                  {editingMeeting ? 'Update Meeting' : 'Schedule Meeting'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMeetingsCalendar;
