import React, { useState, useEffect } from 'react';
import { 
  addMonths, 
  subMonths, 
  format 
} from 'date-fns';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CalendarMonth from './components/CalendarMonth';
import EventModal from './components/EventModal';
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

// Default starter demo events
const DEMO_EVENTS = [
  {
    id: 'demo-1',
    title: 'Spotkanie projektowe',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '10:00',
    endTime: '11:30',
    color: 'blue',
    calendarId: 'kodex',
    description: 'Omówienie harmonogramu i wymiany terminów',
    isExchangeable: true,
    userId: 'demo-user',
    userEmail: 'demo@kalendarz.pl'
  },
  {
    id: 'demo-2',
    title: 'Dyżur / Konsultacje (dostępny termin)',
    date: format(new Date(Date.now() + 86400000 * 2), 'yyyy-MM-dd'),
    startTime: '14:00',
    endTime: '16:00',
    color: 'yellow',
    calendarId: 'swieta',
    description: 'Chętnie zamienię się na inny termin!',
    isExchangeable: true,
    userId: 'friend-1',
    userName: 'Kolega Janek',
    userEmail: 'janek@firma.pl'
  },
  {
    id: 'demo-3',
    title: 'Obiad rodzinny',
    date: format(new Date(Date.now() + 86400000 * 4), 'yyyy-MM-dd'),
    startTime: '13:00',
    endTime: '15:00',
    color: 'gray',
    calendarId: 'familijne',
    description: 'Uroczysty obiad',
    isExchangeable: false,
    userId: 'demo-user',
    userEmail: 'demo@kalendarz.pl'
  }
];

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');

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
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [initialTargetEventForSwap, setInitialTargetEventForSwap] = useState(null);
  const [eventType, setEventType] = useState('Wydarzenie');

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setMyEvents(DEMO_EVENTS.filter(e => e.userId === 'demo-user'));
        setExchangeableEvents(DEMO_EVENTS.filter(e => e.userId !== 'demo-user'));
      }
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Firestore events when user is logged in
  useEffect(() => {
    if (!user) return;

    const unsubMyEvents = subscribeToUserEvents(user.uid, (events) => {
      setMyEvents(events);
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
  const handleToday = () => setCurrentDate(new Date());

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

  // Open Event Modal for new event with type
  const handleOpenCreateModal = (type = 'Wydarzenie') => {
    if (type === 'Harmonogram spotkań') {
      setExchangeModalOpen(true);
      return;
    }
    setEventType(type);
    setSelectedEvent(null);
    setEventModalOpen(true);
  };

  // Open Event Modal for specific date
  const handleSelectDate = (date) => {
    setSelectedEvent({
      date: format(date, 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00'
    });
    setEventType('Wydarzenie');
    setEventModalOpen(true);
  };

  // Open Event Modal for existing event
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setEventType(event.type || 'Wydarzenie');
    setEventModalOpen(true);
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
          calendarId: 'kodex'
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
        calendarId: 'kodex'
      });
    }
  };

  // Delete Event
  const handleDeleteEvent = async (eventId) => {
    if (!user) {
      setMyEvents(prev => prev.filter(e => e.id !== eventId));
      setEventModalOpen(false);
      return;
    }
    await deleteEvent(eventId);
    setEventModalOpen(false);
  };

  // Quick swap with a friend's event
  const handleProposeSwapWithEvent = (targetEvent) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setInitialTargetEventForSwap(targetEvent);
    setExchangeModalOpen(true);
  };

  // Filter events based on active checked calendars and search query
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
        customBg: calendarColorMap[calId] || null
      };
    });

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      combined = combined.filter(e => 
        e.title.toLowerCase().includes(q) || 
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.userEmail && e.userEmail.toLowerCase().includes(q)) ||
        (e.userName && e.userName.toLowerCase().includes(q))
      );
    }

    return combined;
  }, [myEvents, exchangeableEvents, myCalendars, otherCalendars, searchQuery]);

  const pendingExchangesCount = exchanges.filter(ex => 
    (ex.targetUserId === user?.uid || (user?.email && ex.targetUserEmail?.toLowerCase() === user.email.toLowerCase())) &&
    ex.status === 'pending'
  ).length;

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1f1f1f] text-[#e3e3e3] overflow-hidden">
      {/* Top Navbar */}
      <Navbar
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={logoutUser}
        onOpenExchangeModal={() => setExchangeModalOpen(true)}
        pendingExchangesCount={pendingExchangesCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Main Container with Sidebar + Calendar */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onOpenCreateModal={handleOpenCreateModal}
          selectedDate={currentDate}
          onSelectDate={(date) => {
            setCurrentDate(date);
            handleSelectDate(date);
          }}
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
          exchangeableEvents={exchangeableEvents}
          onProposeSwapWithEvent={handleProposeSwapWithEvent}
          onOpenExchangeModal={() => setExchangeModalOpen(true)}
          user={user}
        />

        <CalendarMonth
          currentDate={currentDate}
          events={visibleEvents}
          onSelectEvent={handleSelectEvent}
          onSelectDate={handleSelectDate}
          currentUserId={user?.uid || 'demo-user'}
        />
      </div>

      {/* Modals */}
      <EventModal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        initialData={selectedEvent}
        currentUserId={user?.uid || 'demo-user'}
        onOpenExchangeForEvent={handleProposeSwapWithEvent}
        eventType={eventType}
      />

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

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
