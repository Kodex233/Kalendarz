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

// Default starter demo events if offline or not logged in
const DEMO_EVENTS = [
  {
    id: 'demo-1',
    title: 'Spotkanie projektowe',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '10:00',
    endTime: '11:30',
    color: 'blue',
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
    description: 'Chętnie zamienię się na inny termin!',
    isExchangeable: true,
    userId: 'friend-1',
    userName: 'Kolega Janek',
    userEmail: 'janek@firma.pl'
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

  // Firestore data
  const [myEvents, setMyEvents] = useState([]);
  const [exchangeableEvents, setExchangeableEvents] = useState([]);
  const [exchanges, setExchanges] = useState([]);

  // Modals state
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [initialTargetEventForSwap, setInitialTargetEventForSwap] = useState(null);

  // Filters
  const [calendarsFilter, setCalendarsFilter] = useState({
    myEvents: true,
    exchangeable: true,
    friendsExchangeable: true
  });

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // Fallback to local demo events for instant preview
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

  // Handlers for month navigation
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleToggleFilter = (key) => {
    setCalendarsFilter(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Open Event Modal for new event
  const handleOpenCreateModal = () => {
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
    setEventModalOpen(true);
  };

  // Open Event Modal for existing event
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setEventModalOpen(true);
  };

  // Save Event (Create or Update in Firestore)
  const handleSaveEvent = async (eventData) => {
    if (!user) {
      // Demo mode fallback
      if (selectedEvent && selectedEvent.id) {
        setMyEvents(prev => prev.map(e => e.id === selectedEvent.id ? { ...e, ...eventData } : e));
      } else {
        const newEv = {
          ...eventData,
          id: 'demo-' + Date.now(),
          userId: 'demo-user',
          userEmail: 'demo@kalendarz.pl'
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
        userName: user.displayName || user.email.split('@')[0]
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

  // Filter events to display on the calendar
  const visibleEvents = React.useMemo(() => {
    let combined = [];

    if (calendarsFilter.myEvents) {
      combined = [...combined, ...myEvents];
    }
    if (calendarsFilter.friendsExchangeable) {
      combined = [...combined, ...exchangeableEvents];
    }

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
  }, [myEvents, exchangeableEvents, calendarsFilter, searchQuery]);

  const pendingExchangesCount = exchanges.filter(ex => 
    (ex.targetUserId === user?.uid || (user?.email && ex.targetUserEmail?.toLowerCase() === user.email.toLowerCase())) &&
    ex.status === 'pending'
  ).length;

  return (
    <div className="h-screen w-screen flex flex-col bg-white overflow-hidden">
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
          calendarsFilter={calendarsFilter}
          onToggleFilter={handleToggleFilter}
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
