import React, { useState } from 'react';
import { 
  Users, 
  ArrowLeftRight, 
  ChevronLeft, 
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Clock,
  Sparkles,
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
  exchangeableEvents,
  onProposeSwapWithEvent,
  onOpenExchangeModal,
  user
}) {
  const [miniDate, setMiniDate] = useState(new Date());
  const [myCalendarsOpen, setMyCalendarsOpen] = useState(true);
  const [otherCalendarsOpen, setOtherCalendarsOpen] = useState(true);
  const [activeMenuCalendarId, setActiveMenuCalendarId] = useState(null);

  const monthStart = startOfMonth(miniDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const miniDays = eachDayOfInterval({ start: startDate, end: endDate });

  if (!isOpen) return null;

  return (
    <aside className="w-64 border-r border-[#3c4043] bg-[#1f1f1f] text-[#e3e3e3] flex flex-col p-4 space-y-5 select-none shrink-0 overflow-y-auto h-[calc(100vh-4rem)]">
      {/* 1. Google-like "+ Utwórz ▾" button with smaller rounding and dropdown */}
      <div>
        <CreateDropdown onSelectType={onOpenCreateModal} />
      </div>

      {/* 2. Mini Calendar Picker */}
      <div className="bg-[#202124] p-3 rounded-xl border border-[#3c4043]/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#e3e3e3] capitalize">
            {format(miniDate, 'LLLL yyyy', { locale: pl })}
          </span>
          <div className="flex items-center space-x-0.5">
            <button 
              onClick={() => setMiniDate(subMonths(miniDate, 1))}
              className="p-1 hover:bg-[#35373a] rounded-full text-[#9aa0a6] hover:text-[#e3e3e3] transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setMiniDate(addMonths(miniDate, 1))}
              className="p-1 hover:bg-[#35373a] rounded-full text-[#9aa0a6] hover:text-[#e3e3e3] transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-[#9aa0a6] mb-1">
          {['P', 'W', 'Ś', 'C', 'P', 'S', 'N'].map((d, i) => (
            <div key={i}>{d}</div>
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
                className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-[11px] transition ${
                  isSelected 
                    ? 'bg-[#8ab4f8] text-[#1f1f1f] font-bold'
                    : isToday
                    ? 'border border-[#8ab4f8] text-[#8ab4f8] font-bold'
                    : isCurrentMonth 
                    ? 'text-[#e3e3e3] hover:bg-[#35373a]' 
                    : 'text-[#5f6368]'
                }`}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Moje kalendarze (Collapsible with chevron, large custom colored tick, hover 3 dots & X) */}
      <div className="space-y-1">
        <div 
          onClick={() => setMyCalendarsOpen(!myCalendarsOpen)}
          className="flex items-center justify-between py-1.5 px-2 hover:bg-[#282a2d] rounded-lg cursor-pointer transition text-[#e3e3e3] group"
        >
          <span className="text-xs font-semibold tracking-wide">
            Moje kalendarze
          </span>
          <button className="text-[#9aa0a6] group-hover:text-[#e3e3e3]">
            {myCalendarsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {myCalendarsOpen && (
          <div className="space-y-0.5 pt-1">
            {myCalendars.map((cal) => (
              <div
                key={cal.id}
                className="relative group flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-[#282a2d] transition cursor-pointer"
                onClick={() => onToggleCalendar(cal.id)}
              >
                {/* Left: Large colored tick & Name */}
                <div className="flex items-center space-x-2.5 truncate">
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

                {/* Right: Hover actions (X delete & 3 dots) */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                  {onDeleteCalendar && myCalendars.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCalendar(cal.id);
                      }}
                      className="p-1 hover:bg-[#35373a] text-[#9aa0a6] hover:text-[#f28b82] rounded-full transition"
                      title="Usuń kalendarz"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuCalendarId(activeMenuCalendarId === cal.id ? null : cal.id);
                    }}
                    className="p-1 hover:bg-[#35373a] text-[#9aa0a6] hover:text-[#e3e3e3] rounded-full transition"
                    title="Opcje kalendarza"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
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

      {/* 4. Inne kalendarze (Collapsible with +, chevron, large colored tick, hover 3 dots & X) */}
      <div className="space-y-1 pt-1 border-t border-[#3c4043]/50">
        <div 
          onClick={() => setOtherCalendarsOpen(!otherCalendarsOpen)}
          className="flex items-center justify-between py-1.5 px-2 hover:bg-[#282a2d] rounded-lg cursor-pointer transition text-[#e3e3e3] group"
        >
          <span className="text-xs font-semibold tracking-wide">
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
                className="p-1 hover:bg-[#35373a] rounded-full transition"
                title="Dodaj inny kalendarz"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            )}
            <button className="p-0.5">
              {otherCalendarsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {otherCalendarsOpen && (
          <div className="space-y-0.5 pt-1">
            {otherCalendars.map((cal) => (
              <div
                key={cal.id}
                className="relative group flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-[#282a2d] transition cursor-pointer"
                onClick={() => onToggleOtherCalendar(cal.id)}
              >
                {/* Left: Large colored tick & Name */}
                <div className="flex items-center space-x-2.5 truncate">
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

                {/* Right: Hover actions (X delete & 3 dots) */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                  {onDeleteOtherCalendar && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteOtherCalendar(cal.id);
                      }}
                      className="p-1 hover:bg-[#35373a] text-[#9aa0a6] hover:text-[#f28b82] rounded-full transition"
                      title="Usuń kalendarz"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuCalendarId(activeMenuCalendarId === cal.id ? null : cal.id);
                    }}
                    className="p-1 hover:bg-[#35373a] text-[#9aa0a6] hover:text-[#e3e3e3] rounded-full transition"
                    title="Opcje kalendarza"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
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

      {/* 5. Giełda terminów (Wymiana ze znajomymi) */}
      <div className="pt-2 border-t border-[#3c4043]/50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-[#fdd663]">
            <Users className="w-3.5 h-3.5" />
            <span>Giełda terminów</span>
          </div>
          <span className="text-[10px] bg-[#433519] text-[#feefc3] font-bold px-1.5 py-0.5 rounded-full border border-[#fdd663]/30">
            {exchangeableEvents.length}
          </span>
        </div>

        {exchangeableEvents.length === 0 ? (
          <div className="p-3 bg-[#202124] border border-dashed border-[#3c4043] rounded-lg text-center">
            <p className="text-xs text-[#9aa0a6]">Brak terminów na wymianę.</p>
            <p className="text-[10px] text-[#5f6368] mt-1">Udostępnij własny termin lub poproś kolegę o dodanie!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {exchangeableEvents.slice(0, 5).map((ev) => (
              <div 
                key={ev.id}
                className="p-2.5 bg-[#332a15]/50 border border-[#fdd663]/30 rounded-lg hover:bg-[#433519]/70 transition group text-left cursor-pointer"
                onClick={() => onProposeSwapWithEvent(ev)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#e3e3e3] truncate max-w-[130px]">{ev.title}</span>
                  <ArrowLeftRight className="w-3 h-3 text-[#fdd663] group-hover:scale-110 transition" />
                </div>
                <div className="flex items-center space-x-1 text-[11px] text-[#c4c7c5] mt-1">
                  <Clock className="w-3 h-3 text-[#9aa0a6]" />
                  <span>{ev.date} {ev.startTime}</span>
                </div>
                <div className="text-[10px] text-[#9aa0a6] mt-0.5 truncate">
                  Od: {ev.userName || ev.userEmail || "Znajomy"}
                </div>
                <button 
                  className="w-full mt-2 py-1 bg-[#1f1f1f] hover:bg-[#fdd663] hover:text-[#1f1f1f] border border-[#fdd663]/40 text-[#fdd663] text-[11px] font-semibold rounded transition"
                >
                  Zaproponuj wymianę
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info footer */}
      <div className="mt-auto pt-4 border-t border-[#3c4043]/50 text-[11px] text-[#9aa0a6]">
        <p className="flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-[#8ab4f8]" />
          <span>Synchronizacja Firestore Cloud</span>
        </p>
      </div>
    </aside>
  );
}
