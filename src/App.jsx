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
import ShareCalendarModal from './components/ShareCalendarModal';
import { generateSecurePin, verifyPin, checkPinRateLimit, recordFailedPinAttempt, resetPinRateLimit } from './utils/security';
import { auth, onAuthStateChanged, logoutUser, loginWithGoogle, db } from './firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import JoinRoomModal from './components/JoinRoomModal';
import { 
  createOrUpdateRoom,
  ensureRoom,
  getRoomData,
  joinRoom,
  updateRoomParticipants,
  removeParticipantFromRoom,
  subscribeToRoom,
  subscribeToRoomEvents,
  saveRoomEvent,
  swapRoomEventsInFirestore,
  deleteEvent
} from './firebase/eventsService';

// Default starter calendars matching user screenshots
const INITIAL_MY_CALENDARS = [
  { id: 'kalendarz', name: 'Kalendarz', color: '#1a73e8', checked: true },
  { id: 'familijne', name: 'Familijne', color: '#5f6368', checked: true },
  { id: 'zadania', name: 'Lista zadań', color: '#4285f4', checked: true },
  { id: 'urodziny', name: 'Urodziny', color: '#34a853', checked: true },
];

const INITIAL_OTHER_CALENDARS = [
  { id: 'swieta', name: 'Święta w Polsce', color: '#1e8e3e', checked: true },
  { id: 'inne', name: 'Wspólny kalendarz', color: '#f6bf26', checked: true },
];

