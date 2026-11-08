import React, { useState, useEffect } from 'react';
import { 
  addMonths, 
  subMonths, 
  format 
} from 'date-fns';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CalendarMonth from './components/CalendarMonth';
import CalendarWeek from './components/CalendarWeek';
import EventModal from './components/EventModal';
import EventDetailModal from './components/EventDetailModal';
import ExchangeModal from './components/ExchangeModal';
import AuthModal from './components/AuthModal';
import { auth, onAuthStateChanged, logoutUser } from './firebase/config';
import { 
  subscribeToUserEvents, 
  subscribeToExchangeableEvents, 
  subscribeToExchanges,
  createEvent,
  updateEvent,
  deleteEvent,
  proposeExchange,
  respondToExchange
} from './firebase/eventsService';

// Default starter calendars matching user's screenshot
const INITIAL_MY_CALENDARS = [
  { id: 'kodex', name: 'kodex', color: '#1a73e8', checked: true },
  { id: 'familijne', name: 'Familijne', color: '#5f6368', checked: true },
  { id: 'zadania', name: 'Lista zadań', color: '#4285f4', checked: true },
  { id: 'urodziny', name: 'Urodziny', color: '#34a853', checked: true },
];

const INITIAL_OTHER_CALENDARS = [
  { id: 'swieta', name: 'Święta w Polsce', color: '#1e8e3e', checked: true },
];

