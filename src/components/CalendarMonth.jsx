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
  // Sunday first matching user screenshot
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const today = new Date();

  const weekDayNames = ['NIEDZ.', 'PON.', 'WT.', 'ŚR.', 'CZW.', 'PT.', 'SOB.'];

  // 5 or 6 rows so that the grid expands to fill 100% of the canvas height with no empty space
  const numRows = Math.ceil(days.length / 7);

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
    <div className="flex-1 flex flex-col h-[calc(100vh-5.5rem)] mb-5 mr-4 m-3 ml-2 mt-1 bg-[#131314] text-[#e3e3e3] rounded-[28px] border-0 overflow-hidden select-none shadow-2xl">
      {/* Month Days Grid: kratki na cały tło kalendarza, brak pustego miejsca na dole */}
      <div 
        className="flex-1 grid grid-cols-7 h-full bg-[#131314]"
        style={{ gridTemplateRows: `repeat(${numRows}, minmax(0, 1fr))` }}
      >
        {days.map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDate[dateStr] || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, today);
          const isFirstRow = idx < 7;
          const isLastCol = idx % 7 === 6;
          const isLastRow = Math.floor(idx / 7) === numRows - 1;

          // Pierwszy dzień miesiąca ma skrót nazwy miesiąca obok liczby (np. "1 lut", "1 mar") matching screenshot
          const isFirstOfMonth = day.getDate() === 1;
          const monthAbbr = format(day, 'LLL', { locale: pl });
          const dayDisplay = isFirstOfMonth ? `1 ${monthAbbr}` : format(day, 'd');

          let circleClass = 'text-[#e3e3e3] hover:bg-[#35373a]';
          if (isToday) {
            circleClass = 'bg-[#a8c7fa] text-[#041e49] font-medium shadow-xs';
          }

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(day)}
              className={`p-1.5 flex flex-col overflow-hidden transition relative ${
                isLastCol ? 'border-r-0' : 'border-r border-white/15'
              } ${
                isLastRow ? 'border-b-0' : 'border-b border-white/15'
              } ${
                !isCurrentMonth ? 'bg-[#131314] text-[#9aa0a6] opacity-75' : 'hover:bg-[#1a1b1e]'
              }`}
            >
              {/* Header inside cell: in first row show weekday name (e.g. NIEDZ., PON.), followed by centered day number */}
              <div className="flex flex-col items-center justify-center mb-1">
                {isFirstRow && (
                  <span className="text-[11px] font-medium text-white uppercase tracking-wider mb-1">
                    {weekDayNames[idx]}
                  </span>
                )}
                
                {/* Liczba na środku: idealnie okrągłe tło (w-7 h-7 rounded-full) bez efektu jaja */}
                {isFirstOfMonth ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDayClick(day);
                    }}
                    className={`h-7 flex items-center justify-center space-x-1 text-xs transition font-normal ${
                      isToday ? '' : 'px-2 rounded-full text-[#e3e3e3] hover:bg-[#35373a]'
                    }`}
                    title="Kliknij, aby przejść do widoku dnia"
                  >
                    {isToday ? (
                      <>
                        <span className="w-7 h-7 rounded-full bg-[#a8c7fa] text-[#041e49] font-medium flex items-center justify-center shadow-xs">
                          1
                        </span>
                        <span className="text-xs text-[#a8c7fa] font-medium capitalize pr-1">
                          {monthAbbr}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>1</span>
                        <span className="capitalize">{monthAbbr}</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDayClick(day);
                    }}
                    className={`w-7 h-7 rounded-full text-xs flex items-center justify-center transition ${circleClass} font-normal shrink-0`}
                    title="Kliknij, aby przejść do widoku dnia"
                  >
                    {dayDisplay}
                  </button>
                )}
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
                  <div className="text-[10px] text-[#9aa0a6] text-center font-medium">
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
