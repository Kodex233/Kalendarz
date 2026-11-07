import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay 
} from 'date-fns';
import { pl } from 'date-fns/locale';

export default function CalendarMonth({
  currentDate,
  events,
  onSelectEvent,
  onSelectDate,
  onViewChange,
  currentUserId
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  // Sunday first matching image 1 and 2 (NIEDZ., PON., WT., ŚR., CZW., PT., SOB.)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const today = new Date();

  const weekDayNames = ['NIEDZ.', 'PON.', 'WT.', 'ŚR.', 'CZW.', 'PT.', 'SOB.'];

  // Group events by YYYY-MM-DD
  const eventsByDate = React.useMemo(() => {
    const map = {};
    events.forEach(event => {
      if (!map[event.date]) {
        map[event.date] = [];
      }
      map[event.date].push(event);
    });
    Object.keys(map).forEach(key => {
      map[key].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    });
    return map;
  }, [events]);

  const handleDayClick = (day) => {
    if (onSelectDate) onSelectDate(day);
    if (onViewChange) onViewChange('day');
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-5.5rem)] mb-4 bg-[#131314] text-[#e3e3e3] rounded-[28px] border-0 overflow-hidden select-none m-3 ml-2 shadow-2xl">
      {/* Week day headers */}
      <div className="grid grid-cols-7 bg-[#131314] border-b border-white/10">
        {weekDayNames.map((name, i) => (
          <div 
            key={i} 
            className="py-2.5 text-center text-[11px] font-semibold text-[#9aa0a6] uppercase tracking-wider"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Month Days Grid with clearly visible lines */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6 bg-[#131314]">
        {days.map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDate[dateStr] || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, currentDate);

          let circleClass = 'text-[#e3e3e3] hover:bg-[#35373a]';
          if (isToday) {
            circleClass = 'bg-[#a8c7fa] text-[#041e49] font-medium shadow-xs';
          } else if (isSelected) {
            circleClass = 'bg-[#0f5223] text-[#a8c7fa] font-medium shadow-xs';
          }

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(day)}
              className={`border-r border-b border-white/15 p-1.5 flex flex-col overflow-hidden transition ${
                !isCurrentMonth ? 'bg-[#131314]/50 opacity-40' : 'hover:bg-[#1a1b1e]'
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between mb-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDayClick(day);
                  }}
                  className={`w-7 h-7 rounded-full text-xs flex items-center justify-center transition ${circleClass}`}
                  title="Kliknij, aby przejść do widoku dnia"
                >
                  {format(day, 'd')}
                </button>
              </div>

              {/* Event Pills */}
              <div className="flex-1 overflow-y-auto space-y-1">
                {dayEvents.slice(0, 3).map((event) => {
                  const bgCol = event.customBg || '#1a73e8';
                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(event);
                      }}
                      className="px-2 py-0.5 rounded text-[11px] truncate cursor-pointer transition hover:brightness-110 text-white font-medium shadow-2xs"
                      style={{ backgroundColor: bgCol }}
                    >
                      {event.title}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-[#9aa0a6] pl-1 font-medium">
                    +{dayEvents.length - 3} więcej
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
