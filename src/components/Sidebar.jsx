import React, { useState, useRef, useEffect } from 'react';
import { 
  Users,
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  MoreVertical, 
  X, 
  Plus,
  Search
} from 'lucide-react';
import CreateDropdown from './CreateDropdown';
import CalendarColorMenu from './CalendarColorMenu';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { pl } from 'date-fns/locale';

// Contacts suggestions matching user's uploaded image 3
const PERSON_SUGGESTIONS = [
  { id: '1', name: 'marcinpuda@gmail.com', email: 'marcinpuda@gmail.com', letter: 'm', bg: '#0288d1' },
  { id: '2', name: 'pudaiwo@gmail.com', email: 'pudaiwo@gmail.com', letter: 'p', bg: '#8e24aa' },
  { id: '3', name: 'Zuzanna Biel', email: 'Zuzanna.Biel@precisely.com', letter: 'z', bg: '#00897b' },
  { id: '4', name: 'Varneel', email: 'kuba75915@gmail.com', letter: 'v', bg: '#37474f' },
];

export default function Sidebar({
  isOpen,
  onOpenCreateModal,
  selectedDate,
  onSelectDate,
  myCalendars,
  onToggleCalendar,
  onUpdateCalendarColor,
  onDeleteCalendar,
  onSoloCalendar,
  otherCalendars,
  onToggleOtherCalendar,
  onUpdateOtherCalendarColor,
  onDeleteOtherCalendar,
  onAddOtherCalendar,
  onSearchPerson
}) {
  const [miniDate, setMiniDate] = useState(new Date());
  const [myCalendarsOpen, setMyCalendarsOpen] = useState(true);
  const [otherCalendarsOpen, setOtherCalendarsOpen] = useState(true);
  const [bookingPagesOpen, setBookingPagesOpen] = useState(false);
  const [activeMenuCalendarId, setActiveMenuCalendarId] = useState(null);
  const [searchPersonQuery, setSearchPersonQuery] = useState('');
  const [isSearchingPerson, setIsSearchingPerson] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const monthStart = startOfMonth(miniDate);
  const monthEnd = endOfMonth(monthStart);
  // Sunday first matching image 1 and 2: N P W Ś C P S
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const miniDays = eachDayOfInterval({ start: startDate, end: endDate });

  useEffect(() => {
    if (isSearchingPerson && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchingPerson]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPerson = (person) => {
    setSearchPersonQuery(person.email);
    setShowSuggestions(false);
    setIsSearchingPerson(true);
    if (onSearchPerson) onSearchPerson(person.email);
  };

  const handleClearPersonSearch = () => {
    setSearchPersonQuery('');
    setShowSuggestions(false);
    setIsSearchingPerson(false);
    if (onSearchPerson) onSearchPerson('');
  };

  if (!isOpen) return null;

  return (
    <aside className="w-64 bg-[#1e1f20] text-[#e3e3e3] flex flex-col px-4 py-3 space-y-4 select-none shrink-0 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden h-[calc(100vh-4rem)]">
      {/* 1. Button + Utwórz ▾ without border */}
      <div>
        <CreateDropdown onSelectType={onOpenCreateModal} isCollapsed={false} />
      </div>

      {/* 2. Mini Calendar without background or border, larger typography */}
      <div className="bg-transparent border-0 p-0 space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-semibold text-[#e3e3e3] capitalize">
            {format(miniDate, 'LLLL yyyy', { locale: pl })}
          </span>
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setMiniDate(subMonths(miniDate, 1))}
              className="p-1 hover:bg-[#282a2d] rounded-full text-[#9aa0a6] hover:text-[#e3e3e3] transition"
              title="Poprzedni miesiąc"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setMiniDate(addMonths(miniDate, 1))}
              className="p-1 hover:bg-[#282a2d] rounded-full text-[#9aa0a6] hover:text-[#e3e3e3] transition"
              title="Następny miesiąc"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header: N P W Ś C P S */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[#9aa0a6]">
          {['N', 'P', 'W', 'Ś', 'C', 'P', 'S'].map((d, i) => (
            <div key={i} className="py-0.5">{d}</div>
          ))}
        </div>

        {/* Mini Month Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {miniDays.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, miniDate);
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={idx}
                onClick={() => onSelectDate(day)}
                className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs transition ${
                  isSelected 
                    ? 'bg-[#a8c7fa] text-[#041e49] font-bold shadow-xs'
                    : isToday
                    ? 'border border-[#8ab4f8] text-[#8ab4f8] font-bold'
                    : isCurrentMonth 
                    ? 'text-[#e3e3e3] hover:bg-[#282a2d]' 
                    : 'text-[#5f6368]'
                }`}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>

        {/* 3. Szukaj osób: BEZ RADIUSA i z podpowiedziami znajomych matching image 3 */}
        <div className="pt-2 relative" ref={suggestionsRef}>
          {isSearchingPerson ? (
            <div className="relative flex items-center bg-[#282a2d] rounded-none px-3 py-2 border-b-2 border-[#8ab4f8]">
              <Users className="w-4 h-4 text-[#9aa0a6] mr-2 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Szukaj osób"
                value={searchPersonQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchPersonQuery(e.target.value);
                  setShowSuggestions(true);
                  if (onSearchPerson) onSearchPerson(e.target.value);
                }}
                className="w-full bg-transparent border-0 text-xs text-[#e3e3e3] placeholder-[#9aa0a6] focus:outline-none"
              />
              <button 
                onClick={handleClearPersonSearch}
                className="p-0.5 text-[#9aa0a6] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsSearchingPerson(true);
                setShowSuggestions(true);
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 bg-[#282a2d] hover:bg-[#35373a] text-[#c4c7c5] hover:text-[#e3e3e3] rounded-none text-xs font-medium transition duration-150 border-b-2 border-transparent"
            >
              <Users className="w-4 h-4 text-[#9aa0a6]" />
              <span>Szukaj osób</span>
            </button>
          )}

          {/* Autocomplete suggestions popup matching image 3 */}
          {showSuggestions && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-[#1e1f20] border border-[#303134] rounded-xl shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
              {PERSON_SUGGESTIONS.map((person) => (
                <div
                  key={person.id}
                  onClick={() => handleSelectPerson(person)}
                  className="px-3 py-2 hover:bg-[#282a2d] cursor-pointer flex items-center space-x-3 transition"
                >
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: person.bg }}
                  >
                    {person.letter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[#e3e3e3] truncate">{person.name}</div>
                    <div className="text-[11px] text-[#9aa0a6] truncate">{person.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Strony rezerwacji */}
      <div className="pt-1">
        <div className="flex items-center justify-between text-xs font-medium text-[#c4c7c5] hover:text-[#e3e3e3] py-1 cursor-pointer">
          <span>Strony rezerwacji</span>
          <button 
            onClick={() => onOpenCreateModal('Harmonogram spotkań')}
            className="p-1 hover:bg-[#282a2d] rounded-full text-[#9aa0a6] hover:text-[#e3e3e3]"
            title="Dodaj harmonogram"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. Moje kalendarze: Zwijana sekcja ze strzałką */}
      <div className="space-y-1">
        <div 
          onClick={() => setMyCalendarsOpen(!myCalendarsOpen)}
          className="flex items-center justify-between text-xs font-semibold text-[#e3e3e3] py-1 px-1 cursor-pointer hover:bg-[#282a2d]/50 rounded-lg transition"
        >
          <span>Moje kalendarze</span>
          <ChevronUp className={`w-4 h-4 text-[#9aa0a6] transition-transform duration-200 ${!myCalendarsOpen ? 'rotate-180' : ''}`} />
        </div>

        {myCalendarsOpen && (
          <div className="space-y-0.5">
            {myCalendars.map((cal) => (
              <div 
                key={cal.id} 
                className="group relative flex items-center justify-between py-1 px-1 rounded-xl hover:bg-[#282a2d] transition text-sm"
              >
                <div 
                  onClick={() => onToggleCalendar(cal.id)}
                  className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
                >
                  <div 
                    className="w-5 h-5 rounded-[5px] flex items-center justify-center transition shadow-xs"
                    style={{ 
                      backgroundColor: cal.checked ? cal.color : 'transparent',
                      border: cal.checked ? 'none' : '2px solid #5f6368'
                    }}
                  >
                    {cal.checked && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </div>
                  <span className="text-sm font-normal text-[#e3e3e3] truncate">
                    {cal.name}
                  </span>
                </div>

                <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 transition">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCalendar(cal.id);
                    }}
                    className="w-7 h-7 flex items-center justify-center text-[#9aa0a6] hover:text-[#f28b82] hover:bg-[#35373a] rounded-full transition"
                    title="Usuń kalendarz"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuCalendarId(activeMenuCalendarId === cal.id ? null : cal.id);
                    }}
                    className="w-7 h-7 flex items-center justify-center text-[#9aa0a6] hover:text-[#e3e3e3] hover:bg-[#35373a] rounded-full transition"
                    title="Opcje kalendarza"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {activeMenuCalendarId === cal.id && (
                  <CalendarColorMenu
                    calendar={cal}
                    onClose={() => setActiveMenuCalendarId(null)}
                    onColorChange={(col) => onUpdateCalendarColor(cal.id, col)}
                    onDelete={() => onDeleteCalendar(cal.id)}
                    onSolo={() => onSoloCalendar(cal.id)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Inne kalendarze: Zwijana sekcja ze strzałką i + */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-semibold text-[#e3e3e3] py-1 px-1">
          <div 
            onClick={() => setOtherCalendarsOpen(!otherCalendarsOpen)}
            className="flex items-center space-x-1 cursor-pointer flex-1"
          >
            <span>Inne kalendarze</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={onAddOtherCalendar}
              className="p-1 hover:bg-[#282a2d] rounded-full text-[#9aa0a6] hover:text-[#e3e3e3]"
              title="Dodaj inny kalendarz"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setOtherCalendarsOpen(!otherCalendarsOpen)}
              className="p-1 hover:bg-[#282a2d] rounded-full text-[#9aa0a6] hover:text-[#e3e3e3]"
            >
              <ChevronUp className={`w-4 h-4 text-[#9aa0a6] transition-transform duration-200 ${!otherCalendarsOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {otherCalendarsOpen && (
          <div className="space-y-0.5">
            {otherCalendars.map((cal) => (
              <div 
                key={cal.id} 
                className="group relative flex items-center justify-between py-1 px-1 rounded-xl hover:bg-[#282a2d] transition text-sm"
              >
                <div 
                  onClick={() => onToggleOtherCalendar(cal.id)}
                  className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
                >
                  <div 
                    className="w-5 h-5 rounded-[5px] flex items-center justify-center transition shadow-xs"
                    style={{ 
                      backgroundColor: cal.checked ? cal.color : 'transparent',
                      border: cal.checked ? 'none' : '2px solid #5f6368'
                    }}
                  >
                    {cal.checked && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </div>
                  <span className="text-sm font-normal text-[#e3e3e3] truncate">
                    {cal.name}
                  </span>
                </div>

                <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 transition">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteOtherCalendar(cal.id);
                    }}
                    className="w-7 h-7 flex items-center justify-center text-[#9aa0a6] hover:text-[#f28b82] hover:bg-[#35373a] rounded-full transition"
                    title="Usuń kalendarz"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuCalendarId(activeMenuCalendarId === cal.id ? null : cal.id);
                    }}
                    className="w-7 h-7 flex items-center justify-center text-[#9aa0a6] hover:text-[#e3e3e3] hover:bg-[#35373a] rounded-full transition"
                    title="Opcje kalendarza"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {activeMenuCalendarId === cal.id && (
                  <CalendarColorMenu
                    calendar={cal}
                    onClose={() => setActiveMenuCalendarId(null)}
                    onColorChange={(col) => onUpdateOtherCalendarColor(cal.id, col)}
                    onDelete={() => onDeleteOtherCalendar(cal.id)}
                    onSolo={() => {}}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Links */}
      <div className="pt-4 text-[11px] text-[#9aa0a6] space-x-2">
        <span className="hover:underline cursor-pointer">Warunki</span>
        <span>•</span>
        <span className="hover:underline cursor-pointer">Prywatność</span>
      </div>
    </aside>
  );
}
