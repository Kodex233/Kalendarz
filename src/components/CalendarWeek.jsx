import React, { useRef, useEffect } from 'react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  addDays 
} from 'date-fns';
import { pl } from 'date-fns/locale';
import { ArrowLeftRight } from 'lucide-react';

const HOURS = [
  '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', 
  '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', 
  '6 PM', '7 PM', '8 PM'
];

export default function CalendarWeek({
  currentDate,
  events,
  onSelectEvent,
  onSelectSlot,
  viewMode = 'week', // 'week', 'day', 'fourDays'
  currentUserId
}) {
  const containerRef = useRef(null);
  const today = new Date();

  // Determine days in view
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

  // Current time position (e.g., around 6:45 PM)
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const timeProgressMinutes = (currentHour - 8) * 60 + currentMinutes;
  const showTimeLine = currentHour >= 8 && currentHour <= 20;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-[#1f1f1f] text-[#e3e3e3] overflow-hidden select-none">
      {/* Top Header: Day columns matching image 1 */}
      <div className="flex border-b border-[#3c4043] bg-[#1f1f1f]">
        {/* GMT+1 label column */}
        <div className="w-16 shrink-0 text-center py-3 text-[10px] font-bold text-[#9aa0a6] border-r border-[#3c4043]">
          GMT+1
        </div>

        {/* Day columns */}
        <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
          {days.map((day, idx) => {
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, currentDate);
            const dayName = DAY_NAMES[day.getDay()];

            return (
              <div 
                key={idx}
                className="py-2.5 text-center flex flex-col items-center justify-center border-r border-[#3c4043] cursor-pointer hover:bg-[#282a2d]/40 transition"
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

      {/* Scrollable Time Grid matching image 1 */}
      <div ref={containerRef} className="flex-1 overflow-y-auto relative">
        <div className="flex min-h-[780px]">
          {/* Left Hours column */}
          <div className="w-16 shrink-0 border-r border-[#3c4043] bg-[#1f1f1f] select-none">
            {HOURS.map((hour, idx) => (
              <div 
                key={idx} 
                className="h-16 relative text-right pr-2.5 text-[11px] font-medium text-[#9aa0a6] -top-2.5"
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
              const dayEvents = events.filter(e => e.date === dateStr);
              const isToday = isSameDay(day, today);

              return (
                <div 
                  key={dIdx} 
                  className="border-r border-[#3c4043] relative h-full"
                >
                  {/* Hour slots */}
                  {HOURS.map((_, hIdx) => (
                    <div 
                      key={hIdx} 
                      onClick={() => onSelectSlot(day, `${hIdx + 8}:00`)}
                      className="h-16 border-b border-[#3c4043]/50 hover:bg-[#282a2d]/30 cursor-pointer transition"
                    />
                  ))}

                  {/* Red current time indicator line matching image 1 */}
                  {isToday && showTimeLine && (
                    <div 
                      className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                      style={{ top: `${(timeProgressMinutes / 60) * 64}px` }}
                    >
                      <div className="w-3 h-3 bg-[#ea4335] rounded-full -ml-1.5 shadow-xs" />
                      <div className="flex-1 border-t-2 border-[#ea4335]" />
                    </div>
                  )}

                  {/* Events in this day */}
                  {dayEvents.map((event) => {
                    // Calculate vertical position based on startTime
                    let topPx = 20;
                    let heightPx = 54;
                    if (event.startTime) {
                      const [h, m] = event.startTime.split(':').map(Number);
                      const startMinutes = (h - 8) * 60 + (m || 0);
                      topPx = Math.max(0, (startMinutes / 60) * 64);
                    }
                    if (event.endTime && event.startTime) {
                      const [sh, sm] = event.startTime.split(':').map(Number);
                      const [eh, em] = event.endTime.split(':').map(Number);
                      const durMinutes = ((eh * 60 + em) - (sh * 60 + sm));
                      if (durMinutes > 0) heightPx = Math.max(30, (durMinutes / 60) * 64);
                    }

                    const bgStyle = event.customBg 
                      ? { backgroundColor: event.customBg, color: '#ffffff' } 
                      : (event.color === 'green' 
                        ? { backgroundColor: '#133926', color: '#c4eed0', borderLeft: '4px solid #81c995' }
                        : { backgroundColor: '#1b3a57', color: '#c2e7ff', borderLeft: '4px solid #8ab4f8' });

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
                          ...bgStyle
                        }}
                        className="absolute left-1 right-1.5 rounded-lg px-2.5 py-1 text-xs font-medium overflow-hidden shadow-md cursor-pointer hover:brightness-110 transition z-10"
                      >
                        <div className="font-bold truncate">{event.title}</div>
                        <div className="text-[10px] opacity-80 truncate">
                          {event.startTime} - {event.endTime}
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
