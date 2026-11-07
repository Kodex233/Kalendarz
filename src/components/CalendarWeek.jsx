import React, { useRef } from 'react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  addDays 
} from 'date-fns';
import { Plus } from 'lucide-react';
import CreateDropdown from './CreateDropdown';

// Kalendarz zaczyna się od 1 AM na samej górze
const HOURS = [
  '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM',
  '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', 
  '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', 
  '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
];

export default function CalendarWeek({
  currentDate,
  events,
  onSelectEvent,
  onSelectSlot,
  viewMode = 'week', // 'week', 'day', 'fourDays'
  isSidebarOpen = true,
  onOpenCreateModal,
  onSelectDate,
  onViewChange
}) {
  const containerRef = useRef(null);
  const today = new Date();

  // Days in view
  let days = [];
  if (viewMode === 'day') {
    days = [currentDate];
  } else if (viewMode === 'fourDays') {
    days = Array.from({ length: 4 }).map((_, i) => addDays(currentDate, i));
  } else {
    // Week: Sunday first matching image 1 (NIEDZ., PON., WT., ŚR., CZW., PT., SOB.)
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const end = endOfWeek(currentDate, { weekStartsOn: 0 });
    days = eachDayOfInterval({ start, end });
  }

  const DAY_NAMES = ['NIEDZ.', 'PON.', 'WT.', 'ŚR.', 'CZW.', 'PT.', 'SOB.'];

  // Current time position indicator (48px per hour starting at 1 AM)
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const timeProgressMinutes = Math.max(0, (currentHour - 1) * 48 + (currentMinutes / 60) * 48);

  // Separate all-day events vs timed events
  const allDayEvents = events.filter(e => e.calendarId === 'swieta' || e.isAllDay);
  const timedEvents = events.filter(e => e.calendarId !== 'swieta' && !e.isAllDay);

  const handleDayHeaderClick = (day) => {
    if (onSelectDate) onSelectDate(day);
    if (onViewChange) onViewChange('day');
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-5.5rem)] mb-5 mr-4 m-3 ml-2 mt-1 bg-[#131314] text-[#e3e3e3] rounded-[28px] border-0 overflow-hidden select-none shadow-2xl">
      {/* Top Header: BEZ POZIOMEJ KRESKI POD DNIAMI */}
      <div className="flex bg-[#131314] shrink-0 pt-2 pb-1 pr-1.5">
        {/* Left top box: When sidebar is collapsed, + button sits right here */}
        <div className="w-16 shrink-0 flex items-center justify-center">
          {!isSidebarOpen ? (
            <CreateDropdown onSelectType={onOpenCreateModal} isCollapsed={true} />
          ) : (
            <div className="w-10 h-10" />
          )}
        </div>

        {/* Day columns: W widoku dnia wyrównanie DO LEWEJ, zielony kolor usunięty z głównego kalendarza */}
        <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
          {days.map((day, idx) => {
            const isToday = isSameDay(day, today);
            const dayName = DAY_NAMES[day.getDay()];

            // W głównym kalendarzu tylko dzisiejsza data ma niebieskie tło koła i niebieską nazwę;
            // Pozostałe dni mają zwykły tekst (bez zielonego tła)
            let circleClass = 'text-[#e3e3e3] font-normal hover:bg-[#282a2d]';
            let nameClass = 'text-[#9aa0a6]';

            if (isToday) {
              circleClass = 'bg-[#a8c7fa] text-[#041e49] font-medium shadow-md';
              nameClass = 'text-[#a8c7fa] font-bold';
            }

            return (
              <div 
                key={idx}
                onClick={() => handleDayHeaderClick(day)}
                className={`py-1 transition border-0 select-none cursor-pointer group ${
                  viewMode === 'day' 
                    ? 'flex flex-row items-center space-x-3.5 pl-4 text-left justify-start' 
                    : 'flex flex-col items-center justify-center text-center'
                }`}
                title={`Przejdź do widoku dnia: ${format(day, 'd MMMM')}`}
              >
                {viewMode === 'day' ? (
                  <>
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-2xl transition shrink-0 ${circleClass}`}>
                      {format(day, 'd')}
                    </div>
                    <span className={`text-sm tracking-wider uppercase transition ${nameClass}`}>
                      {dayName}
                    </span>
                  </>
                ) : (
                  <>
                    <span className={`text-[11px] tracking-wider mb-1 transition ${nameClass}`}>
                      {dayName}
                    </span>
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-2xl transition ${circleClass}`}>
                      {format(day, 'd')}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* All-Day Events row: GMT+1 w pełni widoczne */}
      {allDayEvents.length > 0 && (
        <div className="flex bg-[#131314] shrink-0 py-2 border-b border-white/10 pr-1.5">
          <div className="w-16 shrink-0 text-center text-[11px] font-medium text-[#9aa0a6] flex items-center justify-center border-r border-white/20">
            GMT+1
          </div>
          <div className="flex-1 grid relative" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
            {days.map((day, idx) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayHolidays = allDayEvents.filter(e => e.date === dateStr);

              return (
                <div key={idx} className="px-1.5 flex flex-col justify-center">
                  {dayHolidays.map(hol => (
                    <div
                      key={hol.id}
                      onClick={() => onSelectEvent(hol)}
                      className="px-3 py-1 rounded-md text-xs font-medium text-white truncate shadow-xs cursor-pointer hover:brightness-110 transition text-center"
                      style={{ backgroundColor: hol.customBg || '#34a853' }}
                    >
                      {hol.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scrollable Time Grid: 1 AM nie jest ucinane, brak pionowej kreski po prawej */}
      <div ref={containerRef} className="flex-1 overflow-y-auto relative bg-[#131314] pr-1.5 pt-2">
        <div className="flex min-h-[1150px]">
          {/* Left Hours column: 1 AM w pełni widoczne z pionową kreską z prawej */}
          <div className="w-16 shrink-0 bg-[#131314] select-none border-r border-white/20">
            {HOURS.map((hour, idx) => (
              <div 
                key={idx} 
                className="h-12 relative text-right pr-3 text-[11px] font-medium text-[#9aa0a6] flex items-start justify-end"
              >
                {hour}
              </div>
            ))}
          </div>

          {/* Day Grid Columns: białe linie siatki, brak prawej kreski na ostatniej kolumnie */}
          <div 
            className="flex-1 grid relative" 
            style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
          >
            {days.map((day, dIdx) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayEvents = timedEvents.filter(e => e.date === dateStr);
              const isToday = isSameDay(day, today);
              const isLastColumn = dIdx === days.length - 1;

              return (
                <div 
                  key={dIdx} 
                  className={`relative h-full ${isLastColumn ? 'border-r-0' : 'border-r border-white/20'}`}
                >
                  {/* Hour slots: mniejszy dystans h-12 */}
                  {HOURS.map((_, hIdx) => {
                    const slotHour = hIdx + 1;
                    return (
                      <div 
                        key={hIdx} 
                        onClick={() => onSelectSlot(day, `${slotHour.toString().padStart(2, '0')}:00`)}
                        className="h-12 border-b border-white/15 hover:bg-[#1f2022] cursor-pointer transition"
                      />
                    );
                  })}

                  {/* Red current time indicator line */}
                  {isToday && (
                    <div 
                      className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                      style={{ top: `${timeProgressMinutes}px` }}
                    >
                      <div className="w-3 h-3 bg-[#ea4335] rounded-full -ml-1.5 shadow-xs" />
                      <div className="flex-1 border-t-2 border-[#ea4335]" />
                    </div>
                  )}

                  {/* Timed Events */}
                  {dayEvents.map((event) => {
                    let topPx = 48;
                    let heightPx = 48;

                    if (event.startTime) {
                      const [h, m] = event.startTime.split(':').map(Number);
                      const startMinutes = Math.max(0, (h - 1) * 48 + ((m || 0) / 60) * 48);
                      topPx = startMinutes;
                    }
                    if (event.endTime && event.startTime) {
                      const [sh, sm] = event.startTime.split(':').map(Number);
                      const [eh, em] = event.endTime.split(':').map(Number);
                      const durMinutes = ((eh * 60 + em) - (sh * 60 + sm));
                      if (durMinutes > 0) heightPx = Math.max(28, (durMinutes / 60) * 48);
                    }

                    const bgCol = event.customBg || '#1a73e8';

                    return (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(event);
                        }}
                        style={{
                          top: `${topPx}px`,
                          height: `${heightPx}px`,
                          backgroundColor: bgCol
                        }}
                        className="absolute left-1 right-2 rounded-lg px-2.5 py-1 text-xs font-medium overflow-hidden shadow-md cursor-pointer hover:brightness-110 transition z-10 text-white"
                      >
                        <div className="font-semibold truncate">{event.title}</div>
                        <div className="text-[10px] opacity-90 truncate">
                          {event.startTime}–{event.endTime}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
