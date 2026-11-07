import React, { useState, useRef, useEffect } from 'react';
import { 
  UserPlus,
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
  const searchInputRef = useRef(null);

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

  // When hidden: Return null so the [+] button moves directly above GMT+1 in the calendar (matching image 4)
  if (!isOpen) return null;

  return (
    <aside className="w-64 bg-[#1e1f20] text-[#e3e3e3] flex flex-col px-4 py-3 space-y-4 select-none shrink-0 overflow-y-auto h-[calc(100vh-4rem)]">
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

        {/* Days of week header matching image 1: N P W Ś C P S */}
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

        {/* 3. Szukaj osób z mniejszym radiusem i poprawną ikonką (UserPlus) matching image 1 */}
        <div className="pt-2">
          {isSearchingPerson ? (
            <div className="relative flex items-center bg-[#282a2d] rounded-lg px-3 py-2 ring-1 ring-[#8ab4f8]">
              <Search className="w-4 h-4 text-[#9aa0a6] mr-2 shrink-0" />
              <input
                ref={searchInputRef}
                type="email"
                placeholder="Wpisz Gmail osoby..."
                value={searchPersonQuery}
                onChange={(e) => {
                  setSearchPersonQuery(e.target.value);
                  if (onSearchPerson) onSearchPerson(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape' || e.key === 'Enter') {
                    if (!searchPersonQuery) setIsSearchingPerson(false);
                  }
                }}
                className="w-full bg-transparent border-0 text-xs text-[#e3e3e3] placeholder-[#9aa0a6] focus:outline-none"
              />
              <button 
                onClick={() => {
                  setSearchPersonQuery('');
                  if (onSearchPerson) onSearchPerson('');
                  setIsSearchingPerson(false);
                }}
                className="p-0.5 text-[#9aa0a6] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchingPerson(true)}
              className="w-full flex items-center space-x-2.5 px-3 py-2 bg-[#282a2d] hover:bg-[#35373a] text-[#c4c7c5] hover:text-[#e3e3e3] rounded-lg text-xs font-medium transition duration-150 border-0 shadow-xs"
            >
              <UserPlus className="w-4 h-4 text-[#9aa0a6]" />
              <span>Szukaj osób</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Strony rezerwacji + matching image 1 and 2 */}
      <div className="pt-1">
        <div 
          onClick={() => setBookingPagesOpen(!bookingPagesOpen)}
          className="flex items-center justify-between py-1.5 px-2 hover:bg-[#282a2d] rounded-full cursor-pointer transition text-[#e3e3e3] group"
        >
          <span className="text-xs font-medium tracking-wide">
            Strony rezerwacji
          </span>
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); onOpenCreateModal('Harmonogram spotkań'); }}
            className="text-[#9aa0a6] hover:text-[#e3e3e3] p-1"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. Moje kalendarze (Pill hover, larger X & 3 dots target, visible popup menu) */}
      <div className="space-y-1">
        <div 
          onClick={() => setMyCalendarsOpen(!myCalendarsOpen)}
          className="flex items-center justify-between py-1.5 px-2 hover:bg-[#282a2d] rounded-full cursor-pointer transition text-[#e3e3e3] group"
        >
          <span className="text-xs font-medium tracking-wide">
            Moje kalendarze
          </span>
          <button className="text-[#9aa0a6] group-hover:text-[#e3e3e3] p-1">
            {myCalendarsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {myCalendarsOpen && (
          <div className="space-y-0.5 pt-0.5">
            {myCalendars.map((cal) => (
              <div
                key={cal.id}
                className="relative group flex items-center justify-between px-2.5 py-1.5 rounded-full hover:bg-[#282a2d] transition cursor-pointer"
                onClick={() => onToggleCalendar(cal.id)}
              >
                {/* Left: Large colored tick & Name */}
                <div className="flex items-center space-x-3 truncate">
                  <div
                    style={{
                      backgroundColor: cal.checked ? cal.color : 'transparent',
                      borderColor: cal.color
                    }}
                    className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition shrink-0 ${
                      cal.checked ? 'shadow-xs' : 'border-[#5f6368]'
                    }`}
                  >
                    {cal.checked && (
                      <Check className="w-3.5 h-3.5 text-[#1f1f1f] stroke-[3.5]" />
                    )}
                  </div>
                  <span className="text-xs text-[#e3e3e3] font-medium truncate">
                    {cal.name}
                  </span>
                </div>

                {/* Right: Larger hover targets for X and 3 dots matching image 3 and 5 */}
                <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition shrink-0">
                  {onDeleteCalendar && myCalendars.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCalendar(cal.id);
                      }}
                      className="w-7 h-7 flex items-center justify-center hover:bg-[#35373a] text-[#9aa0a6] hover:text-[#f28b82] rounded-full transition"
                      title="Usuń kalendarz"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuCalendarId(activeMenuCalendarId === cal.id ? null : cal.id);
                    }}
                    className="w-7 h-7 flex items-center justify-center hover:bg-[#35373a] text-[#9aa0a6] hover:text-[#e3e3e3] rounded-full transition"
                    title="Opcje kalendarza"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* 24-color palette and options menu */}
                {activeMenuCalendarId === cal.id && (
                  <CalendarColorMenu
                    calendar={cal}
                    onClose={() => setActiveMenuCalendarId(null)}
                    onSelectColor={onUpdateCalendarColor}
                    onSoloView={onSoloCalendar}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Inne kalendarze (Pill hover, larger X & 3 dots target) */}
      <div className="space-y-1 pt-1">
        <div 
          onClick={() => setOtherCalendarsOpen(!otherCalendarsOpen)}
          className="flex items-center justify-between py-1.5 px-2 hover:bg-[#282a2d] rounded-full cursor-pointer transition text-[#e3e3e3] group"
        >
          <span className="text-xs font-medium tracking-wide">
            Inne kalendarze
          </span>
          <div className="flex items-center space-x-1 text-[#9aa0a6] group-hover:text-[#e3e3e3]">
            {onAddOtherCalendar && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddOtherCalendar();
                }}
                className="w-6 h-6 flex items-center justify-center hover:bg-[#282a2d] rounded-full transition"
                title="Dodaj inny kalendarz"
              >
                <Plus className="w-4 h-4 stroke-[2]" />
              </button>
            )}
            <button className="w-6 h-6 flex items-center justify-center">
              {otherCalendarsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {otherCalendarsOpen && (
          <div className="space-y-0.5 pt-0.5">
            {otherCalendars.map((cal) => (
              <div
                key={cal.id}
                className="relative group flex items-center justify-between px-2.5 py-1.5 rounded-full hover:bg-[#282a2d] transition cursor-pointer"
                onClick={() => onToggleOtherCalendar(cal.id)}
              >
                {/* Left: Large colored tick & Name */}
                <div className="flex items-center space-x-3 truncate">
                  <div
                    style={{
                      backgroundColor: cal.checked ? cal.color : 'transparent',
                      borderColor: cal.color
                    }}
                    className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition shrink-0 ${
                      cal.checked ? 'shadow-xs' : 'border-[#5f6368]'
                    }`}
                  >
                    {cal.checked && (
                      <Check className="w-3.5 h-3.5 text-[#1f1f1f] stroke-[3.5]" />
                    )}
                  </div>
                  <span className="text-xs text-[#e3e3e3] font-medium truncate">
                    {cal.name}
                  </span>
                </div>

                {/* Right: Larger hover targets */}
                <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition shrink-0">
                  {onDeleteOtherCalendar && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteOtherCalendar(cal.id);
                      }}
                      className="w-7 h-7 flex items-center justify-center hover:bg-[#35373a] text-[#9aa0a6] hover:text-[#f28b82] rounded-full transition"
                      title="Usuń kalendarz"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuCalendarId(activeMenuCalendarId === cal.id ? null : cal.id);
                    }}
                    className="w-7 h-7 flex items-center justify-center hover:bg-[#35373a] text-[#9aa0a6] hover:text-[#e3e3e3] rounded-full transition"
                    title="Opcje kalendarza"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* 24-color palette and options menu */}
                {activeMenuCalendarId === cal.id && (
                  <CalendarColorMenu
                    calendar={cal}
                    onClose={() => setActiveMenuCalendarId(null)}
                    onSelectColor={onUpdateOtherCalendarColor}
                    onSoloView={onSoloCalendar}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer link matching image 1 and 2 */}
      <div className="mt-auto pt-6 text-[11px] text-[#9aa0a6] hover:underline cursor-pointer">
        Warunki – Prywatność
      </div>
    </aside>
  );
}
