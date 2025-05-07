// src/pages/StudentDash/StudentLiveCalendar.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FaTimes, FaExternalLinkAlt } from 'react-icons/fa';

interface Meeting {
  id:          string;
  title:       string;      // "Titre de session — Titre du cours"
  start:       Date;
  end:         Date;
  meetingLink: string;
}

const locales = { fr };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// Messages in French
const messages = {
  date: 'Date',
  time: 'Heure',
  event: 'Événement',
  allDay: 'Toute la journée',
  week: 'Semaine',
  work_week: 'Semaine de travail',
  day: 'Jour',
  month: 'Mois',
  previous: 'Précédent',
  next: 'Suivant',
  yesterday: 'Hier',
  tomorrow: 'Demain',
  today: 'Aujourd’hui',
  agenda: 'Agenda',
  noEventsInRange: "Aucun événement dans cette plage.",
  showMore: (total: number) => `+${total} plus`
};

const StudentLiveCalendar: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  useEffect(() => {
    async function fetchMeetings() {
      try {
        const token = localStorage.getItem('token');
        const resp = await axios.get<any[]>(
          'http://localhost:5135/api/Meetings/student',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data: Meeting[] = resp.data.map(m => ({
          id: m.id.toString(),
          title: `${m.title} — ${m.courseTitle}`,
          start: new Date(m.start),
          end: new Date(m.end),
          meetingLink: m.meetingLink
        }));
        setMeetings(data);
      } catch (err) {
        console.error('Échec du chargement des sessions', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMeetings();
  }, []);

  if (loading) {
    return <div className="p-6"><p>Chargement du calendrier…</p></div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Mes sessions en direct</h1>
      <Calendar
        localizer={localizer}
        messages={messages}
        events={meetings}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        views={['month', 'week', 'day']}
        onSelectEvent={(event: Meeting) => setSelectedMeeting(event)}
        className="font-sans"
      />

      {selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Détails de la session</h2>
              <button
                onClick={() => setSelectedMeeting(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="space-y-3 text-gray-800">
              <p><span className="font-medium">Titre :</span> {selectedMeeting.title}</p>
              <p><span className="font-medium">Début :</span> {format(selectedMeeting.start, 'PPpp', { locale: fr })}</p>
              <p><span className="font-medium">Fin :</span>   {format(selectedMeeting.end,   'PPpp', { locale: fr })}</p>
              <p>
                <span className="font-medium">Lien :</span>{' '}
                <a
                  href={selectedMeeting.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center"
                >
                  Rejoindre la session <FaExternalLinkAlt className="ml-1" />
                </a>
              </p>
            </div>
            <div className="text-right mt-6">
              <button
                onClick={() => setSelectedMeeting(null)}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLiveCalendar;