// Default starter demo events matching user screenshots
const DEMO_EVENTS = [
  {
    id: 'demo-holiday',
    title: 'Dzień Niepodległości',
    date: '2026-11-11',
    startTime: '08:00',
    endTime: '20:00',
    color: 'green',
    calendarId: 'swieta',
    customBg: '#34a853',
    description: 'Święto państwowe w Polsce',
    isAllDay: true,
    isExchangeable: false,
    userId: 'system',
    userEmail: 'swieta@kalendarz.pl'
  },
  {
    id: 'demo-1',
    title: 'Spotkanie projektowe',
    date: '2026-11-08',
    startTime: '10:30',
    endTime: '11:30',
    color: 'blue',
    calendarId: 'kodex',
    description: 'Omówienie harmonogramu spotkań',
    isExchangeable: true,
    userId: 'demo-user',
    userEmail: 'demo@kalendarz.pl'
  },
  {
    id: 'demo-2',
    title: 'Konsultacje',
    date: '2026-11-10',
    startTime: '12:00',
    endTime: '13:00',
    color: 'blue',
    calendarId: 'kodex',
    description: 'Konsultacje semestralne',
    isExchangeable: true,
    userId: 'friend-1',
    userName: 'Kolega Janek',
    userEmail: 'janek@firma.pl'
  }
];

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 8)); // 8 Nov 2026 as in screenshots
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('week'); // Default to week matching image 1
  const [searchQuery, setSearchQuery] = useState('');
  const [personSearchQuery, setPersonSearchQuery] = useState('');

  // Authentication
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Calendars state
  const [myCalendars, setMyCalendars] = useState(() => {
    const saved = localStorage.getItem('kalendarz_my_calendars');
    return saved ? JSON.parse(saved) : INITIAL_MY_CALENDARS;
  });

  const [otherCalendars, setOtherCalendars] = useState(() => {
    const saved = localStorage.getItem('kalendarz_other_calendars');
    return saved ? JSON.parse(saved) : INITIAL_OTHER_CALENDARS;
  });

  useEffect(() => {
    localStorage.setItem('kalendarz_my_calendars', JSON.stringify(myCalendars));
  }, [myCalendars]);

  useEffect(() => {
    localStorage.setItem('kalendarz_other_calendars', JSON.stringify(otherCalendars));
  }, [otherCalendars]);

  // Firestore data
  const [myEvents, setMyEvents] = useState([]);
  const [exchangeableEvents, setExchangeableEvents] = useState([]);
  const [exchanges, setExchanges] = useState([]);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [initialTargetEventForSwap, setInitialTargetEventForSwap] = useState(null);
  const [eventType, setEventType] = useState('Wydarzenie');

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setMyEvents(DEMO_EVENTS.filter(e => e.userId === 'demo-user' || e.userId === 'system'));
        setExchangeableEvents(DEMO_EVENTS.filter(e => e.userId !== 'demo-user' && e.userId !== 'system'));
      }
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Firestore events when user is logged in
  useEffect(() => {
    if (!user) return;

    const unsubMyEvents = subscribeToUserEvents(user.uid, (events) => {
      setMyEvents([...DEMO_EVENTS.filter(e => e.userId === 'system'), ...events]);
    });

    const unsubExchangeable = subscribeToExchangeableEvents(user.uid, (events) => {
      setExchangeableEvents(events);
    });

    const unsubExchanges = subscribeToExchanges(user.email, user.uid, (exchList) => {
      setExchanges(exchList);
    });

    return () => {
      unsubMyEvents();
      unsubExchangeable();
      unsubExchanges();
    };
  }, [user]);

  // Month navigation handlers
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date(2026, 10, 8));
  const handleSelectDate = (date) => setCurrentDate(date);

  // Calendar Management Handlers
  const handleToggleCalendar = (id) => {
    setMyCalendars(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const handleUpdateCalendarColor = (id, newColor) => {
    setMyCalendars(prev => prev.map(c => c.id === id ? { ...c, color: newColor } : c));
  };

  const handleDeleteCalendar = (id) => {
    if (confirm('Czy na pewno chcesz usunąć ten kalendarz?')) {
      setMyCalendars(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleSoloCalendar = (id) => {
    setMyCalendars(prev => prev.map(c => ({ ...c, checked: c.id === id })));
    setOtherCalendars(prev => prev.map(c => ({ ...c, checked: false })));
  };

  const handleToggleOtherCalendar = (id) => {
    setOtherCalendars(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const handleUpdateOtherCalendarColor = (id, newColor) => {
    setOtherCalendars(prev => prev.map(c => c.id === id ? { ...c, color: newColor } : c));
  };

  const handleDeleteOtherCalendar = (id) => {
    if (confirm('Czy na pewno chcesz usunąć ten kalendarz?')) {
      setOtherCalendars(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleAddOtherCalendar = () => {
    const name = prompt('Wpisz nazwę nowego kalendarza:');
    if (!name || !name.trim()) return;
    const newCal = {
      id: 'other-' + Date.now(),
      name: name.trim(),
      color: '#9c54b6',
      checked: true
    };
    setOtherCalendars(prev => [...prev, newCal]);
  };

  // Open Create Event Modal with specific type
  const handleOpenCreateModal = (type = 'Wydarzenie') => {
    if (type === 'Harmonogram spotkań') {
      setExchangeModalOpen(true);
      return;
    }
    setEventType(type);
    setSelectedEvent(null);
    setCreateModalOpen(true);
  };

  // Open Create Event Modal for a clicked slot on weekly grid
  const handleSelectSlot = (date, timeStr) => {
    const [h] = timeStr.split(':').map(Number);
    const endH = h + 1;
    setSelectedEvent({
      date: format(date, 'yyyy-MM-dd'),
      startTime: `${h.toString().padStart(2, '0')}:00`,
      endTime: `${endH.toString().padStart(2, '0')}:00`,
      calendarId: 'kodex'
    });
    setEventType('Wydarzenie');
    setCreateModalOpen(true);
  };

  // Click on existing event -> open EventDetailModal (image 5)
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setDetailModalOpen(true);
  };

  // Open Edit mode from Detail Modal
  const handleEditFromDetail = (event) => {
    setSelectedEvent(event);
    setEventType(event.type || 'Wydarzenie');
    setCreateModalOpen(true);
  };

  // Save Event
  const handleSaveEvent = async (eventData) => {
    if (!user) {
      if (selectedEvent && selectedEvent.id) {
        setMyEvents(prev => prev.map(e => e.id === selectedEvent.id ? { ...e, ...eventData } : e));
      } else {
        const newEv = {
          ...eventData,
          id: 'demo-' + Date.now(),
          userId: 'demo-user',
          userEmail: 'demo@kalendarz.pl',
          calendarId: eventData.calendarId || 'kodex'
        };
        setMyEvents(prev => [...prev, newEv]);
      }
      return;
    }

    if (selectedEvent && selectedEvent.id && selectedEvent.userId === user.uid) {
      await updateEvent(selectedEvent.id, eventData);
    } else {
      await createEvent({
        ...eventData,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email.split('@')[0],
        calendarId: eventData.calendarId || 'kodex'
      });
    }
  };

  // Delete Event
  const handleDeleteEvent = async (eventId) => {
    if (!user) {
      setMyEvents(prev => prev.filter(e => e.id !== eventId));
      setCreateModalOpen(false);
      setDetailModalOpen(false);
      return;
    }
    await deleteEvent(eventId);
    setCreateModalOpen(false);
    setDetailModalOpen(false);
  };

  // Filter events based on active checked calendars and search queries
  const visibleEvents = React.useMemo(() => {
    const activeCalendarIds = new Set([
      ...myCalendars.filter(c => c.checked).map(c => c.id),
      ...otherCalendars.filter(c => c.checked).map(c => c.id)
    ]);

    const calendarColorMap = {};
    myCalendars.forEach(c => { calendarColorMap[c.id] = c.color; });
    otherCalendars.forEach(c => { calendarColorMap[c.id] = c.color; });

    let combined = [...myEvents, ...exchangeableEvents];

    // Filter by calendar visibility
    combined = combined.filter(e => {
      const calId = e.calendarId || 'kodex';
      return activeCalendarIds.has(calId);
    });

    // Attach custom background color from calendar if applicable
    combined = combined.map(e => {
      const calId = e.calendarId || 'kodex';
      return {
        ...e,
        customBg: e.customBg || calendarColorMap[calId] || null
      };
    });

    // Filter by general search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      combined = combined.filter(e => 
        e.title.toLowerCase().includes(q) || 
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.userEmail && e.userEmail.toLowerCase().includes(q)) ||
        (e.userName && e.userName.toLowerCase().includes(q))
      );
    }

    // Filter by person search query (Gmail)
    if (personSearchQuery.trim()) {
      const pq = personSearchQuery.toLowerCase();
      combined = combined.filter(e =>
        (e.userEmail && e.userEmail.toLowerCase().includes(pq)) ||
        (e.invitedEmail && e.invitedEmail.toLowerCase().includes(pq)) ||
        (e.userName && e.userName.toLowerCase().includes(pq))
      );
    }

    return combined;
  }, [myEvents, exchangeableEvents, myCalendars, otherCalendars, searchQuery, personSearchQuery]);

  const activeEventCal = selectedEvent ? (
    myCalendars.find(c => c.id === selectedEvent.calendarId) || { name: 'kodex', color: '#1a73e8' }
  ) : { name: 'kodex', color: '#1a73e8' };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#131314] text-[#e3e3e3] overflow-hidden">
      {/* Top Navbar */}
      <Navbar
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        onSelectDate={handleSelectDate}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={logoutUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Main Container: Sidebar + Rounded Calendar Canvas */}
      <div className="flex-1 flex overflow-hidden bg-[#131314]">
        <Sidebar
          isOpen={sidebarOpen}
          onOpenCreateModal={handleOpenCreateModal}
          selectedDate={currentDate}
          onSelectDate={handleSelectDate}
          myCalendars={myCalendars}
          onToggleCalendar={handleToggleCalendar}
          onUpdateCalendarColor={handleUpdateCalendarColor}
          onDeleteCalendar={handleDeleteCalendar}
          onSoloCalendar={handleSoloCalendar}
          otherCalendars={otherCalendars}
          onToggleOtherCalendar={handleToggleOtherCalendar}
          onUpdateOtherCalendarColor={handleUpdateOtherCalendarColor}
          onDeleteOtherCalendar={handleDeleteOtherCalendar}
          onAddOtherCalendar={handleAddOtherCalendar}
          onSearchPerson={setPersonSearchQuery}
        />

        {activeView === 'month' ? (
          <CalendarMonth
            currentDate={currentDate}
            events={visibleEvents}
            onSelectEvent={handleSelectEvent}
            onSelectDate={handleSelectDate}
            currentUserId={user?.uid || 'demo-user'}
          />
        ) : (
          <CalendarWeek
            currentDate={currentDate}
            events={visibleEvents}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            viewMode={activeView}
            isSidebarOpen={sidebarOpen}
            onOpenCreateModal={handleOpenCreateModal}
          />
        )}
      </div>

      {/* 1. Okienko dodawania wydarzenia (Create Event Modal) matching image 3 */}
      <EventModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        initialData={selectedEvent}
        currentUserId={user?.uid || 'demo-user'}
        eventType={eventType}
        myCalendars={myCalendars}
      />

      {/* 2. Okienko szczegółów wydarzenia (Event Detail Modal) matching image 5 */}
      <EventDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        event={selectedEvent}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteEvent}
        calendarName={activeEventCal.name}
        calendarColor={activeEventCal.color}
      />

      {/* 3. Wymiana terminów Modal */}
      <ExchangeModal
        isOpen={exchangeModalOpen}
        onClose={() => {
          setExchangeModalOpen(false);
          setInitialTargetEventForSwap(null);
        }}
        myEvents={myEvents}
        exchangeableEvents={exchangeableEvents}
        exchanges={exchanges}
        onProposeExchange={proposeExchange}
        onRespondExchange={respondToExchange}
        user={user}
        initialTargetEvent={initialTargetEventForSwap}
      />

      {/* 4. Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
