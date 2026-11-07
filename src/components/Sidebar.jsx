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
    <aside className="w-64 bg-[#1e1f20] text-[#e3e3e3] flex flex-col px-3 py-3 space-y-3.5 select-none shrink-0 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden h-[calc(100vh-4rem)]">
      {/* 1. Button + Utwórz ▾ without border */}
      <div className="px-1">
        <CreateDropdown onSelectType={onOpenCreateModal} isCollapsed={false} />
      </div>

      {/* 2. Mini Calendar: większy odstęp na wysokość, perfekcyjnie okrągłe tła */}
      <div className="bg-transparent border-0 px-2 mt-1 space-y-2.5">
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
        <div className="grid grid-cols-7 gap-x-1 text-center text-xs font-medium text-[#9aa0a6] mb-1">
          {['N', 'P', 'W', 'Ś', 'C', 'P', 'S'].map((d, i) => (
            <div key={i} className="py-0.5">{d}</div>
          ))}
        </div>

        {/* Mini Month Grid: większy odstęp w pionie (gap-y-2), idealne koła w-7 h-7 */}
        <div className="grid grid-cols-7 gap-x-1 gap-y-2 text-center text-xs">
          {miniDays.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, miniDate);
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            let dayStyle = 'text-[#e3e3e3] hover:bg-[#282a2d]';
            if (!isCurrentMonth) {
              dayStyle = 'text-[#5f6368]';
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
                className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs transition shrink-0 ${dayStyle}`}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>

        {/* 3. Szukaj osób: ładna ikonka User, mniejsza szerokość, większa wysokość, jaśniejsze tło */}
        <div className="pt-2">
          {isSearchingPerson ? (
            <div className="relative flex items-center bg-[#303134] h-10 px-3.5 border-b-2 border-[#8ab4f8]">
              <User className="w-4 h-4 text-[#c4c7c5] mr-2.5 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Szukaj osób"
                value={searchPersonQuery}
                onChange={(e) => {
                  setSearchPersonQuery(e.target.value);
                  if (onSearchPerson) onSearchPerson(e.target.value);
                }}
                className="w-full bg-transparent border-0 text-xs text-[#e3e3e3] placeholder-[#9aa0a6] focus:outline-none"
              />
              <button 
                onClick={handleClearPersonSearch}
                className="p-1 text-[#9aa0a6] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchingPerson(true)}
              className="w-full flex items-center space-x-2.5 h-10 px-3.5 bg-[#303134] hover:bg-[#3c4043] text-[#c4c7c5] hover:text-white text-xs font-medium transition duration-150 border-b-2 border-transparent"
            >
              <User className="w-4 h-4 text-[#c4c7c5]" />
              <span>Szukaj osób</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Strony rezerwacji */}
      <div className="pt-1 px-1">
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

      {/* 5. Moje kalendarze: WIĘKSZY I JAŚNIEJSZY ZAOKRĄGLONY HOVER NAGŁÓWKA, MNIEJ ZAOKRĄGLONE TICKI, WIĘKSZY HOVER X I 3 KROPEK */}
      <div className="space-y-0.5 px-1">
        <div 
          onClick={() => setMyCalendarsOpen(!myCalendarsOpen)}
          className="flex items-center justify-between text-xs font-semibold text-[#e3e3e3] py-2 px-3.5 cursor-pointer hover:bg-[#35373a] rounded-full transition"
        >
          <span>Moje kalendarze</span>
          <ChevronUp className={`w-4 h-4 text-[#9aa0a6] transition-transform duration-200 ${!myCalendarsOpen ? 'rotate-180' : ''}`} />
        </div>

        {myCalendarsOpen && (
          <div className="space-y-0.5 pt-0.5">
            {myCalendars.map((cal) => (
              <div 
                key={cal.id} 
                className="group relative flex items-center justify-between px-3.5 py-1.5 rounded-full hover:bg-[#282a2d] transition text-sm cursor-pointer"
              >
                <div 
                  onClick={() => onToggleCalendar(cal.id)}
                  className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
                >
                  <div 
                    className="w-5 h-5 rounded-[3px] flex items-center justify-center transition shadow-xs shrink-0"
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

                {/* X i 3 kropki: bliżej prawej krawędzi (-mr-2), większy hover (w-8 h-8), bez czerwonego */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 transition shrink-0 -mr-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCalendar(cal.id);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-[#9aa0a6] hover:text-[#e3e3e3] hover:bg-[#3c4043] rounded-full transition"
                    title="Usuń kalendarz"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuCalendarId(activeMenuCalendarId === cal.id ? null : cal.id);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-[#9aa0a6] hover:text-[#e3e3e3] hover:bg-[#3c4043] rounded-full transition"
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

      {/* 6. Inne kalendarze: WIĘKSZY HOVER NAGŁÓWKA, MNIEJ ZAOKRĄGLONE TICKI */}
      <div className="space-y-0.5 px-1">
        <div className="flex items-center justify-between text-xs font-semibold text-[#e3e3e3] py-2 px-3.5 hover:bg-[#35373a] rounded-full transition">
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
          <div className="space-y-0.5 pt-0.5">
            {otherCalendars.map((cal) => (
              <div 
                key={cal.id} 
                className="group relative flex items-center justify-between px-3.5 py-1.5 rounded-full hover:bg-[#282a2d] transition text-sm cursor-pointer"
              >
                <div 
                  onClick={() => onToggleOtherCalendar(cal.id)}
                  className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
                >
                  <div 
                    className="w-5 h-5 rounded-[3px] flex items-center justify-center transition shadow-xs shrink-0"
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

                <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 transition shrink-0 -mr-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteOtherCalendar(cal.id);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-[#9aa0a6] hover:text-[#e3e3e3] hover:bg-[#3c4043] rounded-full transition"
                    title="Usuń kalendarz"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuCalendarId(activeMenuCalendarId === cal.id ? null : cal.id);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-[#9aa0a6] hover:text-[#e3e3e3] hover:bg-[#3c4043] rounded-full transition"
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
    </aside>
  );
}
