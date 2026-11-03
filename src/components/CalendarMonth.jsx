import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  parseISO 
} from 'date-fns';
import { pl } from 'date-fns/locale';
import { ArrowLeftRight, Clock, User } from 'lucide-react';

const COLOR_MAP = {
  blue: 'bg-blue-100 text-blue-800 border-l-4 border-blue-600 hover:bg-blue-200',
  green: 'bg-emerald-100 text-emerald-800 border-l-4 border-emerald-600 hover:bg-emerald-200',
  purple: 'bg-purple-100 text-purple-800 border-l-4 border-purple-600 hover:bg-purple-200',
  red: 'bg-rose-100 text-rose-800 border-l-4 border-rose-600 hover:bg-rose-200',
  yellow: 'bg-amber-100 text-amber-900 border-l-4 border-amber-500 hover:bg-amber-200',
  gray: 'bg-gray-100 text-gray-800 border-l-4 border-gray-600 hover:bg-gray-200',
};

export default function CalendarMonth({
  currentDate,
  events,
  onSelectEvent,
  onSelectDate,
  currentUserId
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const today = new Date();

  const weekDayNames = ['PON.', 'WT.', 'ŚR.', 'CZW.', 'PT.', 'SOB.', 'NIEDZ.'];

  // Group events by YYYY-MM-DD
  const eventsByDate = React.useMemo(() => {
    const map = {};
    events.forEach(event => {
      if (!map[event.date]) {
        map[event.date] = [];
      }
      map[event.date].push(event);
    });
    // Sort events within each day by startTime
    Object.keys(map).forEach(key => {
      map[key].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    });
    return map;
  }, [events]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-white overflow-hidden select-none">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/50">
        {weekDayNames.map((name, i) => (
          <div 
            key={i} 
            className="py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-6 border-b border-l border-gray-200">
        {days.map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDate[dateStr] || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, today);

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(day)}
              className={`border-r border-b border-gray-200 p-1.5 flex flex-col min-h-0 overflow-hidden cursor-pointer transition ${
                isCurrentMonth ? 'bg-white hover:bg-blue-50/20' : 'bg-gray-50/60 text-gray-400'
              }`}
            >
              {/* Day header number */}
              <div className="flex justify-between items-center mb-1">
                <span
                  className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday
                      ? 'bg-blue-600 text-white font-bold'
                      : isCurrentMonth
                      ? 'text-gray-700'
                      : 'text-gray-400'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-gray-500 font-medium">
                    +{dayEvents.length - 2} więcej
                  </span>
                )}
              </div>

              {/* Event Chips List */}
              <div className="flex-1 space-y-1 overflow-y-auto pr-0.5">
                {dayEvents.slice(0, 3).map((event) => {
                  const isMine = event.userId === currentUserId;
                  const colorClass = COLOR_MAP[event.color] || COLOR_MAP.blue;

                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(event);
                      }}
                      className={`text-[11px] font-medium px-1.5 py-1 rounded truncate shadow-xs flex items-center justify-between transition cursor-pointer ${colorClass}`}
                      title={`${event.title} (${event.startTime || ''} - ${event.endTime || ''}) ${event.isExchangeable ? '• Termin do wymiany' : ''}`}
                    >
                      <div className="flex items-center space-x-1 truncate">
                        {event.startTime && (
                          <span className="font-semibold text-[10px] opacity-80 shrink-0">
                            {event.startTime}
                          </span>
                        )}
                        <span className="truncate">{event.title}</span>
                      </div>

                      {event.isExchangeable && (
                        <span 
                          className="shrink-0 ml-1 p-0.5 bg-amber-200/90 text-amber-900 rounded-full" 
                          title="Ten termin można wymienić"
                        >
                          <ArrowLeftRight className="w-2.5 h-2.5" />
                        </span>
                      )}
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
