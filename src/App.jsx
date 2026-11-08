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
import CalendarYear from './components/CalendarYear';
import CalendarAgenda from './components/CalendarAgenda';
import EventModal from './components/EventModal';
import EventDetailModal from './components/EventDetailModal';
import ExchangeModal from './components/ExchangeModal';
import AuthModal from './components/AuthModal';
import { auth, onAuthStateChanged, logoutUser, db } from './firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import JoinRoomModal from './components/JoinRoomModal';
import { 
  createOrUpdateRoom,
  getRoomData,
  joinRoom,
  subscribeToRoom,
  subscribeToRoomEvents,
  saveRoomEvent,
  swapRoomEventsInFirestore,
  subscribeToUserEvents, 
  subscribeToExchangeableEvents, 
  subscribeToExchanges,
  createEvent,
  updateEvent,
  deleteEvent
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
  { id: 'inne', name: 'Kalendarz kolegi (Janek)', color: '#f6bf26', checked: true },
];

// Default starter demo events: pełny kalendarz Twój oraz kolegi
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
    customBg: '#1a73e8',
    description: 'Omówienie harmonogramu i terminów',
    isExchangeable: true,
    userId: 'user-kodex',
    userName: 'Kodex',
    userEmail: 'kodex233@gmail.com'
  },
  {
    id: 'demo-2',
    title: 'Dyżur poranny - Kolega Janek',
    date: '2026-11-09',
    startTime: '08:00',
    endTime: '11:00',
    color: 'teal',
    calendarId: 'inne',
    customBg: '#00897b',
    description: 'Dyżur techniczny poniedziałek',
    isExchangeable: true,
    userId: 'friend-janek',
    userName: 'Kolega Janek',
    userEmail: 'janek@firma.pl'
  },
  {
    id: 'demo-3',
    title: 'Konsultacje semestralne - Kolega Janek',
    date: '2026-11-10',
    startTime: '12:00',
    endTime: '13:30',
    color: 'yellow',
    calendarId: 'inne',
    customBg: '#f6bf26',
    description: 'Konsultacje semestralne w sali 204',
    isExchangeable: true,
    userId: 'friend-janek',
    userName: 'Kolega Janek',
    userEmail: 'janek@firma.pl'
  },
  {
    id: 'demo-4',
    title: 'Warsztaty frontend - Kolega Janek',
    date: '2026-11-11',
    startTime: '14:00',
    endTime: '16:00',
    color: 'purple',
    calendarId: 'inne',
    customBg: '#8e24aa',
    description: 'Prezentacja komponentów i architektury',
    isExchangeable: true,
    userId: 'friend-janek',
    userName: 'Kolega Janek',
    userEmail: 'janek@firma.pl'
  },
  {
    id: 'demo-5',
    title: 'Dyżur piątkowy - Kolega Janek',
    date: '2026-11-13',
    startTime: '10:00',
    endTime: '13:00',
    color: 'red',
    calendarId: 'inne',
    customBg: '#e67c73',
    description: 'Dyżur weekendowy support',
    isExchangeable: true,
    userId: 'friend-janek',
    userName: 'Kolega Janek',
    userEmail: 'janek@firma.pl'
  }
];

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 8)); // 8 Nov 2026 as in screenshots
  const [slideDirection, setSlideDirection] = useState('next'); // 'next' or 'prev' for slide animation
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

  // Multi-device Room Sharing & PIN state
  const [roomCode, setRoomCode] = useState('kodex');
  const [roomPin, setRoomPin] = useState('1234');
  const [participants, setParticipants] = useState(['Kodex']);
  const [currentUserName, setCurrentUserName] = useState('Kodex');
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [urlJoinParams, setUrlJoinParams] = useState({ room: 'kodex', pin: '' });

  // 1. Sprawdź parametry URL na starcie (?room=kodex&pin=1234)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const r = params.get('room');
      const p = params.get('pin');

      if (r) {
        setUrlJoinParams({ room: r, pin: p || '' });
        setRoomCode(r);
        if (p) setRoomPin(p);

        const savedUser = localStorage.getItem(`room_${r}_user`);
        if (!savedUser) {
          // Nowa osoba z innego komputera wchodząca z linku: pytamy o imię i PIN
          setJoinModalOpen(true);
        } else {
          setCurrentUserName(savedUser);
        }
      } else {
        // Domyślna inicjalizacja pokoju w Firestore
        createOrUpdateRoom('kodex', { pin: '1234', hostName: 'Kodex', participants: ['Kodex'] })
          .catch(e => console.warn('Room init:', e));

        // Zapewnij obecność początkowych wydarzeń w pokoju Firestore
        getDocs(collection(db, 'events')).then(snap => {
          if (!snap || snap.size === 0) {
            INITIAL_DEMO_EVENTS.forEach(ev => {
              saveRoomEvent('kodex', ev).catch(() => {});
            });
          }
        }).catch(() => {});
      }
    }
  }, []);

  // 2. Nasłuchuj pokoju i jego uczestników w czasie rzeczywistym
  useEffect(() => {
    if (!roomCode) return;
    const unsubRoom = subscribeToRoom(roomCode, (roomData) => {
      if (roomData) {
        if (roomData.pin) setRoomPin(roomData.pin);
        if (roomData.participants) setParticipants(roomData.participants);
      }
    });

    const unsubEvents = subscribeToRoomEvents(roomCode, (roomEvents) => {
      if (roomEvents && roomEvents.length > 0) {
        const mine = roomEvents.filter(e => e.userName === currentUserName || (!e.userName && e.userId === 'user-kodex'));
        const others = roomEvents.filter(e => e.userName !== currentUserName && e.userId !== 'user-kodex');
        if (mine.length > 0) setMyEvents(mine);
        if (others.length > 0) setExchangeableEvents(others);
      }
    });

    return () => {
      unsubRoom();
      unsubEvents();
    };
  }, [roomCode, currentUserName]);

  // Track Firebase Auth state & load Firestore data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setMyEvents(INITIAL_DEMO_EVENTS.filter(e => e.userId === 'user-kodex' || e.userId === 'system'));
        setExchangeableEvents(INITIAL_DEMO_EVENTS.filter(e => e.userId !== 'user-kodex' && e.userId !== 'system'));
      }
    });

    // Sync from Firestore directly so real Firebase data is immediately active
    getDocs(collection(db, 'events')).then(snap => {
      if (snap && snap.size > 0) {
        const events = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const mine = events.filter(e => e.userId === 'user-kodex');
        const friend = events.filter(e => e.userId === 'friend-janek' || e.userId?.startsWith('friend-'));
        if (mine.length > 0) {
          setMyEvents([...INITIAL_DEMO_EVENTS.filter(e => e.userId === 'system'), ...mine]);
        }
        if (friend.length > 0) {
          setExchangeableEvents(friend);
        }
      }
    }).catch(err => console.warn('Firestore load:', err));

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
    setSlideDirection('prev');
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
    setSlideDirection('next');
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

  const handleToday = () => {
    const todayDate = new Date(2026, 10, 8);
    setSlideDirection(todayDate >= currentDate ? 'next' : 'prev');
    setCurrentDate(todayDate);
  };

  const handleSelectDate = (date) => {
    if (date > currentDate) setSlideDirection('next');
    else if (date < currentDate) setSlideDirection('prev');
    setCurrentDate(date);
  };

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
    setEventType(type);
    setSelectedEvent({
      date: format(currentDate, 'yyyy-MM-dd'),
      startTime: '10:30',
      endTime: '11:30',
      calendarId: 'kodex',
      dayIndex: 2,
      isNew: true
    });
    setCreateModalOpen(true);
  };

  // Open Create Event Modal for a clicked slot on weekly grid
  const handleSelectSlot = (date, timeStr, slotInfo = {}) => {
    const [h] = timeStr.split(':').map(Number);
    const endH = (h + 1) % 24;
    setSelectedEvent({
      date: format(date, 'yyyy-MM-dd'),
      startTime: `${h.toString().padStart(2, '0')}:00`,
      endTime: `${endH.toString().padStart(2, '0')}:00`,
      calendarId: 'kodex',
      dayIndex: slotInfo.dayIndex ?? 2,
      slotRect: slotInfo.slotRect,
      isNew: true,
      title: ''
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

  const handleProposeSwapWithEvent = (targetEvent) => {
    setInitialTargetEventForSwap(targetEvent);
    setExchangeModalOpen(true);
  };

  const handleJoinRoom = async ({ roomCode: rCode, userName: uName, pin: uPin }) => {
    const room = await getRoomData(rCode);
    if (!room) {
      throw new Error(`Nie znaleziono pokoju o kodzie "${rCode}".`);
    }
    if (room.pin && String(room.pin) !== String(uPin)) {
      throw new Error('Nieprawidłowy kod PIN dostępu do tego kalendarza!');
    }

    await joinRoom(rCode, uName);
    setRoomCode(rCode);
    setRoomPin(uPin);
    setCurrentUserName(uName);
    localStorage.setItem(`room_${rCode}_user`, uName);

    setOtherCalendars(prev => prev.map(c => c.id === 'inne' ? { ...c, checked: true, name: `Kalendarz: ${room.hostName || 'Gospodarz'}` } : c));
    showToast(`Połączono z kalendarzem "${rCode}" jako ${uName}!`);
  };

  const handleUpdatePin = async (newPin) => {
    setRoomPin(newPin);
    await createOrUpdateRoom(roomCode, { pin: newPin });
    showToast(`Kod PIN zmieniony na: ${newPin}`);
  };

  // Direct simple swap: natychmiastowa zamiana terminów w kalendarzu i bazie Firebase
  const handleDirectSwap = async (myEventId, targetEventId) => {
    const all = [...myEvents, ...exchangeableEvents];
    const myEv = all.find(e => e.id === myEventId);
    const targetEv = all.find(e => e.id === targetEventId);

    if (!myEv || !targetEv) return;

    const myDate = myEv.date;
    const myStart = myEv.startTime;
    const myEnd = myEv.endTime;

    const targetDate = targetEv.date;
    const targetStart = targetEv.startTime;
    const targetEnd = targetEv.endTime;

    setMyEvents(prev => prev.map(e => {
      if (e.id === myEv.id) return { ...e, date: targetDate, startTime: targetStart, endTime: targetEnd };
      if (e.id === targetEv.id) return { ...e, date: myDate, startTime: myStart, endTime: myEnd };
      return e;
    }));

    setExchangeableEvents(prev => prev.map(e => {
      if (e.id === targetEv.id) return { ...e, date: myDate, startTime: myStart, endTime: myEnd };
      if (e.id === myEv.id) return { ...e, date: targetDate, startTime: targetStart, endTime: targetEnd };
      return e;
    }));

    // Real-time zapis w Firebase Firestore dla obu połączonych urządzeń
    try {
      await swapRoomEventsInFirestore(myEv, targetEv, roomCode);
    } catch (err) {
      console.warn('Firestore room swap error:', err);
    }

    showToast(`Pomyślnie zamieniono: "${myEv.title}" ⇄ "${targetEv.title}"!`);
  };

  // Respond to slot exchange (Accept / Reject)
  const handleRespondExchange = async (exchangeId, accept, exchange) => {
    if (!user || user.uid.startsWith('user-') || user.uid.startsWith('friend-') || exchangeId.startsWith('exch-')) {
      if (accept) {
        // Swap date, startTime, and endTime between the two events
        const myEv = myEvents.find(e => e.id === exchange.myEventId);
        const targetEv = exchangeableEvents.find(e => e.id === exchange.targetEventId) || myEvents.find(e => e.id === exchange.targetEventId);
        
        if (myEv && targetEv) {
          const myDate = myEv.date;
          const myStart = myEv.startTime;
          const myEnd = myEv.endTime;

          const targetDate = targetEv.date;
          const targetStart = targetEv.startTime;
          const targetEnd = targetEv.endTime;

          setMyEvents(prev => prev.map(e => {
            if (e.id === myEv.id) return { ...e, date: targetDate, startTime: targetStart, endTime: targetEnd };
            if (e.id === targetEv.id) return { ...e, date: myDate, startTime: myStart, endTime: myEnd };
            return e;
          }));

          setExchangeableEvents(prev => prev.map(e => {
            if (e.id === targetEv.id) return { ...e, date: myDate, startTime: myStart, endTime: myEnd };
            if (e.id === myEv.id) return { ...e, date: targetDate, startTime: targetStart, endTime: targetEnd };
            return e;
          }));
        }

        setExchanges(prev => prev.map(ex => ex.id === exchangeId ? { ...ex, status: 'accepted' } : ex));
        showToast('Wymiana zaakceptowana! Terminy zamienione w kalendarzu.');
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

  const pendingExchangesCount = exchanges.filter(ex => 
    (ex.targetUserId === (user?.uid || 'user-kodex') || (ex.targetUserEmail && (user?.email || 'kodex233@gmail.com') && ex.targetUserEmail?.toLowerCase() === (user?.email || 'kodex233@gmail.com').toLowerCase())) &&
    ex.status === 'pending'
  ).length;

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
        myCalendars={myCalendars}
        otherCalendars={otherCalendars}
        onOpenExchangeModal={() => setExchangeModalOpen(true)}
        pendingExchangesCount={pendingExchangesCount}
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

        {/* Animated Calendar Container: płynna animacja w lewo lub w prawo przy zmianie daty */}
        <div 
          key={`${format(currentDate, 'yyyy-MM-dd')}-${activeView}`}
          className={`flex-1 flex overflow-hidden ${slideDirection === 'next' ? 'calendar-slide-next' : 'calendar-slide-prev'}`}
        >
          {activeView === 'month' ? (
            <CalendarMonth
              currentDate={currentDate}
              events={visibleEvents}
              onSelectEvent={handleSelectEvent}
              onSelectDate={handleSelectDate}
              onViewChange={setActiveView}
              currentUserId={user?.uid || 'user-kodex'}
            />
          ) : activeView === 'year' ? (
            <CalendarYear
              currentDate={currentDate}
              events={visibleEvents}
              onSelectDate={handleSelectDate}
              onViewChange={setActiveView}
              onSelectEvent={handleSelectEvent}
            />
          ) : activeView === 'agenda' ? (
            <CalendarAgenda
              currentDate={currentDate}
              events={visibleEvents}
              onSelectEvent={handleSelectEvent}
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
              creatingEvent={createModalOpen && selectedEvent?.isNew ? selectedEvent : null}
            />
          )}
        </div>
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
        onClose={() => {
          setCreateModalOpen(false);
          setSelectedEvent(null);
        }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        initialData={selectedEvent}
        currentUserId={user?.uid || 'user-kodex'}
        eventType={eventType}
        myCalendars={myCalendars}
        onFormChange={(formData) => {
          setSelectedEvent(prev => prev ? ({ ...prev, ...formData }) : formData);
        }}
      />

      {/* 2. Okienko szczegółów wydarzenia matching image 5 (czyste, bez zbędnych przycisków wymiany) */}
      <EventDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        event={selectedEvent}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteEvent}
        calendarName={activeEventCal.name}
        calendarColor={activeEventCal.color}
      />

      {/* 3. Wymiana terminów - z linkiem do skopiowania, kodem PIN i synchronizacją na żywo */}
      <ExchangeModal
        isOpen={exchangeModalOpen}
        onClose={() => {
          setExchangeModalOpen(false);
          setInitialTargetEventForSwap(null);
        }}
        myEvents={myEvents.filter(e => e.userId === 'user-kodex' || e.userName === currentUserName || (!e.userId?.startsWith('friend-') && e.id !== 'demo-holiday'))}
        exchangeableEvents={[...exchangeableEvents, ...myEvents.filter(e => (e.userId === 'friend-janek' || e.userId?.startsWith('friend-')) && e.userName !== currentUserName)]}
        onDirectSwap={handleDirectSwap}
        roomCode={roomCode}
        roomPin={roomPin}
        participants={participants}
        onUpdatePin={handleUpdatePin}
        currentUserRole={currentUserName}
        user={user}
      />

      {/* 4. Dołączanie do kalendarza znajomego przez link lub PIN z innego komputera */}
      <JoinRoomModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        initialRoomCode={urlJoinParams.room}
        initialPin={urlJoinParams.pin}
        onJoinSuccess={handleJoinRoom}
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
