import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Clock, 
  Users, 
  Video, 
  MapPin, 
  AlignLeft, 
  Calendar as CalendarIcon, 
  GripHorizontal,
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
        startTime,
        endTime,
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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Większe okienko z edycją wydarzenia: max-w-2xl z przestronnym układem */}
      <div className="bg-[#1e1f20] text-[#e3e3e3] rounded-[28px] shadow-2xl w-full max-w-2xl overflow-hidden border border-[#303134] animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header bar with drag handle and action icons */}
        <div className="flex items-center justify-between px-7 pt-5 pb-2 bg-[#1e1f20]">
          <div className="text-[#9aa0a6] cursor-grab active:cursor-grabbing">
            <GripHorizontal className="w-5 h-5 text-[#9aa0a6]" />
          </div>
          <div className="flex items-center space-x-1">
            {initialData && initialData.id && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-2 text-[#9aa0a6] hover:text-[#f28b82] hover:bg-[#282a2d] rounded-full transition"
                title="Usuń wydarzenie"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-[#9aa0a6] hover:bg-[#282a2d] hover:text-[#e3e3e3] rounded-full transition"
              title="Zamknij"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-7 pb-7 pt-2 space-y-5">
          {/* Title input with blue bottom underline */}
          <div className="pb-1">
            <input
              type="text"
              placeholder="Dodaj tytuł"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="w-full text-2xl font-normal bg-transparent border-0 border-b-2 border-[#8ab4f8] pb-2 text-[#e3e3e3] focus:outline-none placeholder-[#9aa0a6] transition"
            />
          </div>

          {/* Pill Tabs: [ Wydarzenie ] [ Zadanie ] [ Harmonogram spotkań Nowość ] */}
          <div className="flex items-center space-x-2 pt-1 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('Wydarzenie')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${
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
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${
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
              className={`px-5 py-2 rounded-full text-sm font-medium flex items-center space-x-1.5 transition ${
                activeTab === 'Harmonogram spotkań'
                  ? 'bg-[#004a77] text-[#c2e7ff]'
                  : 'text-[#c4c7c5] hover:bg-[#282a2d]'
              }`}
            >
              <span>Harmonogram spotkań</span>
              <span className="text-[10px] font-bold bg-[#284777] text-[#a8c7fa] px-1.5 py-0.5 rounded">
                Nowość
              </span>
            </button>
          </div>

          {/* Row 1: Clock Icon + Date and Time */}
          <div className="flex items-start space-x-4 py-1">
            <Clock className="w-5 h-5 text-[#9aa0a6] mt-1 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center flex-wrap gap-2 text-sm text-[#e3e3e3]">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-[#282a2d] text-[#e3e3e3] border-0 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
                />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-[#282a2d] text-[#e3e3e3] border-0 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
                />
                <span className="text-[#9aa0a6]">–</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-[#282a2d] text-[#e3e3e3] border-0 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
                />
              </div>
              <p className="text-xs text-[#9aa0a6]">
                Strefa czasowa • Nie powtarza się
              </p>
            </div>
          </div>

          {/* Row 2: Users Icon -> Dodaj gości */}
          <div className="flex items-center space-x-4 py-1">
            <Users className="w-5 h-5 text-[#9aa0a6] shrink-0" />
            {showGuestInput ? (
              <input
                type="email"
                placeholder="Wpisz Gmail gościa..."
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full bg-[#282a2d] border-0 rounded-lg px-3.5 py-2 text-sm text-[#e3e3e3] placeholder-[#9aa0a6] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowGuestInput(true)}
                className="text-sm text-[#9aa0a6] hover:text-[#e3e3e3] transition text-left"
              >
                Dodaj gości
              </button>
            )}
          </div>

          {/* Row 3: Video Icon -> Dodaj rozmowę wideo w Google Meet */}
          <div className="flex items-center space-x-4 py-1">
            <div className="w-5 h-5 rounded flex items-center justify-center bg-[#ea4335] text-white shrink-0">
              <Video className="w-3.5 h-3.5 text-white" />
            </div>
            <button
              type="button"
              onClick={() => setHasMeet(!hasMeet)}
              className="text-sm text-[#9aa0a6] hover:text-[#e3e3e3] transition text-left flex items-center space-x-2"
            >
              <span>{hasMeet ? 'Dołączono Google Meet' : 'Dodaj rozmowę wideo w Google Meet'}</span>
              {hasMeet && <span className="text-xs text-[#81c995]">✓</span>}
            </button>
          </div>

          {/* Row 4: MapPin Icon -> Dodaj lokalizację */}
          <div className="flex items-center space-x-4 py-1">
            <MapPin className="w-5 h-5 text-[#9aa0a6] shrink-0" />
            {showLocationInput ? (
              <input
                type="text"
                placeholder="Wpisz lokalizację lub salę..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#282a2d] border-0 rounded-lg px-3.5 py-2 text-sm text-[#e3e3e3] placeholder-[#9aa0a6] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowLocationInput(true)}
                className="text-sm text-[#9aa0a6] hover:text-[#e3e3e3] transition text-left"
              >
                Dodaj lokalizację
              </button>
            )}
          </div>

          {/* Row 5: Description Icon -> Dodaj opis */}
          <div className="flex items-center space-x-4 py-1">
            <AlignLeft className="w-5 h-5 text-[#9aa0a6] shrink-0" />
            {showDescInput ? (
              <textarea
                rows={3}
                placeholder="Dodaj opis..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#282a2d] border-0 rounded-lg p-3 text-sm text-[#e3e3e3] placeholder-[#9aa0a6] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowDescInput(true)}
                className="text-sm text-[#9aa0a6] hover:text-[#e3e3e3] transition text-left"
              >
                Dodaj opis lub załącznik z Dysku Google
              </button>
            )}
          </div>

          {/* Row 6: Calendar Icon + Calendar Name */}
          <div className="flex items-start space-x-4 py-1">
            <CalendarIcon className="w-5 h-5 text-[#9aa0a6] mt-0.5 shrink-0" />
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-[#e3e3e3]">{currentCal.name}</span>
                <span 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: currentCal.color }}
                />
              </div>
              <p className="text-xs text-[#9aa0a6]">
                Zajęty • Widoczność domyślna • Powiadom 30 minut wcześniej
              </p>
            </div>
          </div>

          {/* Optional Exchange Checkbox */}
          <div className="flex items-center space-x-2 pt-1 pl-9">
            <input
              type="checkbox"
              id="exchangeToggle"
              checked={isExchangeable}
              onChange={(e) => setIsExchangeable(e.target.checked)}
              className="rounded bg-[#282a2d] border-0 text-[#8ab4f8] focus:ring-0 cursor-pointer"
            />
            <label htmlFor="exchangeToggle" className="text-xs text-[#9aa0a6] cursor-pointer flex items-center space-x-1.5 hover:text-[#e3e3e3]">
              <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
              <span>Udostępnij ten termin na wymianę ze znajomym</span>
            </label>
          </div>

          {/* Bottom Footer: Więcej opcji on left, Zapisz z elegancką czcionką */}
          <div className="flex items-center justify-between pt-5 border-t border-[#303134]">
            <button
              type="button"
              onClick={() => {
                setShowGuestInput(true);
                setShowLocationInput(true);
                setShowDescInput(true);
              }}
              className="text-sm font-medium text-[#8ab4f8] hover:text-[#aecbfa] transition"
            >
              Więcej opcji
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-7 py-2.5 bg-[#a8c7fa] hover:bg-[#b8d4ff] text-[#041e49] font-medium rounded-full text-sm transition shadow-sm disabled:opacity-50 active:scale-95"
            >
              {loading ? 'Zapisywanie...' : 'Zapisz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
