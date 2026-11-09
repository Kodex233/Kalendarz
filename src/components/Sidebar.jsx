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
  onSearchPerson,
  userRole = 'Pełny dostęp'
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
      {/* 1. Button + Utwórz ▾ without border (lub status Tylko do odczytu przy roli Przeglądający) */}
      <div className="px-1 mb-8">
        {userRole === 'Przeglądający' ? (
          <div className="flex items-center space-x-2.5 px-4 py-3.5 bg-[#282a2d] text-[#9aa0a6] rounded-2xl text-xs font-medium border border-[#444746]/50 select-none shadow-xs">
            <svg className="w-4 h-4 fill-current text-[#8ab4f8] shrink-0" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
            <span className="text-[#c4c7c5]">Tylko do odczytu</span>
          </div>
        ) : (
          <CreateDropdown onSelectType={onOpenCreateModal} isCollapsed={false} />
        )}
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
              className="p-1 hover:bg-[#282a2d] rounded-full text-white hover:text-white transition"
              title="Poprzedni miesiąc"
            >
              <ChevronLeft className="w-4 h-4 text-white stroke-[2.5]" />
            </button>
            <button 
              onClick={() => setMiniDate(addMonths(miniDate, 1))}
              className="p-1 hover:bg-[#282a2d] rounded-full text-white hover:text-white transition"
              title="Następny miesiąc"
            >
              <ChevronRight className="w-4 h-4 text-white stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Days of week header: N P W Ś C P S na biało */}
        <div className="grid grid-cols-7 gap-x-1 text-center text-[10.5px] font-medium text-white mb-1">
          {['N', 'P', 'W', 'Ś', 'C', 'P', 'S'].map((d, i) => (
            <div key={i} className="py-0.5">{d}</div>
          ))}
        </div>

        {/* Mini Month Grid: lekko mniejsze liczby (text-[11px]), tła okrągłe w-6 h-6, szare dni lekko jaśniejsze */}
        <div className="grid grid-cols-7 gap-x-1 gap-y-2 text-center text-[11px]">
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
                className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-[11px] font-medium transition shrink-0 ${dayStyle}`}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>

        {/* 3. Szukaj osób: ikonka z lewej, normalny kursor obok napisu */}
        <div className="pt-2">
          <div 
            onClick={() => searchInputRef.current?.focus()}
            className={`w-full flex items-center h-10 px-3 bg-[#282a2d] text-[#c4c7c5] text-sm font-medium transition duration-150 border-b-2 cursor-text ${
              isSearchingPerson ? 'rounded-t-md border-[#8ab4f8]' : 'rounded-lg border-transparent'
            }`}
          >
            <svg className="w-5 h-5 text-[#c4c7c5] shrink-0 mr-2.5 pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              <path d="M9 13c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4zm-6 5c.2-.71 3.3-2 6-2 2.69 0 5.78 1.28 6 2H3z" />
              <path d="M16.5 12c1.38 0 2.5-1.12 2.5-2.5S17.88 7 16.5 7c-.3 0-.58.05-.85.15.53.7.85 1.57.85 2.52s-.32 1.82-.85 2.52c.27.1.55.15.85.15z" />
              <path d="M18 14.5c1.86.32 4 1.35 4 2.5v3h-3v-2c0-.79-.3-1.52-.79-2.07.61-.17 1.24-.31 1.79-.43z" />
            </svg>

            <input
              ref={searchInputRef}
              type="text"
              placeholder="Szukaj osób"
              value={searchPersonQuery}
              onFocus={() => setIsSearchingPerson(true)}
              onBlur={() => {
                if (!searchPersonQuery) setIsSearchingPerson(false);
              }}
              onChange={(e) => {
                setSearchPersonQuery(e.target.value);
                if (onSearchPerson) onSearchPerson(e.target.value);
              }}
              className="w-full bg-transparent border-0 text-sm font-medium text-[#c4c7c5] placeholder-[#c4c7c5] focus:outline-none p-0 caret-[#8ab4f8]"
            />
          </div>
        </div>
      </div>

      {/* 4. Strony rezerwacji: + przesunięty w prawo, spójny margines */}
      <div className="space-y-0.5 px-1">
        <div className="flex items-center justify-between py-1 px-3.5">
          <span className="text-sm font-medium text-[#e3e3e3]">Strony rezerwacji</span>
          <button 
            onClick={() => onOpenCreateModal('Harmonogram spotkań')}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#35373a] text-white transition -mr-1"
            title="Dodaj harmonogram"
          >
            <Plus className="w-5 h-5 text-white stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 5. Moje kalendarze: większy padding, hover na całe wiersze, a po najechaniu na strzałkę tło ma tylko strzałka */}
      <div className="space-y-0.5 px-1">
        <div 
          onClick={() => setMyCalendarsOpen(!myCalendarsOpen)}
          className="flex items-center justify-between px-3.5 py-1.5 rounded-full hover:bg-[#282a2d] transition group has-[button:hover]:bg-transparent cursor-pointer"
        >
          <span className="text-sm font-medium text-[#e3e3e3] select-none">
            Moje kalendarze
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMyCalendarsOpen(!myCalendarsOpen);
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#35373a] text-white transition -mr-1 shrink-0"
            title={myCalendarsOpen ? "Zwiń moje kalendarze" : "Rozwiń moje kalendarze"}
          >
            <ChevronUp className={`w-5 h-5 text-white stroke-[2.5] transition-transform duration-200 ${!myCalendarsOpen ? 'rotate-180' : ''}`} />
          </button>
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

      {/* 6. Inne kalendarze: większy padding w każdą stronę, hover na cały wiersz łącznie z ikonkami, a przy najechaniu na ikonki tło ma tylko dana ikonka */}
      <div className="space-y-0.5 px-1">
        <div 
          onClick={() => setOtherCalendarsOpen(!otherCalendarsOpen)}
          className="flex items-center justify-between px-3.5 py-1.5 rounded-full hover:bg-[#282a2d] transition group has-[button:hover]:bg-transparent cursor-pointer"
        >
          <span className="text-sm font-medium text-[#e3e3e3] select-none">
            Inne kalendarze
          </span>
          <div className="flex items-center space-x-0.5 -mr-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddOtherCalendar();
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#35373a] text-white transition"
              title="Dodaj inny kalendarz"
            >
              <Plus className="w-5 h-5 text-white stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOtherCalendarsOpen(!otherCalendarsOpen);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#35373a] text-white transition"
              title={otherCalendarsOpen ? "Zwiń inne kalendarze" : "Rozwiń inne kalendarze"}
            >
              <ChevronUp className={`w-5 h-5 text-white stroke-[2.5] transition-transform duration-200 ${!otherCalendarsOpen ? 'rotate-180' : ''}`} />
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
      </div>
    </aside>
  );
}
