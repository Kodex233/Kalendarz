import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, 
  Trash2, 
  Clock, 
  Users, 
  Video, 
  MapPin, 
  AlignLeft, 
  Calendar as CalendarIcon, 
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
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
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('10:30');
  const [endTime, setEndTime] = useState('11:30');
  const [isAllDay, setIsAllDay] = useState(false);
  const [guests, setGuests] = useState('');
  const [showGuestInput, setShowGuestInput] = useState(false);
  const [hasMeet, setHasMeet] = useState(false);
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [description, setDescription] = useState('');
  const [showDescInput, setShowDescInput] = useState(false);
  const [selectedCalendarId, setSelectedCalendarId] = useState('kodex');
  const [loading, setLoading] = useState(false);

  // Timezone and Repeat states
  const [isTimeZoneModalOpen, setIsTimeZoneModalOpen] = useState(false);
  const [isRepeatMenuOpen, setIsRepeatMenuOpen] = useState(false);
  const [repeatRule, setRepeatRule] = useState('Nie powtarza się');
  const repeatMenuRef = useRef(null);

  useEffect(() => {
    setActiveTab(eventType || 'Wydarzenie');
  }, [eventType]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      setStartTime(initialData.startTime || '10:30');
      setEndTime(initialData.endTime || '11:30');
      setIsAllDay(Boolean(initialData.isAllDay));
      setGuests(initialData.invitedEmail || '');
      setShowGuestInput(Boolean(initialData.invitedEmail));
      setLocation(initialData.location || '');
      setShowLocationInput(Boolean(initialData.location));
      setDescription(initialData.description || '');
      setShowDescInput(Boolean(initialData.description));
      setSelectedCalendarId(initialData.calendarId || 'kodex');
      setRepeatRule('Nie powtarza się');
      if (initialData.type) setActiveTab(initialData.type);
    } else {
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setStartTime('10:30');
      setEndTime('11:30');
      setIsAllDay(false);
      setGuests('');
      setShowGuestInput(false);
      setHasMeet(false);
      setLocation('');
      setShowLocationInput(false);
      setDescription('');
      setShowDescInput(false);
      setSelectedCalendarId('kodex');
      setRepeatRule('Nie powtarza się');
    }
  }, [initialData, isOpen]);

  // Close repeat dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (repeatMenuRef.current && !repeatMenuRef.current.contains(e.target)) {
        setIsRepeatMenuOpen(false);
      }
    };
    if (isRepeatMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isRepeatMenuOpen]);

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

  const currentCal = myCalendars.find(c => c.id === selectedCalendarId) || { name: 'kodex', color: '#1a73e8' };

  // Formatted date chip text
  const formattedDateLabel = useMemo(() => {
    try {
      if (!date) return 'Wybierz datę';
      const d = new Date(date + 'T00:00:00');
      return format(d, 'EEEE, d MMMM', { locale: pl });
    } catch {
      return date;
    }
  }, [date]);

  // Repeat menu options matching image 1
  const repeatOptions = useMemo(() => {
    try {
      const d = new Date((date || new Date().toISOString().split('T')[0]) + 'T00:00:00');
      const dayName = format(d, 'EEEE', { locale: pl });
      const dayNum = format(d, 'd', { locale: pl });
      const monthName = format(d, 'MMMM', { locale: pl });

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
        repeatRule
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

  // Determine modal placement to the left of the clicked column (Image 4)
  const isShiftedLeft = initialData && (initialData.dayIndex !== undefined ? initialData.dayIndex >= 2 : true);

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-transparent animate-in fade-in duration-100"
        onClick={onClose}
      >
        {/* Okienko dodawania wydarzenia: przesunięte z lewej od dodawanej kratki (Image 4) */}
        <div 
          className={`bg-[#1e1f20] text-[#e3e3e3] rounded-[28px] shadow-2xl w-full max-w-[495px] overflow-hidden border-0 animate-in fade-in zoom-in-95 duration-150 absolute ${
            isShiftedLeft 
              ? 'sm:left-[275px] sm:top-16 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:translate-x-0 sm:translate-y-0' 
              : 'sm:left-[460px] sm:top-16 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:translate-x-0 sm:translate-y-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header bar with drag handle and action icons */}
          <div className="flex items-center justify-between px-6 pt-3.5 pb-1 bg-[#1e1f20]">
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
                  <Trash2 className="w-4 h-4" />
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
                onClick={() => setActiveTab('Wydarzenie')}
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
                onClick={() => setActiveTab('Zadanie')}
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
                onClick={() => setActiveTab('Harmonogram spotkań')}
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
                      {startTime} – {endTime}
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
                  <CalendarIcon className="w-5 h-5 text-[#c4c7c5] shrink-0" />
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
            ) : (
              /* ======================================================== */
              /* WIDOK: WYDARZENIE / ZADANIE (Zgodny z Image 1 i Image 4)   */
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
                            {/* Chip Czasu od: większy padding, jaśniejszy szary */}
                            <div className="relative">
                              <button
                                type="button"
                                className="px-4 py-2 bg-[#303134] hover:bg-[#3c4043] text-[#e3e3e3] rounded-md text-sm font-normal transition"
                              >
                                {startTime}
                              </button>
                              <input
                                type="time"
                                value={startTime}
                                onChange={(e) => handleStartTimeChange(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              />
                            </div>

                            <span className="text-[#9aa0a6]">–</span>

                            {/* Chip Czasu do: większy padding, jaśniejszy szary */}
                            <div className="relative">
                              <button
                                type="button"
                                className="px-4 py-2 bg-[#303134] hover:bg-[#3c4043] text-[#e3e3e3] rounded-md text-sm font-normal transition"
                              >
                                {endTime}
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
                        {/* Checkbox z lekko grubym szarym borderem (border-2 border-[#8e918f]) */}
                        <label className="flex items-center space-x-2.5 text-sm text-[#e3e3e3] cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isAllDay}
                            onChange={(e) => setIsAllDay(e.target.checked)}
                            className="w-4.5 h-4.5 rounded-[3px] bg-transparent border-2 border-[#8e918f] text-[#8ab4f8] focus:ring-0 cursor-pointer"
                          />
                          <span>Cały dzień</span>
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

                      {/* Dropdown "Nie powtarza się": większy padding, jasny szary, niebieska kreska i pełna lista jak na zdjęciu Image 1 */}
                      <div className="relative inline-block" ref={repeatMenuRef}>
                        <button
                          type="button"
                          onClick={() => setIsRepeatMenuOpen(!isRepeatMenuOpen)}
                          className={`flex items-center justify-between space-x-2 px-3.5 py-2 bg-[#303134] hover:bg-[#3c4043] text-sm text-[#e3e3e3] cursor-pointer transition ${
                            isRepeatMenuOpen 
                              ? 'rounded-t-md border-b-2 border-[#a8c7fa]' 
                              : 'rounded-md'
                          }`}
                        >
                          <span>{repeatRule}</span>
                          {isRepeatMenuOpen ? (
                            <ChevronUp className="w-4 h-4 text-[#a8c7fa]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#9aa0a6]" />
                          )}
                        </button>

                        {/* Menu opcji powtarzania (Image 1) */}
                        {isRepeatMenuOpen && (
                          <div className="absolute left-0 top-full mt-0 w-80 bg-[#282a2d] rounded-b-md shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100 border border-white/5">
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

                  {/* Row 2: Users Icon -> Dodaj gości */}
                  <div className="flex items-center space-x-4">
                    <Users className="w-5 h-5 text-[#c4c7c5] shrink-0" />
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

                  {/* Row 3: Video Icon (Meet) -> Dodaj rozmowę wideo w Google Meet */}
                  <div className="flex items-center space-x-4">
                    <Video className="w-5 h-5 text-[#fbbc04] shrink-0" />
                    <button
                      type="button"
                      onClick={() => setHasMeet(!hasMeet)}
                      className="text-sm text-[#c4c7c5] hover:text-white transition text-left flex items-center space-x-2"
                    >
                      <span>{hasMeet ? 'Dołączono Google Meet' : 'Dodaj rozmowę wideo w Google Meet'}</span>
                      {hasMeet && <span className="text-xs text-[#81c995]">✓</span>}
                    </button>
                  </div>

                  {/* Row 4: MapPin Icon -> Dodaj lokalizację */}
                  <div className="flex items-center space-x-4">
                    <MapPin className="w-5 h-5 text-[#c4c7c5] shrink-0" />
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

                  {/* Row 5: Description Icon -> Dodaj opis lub załącznik z Dysku Google */}
                  <div className="flex items-center space-x-4">
                    <AlignLeft className="w-5 h-5 text-[#c4c7c5] shrink-0" />
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

                  {/* Row 6: Calendar Icon + Calendar Name + Settings Subtitle (jak na zdjeciu) */}
                  <div className="flex items-start space-x-4">
                    <CalendarIcon className="w-5 h-5 text-[#c4c7c5] mt-0.5 shrink-0" />
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
