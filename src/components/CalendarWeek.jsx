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

const HOURS = [
  'GMT+1', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM',
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
  onOpenCreateModal
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

  // Current time position (around 7 PM in screenshots)
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const timeProgressMinutes = currentHour * 56 + (currentMinutes / 60) * 56;

  // Separate all-day events (or holiday events) vs timed events
  const allDayEvents = events.filter(e => e.calendarId === 'swieta' || e.isAllDay);
  const timedEvents = events.filter(e => e.calendarId !== 'swieta' && !e.isAllDay);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-[#1e1f20] text-[#e3e3e3] rounded-[28px] border border-[#303134]/60 overflow-hidden select-none m-2 ml-1 mr-3 shadow-xl">
      {/* Top Header: Bez kratek / pionowych kresek między dniami (matching image 1 and 4) */}
      <div className="flex border-b border-[#303134] bg-[#1e1f20] shrink-0">
        {/* Left top box: When sidebar is collapsed, + button sits right here over GMT+1 (matching image 4) */}
        <div className="w-16 shrink-0 flex items-center justify-center py-2.5">
          {!isSidebarOpen ? (
            <CreateDropdown onSelectType={onOpenCreateModal} isCollapsed={true} />
          ) : (
            <div className="w-10 h-10" />
          )}
        </div>

        {/* Day columns: NO vertical borders between days (border-r-0) matching image 1 and 4 */}
        <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
          {days.map((day, idx) => {
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, currentDate);
            const dayName = DAY_NAMES[day.getDay()];

            return (
              <div 
                key={idx}
                className="py-2.5 text-center flex flex-col items-center justify-center cursor-pointer hover:bg-[#282a2d]/30 transition border-0"
              >
                <span className="text-[11px] font-semibold tracking-wider text-[#9aa0a6] mb-1">
                  {dayName}
                </span>

                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition ${
                    isToday || isSelected
                      ? 'bg-[#a8c7fa] text-[#041e49] font-bold shadow-md'
                      : 'text-[#e3e3e3] font-normal hover:bg-[#35373a]'
                  }`}
                >
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All-Day Events row (e.g. Dzień Niepodległości matching image 1) */}
      {allDayEvents.length > 0 && (
        <div className="flex border-b border-[#303134] bg-[#1e1f20] shrink-0 py-1">
          <div className="w-16 shrink-0 text-center text-[10px] text-[#9aa0a6] pt-1">
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

      {/* Scrollable Time Grid with vertical borders and horizontal lines */}
      <div ref={containerRef} className="flex-1 overflow-y-auto relative">
        <div className="flex min-h-[1350px]">
          {/* Left Hours column */}
          <div className="w-16 shrink-0 bg-[#1e1f20] select-none">
            {HOURS.slice(1).map((hour, idx) => (
              <div 
                key={idx} 
                className="h-14 relative text-right pr-3 text-[11px] font-medium text-[#9aa0a6] -top-2.5"
              >
                {hour}
              </div>
            ))}
          </div>

          {/* Day Grid Columns */}
          <div 
            className="flex-1 grid relative" 
            style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
          >
            {days.map((day, dIdx) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayEvents = timedEvents.filter(e => e.date === dateStr);
              const isToday = isSameDay(day, today);

              return (
                <div 
                  key={dIdx} 
                  className="border-r border-[#303134] relative h-full"
                >
                  {/* Hour slots */}
                  {HOURS.slice(1).map((_, hIdx) => (
                    <div 
                      key={hIdx} 
                      onClick={() => onSelectSlot(day, `${(hIdx + 1).toString().padStart(2, '0')}:00`)}
                      className="h-14 border-b border-[#303134]/60 hover:bg-[#282a2d]/30 cursor-pointer transition"
                    />
                  ))}

                  {/* Red current time indicator line matching image 1 and 2 */}
                  {isToday && (
                    <div 
                      className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                      style={{ top: `${timeProgressMinutes}px` }}
                    >
                      <div className="w-3 h-3 bg-[#ea4335] rounded-full -ml-1.5 shadow-xs" />
                      <div className="flex-1 border-t-2 border-[#ea4335]" />
                    </div>
                  )}

                  {/* Timed Events in this day matching image 5 */}
                  {dayEvents.map((event) => {
                    let topPx = 100;
                    let heightPx = 50;

                    if (event.startTime) {
                      const [h, m] = event.startTime.split(':').map(Number);
                      const startMinutes = h * 56 + ((m || 0) / 60) * 56;
                      topPx = Math.max(0, startMinutes);
                    }
                    if (event.endTime && event.startTime) {
                      const [sh, sm] = event.startTime.split(':').map(Number);
                      const [eh, em] = event.endTime.split(':').map(Number);
                      const durMinutes = ((eh * 60 + em) - (sh * 60 + sm));
                      if (durMinutes > 0) heightPx = Math.max(34, (durMinutes / 60) * 56);
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
