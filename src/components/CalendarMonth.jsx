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
import { ArrowLeftRight } from 'lucide-react';

const COLOR_MAP = {
  blue: 'bg-[#1b3a57] text-[#c2e7ff] border-l-4 border-[#8ab4f8] hover:bg-[#23486c]',
  green: 'bg-[#133926] text-[#c4eed0] border-l-4 border-[#81c995] hover:bg-[#1a4a32]',
  purple: 'bg-[#371e54] text-[#e8dff5] border-l-4 border-[#c58af9] hover:bg-[#48286e]',
  red: 'bg-[#4c1f24] text-[#fce8e6] border-l-4 border-[#f28b82] hover:bg-[#61272d]',
  yellow: 'bg-[#433519] text-[#feefc3] border-l-4 border-[#fdd663] hover:bg-[#564420]',
  gray: 'bg-[#303134] text-[#e8eaed] border-l-4 border-[#9aa0a6] hover:bg-[#3c4043]',
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
    Object.keys(map).forEach(key => {
      map[key].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    });
    return map;
  }, [events]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-[#1f1f1f] text-[#e3e3e3] overflow-hidden select-none">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-[#3c4043] bg-[#1f1f1f]">
        {weekDayNames.map((name, i) => (
          <div 
            key={i} 
            className="py-2 text-center text-[11px] font-semibold text-[#9aa0a6] uppercase tracking-wider"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-6 border-b border-l border-[#3c4043]">
        {days.map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDate[dateStr] || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, today);

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(day)}
              className={`border-r border-b border-[#3c4043] p-1.5 flex flex-col min-h-0 overflow-hidden cursor-pointer transition ${
                isCurrentMonth 
                  ? 'bg-[#1f1f1f] hover:bg-[#282a2d]' 
                  : 'bg-[#191a1c] text-[#5f6368]'
              }`}
            >
              {/* Day header number */}
              <div className="flex justify-between items-center mb-1">
                <span
                  className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday
                      ? 'bg-[#8ab4f8] text-[#1f1f1f] font-bold shadow-sm'
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
                  const colorClass = COLOR_MAP[event.color] || (event.customBg ? '' : COLOR_MAP.blue);
                  const customStyle = event.customBg ? { backgroundColor: event.customBg, color: '#ffffff' } : {};

                  return (
                    <div
                      key={event.id}
                      style={customStyle}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(event);
                      }}
                      className={`text-[11px] font-medium px-2 py-0.5 rounded truncate shadow-xs flex items-center justify-between transition cursor-pointer ${colorClass}`}
                      title={`${event.title} (${event.startTime || ''} - ${event.endTime || ''}) ${event.isExchangeable ? '• Termin do wymiany' : ''}`}
                    >
                      <div className="flex items-center space-x-1.5 truncate">
                        {event.startTime && (
                          <span className="font-semibold text-[10px] opacity-90 shrink-0">
                            {event.startTime}
                          </span>
                        )}
                        <span className="truncate">{event.title}</span>
                      </div>

                      {event.isExchangeable && (
                        <span 
                          className="shrink-0 ml-1 p-0.5 bg-amber-500/20 text-amber-300 rounded-full" 
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
