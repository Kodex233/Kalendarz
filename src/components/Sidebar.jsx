import React, { useState, useRef, useEffect } from 'react';
import { 
  User,
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  Check, 
  MoreVertical, 
  X, 
  Plus
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
  const [miniDate, setMiniDate] = useState(selectedDate || new Date());
  const [myCalendarsOpen, setMyCalendarsOpen] = useState(true);
  const [otherCalendarsOpen, setOtherCalendarsOpen] = useState(true);
  const [activeMenuCalendarId, setActiveMenuCalendarId] = useState(null);
  const [searchPersonQuery, setSearchPersonQuery] = useState('');
  const [isSearchingPerson, setIsSearchingPerson] = useState(false);
  
  const searchInputRef = useRef(null);

  // Keep mini calendar month in sync with selectedDate
  useEffect(() => {
    if (selectedDate) {
      setMiniDate(selectedDate);
    }
  }, [selectedDate]);

  const monthStart = startOfMonth(miniDate);
  const monthEnd = endOfMonth(monthStart);
  // Sunday first: N P W Ś C P S
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const miniDays = eachDayOfInterval({ start: startDate, end: endDate });

  useEffect(() => {
    if (isSearchingPerson && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchingPerson]);

  const handleClearPersonSearch = () => {
    setSearchPersonQuery('');
    setIsSearchingPerson(false);
    if (onSearchPerson) onSearchPerson('');
  };

  const handleMiniDayClick = (day) => {
    onSelectDate(day);
  };

  if (!isOpen) return null;

  return (
    <aside className="w-64 bg-[#1e1f20] text-[#e3e3e3] flex flex-col px-3 py-3 select-none shrink-0 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden h-[calc(100vh-4rem)]">
      {/* 1. Button + Utwórz ▾ without border */}
      <div className="px-1 mb-8">
        <CreateDropdown onSelectType={onOpenCreateModal} isCollapsed={false} />
      </div>

      {/* Wszystko poniżej buttona Utwórz przesunięte niżej (mb-8 powyżej + space-y-3.5 wewnątrz) */}
      <div className="flex flex-col space-y-3.5">
        {/* 2. Mini Calendar: mniejsza szerokość (w-[208px]) */}
        <div className="bg-transparent border-0 w-[208px] mx-auto space-y-2.5">
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
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button 
              onClick={() => setMiniDate(addMonths(miniDate, 1))}
              className="p-1 hover:bg-[#282a2d] rounded-full text-[#9aa0a6] hover:text-[#e3e3e3] transition"
              title="Następny miesiąc"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Days of week header: N P W Ś C P S na biało */}
        <div className="grid grid-cols-7 gap-x-1 text-center text-xs font-medium text-white mb-1">
          {['N', 'P', 'W', 'Ś', 'C', 'P', 'S'].map((d, i) => (
            <div key={i} className="py-0.5">{d}</div>
          ))}
        </div>

        {/* Mini Month Grid: większy odstęp w pionie (gap-y-2), tła okrągłe w-6 h-6, szare dni lekko jaśniejsze */}
        <div className="grid grid-cols-7 gap-x-1 gap-y-2 text-center text-xs">
          {miniDays.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, miniDate);
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            let dayStyle = 'text-[#e3e3e3] hover:bg-[#282a2d]';
            if (!isCurrentMonth) {
              dayStyle = 'text-[#9aa0a6]';
            }
            if (isToday) {
              dayStyle = 'bg-[#a8c7fa] text-[#041e49] font-bold shadow-xs';
            } else if (isSelected && isCurrentMonth) {
              // Tło zaznaczonego dnia: #004a77 (zgodnie z życzeniem)
              dayStyle = 'bg-[#004a77] text-[#c2e7ff] font-bold shadow-xs';
            }

            return (
              <button
                key={idx}
                onClick={() => handleMiniDayClick(day)}
                className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs transition shrink-0 ${dayStyle}`}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>

        {/* 3. Szukaj osób: większy napis (text-sm), ikonka ze zdjęcia Image 1, kursor z lewej od ikonki, napis nie zmienia koloru, ciemniejsze tło */}
        <div className="pt-2">
          {isSearchingPerson ? (
            <div className="relative flex items-center justify-between bg-[#282a2d] h-10 px-3.5 rounded-t-md border-0 border-b-2 border-[#8ab4f8] transition">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Szukaj osób"
                value={searchPersonQuery}
                onBlur={() => {
                  if (!searchPersonQuery) setIsSearchingPerson(false);
                }}
                onChange={(e) => {
                  setSearchPersonQuery(e.target.value);
                  if (onSearchPerson) onSearchPerson(e.target.value);
                }}
                className="w-full bg-transparent border-0 text-sm font-medium text-[#c4c7c5] placeholder-[#c4c7c5] focus:outline-none"
              />
              {/* Ikonka osób ze zdjęcia Image 1 na prawo od kursora */}
              <svg className="w-5 h-5 text-[#c4c7c5] shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchingPerson(true)}
              className="w-full flex items-center justify-between h-10 px-3.5 bg-[#282a2d] hover:bg-[#323438] text-[#c4c7c5] hover:text-[#c4c7c5] text-sm font-medium transition duration-150 rounded-lg"
            >
              <span className="text-[#c4c7c5]">Szukaj osób</span>
              {/* Ikonka osób ze zdjęcia Image 1 */}
              <svg className="w-5 h-5 text-[#c4c7c5] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 4. Strony rezerwacji: wyrównanie tekstu do lewej na tym samym poziomie, hover tylko dla przycisku + */}
      <div className="space-y-0.5 px-1">
        <div className="flex items-center justify-between text-xs font-semibold text-[#e3e3e3] py-1 px-3">
          <span>Strony rezerwacji</span>
          <button 
            onClick={() => onOpenCreateModal('Harmonogram spotkań')}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#35373a] text-[#9aa0a6] hover:text-[#e3e3e3] transition -mr-1"
            title="Dodaj harmonogram"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 5. Moje kalendarze: bliżej siebie kalendarze (space-y-[1px]), mniejsza wysokość hover (py-0.5), tick mniejszy */}
      <div className="space-y-0.5 px-1">
        <div 
          onClick={() => setMyCalendarsOpen(!myCalendarsOpen)}
          className="flex items-center justify-between text-xs font-semibold text-[#e3e3e3] py-1 px-3 cursor-pointer hover:bg-[#35373a] rounded-full transition"
        >
          <span>Moje kalendarze</span>
          <div className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#4d5156] text-[#9aa0a6] hover:text-white transition -mr-1">
            <ChevronUp className={`w-4 h-4 text-[#9aa0a6] hover:text-white transition-transform duration-200 ${!myCalendarsOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {myCalendarsOpen && (
          <div className="space-y-[1px] pt-0.5">
            {myCalendars.map((cal) => (
              <div 
                key={cal.id} 
                className="group relative flex items-center justify-between px-3 py-0.5 rounded-full hover:bg-[#282a2d] transition text-sm cursor-pointer"
              >
                <div 
                  onClick={() => onToggleCalendar(cal.id)}
                  className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
                >
                  <div 
                    className="w-4 h-4 rounded-[3px] flex items-center justify-center transition shadow-xs shrink-0"
                    style={{ 
                      backgroundColor: cal.checked ? cal.color : 'transparent',
                      border: cal.checked ? 'none' : '2px solid #5f6368'
                    }}
                  >
                    {cal.checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </div>
                  <span className="text-sm font-normal text-[#e3e3e3] truncate">
                    {cal.name}
                  </span>
                </div>

                {/* X i 3 kropki: jaśniejszy szary hover (hover:bg-[#4d5156] hover:text-white) */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 transition shrink-0 -mr-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCalendar(cal.id);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-[#9aa0a6] hover:text-white hover:bg-[#4d5156] rounded-full transition"
                    title="Usuń kalendarz"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuCalendarId(activeMenuCalendarId === cal.id ? null : cal.id);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-[#9aa0a6] hover:text-white hover:bg-[#4d5156] rounded-full transition"
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
                    onSelectColor={(id, col) => onUpdateCalendarColor(id, col)}
                    onDelete={() => onDeleteCalendar(cal.id)}
                    onSolo={() => onSoloCalendar(cal.id)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Inne kalendarze: mniejsze odstępy, spójne z moimi kalendarzami, lekko mniejsza wysokość padding */}
      <div className="space-y-0.5 px-1">
        <div className="flex items-center justify-between text-xs font-semibold text-[#e3e3e3] py-1.5 px-3 hover:bg-[#35373a] rounded-full transition">
          <div 
            onClick={() => setOtherCalendarsOpen(!otherCalendarsOpen)}
            className="flex items-center space-x-1 cursor-pointer flex-1"
          >
            <span>Inne kalendarze</span>
          </div>
          <div className="flex items-center space-x-0.5 -mr-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddOtherCalendar();
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#4d5156] text-[#9aa0a6] hover:text-white transition"
              title="Dodaj inny kalendarz"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOtherCalendarsOpen(!otherCalendarsOpen);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#4d5156] text-[#9aa0a6] hover:text-white transition"
              title={otherCalendarsOpen ? "Zwiń inne kalendarze" : "Rozwiń inne kalendarze"}
            >
              <ChevronUp className={`w-4 h-4 text-[#9aa0a6] hover:text-white transition-transform duration-200 ${!otherCalendarsOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {otherCalendarsOpen && (
          <div className="space-y-[1px] pt-0.5">
            {otherCalendars.map((cal) => (
              <div 
                key={cal.id} 
                className="group relative flex items-center justify-between px-3 py-0.5 rounded-full hover:bg-[#282a2d] transition text-sm cursor-pointer"
              >
                <div 
                  onClick={() => onToggleOtherCalendar(cal.id)}
                  className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
                >
                  <div 
                    className="w-4 h-4 rounded-[3px] flex items-center justify-center transition shadow-xs shrink-0"
                    style={{ 
                      backgroundColor: cal.checked ? cal.color : 'transparent',
                      border: cal.checked ? 'none' : '2px solid #5f6368'
                    }}
                  >
                    {cal.checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </div>
                  <span className="text-sm font-normal text-[#e3e3e3] truncate">
                    {cal.name}
                  </span>
                </div>

                <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 transition shrink-0 -mr-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteOtherCalendar(cal.id);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-[#9aa0a6] hover:text-white hover:bg-[#4d5156] rounded-full transition"
                    title="Usuń kalendarz"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuCalendarId(activeMenuCalendarId === cal.id ? null : cal.id);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-[#9aa0a6] hover:text-white hover:bg-[#4d5156] rounded-full transition"
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
                    onSelectColor={(id, col) => onUpdateOtherCalendarColor(id, col)}
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
      <div className="pt-3 text-[11px] text-[#9aa0a6] space-x-2 px-2">
        <span className="hover:underline cursor-pointer">Warunki</span>
        <span>•</span>
        <span className="hover:underline cursor-pointer">Prywatność</span>
      </div>
      </div>
    </aside>
  );
}
