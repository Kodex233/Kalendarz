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

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-[#1e1f20] text-[#e3e3e3] rounded-[28px] border border-[#303134]/60 overflow-hidden select-none m-2 ml-1 mr-3 shadow-xl">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-[#303134] bg-[#1e1f20]">
        {weekDayNames.map((name, i) => (
          <div 
            key={i} 
            className="py-2.5 text-center text-[11px] font-semibold text-[#9aa0a6] uppercase tracking-wider"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-6 border-b border-l border-[#303134]">
        {days.map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDate[dateStr] || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, currentDate);

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(day)}
              className={`border-r border-b border-[#303134] p-1.5 flex flex-col min-h-0 overflow-hidden cursor-pointer transition ${
                isCurrentMonth 
                  ? 'bg-[#1e1f20] hover:bg-[#282a2d]' 
                  : 'bg-[#161718] text-[#5f6368]'
              }`}
            >
              {/* Day header number with circular highlight */}
              <div className="flex justify-between items-center mb-1">
                <span
                  className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full transition ${
                    isToday || isSelected
                      ? 'bg-[#a8c7fa] text-[#041e49] font-bold shadow-xs'
                      : isCurrentMonth
                      ? 'text-[#e3e3e3]'
                      : 'text-[#5f6368]'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-[#9aa0a6] font-medium">
                    +{dayEvents.length - 2} więcej
                  </span>
                )}
              </div>

              {/* Event Chips List */}
              <div className="flex-1 space-y-1 overflow-y-auto pr-0.5">
                {dayEvents.slice(0, 3).map((event) => {
                  const customStyle = event.customBg ? { backgroundColor: event.customBg, color: '#ffffff' } : { backgroundColor: '#1a73e8', color: '#ffffff' };

                  return (
                    <div
                      key={event.id}
                      style={customStyle}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(event);
                      }}
                      className="text-[11px] font-medium px-2 py-0.5 rounded truncate shadow-xs flex items-center justify-between transition cursor-pointer hover:brightness-110"
                      title={`${event.title} (${event.startTime || ''} - ${event.endTime || ''})`}
                    >
                      <div className="flex items-center space-x-1.5 truncate">
                        {event.startTime && (
                          <span className="font-semibold text-[10px] opacity-90 shrink-0">
                            {event.startTime}
                          </span>
                        )}
                        <span className="truncate">{event.title}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
