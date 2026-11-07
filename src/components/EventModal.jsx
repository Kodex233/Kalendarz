import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowLeftRight
} from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  currentUserId,
  eventType = 'Wydarzenie',
  myCalendars = []
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
  const [isExchangeable, setIsExchangeable] = useState(false);
  const [loading, setLoading] = useState(false);

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
      setIsExchangeable(initialData.isExchangeable || false);
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
      setIsExchangeable(false);
    }
  }, [initialData, isOpen]);

  const formattedDateLabel = useMemo(() => {
    try {
      if (!date) return 'Wybierz datę';
      const d = new Date(date + 'T00:00:00');
      return format(d, 'EEEE, d MMMM', { locale: pl });
    } catch {
      return date;
    }
  }, [date]);

  if (!isOpen) return null;

  const currentCal = myCalendars.find(c => c.id === selectedCalendarId) || { name: 'kodex', color: '#1a73e8' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onSave({
        title,
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
        isExchangeable
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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent animate-in fade-in duration-100"
      onClick={onClose}
    >
      {/* Okienko dodawania wydarzenia o optymalnym rozmiarze max-w-[448px] (zgodnie ze zdjęciem) */}
      <div 
        className="bg-[#1e1f20] text-[#e3e3e3] rounded-[28px] shadow-2xl w-full max-w-[448px] overflow-hidden border border-[#303134] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header bar with drag handle and action icons */}
        <div className="flex items-center justify-between px-6 pt-4 pb-1 bg-[#1e1f20]">
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
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-1 space-y-4">
          {/* Title input: "Dodaj tytuł" */}
          <div className="pb-0.5">
            <input
              type="text"
              placeholder="Dodaj tytuł"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="w-full text-[22px] font-normal bg-transparent border-0 border-b border-transparent focus:border-[#8ab4f8] text-[#e3e3e3] focus:outline-none placeholder-[#9aa0a6] pb-1 transition"
            />
          </div>

          {/* Pill Tabs: [ Wydarzenie ] [ Zadanie ] [ Harmonogram spotkań Nowość ] */}
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('Wydarzenie')}
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition ${
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
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition ${
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
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium flex items-center space-x-1.5 transition ${
                activeTab === 'Harmonogram spotkań'
                  ? 'bg-[#004a77] text-[#c2e7ff]'
                  : 'text-[#c4c7c5] hover:bg-[#282a2d]'
              }`}
            >
              <span>Harmonogram spotkań</span>
              <span className="text-[10px] font-bold bg-[#0b57d0] text-[#c2e7ff] px-1.5 py-0.5 rounded-full">
                Nowość
              </span>
            </button>
          </div>

          {/* Row 1: Clock Icon + Date and Time Chips (zgodnie ze zdjęciem) */}
          <div className="flex items-start space-x-3.5 pt-1">
            <Clock className="w-5 h-5 text-[#c4c7c5] mt-1 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center flex-wrap gap-2 text-sm text-[#e3e3e3]">
                {/* Chip Daty */}
                <div className="relative">
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-[#282a2d] hover:bg-[#35373a] text-[#e3e3e3] rounded-md text-sm font-normal capitalize flex items-center transition"
                  >
                    {formattedDateLabel}
                  </button>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>

                {!isAllDay && (
                  <>
                    {/* Chip Czasu od */}
                    <div className="relative">
                      <button
                        type="button"
                        className="px-3 py-1.5 bg-[#282a2d] hover:bg-[#35373a] text-[#e3e3e3] rounded-md text-sm font-normal transition"
                      >
                        {startTime}
                      </button>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>

                    <span className="text-[#9aa0a6]">–</span>

                    {/* Chip Czasu do */}
                    <div className="relative">
                      <button
                        type="button"
                        className="px-3 py-1.5 bg-[#282a2d] hover:bg-[#35373a] text-[#e3e3e3] rounded-md text-sm font-normal transition"
                      >
                        {endTime}
                      </button>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Cały dzień + Strefa czasowa */}
              <div className="flex items-center space-x-5 pt-0.5">
                <label className="flex items-center space-x-2 text-sm text-[#e3e3e3] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAllDay}
                    onChange={(e) => setIsAllDay(e.target.checked)}
                    className="w-4 h-4 rounded-[3px] bg-[#282a2d] border border-[#5f6368] text-[#8ab4f8] focus:ring-0 cursor-pointer"
                  />
                  <span>Cały dzień</span>
                </label>

                <button 
                  type="button" 
                  onClick={() => alert('Strefa czasowa: GMT+01:00 Czas środkowoeuropejski')}
                  className="text-sm text-[#8ab4f8] hover:underline font-medium"
                >
                  Strefa czasowa
                </button>
              </div>

              {/* Nie powtarza się ▾ */}
              <div className="pt-0.5">
                <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-[#282a2d] hover:bg-[#35373a] rounded-md text-sm text-[#e3e3e3] cursor-pointer transition">
                  <span>Nie powtarza się</span>
                  <ChevronDown className="w-4 h-4 text-[#9aa0a6]" />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Users Icon -> Dodaj gości */}
          <div className="flex items-center space-x-3.5 pt-0.5">
            <Users className="w-5 h-5 text-[#c4c7c5] shrink-0" />
            {showGuestInput ? (
              <input
                type="email"
                placeholder="Wpisz Gmail gościa..."
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full bg-[#282a2d] border-0 rounded-lg px-3 py-1.5 text-sm text-[#e3e3e3] placeholder-[#9aa0a6] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
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
          <div className="flex items-center space-x-3.5 pt-0.5">
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
          <div className="flex items-center space-x-3.5 pt-0.5">
            <MapPin className="w-5 h-5 text-[#c4c7c5] shrink-0" />
            {showLocationInput ? (
              <input
                type="text"
                placeholder="Wpisz lokalizację lub salę..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#282a2d] border-0 rounded-lg px-3 py-1.5 text-sm text-[#e3e3e3] placeholder-[#9aa0a6] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
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

          {/* Row 5: Description Icon -> Dodaj opis */}
          <div className="flex items-center space-x-3.5 pt-0.5">
            <AlignLeft className="w-5 h-5 text-[#c4c7c5] shrink-0" />
            {showDescInput ? (
              <textarea
                rows={2}
                placeholder="Dodaj opis..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#282a2d] border-0 rounded-lg p-2.5 text-sm text-[#e3e3e3] placeholder-[#9aa0a6] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
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

          {/* Row 6: Calendar Icon + Calendar Name + Notifications */}
          <div className="flex items-start space-x-3.5 pt-0.5">
            <CalendarIcon className="w-5 h-5 text-[#c4c7c5] mt-0.5 shrink-0" />
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-[#e3e3e3]">{currentCal.name}</span>
                <span 
                  className="w-3 h-3 rounded-full shrink-0" 
                  style={{ backgroundColor: currentCal.color }}
                />
              </div>
              <p className="text-xs text-[#9aa0a6]">
                Zajęty • Widoczność domyślna • Powiadom 30 minut wcześniej
              </p>
            </div>
          </div>

          {/* Optional Exchange Checkbox */}
          <div className="flex items-center space-x-2 pt-0.5 pl-8">
            <input
              type="checkbox"
              id="exchangeToggle"
              checked={isExchangeable}
              onChange={(e) => setIsExchangeable(e.target.checked)}
              className="w-4 h-4 rounded-[3px] bg-[#282a2d] border border-[#5f6368] text-[#8ab4f8] focus:ring-0 cursor-pointer"
            />
            <label htmlFor="exchangeToggle" className="text-xs text-[#9aa0a6] cursor-pointer flex items-center space-x-1.5 hover:text-[#e3e3e3]">
              <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
              <span>Udostępnij ten termin na wymianę ze znajomym</span>
            </label>
          </div>

          {/* Bottom Footer: Więcej opcji on left, Zapisz on right */}
          <div className="flex items-center justify-between pt-4 border-t border-[#303134]">
            <button
              type="button"
              onClick={() => {
                setShowGuestInput(true);
                setShowLocationInput(true);
                setShowDescInput(true);
              }}
              className="text-sm font-medium text-[#8ab4f8] hover:text-[#aecbfa] transition px-2 py-1"
            >
              Więcej opcji
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#a8c7fa] hover:bg-[#b8d4ff] text-[#041e49] font-medium rounded-full text-sm transition shadow-sm disabled:opacity-50 active:scale-95"
            >
              {loading ? 'Zapisywanie...' : 'Zapisz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