export const OFFICIAL_POLISH_HOLIDAYS = [
  // 2026
  { id: 'hol-2026-01-01', title: 'Nowy Rok', date: '2026-01-01', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Święto państwowe' },
  { id: 'hol-2026-01-06', title: 'Święto Trzech Króli', date: '2026-01-06', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Objawienie Pańskie' },
  { id: 'hol-2026-02-14', title: 'Walentynki', date: '2026-02-14', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Dzień Zakochanych' },
  { id: 'hol-2026-04-05', title: 'Wielkanoc', date: '2026-04-05', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Niedziela Wielkanocna' },
  { id: 'hol-2026-04-06', title: 'Poniedziałek Wielkanocny', date: '2026-04-06', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Poniedziałek Wielkanocny' },
  { id: 'hol-2026-05-01', title: 'Święto Pracy', date: '2026-05-01', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Międzynarodowy Dzień Solidarności Ludzi Pracy' },
  { id: 'hol-2026-05-02', title: 'Dzień Flagi RP', date: '2026-05-02', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Dzień Flagi Rzeczypospolitej Polskiej' },
  { id: 'hol-2026-05-03', title: 'Święto Konstytucji 3 Maja', date: '2026-05-03', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Narodowe Święto Trzeciego Maja' },
  { id: 'hol-2026-05-24', title: 'Zielone Świątki', date: '2026-05-24', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Zesłanie Ducha Świętego' },
  { id: 'hol-2026-06-04', title: 'Boże Ciało', date: '2026-06-04', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Uroczystość Najświętszego Ciała i Krwi Chrystusa' },
  { id: 'hol-2026-08-15', title: 'Wniebowzięcie NMP / Święto Wojska Polskiego', date: '2026-08-15', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Święto Wojska Polskiego i Wniebowzięcie NMP' },
  { id: 'hol-2026-11-01', title: 'Wszystkich Świętych', date: '2026-11-01', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Uroczystość Wszystkich Świętych' },
  { id: 'hol-2026-11-02', title: 'Dzień Zaduszny', date: '2026-11-02', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Wspomnienie Wszystkich Wiernych Zmarłych' },
  { id: 'hol-2026-11-11', title: 'Dzień Niepodległości', date: '2026-11-11', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Narodowe Święto Niepodległości' },
  { id: 'hol-2026-12-24', title: 'Wigilia Bożego Narodzenia', date: '2026-12-24', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Wigilia' },
  { id: 'hol-2026-12-25', title: 'Boże Narodzenie', date: '2026-12-25', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Pierwszy dzień Bożego Narodzenia' },
  { id: 'hol-2026-12-26', title: 'Drugi dzień Bożego Narodzenia', date: '2026-12-26', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Święto św. Szczepana' },
  { id: 'hol-2026-12-31', title: 'Sylwester', date: '2026-12-31', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Ostatni dzień roku' },
  // 2027
  { id: 'hol-2027-01-01', title: 'Nowy Rok', date: '2027-01-01', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Święto państwowe' },
  { id: 'hol-2027-01-06', title: 'Święto Trzech Króli', date: '2027-01-06', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Objawienie Pańskie' },
  { id: 'hol-2027-03-28', title: 'Wielkanoc', date: '2027-03-28', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Niedziela Wielkanocna' },
  { id: 'hol-2027-03-29', title: 'Poniedziałek Wielkanocny', date: '2027-03-29', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Poniedziałek Wielkanocny' },
  { id: 'hol-2027-05-01', title: 'Święto Pracy', date: '2027-05-01', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Święto państwowe' },
  { id: 'hol-2027-05-03', title: 'Święto Konstytucji 3 Maja', date: '2027-05-03', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Święto państwowe' },
  { id: 'hol-2027-11-11', title: 'Dzień Niepodległości', date: '2027-11-11', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Narodowe Święto Niepodległości' },
  { id: 'hol-2027-12-25', title: 'Boże Narodzenie', date: '2027-12-25', isAllDay: true, calendarId: 'swieta', customBg: '#1e8e3e', description: 'Święta Bożego Narodzenia' }
];

// Domyślne czyste wydarzenie startowe w pokoju
const INITIAL_DEMO_EVENTS = [
  {
    id: 'starter-1',
    title: 'Spotkanie projektowe',
    date: '2026-11-08',
    startTime: '10:30',
    endTime: '11:30',
    color: '#1a73e8',
    calendarId: 'kalendarz',
    customBg: '#1a73e8',
    description: 'Omówienie harmonogramu i terminów',
    isExchangeable: true,
    userId: 'user-kodex',
    userName: 'Kodex',
    userEmail: 'kodex233@gmail.com',
    roomCode: 'kodex'
  }
];

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 8)); // 8 Nov 2026 as in screenshots
  const [slideDirection, setSlideDirection] = useState('none'); // 'next', 'prev', or 'none' for instant view transitions
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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map(c => (c.id === 'kodex' || c.name === 'kodex') ? { ...c, id: 'kalendarz', name: 'Kalendarz' } : c);
      } catch (e) {}
    }
    return INITIAL_MY_CALENDARS;
  });

  const [otherCalendars, setOtherCalendars] = useState(() => {
    const saved = localStorage.getItem('kalendarz_other_calendars');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map(c => c.id === 'inne' && c.name.includes('Janek') ? { ...c, name: 'Wspólny kalendarz' } : c);
      } catch (e) {}
    }
    return INITIAL_OTHER_CALENDARS;
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
  const [roomPin, setRoomPin] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kalendarz_owner_pin');
      if (saved) return saved;
    }
    return generateSecurePin();
  });
  const [participants, setParticipants] = useState(['Kodex']);
  const [detailedParticipants, setDetailedParticipants] = useState([]);
  const [currentUserName, setCurrentUserName] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const r = params.get('room') || 'kodex';
      const saved = localStorage.getItem(`room_${r}_user`);
      if (saved === 'Kodex') {
        const verified = localStorage.getItem('kodex_auth_verified');
        if (verified === 'true') return 'Kodex';
        return '';
      }
      return saved || '';
    }
    return '';
  });
  const [userRole, setUserRole] = useState(() => {
    if (typeof window !== 'undefined') {
      const verified = localStorage.getItem('kodex_auth_verified');
      if (verified === 'true') return 'Właściciel';
      const params = new URLSearchParams(window.location.search);
      const r = params.get('room') || 'kodex';
      const saved = localStorage.getItem(`room_${r}_user`);
      if (saved) return 'Uczestnik';
    }
    return '';
  });
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminInputCode, setAdminInputCode] = useState('');
  const [adminErrorCode, setAdminErrorCode] = useState('');
  const [urlJoinParams, setUrlJoinParams] = useState({ room: 'kodex' });

  // Autoryzacja dostępu: tylko zweryfikowany właściciel ('Kodex') lub zaakceptowany uczestnik z listy pokoju
  const isOwnerVerified = Boolean(
    (user && user.email && user.email.toLowerCase() === 'kodex233@gmail.com') ||
    (typeof window !== 'undefined' && localStorage.getItem('kodex_auth_verified') === 'true')
  );

  const isAuthorized = Boolean(
    currentUserName && (
      (currentUserName === 'Kodex' && isOwnerVerified) ||
      (currentUserName !== 'Kodex' && participants.includes(currentUserName))
    )
  );

  // 1. Sprawdź parametry URL na starcie (?room=kodex)
  // W skopiowanym linku NIE MA hasła, a jeśli ktoś otworzy stary link z &pin=, natychmiast go czyścimy
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const r = url.searchParams.get('room');

      // Bezpieczeństwo: usuń PIN z paska adresu URL jeśli tam się znajdował
      if (url.searchParams.has('pin')) {
        url.searchParams.delete('pin');
        window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
      }

      if (r) {
        setUrlJoinParams({ room: r });
        setRoomCode(r);

        const savedUser = localStorage.getItem(`room_${r}_user`);
        if (!savedUser) {
          // Nowa osoba z innego urządzenia wchodząca z linku: wymuszenie dołączenia kodem PIN
          setJoinModalOpen(true);
        } else {
          if (savedUser === 'Kodex') {
            const verified = localStorage.getItem('kodex_auth_verified');
            if (verified === 'true') setCurrentUserName('Kodex');
            else setCurrentUserName('');
          } else {
            setCurrentUserName(savedUser);
          }
        }
      } else {
        // Bezpieczne upewnienie się, że pokój istnieje w Firestore (BEZ nadpisywania istniejącego PINu pokoju!)
        ensureRoom('kodex', { hostName: 'Kodex' })
          .catch(e => console.warn('Room ensure error:', e));

        // Zapewnij obecność początkowego wydarzenia w pokoju Firestore jeśli kolekcja jest pusta
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
        if (roomData.participants) {
          setParticipants(roomData.participants);

          // Jeśli użytkownik był dołączony, ale gospodarz usunął go z uczestników:
          if (currentUserName && currentUserName !== 'Kodex' && !roomData.participants.includes(currentUserName)) {
            localStorage.removeItem(`room_${roomCode}_user`);
            setCurrentUserName('');
            setMyEvents([]);
            setExchangeableEvents([]);
            setJoinModalOpen(true);
            showToast('Twój dostęp do tego kalendarza został cofnięty przez właściciela.');
            return;
          }

          // Wyświetlaj wyłącznie realne osoby zarejestrowane w Firestore wraz z ich rolą
          const pData = roomData.participantsData || {};
          const realOthers = roomData.participants
            .filter(p => p !== 'Kodex' && p !== currentUserName)
            .map(p => ({
              name: p,
              email: pData[p]?.email || (p.includes('@') ? p : `${p.toLowerCase().replace(/\s+/g, '')}@gmail.com`),
              role: pData[p]?.role || 'Pełny dostęp',
              isOwner: false
            }));
          setDetailedParticipants(realOthers);

          // Zaktualizuj rolę bieżącego użytkownika (zarówno gospodarza jak i gościa)
          if (currentUserName) {
            if (currentUserName === 'Kodex') {
              setUserRole('Właściciel');
            } else {
              const myAssignedRole = pData[currentUserName]?.role || 'Pełny dostęp';
              setUserRole(myAssignedRole);
            }
          }
        }
      }
    });

    const unsubEvents = subscribeToRoomEvents(roomCode, (roomEvents) => {
      if (roomEvents) {
        // Wszystkie wydarzenia z tego pokoju: podział na własne i pozostałych uczestników
        const normCurrent = (currentUserName || 'kodex').trim().toLowerCase();
        const mine = roomEvents.filter(e => {
          const author = (e.userName || (e.userId === 'user-kodex' ? 'kodex' : '')).trim().toLowerCase();
          if (!author) return normCurrent === 'kodex';
          return author === normCurrent;
        });
        const others = roomEvents.filter(e => {
          const author = (e.userName || (e.userId === 'user-kodex' ? 'kodex' : '')).trim().toLowerCase();
          if (!author) return normCurrent !== 'kodex';
          return author !== normCurrent;
        });
        setMyEvents(mine);
        setExchangeableEvents(others);
      }
    });

    return () => {
      unsubRoom();
      unsubEvents();
    };
  }, [roomCode, currentUserName]);

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        if (currentUser.email && currentUser.email.toLowerCase() === 'kodex233@gmail.com') {
          setCurrentUserName('Kodex');
          setUserRole('Właściciel');
          localStorage.setItem('room_kodex_user', 'Kodex');
          localStorage.setItem('kodex_auth_verified', 'true');
        }
      }
    });
    return () => unsubscribe();
  }, []);

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

  // Reset slide animation after step animation completes so view transitions have NO animation
  useEffect(() => {
    if (slideDirection !== 'none') {
      const timer = setTimeout(() => setSlideDirection('none'), 250);
      return () => clearTimeout(timer);
    }
  }, [slideDirection]);

  const handleToday = () => {
    setSlideDirection('none');
    setCurrentDate(new Date(2026, 10, 8));
  };

  const handleSelectDate = (date) => {
    setSlideDirection('none');
    setCurrentDate(date);
  };

  const handleViewChange = (newView) => {
    setSlideDirection('none');
    setActiveView(newView);
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
    if (userRole === 'Przeglądający') {
      showToast('Masz uprawnienia tylko do odczytu (Przeglądający). Nie możesz dodawać wydarzeń.');
      return;
    }
    setEventType(type);
    setSelectedEvent({
      date: format(currentDate, 'yyyy-MM-dd'),
      startTime: '10:30',
      endTime: '11:30',
      calendarId: 'kalendarz',
      dayIndex: 2,
      isNew: true
    });
    setCreateModalOpen(true);
  };

  // Open Create Event Modal for a clicked slot on weekly grid
  const handleSelectSlot = (date, timeStr, slotInfo = {}) => {
    if (userRole === 'Przeglądający') {
      showToast('Masz uprawnienia tylko do odczytu (Przeglądający). Nie możesz dodawać wydarzeń.');
      return;
    }
    const [h] = timeStr.split(':').map(Number);
    const endH = (h + 1) % 24;

    const finalStartTime = slotInfo.startTime || `${h.toString().padStart(2, '0')}:00`;
    const finalEndTime = slotInfo.endTime || `${endH.toString().padStart(2, '0')}:00`;

    setSelectedEvent({
      date: format(date, 'yyyy-MM-dd'),
      startTime: finalStartTime,
      endTime: finalEndTime,
      calendarId: 'kalendarz',
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
    if (userRole === 'Przeglądający') {
      showToast('Masz uprawnienia tylko do odczytu (Przeglądający). Nie możesz edytować wydarzeń.');
      return;
    }
    setSelectedEvent(event);
    setEventType(event.type || 'Wydarzenie');
    setCreateModalOpen(true);
  };

  // Save Event - zapisuje lokalnie i natychmiast w Firestore pokoju
  const handleSaveEvent = async (eventData) => {
    if (userRole === 'Przeglądający') {
      showToast('Masz uprawnienia tylko do odczytu (Przeglądający). Nie możesz zapisywać wydarzeń.');
      return;
    }
    const currentUid = user?.uid || (currentUserName === 'Kodex' ? 'user-kodex' : `user-${currentUserName.toLowerCase().replace(/\s+/g, '')}`);
    const currentEmail = user?.email || `${(currentUserName || 'kodex').toLowerCase().replace(/\s+/g, '')}@gmail.com`;
    const currentName = user?.displayName || currentUserName || 'Kodex';
    const cleanCalId = (eventData.calendarId === 'kodex' ? 'kalendarz' : eventData.calendarId) || 'kalendarz';

    try {
      if (selectedEvent && selectedEvent.id && !selectedEvent.id.startsWith('demo-') && !selectedEvent.id.startsWith('starter-')) {
        await saveRoomEvent(roomCode, {
          ...selectedEvent,
          ...eventData,
          calendarId: cleanCalId,
          userName: selectedEvent.userName || currentName,
          userEmail: selectedEvent.userEmail || currentEmail,
          userId: selectedEvent.userId || currentUid,
          roomCode
        });
      } else {
        const newEvData = {
          ...eventData,
          calendarId: cleanCalId,
          userId: currentUid,
          userEmail: currentEmail,
          userName: currentName,
          isExchangeable: eventData.isExchangeable ?? false,
          roomCode
        };
        await saveRoomEvent(roomCode, newEvData);
      }
      showToast('Wydarzenie zostało zapisane');
    } catch (err) {
      console.warn('Błąd zapisu w Firestore:', err);
      showToast('Błąd zapisu wydarzenia w bazie');
    }
  };

  // Delete Event
  const handleDeleteEvent = async (eventId) => {
    if (userRole === 'Przeglądający') {
      showToast('Masz uprawnienia tylko do odczytu (Przeglądający). Nie możesz usuwać wydarzeń.');
      return;
    }
    setCreateModalOpen(false);
    setDetailModalOpen(false);

    if (eventId) {
      try {
        await deleteEvent(eventId);
        showToast('Wydarzenie zostało usunięte');
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
    // 1. Zabezpieczenie anty-bot: limit prób logowania i ochrona przed wtyczkami automatycznymi
    const rateCheck = checkPinRateLimit();
    if (!rateCheck.allowed) {
      throw new Error(rateCheck.message);
    }

    const trimmedCode = String(uPin || '').trim();

    // Kod dostępu administratora / właściciela (12 znaków)
    const ADMIN_CODE_12 = 'Kodex2026xK9';
    if (trimmedCode === ADMIN_CODE_12 || trimmedCode.toLowerCase() === ADMIN_CODE_12.toLowerCase() || trimmedCode === 'kodex2026') {
      resetPinRateLimit();
      localStorage.setItem('kodex_auth_verified', 'true');
      localStorage.setItem('room_kodex_user', 'Kodex');
      setCurrentUserName('Kodex');
      setUserRole('Właściciel');
      setRoomCode(rCode || 'kodex');
      showToast('Zalogowano pomyślnie jako Właściciel kalendarza!');
      return;
    }

    const room = await getRoomData(rCode);
    if (!room) {
      throw new Error(`Nie znaleziono pokoju o kodzie "${rCode}".`);
    }

    // 2. Kryptograficzna weryfikacja PIN-u (PBKDF2-50000 z unikalną solą)
    let isValidPin = false;
    if (room.pinHash && room.pinSalt) {
      isValidPin = await verifyPin(trimmedCode, room.pinHash, room.pinSalt);
    } else if (room.pin) {
      // Wsteczna kompatybilność: po zalogowaniu natychmiast migrujemy pokój na bezpieczny hash
      isValidPin = String(room.pin) === String(trimmedCode);
      if (isValidPin) {
        createOrUpdateRoom(rCode, { pin: trimmedCode }).catch(() => {});
      }
    }

    if (!isValidPin) {
      recordFailedPinAttempt();
      throw new Error('Nieprawidłowy kod PIN lub kod dostępu do tego kalendarza!');
    }

    resetPinRateLimit();

    const isKodexName = uName.trim().toLowerCase() === 'kodex';
    if (isKodexName) {
      // Weryfikacja właściciela (Kodex)
      localStorage.setItem('kodex_auth_verified', 'true');
      localStorage.setItem('room_kodex_user', 'Kodex');
      setCurrentUserName('Kodex');
      setUserRole('Właściciel');
      setRoomCode(rCode);
      showToast('Zalogowano pomyślnie jako Właściciel!');
      return;
    }

    // Uczestnik z własnym imieniem
    const cleanEmail = user?.email || `${uName.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
    await joinRoom(rCode, uName, cleanEmail);
    setRoomCode(rCode);
    setCurrentUserName(uName);
    setUserRole('Pełny dostęp');
    localStorage.setItem(`room_${rCode}_user`, uName);

    setDetailedParticipants(prev => {
      if (prev.some(p => p.name === uName)) return prev;
      return [...prev, { name: uName, email: cleanEmail, role: 'Pełny dostęp', isOwner: false }];
    });

    setOtherCalendars(prev => prev.map(c => c.id === 'inne' ? { ...c, checked: true, name: `Kalendarz: ${room.hostName || 'Gospodarz'}` } : c));
    showToast(`Połączono z kalendarzem "${rCode}" jako ${uName}!`);
  };

  const handleAdminCodeSubmit = (e) => {
    e.preventDefault();
    const clean = adminInputCode.trim();
    if (!clean) {
      setAdminErrorCode('Wpisz kod dostępu administratora.');
      return;
    }

    const rateCheck = checkPinRateLimit();
    if (!rateCheck.allowed) {
      setAdminErrorCode(rateCheck.message);
      return;
    }

    const ADMIN_CODE_12 = 'Kodex2026xK9';
    if (clean === ADMIN_CODE_12 || clean.toLowerCase() === ADMIN_CODE_12.toLowerCase() || clean === 'kodex2026') {
      resetPinRateLimit();
      localStorage.setItem('kodex_auth_verified', 'true');
      localStorage.setItem('room_kodex_user', 'Kodex');
      setCurrentUserName('Kodex');
      setUserRole('Właściciel');
      setRoomCode('kodex');
      setAdminModalOpen(false);
      setAdminInputCode('');
      setAdminErrorCode('');
      showToast('Zalogowano pomyślnie jako Właściciel kalendarza!');
    } else {
      recordFailedPinAttempt();
      setAdminErrorCode('Nieprawidłowy kod administratora!');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await loginWithGoogle();
      const gUser = result.user;
      setUser(gUser);

      if (gUser.email && gUser.email.toLowerCase() === 'kodex233@gmail.com') {
        setCurrentUserName('Kodex');
        setUserRole('Właściciel');
        localStorage.setItem('room_kodex_user', 'Kodex');
        localStorage.setItem('kodex_auth_verified', 'true');
        showToast(`Zalogowano jako Właściciel (${gUser.email})!`);
        return;
      }

      // Inny użytkownik konta Google
      const gName = gUser.displayName || gUser.email.split('@')[0];
      if (participants.includes(gName) || participants.includes(gUser.displayName) || participants.includes(gUser.email)) {
        const matched = participants.includes(gName) ? gName : (participants.includes(gUser.displayName) ? gUser.displayName : gUser.email);
        setCurrentUserName(matched);
        localStorage.setItem(`room_${roomCode}_user`, matched);
        showToast(`Witaj ponownie, ${matched}!`);
      } else {
        setUrlJoinParams(prev => ({
          ...prev,
          suggestedName: gName,
          suggestedEmail: gUser.email
        }));
        setJoinModalOpen(true);
        showToast(`Zalogowano przez Google (${gUser.email}). Podaj kod PIN, aby dołączyć.`);
      }
    } catch (err) {
      console.warn('Google login error:', err);
      if (err.code === 'auth/popup-blocked') {
        showToast('Przeglądarka zablokowała wyskakujące okienko Google. Zezwól na pop-upy.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        // Zamknięto okienko
      } else {
        showToast('Błąd logowania Google: ' + (err.message || err.code));
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn('Logout error:', e);
    }
    setUser(null);
    setCurrentUserName('');
    setUserRole('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('room_kodex_user');
      localStorage.removeItem('kodex_auth_verified');
      if (roomCode) {
        localStorage.removeItem(`room_${roomCode}_user`);
      }
    }
    showToast('Wylogowano. Kalendarz został zablokowany.');
  };

  const handleUpdateParticipants = async (newParticipants, options = {}) => {
    setDetailedParticipants(newParticipants);
    const updatedData = {};
    newParticipants.forEach(p => {
      updatedData[p.name] = {
        name: p.name,
        email: p.email || `${p.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        role: p.role || 'Pełny dostęp'
      };
    });

    const updatePayload = {
      participants: ['Kodex', ...newParticipants.map(p => p.name)],
      participantsData: {
        Kodex: { name: 'Kodex', role: 'Właściciel', email: 'kodex233@gmail.com' },
        ...updatedData
      }
    };

    // Jeśli usunięto użytkownika: natychmiast wygeneruj nowy silny PIN, aby usunięta osoba nie mogła ponownie dołączyć!
    if (options.removedName) {
      const newPin = generateSecurePin();
      updatePayload.pin = newPin;
      setRoomPin(newPin);
      localStorage.setItem('kalendarz_owner_pin', newPin);
      showToast(`Usunięto dostęp dla "${options.removedName}". Wygenerowano nowy kod PIN: ${newPin}`);
    } else if (options.changedName && options.newRole) {
      showToast(`Zmieniono rolę dla "${options.changedName}" na: ${options.newRole}`);
    }

    await createOrUpdateRoom(roomCode, updatePayload);
  };

  const handleUpdatePin = async (newPin) => {
    setRoomPin(newPin);
    localStorage.setItem('kalendarz_owner_pin', newPin);
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
    if (!isAuthorized) return [];

    const isSearchAll = advancedFilters.searchIn === 'Wszystkie kalendarze';
    const activeCalendarIds = new Set([
      ...myCalendars.filter(c => isSearchAll || c.checked).map(c => c.id),
      ...otherCalendars.filter(c => isSearchAll || c.checked).map(c => c.id)
    ]);

    const calendarColorMap = {};
    myCalendars.forEach(c => { calendarColorMap[c.id] = c.color; });
    otherCalendars.forEach(c => { calendarColorMap[c.id] = c.color; });

    let combined = [...myEvents, ...exchangeableEvents];

    // Dołącz oficjalne polskie święta, gdy zaznaczony jest kalendarz "Święta w Polsce"
    if (activeCalendarIds.has('swieta')) {
      const swietaColor = calendarColorMap['swieta'] || '#1e8e3e';
      OFFICIAL_POLISH_HOLIDAYS.forEach(hol => {
        if (!combined.some(e => e.date === hol.date && (e.calendarId === 'swieta' || e.title === hol.title))) {
          combined.push({
            ...hol,
            customBg: swietaColor
          });
        }
      });
    }

    // Filter by calendar visibility - pokazuje wszystkie wydarzenia pokoju
    combined = combined.filter(e => {
      const calId = e.calendarId || 'kalendarz';
      return activeCalendarIds.has(calId) || 
             (calId === 'kodex' && (activeCalendarIds.has('kalendarz') || activeCalendarIds.has('kodex'))) ||
             (calId === 'kalendarz' && (activeCalendarIds.has('kalendarz') || activeCalendarIds.has('kodex'))) ||
             activeCalendarIds.has('inne');
    });

    // Attach custom background color from calendar if applicable
    combined = combined.map(e => {
      const calId = e.calendarId || 'kalendarz';
      return {
        ...e,
        customBg: e.customBg || e.color || calendarColorMap[calId] || calendarColorMap['kalendarz'] || '#1a73e8'
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
  }, [isAuthorized, myEvents, exchangeableEvents, myCalendars, otherCalendars, searchQuery, personSearchQuery, advancedFilters]);

  const activeEventCal = selectedEvent ? (
    myCalendars.find(c => c.id === selectedEvent.calendarId) || { name: 'Kalendarz', color: '#1a73e8' }
  ) : { name: 'Kalendarz', color: '#1a73e8' };

  const pendingExchangesCount = exchanges.filter(ex => 
    (ex.targetUserId === (user?.uid || 'user-kodex') || (ex.targetUserEmail && (user?.email || 'kodex233@gmail.com') && ex.targetUserEmail?.toLowerCase() === (user?.email || 'kodex233@gmail.com').toLowerCase())) &&
    ex.status === 'pending'
  ).length;

  // Ekran blokady / dołączania dla osób nieautoryzowanych (podczas logowania nie widać kalendarza!)
  if (!isAuthorized) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#0d0e12] text-[#e3e3e3] p-4 select-none relative font-['Roboto',sans-serif] overflow-hidden">
        {/* Gemini Atmospheric Cosmic Sapphire Background Glow z płynną zmianą kolorów */}
        <div 
          className="absolute inset-0 pointer-events-none gemini-aurora-glow"
          style={{
            background: `
              radial-gradient(ellipse 85% 65% at 65% 38%, rgba(28, 68, 158, 0.48) 0%, rgba(18, 42, 105, 0.3) 35%, rgba(11, 22, 60, 0.14) 65%, transparent 85%),
              radial-gradient(circle 550px at 50% 50%, rgba(30, 75, 170, 0.28) 0%, rgba(14, 28, 70, 0.14) 50%, transparent 80%)
            `
          }}
        />

        {/* Google Calendar original branded logo */}
        <div className="flex items-center space-x-3 mb-6 relative z-10">
          <img 
            src="/calendar-logo.png" 
            alt="Google Kalendarz" 
            className="w-12 h-12 object-contain drop-shadow-lg" 
          />
          <span className="text-[26px] font-normal text-[#e3e3e3] font-['Product_Sans','Google_Sans',sans-serif] tracking-tight">
            Google Kalendarz
          </span>
        </div>

        {/* Lock Screen Card: tło bez bordera */}
        <div className="bg-[#1e1f20] rounded-[28px] p-8 max-w-[440px] w-full text-center shadow-2xl space-y-5 relative z-10">
          <div>
            <h2 className="text-2xl font-normal font-['Google_Sans',sans-serif] text-white">
              Kalendarz prywatny
            </h2>
            <p className="text-sm text-[#9aa0a6] mt-2 leading-relaxed">
              Dostęp do tego kalendarza wymaga autoryzacji. Zaloguj się przez Google lub wpisz kod PIN dostępu.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {/* Google Sign-in Button: tło lekko jasny szary i bez bordera */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-[#35373a] hover:bg-[#434649] rounded-full text-[#e3e3e3] font-medium text-sm transition shadow-sm active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Zaloguj się przez Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center my-3">
              <div className="flex-1 border-t border-[#3c4043]"></div>
              <span className="px-3 text-xs text-[#9aa0a6] uppercase tracking-wider">lub</span>
              <div className="flex-1 border-t border-[#3c4043]"></div>
            </div>

            {/* PIN Join Button */}
            <button
              type="button"
              onClick={() => setJoinModalOpen(true)}
              className="w-full py-3 px-4 bg-[#0b57d0] hover:bg-[#1b66c9] text-white rounded-full text-sm font-medium transition shadow-md active:scale-[0.98] cursor-pointer"
            >
              Dołącz kodem PIN
            </button>

            {/* Dwa przyciski obok siebie (po 50% szerokości): Logowanie e-mail oraz Dołącz jako admin */}
            <div className="flex items-center space-x-2.5 pt-1">
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="w-1/2 py-2.5 px-3 bg-transparent hover:bg-[#282a2d] border border-[#3c4043] hover:border-[#444746] text-[#c4c7c5] hover:text-[#e3e3e3] rounded-full text-xs sm:text-[13px] font-medium transition shadow-sm active:scale-[0.98] cursor-pointer text-center whitespace-nowrap"
              >
                Logowanie przez e-mail
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdminModalOpen(true);
                  setAdminErrorCode('');
                  setAdminInputCode('');
                }}
                className="w-1/2 py-2.5 px-3 bg-transparent hover:bg-[#282a2d] border border-[#3c4043] hover:border-[#444746] text-[#c4c7c5] hover:text-[#e3e3e3] rounded-full text-xs sm:text-[13px] font-medium transition shadow-sm active:scale-[0.98] cursor-pointer text-center whitespace-nowrap"
              >
                Dołącz jako admin
              </button>
            </div>
          </div>
        </div>

        {/* Modal dołączania kodem PIN */}
        <JoinRoomModal
          isOpen={joinModalOpen}
          onClose={() => setJoinModalOpen(false)}
          initialRoomCode={urlJoinParams.room || roomCode}
          initialUserName={urlJoinParams.suggestedName || ''}
          onJoinSuccess={handleJoinRoom}
        />

        {/* Modal logowania jako administrator */}
        {adminModalOpen && (
          <div 
            className="fixed inset-0 z-50 bg-[#131314]/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={() => setAdminModalOpen(false)}
          >
            <div 
              className="bg-[#282a2d] text-[#e3e3e3] rounded-[28px] shadow-2xl w-full max-w-[420px] overflow-hidden border border-[#3c4043] animate-in zoom-in-95 duration-150 p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2">
                <h2 className="text-[20px] font-normal text-[#e3e3e3] font-['Google_Sans','Product_Sans',sans-serif]">
                  Logowanie administratora
                </h2>
                <button
                  type="button"
                  onClick={() => setAdminModalOpen(false)}
                  className="p-1.5 hover:bg-[#35373a] text-[#c4c7c5] hover:text-white rounded-full transition cursor-pointer -mr-1"
                  title="Zamknij"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-[#9aa0a6] mt-1 leading-relaxed">
                Wpisz kod dostępu, aby uzyskać uprawnienia administratora do kalendarza.
              </p>

              {adminErrorCode && (
                <div className="mt-4 p-3 bg-[#4c1f24] border border-[#f28b82]/40 rounded-xl text-xs text-[#fce8e6]">
                  <span>{adminErrorCode}</span>
                </div>
              )}

              <form onSubmit={handleAdminCodeSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#c4c7c5] mb-1.5">
                    Kod administratora:
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={30}
                    autoComplete="current-password"
                    placeholder="Wpisz kod dostępu"
                    value={adminInputCode}
                    onChange={(e) => setAdminInputCode(e.target.value)}
                    autoFocus
                    className="w-full bg-[#1e1f20] border border-[#444746] focus:border-[#8ab4f8] rounded-xl px-4 py-2.5 text-sm text-[#e3e3e3] placeholder-[#747775] font-mono tracking-wider focus:outline-none transition"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setAdminModalOpen(false)}
                    className="px-5 py-2.5 text-sm font-medium text-[#8ab4f8] hover:bg-[#8ab4f8]/10 rounded-full transition cursor-pointer"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    className="px-7 py-2.5 bg-[#0b57d0] hover:bg-[#1b66c9] text-white text-sm font-medium rounded-full transition shadow-md active:scale-95 cursor-pointer"
                  >
                    Zaloguj
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal logowania e-mail / testowego */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onTestLogin={(mockUser) => {
            setUser(mockUser);
            if (mockUser.email && mockUser.email.toLowerCase() === 'kodex233@gmail.com') {
              setCurrentUserName('Kodex');
              setUserRole('Właściciel');
              localStorage.setItem('room_kodex_user', 'Kodex');
              localStorage.setItem('kodex_auth_verified', 'true');
            } else {
              const uName = mockUser.displayName || mockUser.email.split('@')[0];
              setCurrentUserName(uName);
              setUserRole('Uczestnik');
              localStorage.setItem(`room_${roomCode}_user`, uName);
            }
          }}
        />

        {toast && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-[#e3e3e3] text-[#1f1f1f] px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-6 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-150">
            <span>{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="p-1 text-[#5f6368] hover:text-[#1f1f1f] hover:bg-black/10 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

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
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeView={activeView}
        onViewChange={handleViewChange}
        advancedFilters={advancedFilters}
        onAdvancedFiltersChange={setAdvancedFilters}
        myCalendars={myCalendars}
        otherCalendars={otherCalendars}
        onOpenExchangeModal={() => setExchangeModalOpen(true)}
        onOpenShareModal={() => setShareModalOpen(true)}
        pendingExchangesCount={pendingExchangesCount}
        roomCode={roomCode}
        roomPin={roomPin}
        participants={participants}
        onUpdatePin={handleUpdatePin}
        myEvents={myEvents}
        exchangeableEvents={exchangeableEvents}
        onDirectSwap={handleDirectSwap}
        currentUser={currentUserName}
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
          userRole={userRole}
        />

        {/* Calendar Canvas */}
        <div 
          className={`flex-1 flex overflow-hidden ${
            slideDirection === 'next'
              ? 'calendar-slide-next'
              : slideDirection === 'prev'
              ? 'calendar-slide-prev'
              : 'calendar-slide-none'
          }`}
        >
          {activeView === 'month' ? (
            <CalendarMonth
              currentDate={currentDate}
              events={visibleEvents}
              onSelectEvent={handleSelectEvent}
              onSelectDate={handleSelectDate}
              onViewChange={handleViewChange}
              currentUserId={user?.uid || 'user-kodex'}
            />
          ) : activeView === 'year' ? (
            <CalendarYear
              currentDate={currentDate}
              events={visibleEvents}
              onSelectDate={handleSelectDate}
              onViewChange={handleViewChange}
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
              onViewChange={handleViewChange}
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
        userRole={userRole}
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
        onJoinSuccess={handleJoinRoom}
      />

      {/* 5. Autentyczne okno udostępniania w stylu Google z zarządzaniem uprawnieniami (1:1 z obrazami) */}
      <ShareCalendarModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        calendarName="Kalendarz"
        ownerName={user?.displayName ? `${user.displayName} (you)` : 'kodex (you)'}
        ownerEmail={user?.email || 'kodex233@gmail.com'}
        roomCode={roomCode}
        currentPin={roomPin}
        onUpdatePin={handleUpdatePin}
        participants={detailedParticipants}
        onUpdateParticipants={handleUpdateParticipants}
      />

      {/* 6. Auth Modal - Autentyczny styl Google */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onTestLogin={(mockUser) => setUser(mockUser)}
      />
    </div>
  );
}
