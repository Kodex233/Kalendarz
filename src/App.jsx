import React, { useState, useEffect, useMemo } from 'react';
import { 
  addDays, 
  subDays, 
  addWeeks, 
  subWeeks, 
  addMonths, 
  subMonths, 
  addYears, 
  subYears, 
  format 
} from 'date-fns';
import { X } from 'lucide-react';
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

// Default starter calendars matching user screenshots
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
const INITIAL_DEMO_EVENTS = [
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
    description: 'Omówienie harmonogramu i terminów',
    isExchangeable: true,
    userId: 'user-kodex',
    userName: 'Kodex',
    userEmail: 'kodex233@gmail.com'
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

  // Advanced search filters matching image 2
  const [advancedFilters, setAdvancedFilters] = useState({
    searchIn: 'Aktywne kalendarze',
    what: '',
    who: '',
    where: '',
    notContain: '',
    dateFrom: '',
    dateTo: ''
  });

  // Toast / Snackbar notification matching image 5
  const [toast, setToast] = useState(null);

  const showToast = (message, actionText = 'Cofnij', onAction = null) => {
    setToast({ message, actionText, onAction });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

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

  // Events & Exchanges state
  const [myEvents, setMyEvents] = useState(() => {
    const saved = localStorage.getItem('kalendarz_my_events');
    return saved ? JSON.parse(saved) : INITIAL_DEMO_EVENTS;
  });

  const [exchangeableEvents, setExchangeableEvents] = useState([]);
  const [exchanges, setExchanges] = useState([]);

  useEffect(() => {
    localStorage.setItem('kalendarz_my_events', JSON.stringify(myEvents));
  }, [myEvents]);

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
        setMyEvents(INITIAL_DEMO_EVENTS.filter(e => e.userId === 'user-kodex' || e.userId === 'system'));
        setExchangeableEvents(INITIAL_DEMO_EVENTS.filter(e => e.userId !== 'user-kodex' && e.userId !== 'system'));
      }
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Firestore events when user is logged in
  useEffect(() => {
    if (!user || user.uid.startsWith('user-') || user.uid.startsWith('friend-')) return;

    const unsubMyEvents = subscribeToUserEvents(user.uid, (events) => {
      setMyEvents([...INITIAL_DEMO_EVENTS.filter(e => e.userId === 'system'), ...events]);
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

  // Stepping navigation handlers `< >` that step by the active view
  const handlePrevDate = () => {
    if (activeView === 'day') {
      setCurrentDate(prev => subDays(prev, 1));
    } else if (activeView === 'week') {
      setCurrentDate(prev => subWeeks(prev, 1));
    } else if (activeView === 'fourDays') {
      setCurrentDate(prev => subDays(prev, 4));
    } else if (activeView === 'year') {
      setCurrentDate(prev => subYears(prev, 1));
    } else {
      setCurrentDate(prev => subMonths(prev, 1));
    }
  };

  const handleNextDate = () => {
    if (activeView === 'day') {
      setCurrentDate(prev => addDays(prev, 1));
    } else if (activeView === 'week') {
      setCurrentDate(prev => addWeeks(prev, 1));
    } else if (activeView === 'fourDays') {
      setCurrentDate(prev => addDays(prev, 4));
    } else if (activeView === 'year') {
      setCurrentDate(prev => addYears(prev, 1));
    } else {
      setCurrentDate(prev => addMonths(prev, 1));
    }
  };

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
    const currentUid = user?.uid || 'user-kodex';
    const currentEmail = user?.email || 'kodex233@gmail.com';
    const currentName = user?.displayName || 'Kodex';

    // Local / Demo mode or test users
    if (!user || user.uid.startsWith('user-') || user.uid.startsWith('friend-')) {
      if (selectedEvent && selectedEvent.id) {
        setMyEvents(prev => prev.map(e => e.id === selectedEvent.id ? { ...e, ...eventData } : e));
      } else {
        const newEv = {
          ...eventData,
          id: 'demo-' + Date.now(),
          userId: currentUid,
          userEmail: currentEmail,
          userName: currentName,
          calendarId: eventData.calendarId || 'kodex'
        };
        setMyEvents(prev => [...prev, newEv]);
      }
      showToast('Wydarzenie zostało zapisane');
      return;
    }

    // Real Firebase Firestore
    try {
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
      showToast('Wydarzenie zostało zapisane');
    } catch (err) {
      console.error(err);
      alert('Nie udało się zapisać w Firestore: ' + err.message);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (eventId) => {
    // Optimistically update local state immediately
    setMyEvents(prev => prev.filter(e => e.id !== eventId));
    setExchangeableEvents(prev => prev.filter(e => e.id !== eventId));
    setCreateModalOpen(false);
    setDetailModalOpen(false);
    showToast('Wydarzenie zostało usunięte');

    // If logged into real Firebase and event is not a local demo event
    if (user && !user.uid.startsWith('user-') && !eventId.startsWith('demo-')) {
      try {
        await deleteEvent(eventId);
      } catch (err) {
        console.warn('Firestore deletion failed:', err);
      }
    }
  };

  // Propose slot exchange
  const handleProposeExchange = async (proposalData) => {
    if (!user || user.uid.startsWith('user-') || user.uid.startsWith('friend-')) {
      const newProposal = {
        ...proposalData,
        id: 'exch-' + Date.now(),
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      setExchanges(prev => [newProposal, ...prev]);
      showToast('Wysłano propozycję wymiany');
      return;
    }
    await proposeExchange(proposalData);
    showToast('Wysłano propozycję wymiany');
  };

  // Respond to slot exchange (Accept / Reject)
  const handleRespondExchange = async (exchangeId, accept, exchange) => {
    if (!user || user.uid.startsWith('user-') || user.uid.startsWith('friend-') || exchangeId.startsWith('exch-')) {
      if (accept) {
        // Swap date, startTime, and endTime between the two events
        setMyEvents(prev => {
          const myEv = prev.find(e => e.id === exchange.myEventId);
          const targetEv = prev.find(e => e.id === exchange.targetEventId) || exchangeableEvents.find(e => e.id === exchange.targetEventId);
          if (!myEv || !targetEv) return prev;
          return prev.map(e => {
            if (e.id === myEv.id) return { ...e, date: targetEv.date, startTime: targetEv.startTime, endTime: targetEv.endTime };
            if (e.id === targetEv.id) return { ...e, date: myEv.date, startTime: myEv.startTime, endTime: myEv.endTime };
            return e;
          });
        });
        setExchangeableEvents(prev => {
          const myEv = myEvents.find(e => e.id === exchange.myEventId);
          const targetEv = prev.find(e => e.id === exchange.targetEventId);
          if (!myEv || !targetEv) return prev;
          return prev.map(e => {
            if (e.id === targetEv.id) return { ...e, date: myEv.date, startTime: myEv.startTime, endTime: myEv.endTime };
            return e;
          });
        });
        setExchanges(prev => prev.map(ex => ex.id === exchangeId ? { ...ex, status: 'accepted' } : ex));
        showToast('Wymiana zaakceptowana! Terminy zamienione.');
      } else {
        setExchanges(prev => prev.map(ex => ex.id === exchangeId ? { ...ex, status: 'rejected' } : ex));
        showToast('Propozycja odrzucona');
      }
      return;
    }

    await respondToExchange(exchangeId, accept, exchange);
    showToast(accept ? 'Wymiana zaakceptowana w Firebase!' : 'Propozycja odrzucona');
  };

  // Filter events based on active checked calendars and search queries + advanced filters
  const visibleEvents = useMemo(() => {
    const isSearchAll = advancedFilters.searchIn === 'Wszystkie kalendarze';
    const activeCalendarIds = new Set([
      ...myCalendars.filter(c => isSearchAll || c.checked).map(c => c.id),
      ...otherCalendars.filter(c => isSearchAll || c.checked).map(c => c.id)
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

    // Filter by general search query / "Co"
    const keyword = (searchQuery || advancedFilters.what || '').trim().toLowerCase();
    if (keyword) {
      combined = combined.filter(e => 
        (e.title && e.title.toLowerCase().includes(keyword)) || 
        (e.description && e.description.toLowerCase().includes(keyword)) ||
        (e.userEmail && e.userEmail.toLowerCase().includes(keyword)) ||
        (e.userName && e.userName.toLowerCase().includes(keyword))
      );
    }

    // Filter by "Kto"
    const who = (advancedFilters.who || '').trim().toLowerCase();
    if (who) {
      combined = combined.filter(e =>
        (e.userEmail && e.userEmail.toLowerCase().includes(who)) ||
        (e.invitedEmail && e.invitedEmail.toLowerCase().includes(who)) ||
        (e.userName && e.userName.toLowerCase().includes(who))
      );
    }

    // Filter by "Gdzie"
    const where = (advancedFilters.where || '').trim().toLowerCase();
    if (where) {
      combined = combined.filter(e =>
        e.location && e.location.toLowerCase().includes(where)
      );
    }

    // Filter by "Nie zawiera"
    const notContain = (advancedFilters.notContain || '').trim().toLowerCase();
    if (notContain) {
      combined = combined.filter(e => {
        const inTitle = e.title && e.title.toLowerCase().includes(notContain);
        const inDesc = e.description && e.description.toLowerCase().includes(notContain);
        return !inTitle && !inDesc;
      });
    }

    // Filter by date range
    if (advancedFilters.dateFrom) {
      combined = combined.filter(e => e.date >= advancedFilters.dateFrom);
    }
    if (advancedFilters.dateTo) {
      combined = combined.filter(e => e.date <= advancedFilters.dateTo);
    }

    // Filter by person search query (Gmail from sidebar)
    if (personSearchQuery.trim()) {
      const pq = personSearchQuery.toLowerCase();
      combined = combined.filter(e =>
        (e.userEmail && e.userEmail.toLowerCase().includes(pq)) ||
        (e.invitedEmail && e.invitedEmail.toLowerCase().includes(pq)) ||
        (e.userName && e.userName.toLowerCase().includes(pq))
      );
    }

    return combined;
  }, [myEvents, exchangeableEvents, myCalendars, otherCalendars, searchQuery, personSearchQuery, advancedFilters]);

  const activeEventCal = selectedEvent ? (
    myCalendars.find(c => c.id === selectedEvent.calendarId) || { name: 'kodex', color: '#1a73e8' }
  ) : { name: 'kodex', color: '#1a73e8' };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1f20] text-[#e3e3e3] overflow-hidden">
      {/* Top Navbar: tło #1e1f20, wyszukiwarka Google */}
      <Navbar
        currentDate={currentDate}
        onPrevDate={handlePrevDate}
        onNextDate={handleNextDate}
        onToday={handleToday}
        onSelectDate={handleSelectDate}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={() => {
          logoutUser();
          setUser(null);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeView={activeView}
        onViewChange={setActiveView}
        advancedFilters={advancedFilters}
        onAdvancedFiltersChange={setAdvancedFilters}
      />

      {/* Main Container: Sidebar + Rounded Borderless Calendar Canvas */}
      <div className="flex-1 flex overflow-hidden bg-[#1e1f20]">
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
            onViewChange={setActiveView}
            currentUserId={user?.uid || 'user-kodex'}
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
            onSelectDate={handleSelectDate}
            onViewChange={setActiveView}
          />
        )}
      </div>

      {/* Toast Notification matching image 5 at the bottom */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-[#e3e3e3] text-[#1f1f1f] px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-6 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span>{toast.message}</span>
          {toast.onAction && (
            <button 
              onClick={toast.onAction}
              className="text-[#1a73e8] font-semibold hover:underline"
            >
              {toast.actionText}
            </button>
          )}
          <button 
            onClick={() => setToast(null)}
            className="p-1 text-[#5f6368] hover:text-[#1f1f1f] hover:bg-black/10 rounded-full transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Okienko dodawania/edycji wydarzenia matching image 5 */}
      <EventModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        initialData={selectedEvent}
        currentUserId={user?.uid || 'user-kodex'}
        eventType={eventType}
        myCalendars={myCalendars}
      />

      {/* 2. Okienko szczegółów wydarzenia matching image 5 */}
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
        onProposeExchange={handleProposeExchange}
        onRespondExchange={handleRespondExchange}
        user={user}
        initialTargetEvent={initialTargetEventForSwap}
      />

      {/* 4. Auth Modal - Autentyczny styl Google */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onTestLogin={(mockUser) => setUser(mockUser)}
      />
    </div>
  );
}
