import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, 
  Clock, 
  Info,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay
} from 'date-fns';
import { pl } from 'date-fns/locale';
import TimeZoneModal from './TimeZoneModal';

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  currentUserId,
  eventType = 'Wydarzenie',
  myCalendars = [],
  onFormChange
}) {
  const [activeTab, setActiveTab] = useState(eventType || 'Wydarzenie');
  const [title, setTitle] = useState(initialData?.title || '');
  const [date, setDate] = useState(initialData?.date || '');
  const [startTime, setStartTime] = useState(initialData?.startTime || '10:30');
  const [endTime, setEndTime] = useState(initialData?.endTime || '11:30');
  const [isAllDay, setIsAllDay] = useState(false);
  const [guests, setGuests] = useState('');
  const [showGuestInput, setShowGuestInput] = useState(false);
  const [hasMeet, setHasMeet] = useState(false);
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [description, setDescription] = useState('');
  const [showDescInput, setShowDescInput] = useState(false);
  const [selectedCalendarId, setSelectedCalendarId] = useState('kalendarz');
  const [loading, setLoading] = useState(false);
  const [hasDeadline, setHasDeadline] = useState(Boolean(initialData?.deadlineDate));
  const [deadlineDate, setDeadlineDate] = useState(initialData?.deadlineDate || '');
  const [isDeadlinePickerOpen, setIsDeadlinePickerOpen] = useState(false);
  const [deadlinePickerMonth, setDeadlinePickerMonth] = useState(() => new Date());
  const deadlinePickerRef = useRef(null);

  // Timezone and Repeat states
  const [isTimeZoneModalOpen, setIsTimeZoneModalOpen] = useState(false);
  const [isRepeatMenuOpen, setIsRepeatMenuOpen] = useState(false);
  const [repeatRule, setRepeatRule] = useState('Nie powtarza się');
  const repeatMenuRef = useRef(null);
  const lastOpenedSlotRef = useRef(null);

  useEffect(() => {
    setActiveTab(eventType || 'Wydarzenie');
  }, [eventType]);

  useEffect(() => {
    if (isOpen) {
      const slotKey = initialData?.id || `${initialData?.date}_${initialData?.startTime}_${initialData?.endTime}_${initialData?.slotRect?.top}`;
      if (lastOpenedSlotRef.current !== slotKey) {
        lastOpenedSlotRef.current = slotKey;
        setTitle(initialData?.title || '');
        setDate(initialData?.date || new Date().toISOString().split('T')[0]);
        setStartTime(initialData?.startTime || '10:30');
        setEndTime(initialData?.endTime || '11:30');
        setIsAllDay(Boolean(initialData?.isAllDay));
        setGuests(initialData?.invitedEmail || '');
        setShowGuestInput(Boolean(initialData?.invitedEmail));
        setLocation(initialData?.location || '');
        setShowLocationInput(Boolean(initialData?.location));
        setDescription(initialData?.description || '');
        setShowDescInput(Boolean(initialData?.description));
        setSelectedCalendarId(initialData?.calendarId || 'kalendarz');
        setRepeatRule('Nie powtarza się');
        setHasDeadline(Boolean(initialData?.deadlineDate));
        setDeadlineDate(initialData?.deadlineDate || '');
        setIsDeadlinePickerOpen(false);
        if (initialData?.type) setActiveTab(initialData.type);
      }
    } else {
      lastOpenedSlotRef.current = null;
      setIsDeadlinePickerOpen(false);
    }
  }, [isOpen, initialData?.id, initialData?.date, initialData?.startTime, initialData?.endTime, initialData?.slotRect]);

  // Close repeat dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (repeatMenuRef.current && !repeatMenuRef.current.contains(e.target)) {
        setIsRepeatMenuOpen(false);
      }
      if (deadlinePickerRef.current && !deadlinePickerRef.current.contains(e.target)) {
        setIsDeadlinePickerOpen(false);
      }
    };
    if (isRepeatMenuOpen || isDeadlinePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isRepeatMenuOpen, isDeadlinePickerOpen]);

  // Format 12h time (np. 1:00am, 2:00am)
  const formatTime12h = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'pm' : 'am';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m !== undefined ? m.toString().padStart(2, '0') : '00';
    return `${displayH}:${displayM}${period}`;
  };

  // Explicit handlers that notify parent without wiping initialData or causing effect loops
  const handleTitleChange = (val) => {
    setTitle(val);
    if (onFormChange) onFormChange({ title: val });
  };

  const handleDateChange = (val) => {
    setDate(val);
    if (onFormChange) onFormChange({ date: val });
  };

  const handleStartTimeChange = (val) => {
    setStartTime(val);
    if (onFormChange) onFormChange({ startTime: val });
  };

  const handleEndTimeChange = (val) => {
    setEndTime(val);
    if (onFormChange) onFormChange({ endTime: val });
  };

  const handleTabChange = (val) => {
    setActiveTab(val);
    if (onFormChange) onFormChange({ type: val });
  };

  const currentCal = myCalendars.find(c => c.id === selectedCalendarId) || { name: 'Kalendarz', color: '#1a73e8' };

  // Formatted date chip text (z wielką literą jak na zdjęciu)
  const formattedDateLabel = useMemo(() => {
    try {
      if (!date) return 'Wybierz datę';
      const d = new Date(date + 'T00:00:00');
      const formatted = format(d, 'EEEE, d MMMM', { locale: pl });
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } catch {
      return date;
    }
  }, [date]);

  // Formatted deadline date chip text (z wielką literą jak na zdjęciu Image 1)
  const formattedDeadlineLabel = useMemo(() => {
    try {
      const dStr = deadlineDate || date;
      if (!dStr) return 'Wybierz datę';
      const d = new Date(dStr + 'T00:00:00');
      const formatted = format(d, 'EEEE, d MMMM', { locale: pl });
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } catch {
      return deadlineDate || date;
    }
  }, [deadlineDate, date]);

  // Dni miesiąca dla popupu wyboru terminu (od niedzieli jak na zrzucie ekranu)
  const deadlineCalendarDays = useMemo(() => {
    try {
      const monthStart = startOfMonth(deadlinePickerMonth);
      const monthEnd = endOfMonth(deadlinePickerMonth);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: startDate, end: endDate });
    } catch {
      return [];
    }
  }, [deadlinePickerMonth]);

  const handleOpenDeadlinePicker = () => {
    try {
      const d = deadlineDate ? new Date(deadlineDate + 'T00:00:00') : (date ? new Date(date + 'T00:00:00') : new Date());
      setDeadlinePickerMonth(d);
    } catch {
      setDeadlinePickerMonth(new Date());
    }
    setIsDeadlinePickerOpen(prev => !prev);
  };

  // Repeat menu options matching image 3 (dokładnie jak na zrzucie ekranu)
  const repeatOptions = useMemo(() => {
    try {
      const d = new Date((date || new Date().toISOString().split('T')[0]) + 'T00:00:00');
      const dayName = format(d, 'EEEE', { locale: pl }).toLowerCase();
      const dayNum = format(d, 'd', { locale: pl });
      const monthName = format(d, 'MMMM', { locale: pl }).toLowerCase();

      return [
        { label: 'Nie powtarza się', value: 'Nie powtarza się' },
        { label: 'Codziennie', value: 'Codziennie' },
        { label: `Co tydzień w: ${dayName}`, value: `Co tydzień w: ${dayName}` },
        { label: `Co miesiąc w: 2. ${dayName}`, value: `Co miesiąc w: 2. ${dayName}` },
        { label: `Co rok w dniu: ${dayNum}. ${monthName}`, value: `Co rok w dniu: ${dayNum}. ${monthName}` },
        { label: 'W dni powszednie (od poniedziałku do piątku)', value: 'W dni powszednie (od poniedziałku do piątku)' },
        { label: 'Niestandardowe...', value: 'Niestandardowe...' }
      ];
    } catch {
      return [
        { label: 'Nie powtarza się', value: 'Nie powtarza się' },
        { label: 'Codziennie', value: 'Codziennie' }
      ];
    }
  }, [date]);

  // Dynamiczne pozycjonowanie okienka bezpośrednio obok podglądu klikniętej kratki
  // (Musi być wywołane przed jakimkolwiek wczesnym return null, zgodnie z Rules of Hooks)
  const modalStyle = useMemo(() => {
    if (!initialData?.slotRect) {
      return {
        top: '80px',
        left: '280px'
      };
    }

    const { left: slotLeft, right: slotRight, top: slotTop } = initialData.slotRect;
    const modalWidth = 495;
    const modalHeight = 560;
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1400;
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 900;

    let targetLeft = 0;
    // Jeśli po lewej stronie kratki mieści się okienko: umieść je z lewej od kratki/podglądu
    if (slotLeft - modalWidth - 10 >= 40) {
      targetLeft = slotLeft - modalWidth - 12;
    } else {
      // W przeciwnym razie umieść je z prawej strony kratki/podglądu
      targetLeft = slotRight + 12;
    }

    // Ograniczenie poziome w granicach ekranu
    targetLeft = Math.max(16, Math.min(windowWidth - modalWidth - 16, targetLeft));

    // Wyrównanie pionowe: przesunięte wyżej, aby dolna część okienka nie była obcięta przy kliknięciu nisko
    let targetTop = slotTop - 110;
    targetTop = Math.max(68, Math.min(windowHeight - modalHeight - 32, targetTop));

    return {
      top: `${targetTop}px`,
      left: `${targetLeft}px`
    };
  }, [initialData?.slotRect]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim() && activeTab !== 'Harmonogram spotkań') return;

    setLoading(true);
    try {
      await onSave({
        title: title.trim() || 'Harmonogram spotkań',
        date,
        startTime: isAllDay ? '00:00' : startTime,
        endTime: isAllDay ? '23:59' : endTime,
        isAllDay,
        type: activeTab,
        calendarId: selectedCalendarId,
        color: currentCal.color,
        description,
        location,
        hasMeet,
        invitedEmail: guests,
        isExchangeable: false,
        repeatRule,
        deadlineDate: hasDeadline ? deadlineDate : null
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Błąd podczas zapisywania');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (initialData && initialData.id) {
      onDelete(initialData.id);
      onClose();
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-transparent animate-in fade-in duration-100"
        onClick={onClose}
      >
        {/* Okienko dodawania wydarzenia: umieszczone obok podglądu kratki */}
        <div 
          style={modalStyle}
          className="bg-[#1e1f20] text-[#e3e3e3] rounded-[28px] shadow-2xl w-full max-w-[495px] overflow-visible border-0 animate-in fade-in zoom-in-95 duration-150 fixed z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header bar with drag handle and action icons */}
          <div className="flex items-center justify-between px-6 pt-3.5 pb-1 bg-[#1e1f20] rounded-t-[28px]">
            {/* Uchwyt do przesuwania (=) */}
            <div className="flex flex-col space-y-1 py-1 cursor-grab active:cursor-grabbing text-[#c4c7c5]">
              <div className="w-4 h-0.5 bg-[#c4c7c5] rounded-full" />
              <div className="w-4 h-0.5 bg-[#c4c7c5] rounded-full" />
            </div>
            <div className="flex items-center space-x-1">
              {initialData && initialData.id && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-1.5 text-[#c4c7c5] hover:text-[#f28b82] hover:bg-[#35373a] rounded-full transition"
                  title="Usuń wydarzenie"
                >
                  {/* Google Trash Can ze zdjęcia Image 4 */}
                  <svg className="w-5 h-5 fill-current text-[#c4c7c5] hover:text-[#f28b82] transition" viewBox="0 0 24 24">
                    <path d="M15 4V3H9v1H4v2h1v13c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V6h1V4h-5zm2 15H7V6h10v13zM9 8h2v9H9zm4 0h2v9h-2z" />
                  </svg>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-[#c4c7c5] hover:bg-[#35373a] hover:text-white rounded-full transition"
                title="Zamknij"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="px-6 pb-5 pt-0.5 space-y-3.5">
            {/* Title input: "Dodaj tytuł" (z niebieską kreską jak na zdjęciu) */}
            <div className="pb-0.5">
              <input
                type="text"
                placeholder="Dodaj tytuł"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                autoFocus
                className="w-full text-[22px] font-normal bg-transparent border-0 border-b-2 border-transparent focus:border-[#a8c7fa] text-[#e3e3e3] focus:outline-none placeholder-[#9aa0a6] pb-1 transition"
              />
            </div>

            {/* Pill Tabs: Wydarzenie / Zadanie / Harmonogram spotkań (BEZ napisu Nowość) */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleTabChange('Wydarzenie')}
                className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition whitespace-nowrap shrink-0 ${
                  activeTab === 'Wydarzenie'
                    ? 'bg-[#004a77] text-[#c2e7ff]'
                    : 'text-[#c4c7c5] hover:bg-[#282a2d]'
                }`}
              >
                Wydarzenie
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('Zadanie')}
                className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition whitespace-nowrap shrink-0 ${
                  activeTab === 'Zadanie'
                    ? 'bg-[#004a77] text-[#c2e7ff]'
                    : 'text-[#c4c7c5] hover:bg-[#282a2d]'
                }`}
              >
                Zadanie
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('Harmonogram spotkań')}
                className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition whitespace-nowrap shrink-0 ${
                  activeTab === 'Harmonogram spotkań'
                    ? 'bg-[#004a77] text-[#c2e7ff]'
                    : 'text-[#c4c7c5] hover:bg-[#282a2d]'
                }`}
              >
                <span className="whitespace-nowrap">Harmonogram spotkań</span>
              </button>
            </div>

            {/* ======================================================== */}
            {/* WIDOK: HARMONOGRAM SPOTKAŃ (Zgodny ze zdjęciem Image 3) */}
            {/* ======================================================== */}
            {activeTab === 'Harmonogram spotkań' ? (
              <div className="space-y-4 pt-1 animate-in fade-in duration-100">
                {/* Czas i data z większym paddingiem i jasnym szarym tłem */}
                <div className="flex items-center space-x-4">
                  <Clock className="w-5 h-5 text-[#c4c7c5] shrink-0" />
                  <div className="flex items-center space-x-2 text-sm text-[#e3e3e3]">
                    <div className="relative">
                      <button
                        type="button"
                        className="px-4 py-2 bg-[#303134] hover:bg-[#3c4043] text-[#e3e3e3] rounded-md text-sm font-normal capitalize flex items-center transition"
                      >
                        {formattedDateLabel}
                      </button>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                    <div className="px-4 py-2 bg-[#303134] text-[#e3e3e3] rounded-md text-sm font-normal">
                      {formatTime12h(startTime)} – {formatTime12h(endTime)}
                    </div>
                  </div>
                </div>

                {/* Karta informacyjna jak na zdjęciu Image 3 */}
                <div className="border border-[#444746] rounded-xl p-4 flex items-start space-x-3.5 my-3 bg-[#1e1f20]">
                  <Info className="w-5 h-5 text-[#9aa0a6] mt-0.5 shrink-0" />
                  <div className="space-y-3 text-sm">
                    <p className="text-[#e3e3e3] leading-relaxed">
                      Utwórz stronę rezerwacji, którą możesz udostępnić innym osobom, aby mogły samodzielnie zarezerwować termin spotkania z Tobą
                    </p>
                    <div className="flex items-center space-x-5">
                      <button 
                        type="button" 
                        onClick={() => alert('Harmonogram spotkań pozwala innym na wybór wolnych godzin w Twoim kalendarzu.')}
                        className="text-sm font-medium text-[#a8c7fa] hover:underline"
                      >
                        Jak to działa?
                      </button>
                      <button 
                        type="button" 
                        onClick={() => alert('Więcej informacji o stronach rezerwacji Google Calendar.')}
                        className="text-sm font-medium text-[#a8c7fa] hover:underline"
                      >
                        Więcej informacji
                      </button>
                    </div>
                  </div>
                </div>

                {/* Kreska pozioma */}
                <div className="border-t border-[#3c4043] my-3" />

                {/* Wybór kalendarza */}
                <div className="flex items-center space-x-4 py-1">
                  <svg className="w-5 h-5 text-[#c4c7c5] shrink-0 fill-current" viewBox="0 0 24 24">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                  </svg>
                  <span className="text-sm font-medium text-[#e3e3e3]">{currentCal.name}</span>
                </div>

                {/* Footer dla Harmonogram spotkań: Przycisk Skonfiguruj harmonogram */}
                <div className="flex items-center justify-end pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-[#a8c7fa] hover:bg-[#b8d4ff] text-[#041e49] font-medium rounded-full text-sm transition shadow-sm active:scale-95"
                  >
                    Skonfiguruj harmonogram
                  </button>
                </div>
              </div>
            ) : activeTab === 'Zadanie' ? (
              /* ======================================================== */
              /* WIDOK: ZADANIE (Dokładnie jak na zdjęciu referencyjnym)  */
              /* ======================================================== */
              <div className="space-y-4 pt-1 animate-in fade-in duration-100">
                {/* Row 1: Clock Icon + Date and Time with Subtitle "Nie powtarza się" */}
                <div className="flex items-start space-x-4">
                  <Clock className="w-5 h-5 text-[#c4c7c5] mt-1 shrink-0" />
                  <div className="space-y-1">
                    <div className="flex items-center flex-wrap gap-2 text-sm text-[#e3e3e3]">
                      <div className="relative">
                        <button
                          type="button"
                          className="px-4 py-2 bg-[#303134] hover:bg-[#3c4043] text-[#e3e3e3] rounded-md text-sm font-normal capitalize flex items-center transition"
                        >
                          {formattedDateLabel}
                        </button>
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => handleDateChange(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </div>

                      {!isAllDay && (
                        <>
                          <div className="relative">
                            <button
                              type="button"
                              className="px-4 py-2 bg-[#303134] hover:bg-[#3c4043] text-[#e3e3e3] rounded-md text-sm font-normal transition"
                            >
                              {formatTime12h(startTime)}
                            </button>
                            <input
                              type="time"
                              value={startTime}
                              onChange={(e) => handleStartTimeChange(e.target.value)}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                          </div>

                          <span className="text-[#9aa0a6]">–</span>

                          <div className="relative">
                            <button
                              type="button"
                              className="px-4 py-2 bg-[#303134] hover:bg-[#3c4043] text-[#e3e3e3] rounded-md text-sm font-normal transition"
                            >
                              {formatTime12h(endTime)}
                            </button>
                            <input
                              type="time"
                              value={endTime}
                              onChange={(e) => handleEndTimeChange(e.target.value)}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                          </div>
                        </>
                      )}
                    </div>
                    {/* Dropdown "Nie powtarza się": identyczny jak w Wydarzeniu */}
                    <div className="relative inline-block" ref={repeatMenuRef}>
                      <button
                        type="button"
                        onClick={() => setIsRepeatMenuOpen(!isRepeatMenuOpen)}
                        className={`flex items-center justify-between space-x-2.5 px-3.5 py-2 bg-[#303134] hover:bg-[#3c4043] text-sm text-[#e3e3e3] cursor-pointer transition ${
                          isRepeatMenuOpen 
                            ? 'rounded-t-md border-b-2 border-[#a8c7fa]' 
                            : 'rounded-md'
                        }`}
                      >
                        <span>{repeatRule}</span>
                        {isRepeatMenuOpen ? (
                          <svg className="w-4 h-4 fill-[#a8c7fa] shrink-0" viewBox="0 0 24 24">
                            <path d="M7 14l5-5 5 5z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 fill-[#9aa0a6] shrink-0" viewBox="0 0 24 24">
                            <path d="M7 10l5 5 5-5z" />
                          </svg>
                        )}
                      </button>

                      {/* Menu opcji powtarzania */}
                      {isRepeatMenuOpen && (
                        <div className="absolute left-0 top-full mt-1 w-80 bg-[#282a2d] rounded-md shadow-2xl py-1 z-[80] animate-in fade-in zoom-in-95 duration-100 border border-white/10">
                          {repeatOptions.map((opt, i) => (
                            <div
                              key={i}
                              onClick={() => {
                                setRepeatRule(opt.value);
                                setIsRepeatMenuOpen(false);
                              }}
                              className={`px-4 py-2.5 text-sm cursor-pointer transition select-none ${
                                repeatRule === opt.value
                                  ? 'bg-[#3c4043] text-white font-medium'
                                  : 'text-[#e3e3e3] hover:bg-[#35373a]'
                              }`}
                            >
                              {opt.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 2: Target / Bullseye Icon -> Dodaj termin / Termin chip (Image 1) */}
                <div className="flex items-center space-x-4">
                  <svg className="w-5 h-5 text-[#c4c7c5] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.07 4.93l-1.41 1.41C19.1 7.79 20 9.79 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-2.21.9-4.21 2.34-5.66L4.93 4.93C3.12 6.74 2 9.24 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07zM12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                  {hasDeadline ? (
                    <div className="flex items-center space-x-3 text-sm">
                      <span className="text-[#e3e3e3] font-normal">Termin</span>
                      
                      {/* Przycisk terminu z popupem kalendarza dokładnie jak na zrzucie ekranu */}
                      <div className="relative" ref={deadlinePickerRef}>
                        <button
                          type="button"
                          onClick={handleOpenDeadlinePicker}
                          className={`px-3.5 py-1.5 text-sm font-normal capitalize flex items-center transition cursor-pointer select-none ${
                            isDeadlinePickerOpen
                              ? 'bg-[#3c4043] rounded-t-md border-b-2 border-[#a8c7fa] text-white'
                              : 'bg-[#303134] hover:bg-[#3c4043] rounded-md text-[#e3e3e3]'
                          }`}
                        >
                          <span>{formattedDeadlineLabel}</span>
                          {isDeadlinePickerOpen && (
                            <span className="w-[1.5px] h-4 bg-[#a8c7fa] ml-0.5 animate-pulse" />
                          )}
                        </button>

                        {/* Popup kalendarza do wyboru terminu (1:1 ze zrzutem ekranu Image 1) */}
                        {isDeadlinePickerOpen && (
                          <div className="absolute left-0 top-full mt-0 w-72 bg-[#1e1f20] rounded-b-2xl rounded-tr-2xl shadow-2xl p-4 z-[90] animate-in fade-in zoom-in-95 duration-100 border border-white/10 select-none">
                            {/* Nagłówek miesiąca z nawigacją */}
                            <div className="flex items-center justify-between pb-3 px-1">
                              <span className="text-sm font-semibold text-white capitalize">
                                {format(deadlinePickerMonth, 'LLLL yyyy', { locale: pl })}
                              </span>
                              <div className="flex items-center space-x-1">
                                <button
                                  type="button"
                                  onClick={() => setDeadlinePickerMonth(subMonths(deadlinePickerMonth, 1))}
                                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#35373a] text-[#c4c7c5] hover:text-white transition"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeadlinePickerMonth(addMonths(deadlinePickerMonth, 1))}
                                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#35373a] text-[#c4c7c5] hover:text-white transition"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Dni tygodnia: N P W Ś C P S */}
                            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[#c4c7c5] mb-2">
                              {['N', 'P', 'W', 'Ś', 'C', 'P', 'S'].map((dayChar, i) => (
                                <div key={i} className="py-0.5">{dayChar}</div>
                              ))}
                            </div>

                            {/* Siatka dni miesiąca */}
                            <div className="grid grid-cols-7 gap-1 text-center text-xs">
                              {deadlineCalendarDays.map((d, i) => {
                                const isCurrentMonth = isSameMonth(d, deadlinePickerMonth);
                                const selectedDeadline = deadlineDate ? new Date(deadlineDate + 'T00:00:00') : null;
                                const isSelected = selectedDeadline ? isSameDay(d, selectedDeadline) : false;
                                const isToday = isSameDay(d, new Date());

                                let dayClass = 'text-white hover:bg-[#35373a]';
                                if (!isCurrentMonth) {
                                  dayClass = 'text-[#70757a] hover:bg-[#35373a]';
                                }
                                if (isSelected) {
                                  dayClass = 'bg-[#004a77] text-white font-bold';
                                } else if (isToday) {
                                  dayClass = 'bg-[#a8c7fa] text-[#041e49] font-bold';
                                }

                                return (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                      const pickedStr = format(d, 'yyyy-MM-dd');
                                      setDeadlineDate(pickedStr);
                                      setIsDeadlinePickerOpen(false);
                                    }}
                                    className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center transition shrink-0 ${dayClass}`}
                                  >
                                    {format(d, 'd')}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Przycisk X usuwający termin */}
                      <button
                        type="button"
                        onClick={() => {
                          setHasDeadline(false);
                          setDeadlineDate('');
                          setIsDeadlinePickerOpen(false);
                        }}
                        className="p-1 text-[#c4c7c5] hover:text-white hover:bg-[#35373a] rounded-full transition"
                        title="Usuń termin"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setHasDeadline(true);
                        let defaultD = date;
                        try {
                          const nextDay = new Date(date + 'T00:00:00');
                          nextDay.setDate(nextDay.getDate() + 1);
                          defaultD = format(nextDay, 'yyyy-MM-dd');
                          setDeadlineDate(defaultD);
                          setDeadlinePickerMonth(nextDay);
                        } catch {
                          setDeadlineDate(date);
                          setDeadlinePickerMonth(new Date());
                        }
                        setIsDeadlinePickerOpen(true);
                      }}
                      className="text-sm text-[#c4c7c5] hover:text-white transition text-left"
                    >
                      Dodaj termin
                    </button>
                  )}
                </div>

                {/* Row 3: Notes / Description Icon -> Dodaj opis lub załącznik z Dysku Google */}
                <div className="flex items-center space-x-4">
                  <svg className="w-5 h-5 text-[#c4c7c5] shrink-0 fill-current" viewBox="0 0 24 24">
                    <path d="M3 18h12v-2H3v2zM3 6v2h18V6H3zm0 7h18v-2H3v2z" />
                  </svg>
                  {showDescInput ? (
                    <textarea
                      rows={2}
                      placeholder="Dodaj opis..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-[#303134] border-0 rounded-lg p-2.5 text-sm text-[#e3e3e3] placeholder-[#9aa0a6] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowDescInput(true)}
                      className="text-sm text-[#c4c7c5] hover:text-white transition text-left"
                    >
                      Dodaj opis lub załącznik z Dysku Google
                    </button>
                  )}
                </div>

                {/* Row 4: Bullet List Icon -> Dropdown "Moje zadania ▼" */}
                <div className="flex items-center space-x-4">
                  <svg className="w-5 h-5 text-[#c4c7c5] shrink-0 fill-current" viewBox="0 0 24 24">
                    <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
                  </svg>
                  <div className="relative">
                    <button
                      type="button"
                      className="flex items-center space-x-2 px-4 py-2 bg-[#303134] hover:bg-[#3c4043] text-sm text-[#e3e3e3] rounded-md transition"
                    >
                      <span>Moje zadania</span>
                      <ChevronDown className="w-4 h-4 text-[#c4c7c5]" />
                    </button>
                  </div>
                </div>

                {/* Row 5: Calendar Icon -> kodex + blue dot + subtitle "Wolny • Prywatny" */}
                <div className="flex items-start space-x-4">
                  <svg className="w-5 h-5 text-[#c4c7c5] mt-0.5 shrink-0 fill-current" viewBox="0 0 24 24">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                  </svg>
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-[#e3e3e3]">{currentCal.name}</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1a73e8] shrink-0" />
                    </div>
                    <span className="text-xs text-[#9aa0a6] mt-0.5">
                      Wolny • Prywatny
                    </span>
                  </div>
                </div>

                {/* Footer dla Zadanie: Przycisk Zapisz */}
                <div className="flex items-center justify-end pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-[#a8c7fa] hover:bg-[#b8d4ff] text-[#041e49] font-medium rounded-full text-sm transition shadow-sm active:scale-95"
                  >
                    Zapisz
                  </button>
                </div>
              </div>
            ) : (
              /* ======================================================== */
              /* WIDOK: WYDARZENIE (Zgodny ze zdjęciami Image 1 i 2)       */
              /* ======================================================== */
              <>
                <div className="space-y-4 pt-1">
                  {/* Row 1: Clock Icon + Date and Time Chips (większy padding, jasny szary) */}
                  <div className="flex items-start space-x-4">
                    <Clock className="w-5 h-5 text-[#c4c7c5] mt-1 shrink-0" />
                    <div className="flex-1 space-y-2.5">
                      <div className="flex items-center flex-wrap gap-2 text-sm text-[#e3e3e3]">
                        {/* Chip Daty: większy padding, jaśniejszy szary */}
                        <div className="relative">
                          <button
                            type="button"
                            className="px-4 py-2 bg-[#303134] hover:bg-[#3c4043] text-[#e3e3e3] rounded-md text-sm font-normal capitalize flex items-center transition"
                          >
                            {formattedDateLabel}
                          </button>
                          <input
                            type="date"
                            value={date}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                        </div>

                        {!isAllDay && (
                          <>
                            {/* Chip Czasu od: np. 1:00am jak na zdjęciu Image 2 */}
                            <div className="relative">
                              <button
                                type="button"
                                className="px-4 py-2 bg-[#303134] hover:bg-[#3c4043] text-[#e3e3e3] rounded-md text-sm font-normal transition"
                              >
                                {formatTime12h(startTime)}
                              </button>
                              <input
                                type="time"
                                value={startTime}
                                onChange={(e) => handleStartTimeChange(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              />
                            </div>

                            <span className="text-[#9aa0a6]">–</span>

                            {/* Chip Czasu do: np. 2:00am jak na zdjęciu Image 2 */}
                            <div className="relative">
                              <button
                                type="button"
                                className="px-4 py-2 bg-[#303134] hover:bg-[#3c4043] text-[#e3e3e3] rounded-md text-sm font-normal transition"
                              >
                                {formatTime12h(endTime)}
                              </button>
                              <input
                                type="time"
                                value={endTime}
                                onChange={(e) => handleEndTimeChange(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {/* Cały dzień + Strefa czasowa + Nie powtarza się */}
                      <div className="flex items-center space-x-4 pt-0.5 flex-wrap gap-y-2 text-sm">
                        {/* Checkbox: bez białego tła, szary grubszy border, większy checkbox */}
                        <label className="flex items-center space-x-2.5 text-sm text-[#e3e3e3] cursor-pointer select-none group">
                          <div 
                            onClick={() => setIsAllDay(!isAllDay)}
                            className={`w-5 h-5 rounded-[3px] flex items-center justify-center transition cursor-pointer ${
                              isAllDay 
                                ? 'bg-[#8ab4f8] border-2 border-[#8ab4f8]' 
                                : 'bg-transparent border-2 border-[#8e918f] group-hover:border-[#c4c7c5]'
                            }`}
                          >
                            {isAllDay && (
                              <svg className="w-3.5 h-3.5 text-[#041e49] stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span onClick={() => setIsAllDay(!isAllDay)}>Cały dzień</span>
                        </label>

                        {/* Strefa czasowa: zaokrąglony przezroczysty hover w kolorze napisu */}
                        <button 
                          type="button" 
                          onClick={() => setIsTimeZoneModalOpen(true)}
                          className="text-sm font-medium text-[#a8c7fa] hover:bg-[#a8c7fa]/15 rounded-full px-2.5 py-1 transition cursor-pointer"
                        >
                          Strefa czasowa
                        </button>
                      </div>

                      {/* Dropdown "Nie powtarza się": ze strzałką caret solid i niebieską kreską jak na zdjęciu Image 3 */}
                      <div className="relative inline-block" ref={repeatMenuRef}>
                        <button
                          type="button"
                          onClick={() => setIsRepeatMenuOpen(!isRepeatMenuOpen)}
                          className={`flex items-center justify-between space-x-2.5 px-3.5 py-2 bg-[#303134] hover:bg-[#3c4043] text-sm text-[#e3e3e3] cursor-pointer transition ${
                            isRepeatMenuOpen 
                              ? 'rounded-t-md border-b-2 border-[#a8c7fa]' 
                              : 'rounded-md'
                          }`}
                        >
                          <span>{repeatRule}</span>
                          {isRepeatMenuOpen ? (
                            <svg className="w-4 h-4 fill-[#a8c7fa] shrink-0" viewBox="0 0 24 24">
                              <path d="M7 14l5-5 5 5z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 fill-[#9aa0a6] shrink-0" viewBox="0 0 24 24">
                              <path d="M7 10l5 5 5-5z" />
                            </svg>
                          )}
                        </button>

                        {/* Menu opcji powtarzania (dokładnie jak na zdjęciu Image 3) */}
                        {isRepeatMenuOpen && (
                          <div className="absolute left-0 top-full mt-1 w-80 bg-[#282a2d] rounded-md shadow-2xl py-1 z-[80] animate-in fade-in zoom-in-95 duration-100 border border-white/10">
                            {repeatOptions.map((opt, i) => (
                              <div
                                key={i}
                                onClick={() => {
                                  setRepeatRule(opt.value);
                                  setIsRepeatMenuOpen(false);
                                }}
                                className={`px-4 py-2.5 text-sm cursor-pointer transition select-none ${
                                  repeatRule === opt.value
                                    ? 'bg-[#3c4043] text-white font-medium'
                                    : 'text-[#e3e3e3] hover:bg-[#35373a]'
                                }`}
                              >
                                {opt.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Users Icon -> Dodaj gości (Ikonka Google Material ze zdjęcia Image 1) */}
                  <div className="flex items-center space-x-4">
                    <svg className="w-5 h-5 text-[#c4c7c5] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      <path d="M9 13c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4zm-6 5c.2-.71 3.3-2 6-2 2.69 0 5.78 1.28 6 2H3z" />
                      <path d="M16.5 12c1.38 0 2.5-1.12 2.5-2.5S17.88 7 16.5 7c-.3 0-.58.05-.85.15.53.7.85 1.57.85 2.52s-.32 1.82-.85 2.52c.27.1.55.15.85.15z" />
                      <path d="M18 14.5c1.86.32 4 1.35 4 2.5v3h-3v-2c0-.79-.3-1.52-.79-2.07.61-.17 1.24-.31 1.79-.43z" />
                    </svg>
                    {showGuestInput ? (
                      <input
                        type="email"
                        placeholder="Wpisz Gmail gościa..."
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="w-full bg-[#303134] border-0 rounded-lg px-3.5 py-2 text-sm text-[#e3e3e3] placeholder-[#9aa0a6] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowGuestInput(true)}
                        className="text-sm text-[#c4c7c5] hover:text-white transition text-left"
                      >
                        Dodaj gości
                      </button>
                    )}
                  </div>

                  {/* Row 3: Video Icon (Google Meet) -> Dodaj rozmowę wideo w Google Meet */}
                  <div className="flex items-center space-x-4">
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#fbbc04">
                      <path d="M17 10.5V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.5l4 4v-11l-4 4z" />
                    </svg>
                    <button
                      type="button"
                      onClick={() => setHasMeet(!hasMeet)}
                      className="text-sm text-[#c4c7c5] hover:text-white transition text-left flex items-center space-x-2"
                    >
                      <span>{hasMeet ? 'Dołączono Google Meet' : 'Dodaj rozmowę wideo w Google Meet'}</span>
                      {hasMeet && <span className="text-xs text-[#81c995]">✓</span>}
                    </button>
                  </div>

                  {/* Row 4: MapPin Icon -> Dodaj lokalizację (Google Material Location Pin) */}
                  <div className="flex items-center space-x-4">
                    <svg className="w-5 h-5 text-[#c4c7c5] shrink-0 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    {showLocationInput ? (
                      <input
                        type="text"
                        placeholder="Wpisz lokalizację..."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-[#303134] border-0 rounded-lg px-3.5 py-2 text-sm text-[#e3e3e3] placeholder-[#9aa0a6] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowLocationInput(true)}
                        className="text-sm text-[#c4c7c5] hover:text-white transition text-left"
                      >
                        Dodaj lokalizację
                      </button>
                    )}
                  </div>

                  {/* Row 5: Description Icon -> Dodaj opis lub załącznik z Dysku Google (Google Material notes) */}
                  <div className="flex items-center space-x-4">
                    <svg className="w-5 h-5 text-[#c4c7c5] shrink-0 fill-current" viewBox="0 0 24 24">
                      <path d="M3 18h12v-2H3v2zM3 6v2h18V6H3zm0 7h18v-2H3v2z" />
                    </svg>
                    {showDescInput ? (
                      <textarea
                        rows={2}
                        placeholder="Dodaj opis..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-[#303134] border-0 rounded-lg p-2.5 text-sm text-[#e3e3e3] placeholder-[#9aa0a6] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowDescInput(true)}
                        className="text-sm text-[#c4c7c5] hover:text-white transition text-left"
                      >
                        Dodaj opis lub załącznik z Dysku Google
                      </button>
                    )}
                  </div>

                  {/* Row 6: Calendar Icon + Calendar Name + Settings Subtitle (Google Material calendar) */}
                  <div className="flex items-start space-x-4">
                    <svg className="w-5 h-5 text-[#c4c7c5] mt-0.5 shrink-0 fill-current" viewBox="0 0 24 24">
                      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                    </svg>
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-[#e3e3e3]">{currentCal.name}</span>
                        <span 
                          className="w-3 h-3 rounded-full shrink-0" 
                          style={{ backgroundColor: currentCal.color }}
                        />
                      </div>
                      <span className="text-xs text-[#9aa0a6] mt-0.5">
                        Zajęty • Widoczność domyślna • Powiadom 30 minut wcześniej
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Footer: USUNIĘTO "Więcej opcji", tylko "Zapisz" po prawej */}
                <div className="flex items-center justify-end pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-[#a8c7fa] hover:bg-[#b8d4ff] text-[#041e49] font-medium rounded-full text-sm transition shadow-sm disabled:opacity-50 active:scale-95"
                  >
                    {loading ? 'Zapisywanie...' : 'Zapisz'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Modal wyboru strefy czasowej (Image 2) */}
      <TimeZoneModal
        isOpen={isTimeZoneModalOpen}
        onClose={() => setIsTimeZoneModalOpen(false)}
      />
    </>
  );
}
