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
      {/* Top Header: bez kratek między liczbami dni, bez kreski pionowej obok dnia, bez 1. poziomej */}
      <div className="flex bg-[#131314] shrink-0 pt-2 pb-1 pr-1.5">
        {/* Left top box: When sidebar is collapsed, + button sits right here (bez kreski pionowej) */}
        <div className="w-16 shrink-0 flex items-center justify-center">
          {!isSidebarOpen ? (
            <CreateDropdown onSelectType={onOpenCreateModal} isCollapsed={true} />
          ) : (
            <div className="w-10 h-10" />
          )}
        </div>

        {/* Day columns: W widoku dnia wyrównanie DO LEWEJ, bez kratek między liczbami dni */}
        <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
          {days.map((day, idx) => {
            const isToday = isSameDay(day, today);
            const dayName = DAY_NAMES[day.getDay()];

            // W głównym kalendarzu tylko dzisiejsza data ma niebieskie tło koła i niebieską nazwę;
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
                className={`py-0.5 transition select-none cursor-pointer group ${
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
                    <span className={`text-[11px] tracking-wider mb-0.5 transition ${nameClass}`}>
                      {dayName}
                    </span>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition ${circleClass}`}>
                      {format(day, 'd')}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        {/* Spacer wyrównujący szerokość do scrollbara */}
        <div className="w-[9px] shrink-0" />
      </div>

      {/* Row with GMT+1 and all-day events: proste pionowe kreski idealnie równe z siatką; linia pozioma tylko pod dniami i 8px znacznik w GMT */}
      <div className="flex bg-[#131314] shrink-0 pr-1.5 min-h-[36px]">
        <div className="w-16 shrink-0 text-center text-[11px] font-medium text-white flex items-center justify-center border-r border-white/20 py-1.5 relative">
          GMT+1
          {/* Poziomy znacznik 8px w lewo od pionowej linii, identycznie jak w godzinach poniżej (nie idzie za daleko w lewo) */}
          <div className="absolute right-0 bottom-0 w-2 border-b border-white/15 pointer-events-none" />
        </div>
        <div className="flex-1 grid relative border-b border-white/15" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
          {days.map((day, idx) => {
            const isLastColumn = idx === days.length - 1;
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayHolidays = allDayEvents.filter(e => e.date === dateStr);

            return (
              <div 
                key={idx} 
                className={`px-1.5 flex flex-col justify-center py-1.5 ${isLastColumn ? 'border-r-0' : 'border-r border-white/20'}`}
              >
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
        {/* Spacer wyrównujący szerokość do scrollbara, aby kratki były idealnie równe */}
        <div className="w-[9px] shrink-0 border-b border-white/15" />
      </div>

      {/* Scrollable Time Grid: godziny minimalnie bliżej prawej (pr-3.5), kreski poziome na TYM SAMYM poziomie co siatka */}
      <div ref={containerRef} className="flex-1 overflow-y-auto relative bg-[#131314] pr-1.5 pt-0">
        <div className="flex min-h-[1150px]">
          {/* Left Hours column: godziny minimalnie bliżej prawej (pr-3.5) */}
          <div className="w-16 shrink-0 bg-[#131314] select-none border-r border-white/20 relative">
            {HOURS.map((hour, idx) => (
              <div 
                key={idx} 
                className="h-12 relative flex items-start justify-end pr-3.5 text-[11px] font-medium text-white"
              >
                <span className="relative -top-2 bg-[#131314] px-1 z-10">{hour}</span>
                {/* Linia pozioma wystająca 8px w lewo - na TYM SAMYM poziomie (top-0 border-t border-white/15) */}
                <div className="absolute right-0 top-0 w-2 border-t border-white/15 pointer-events-none" />
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
                  {/* Hour slots: linie poziome border-t dopasowane idealnie do znaczników */}
                  {HOURS.map((_, hIdx) => {
                    const slotHour = hIdx + 1;
                    const isLastRow = hIdx === HOURS.length - 1;
                    return (
                      <div 
                        key={hIdx} 
                        onClick={() => onSelectSlot(day, `${slotHour.toString().padStart(2, '0')}:00`)}
                        className={`h-12 border-t border-white/15 hover:bg-[#1f2022] cursor-pointer transition ${
                          isLastRow ? 'border-b border-white/15' : ''
                        }`}
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
