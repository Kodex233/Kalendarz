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

// 24 godziny w dobie: indeks 0 (00:00) to odstęp 1 kratki pod GMT (bez etykiety), indeks 1 (01:00) to 1 AM
const HOURS_COUNT = 24;
const HOUR_LABELS = [
  null,    // 00:00 - odstęp 1 kratki od GMT
  '1 AM',  // 01:00
  '2 AM',  // 02:00
  '3 AM',  // 03:00
  '4 AM',  // 04:00
  '5 AM',  // 05:00
  '6 AM',  // 06:00
  '7 AM',  // 07:00
  '8 AM',  // 08:00
  '9 AM',  // 09:00
  '10 AM', // 10:00
  '11 AM', // 11:00
  '12 PM', // 12:00
  '1 PM',  // 13:00
  '2 PM',  // 14:00
  '3 PM',  // 15:00
  '4 PM',  // 16:00
  '5 PM',  // 17:00
  '6 PM',  // 18:00
  '7 PM',  // 19:00
  '8 PM',  // 20:00
  '9 PM',  // 21:00
  '10 PM', // 22:00
  '11 PM'  // 23:00
];

const formatTimeRangeCompact = (start, end) => {
  if (!start || !end) return '';
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const sPeriod = sh >= 12 ? 'pm' : 'am';
  const ePeriod = eh >= 12 ? 'pm' : 'am';
  const sH = sh % 12 === 0 ? 12 : sh % 12;
  const eH = eh % 12 === 0 ? 12 : eh % 12;
  const sM = sm ? `:${sm.toString().padStart(2, '0')}` : '';
  const eM = em ? `:${em.toString().padStart(2, '0')}` : '';
  if (sPeriod === ePeriod) {
    return `${sM ? sH + sM : sH}–${eH}${eM}${ePeriod}`;
  }
  return `${sM ? sH + sM : sH}${sPeriod}–${eH}${eM}${ePeriod}`;
};

export default function CalendarWeek({
  currentDate,
  events,
  onSelectEvent,
  onSelectSlot,
  viewMode = 'week', // 'week', 'day', 'fourDays'
  isSidebarOpen = true,
  onOpenCreateModal,
  onSelectDate,
  onViewChange,
  creatingEvent
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

  // Current time position indicator (48px per hour, 1 AM starts after 1 kratka at 48px)
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const timeProgressMinutes = Math.max(0, currentHour * 48 + (currentMinutes / 60) * 48);

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

            // W głównym kalendarzu skróty nazw dni tygodnia minimalnie mniej białe (a dzisiejsza na jasnoniebiesko)
            let circleClass = 'text-[#e3e3e3] font-normal hover:bg-[#282a2d]';
            let nameClass = 'text-[#c4c7c5] font-medium';

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
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-2xl transition ${circleClass}`}>
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

      {/* Row with GMT+1 and all-day events: godziny i GMT lekko mniej białe */}
      <div className="flex bg-[#131314] shrink-0 pr-1.5 min-h-[18px]">
        <div className="w-16 shrink-0 text-center text-[10px] font-medium text-[#c4c7c5] flex items-center justify-center border-r border-white/20 py-0.5 relative">
          GMT+1
        </div>
        <div className="flex-1 grid relative" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
          {days.map((day, idx) => {
            const isLastColumn = idx === days.length - 1;
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayHolidays = allDayEvents.filter(e => e.date === dateStr);

            return (
              <div 
                key={idx} 
                className={`px-1.5 flex flex-col justify-center py-0.5 ${isLastColumn ? 'border-r-0' : 'border-r border-white/20'}`}
              >
                {dayHolidays.map(hol => (
                  <div
                    key={hol.id}
                    onClick={() => onSelectEvent(hol)}
                    className="px-3 py-0.5 rounded-md text-xs font-medium text-white truncate shadow-xs cursor-pointer hover:brightness-110 transition text-center"
                    style={{ backgroundColor: hol.customBg || '#34a853' }}
                  >
                    {hol.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        {/* Spacer wyrównujący szerokość do scrollbara */}
        <div className="w-[9px] shrink-0" />
      </div>

      {/* Scrollable Time Grid: 1 AM ma odstęp 1 kratki od GMT, kreski tylko z prawej (brak kresek po lewej stronie godzin, brak podwójnych kresek) */}
      <div ref={containerRef} className="flex-1 overflow-y-auto relative bg-[#131314] pr-1.5 pt-0">
        <div className="flex min-h-[1152px]">
          {/* Left Hours column: godziny minimalnie mniej białe (text-[#c4c7c5]) */}
          <div className="w-16 shrink-0 bg-[#131314] select-none border-r border-white/20 relative">
            {Array.from({ length: HOURS_COUNT }).map((_, idx) => {
              const label = HOUR_LABELS[idx];
              const isLast = idx === HOURS_COUNT - 1;
              return (
                <div 
                  key={idx} 
                  className={`h-12 relative flex items-start justify-end pr-3.5 text-[11px] font-medium text-[#c4c7c5] ${
                    isLast ? 'border-b border-white/15' : ''
                  }`}
                >
                  {label && (
                    <span className="relative -top-2 bg-[#131314] px-1 z-10 leading-none">{label}</span>
                  )}
                  {/* Linia pozioma wystająca 8px w lewo od pionowej linii (nigdy po lewej stronie godziny) */}
                  <div className="absolute right-0 top-0 w-2 border-t border-white/15 pointer-events-none" />
                </div>
              );
            })}
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
                  {/* 24 Hour slots: przekazanie współrzędnych klikniętej kratki dla pozycjonowania okienka */}
                  {Array.from({ length: HOURS_COUNT }).map((_, hIdx) => {
                    const isLast = hIdx === HOURS_COUNT - 1;
                    return (
                      <div 
                        key={hIdx} 
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          onSelectSlot(day, `${hIdx.toString().padStart(2, '0')}:00`, {
                            dayIndex: dIdx,
                            slotRect: {
                              top: rect.top,
                              bottom: rect.bottom,
                              left: rect.left,
                              right: rect.right,
                              width: rect.width,
                              height: rect.height
                            }
                          });
                        }}
                        className={`h-12 border-t border-white/15 hover:bg-[#1f2022] cursor-pointer transition ${
                          isLast ? 'border-b border-white/15' : ''
                        }`}
                      />
                    );
                  })}

                  {/* Red current time indicator line: wyżej w kratce (-translate-y-[24px]) i matowy jaśniejszy kolor (#e06d69) */}
                  {isToday && (
                    <div 
                      className="absolute left-0 right-0 z-20 flex items-center -translate-y-[24px] pointer-events-none"
                      style={{ top: `${timeProgressMinutes}px` }}
                    >
                      <div className="w-3 h-3 bg-[#e06d69] rounded-full -ml-1.5 shadow-xs" />
                      <div className="flex-1 border-t-2 border-[#e06d69]" />
                    </div>
                  )}

                  {/* Podgląd dodawanego wydarzenia (Image 4): (Bez tytułu) z godziną w kafelku obok okienka */}
                  {creatingEvent && creatingEvent.date === dateStr && (() => {
                    let topPx = 48;
                    let heightPx = 48;
                    if (creatingEvent.startTime) {
                      const [h, m] = creatingEvent.startTime.split(':').map(Number);
                      topPx = Math.max(0, h * 48 + ((m || 0) / 60) * 48);
                    }
                    if (creatingEvent.endTime && creatingEvent.startTime) {
                      const [sh, sm] = creatingEvent.startTime.split(':').map(Number);
                      const [eh, em] = creatingEvent.endTime.split(':').map(Number);
                      const durMinutes = ((eh * 60 + em) - (sh * 60 + sm));
                      if (durMinutes > 0) heightPx = Math.max(28, (durMinutes / 60) * 48);
                    }

                    const titleDisplay = creatingEvent.title?.trim() || '(Bez tytułu)';
                    const isTask = creatingEvent.type === 'Zadanie';
                    const bgColor = isTask ? '#1a73e8' : (creatingEvent.color || '#e8710a');

                    return (
                      <div
                        style={{
                          top: `${topPx}px`,
                          height: `${heightPx}px`,
                          backgroundColor: bgColor
                        }}
                        className="absolute left-1 right-2 rounded-lg px-2.5 py-1 text-xs font-medium overflow-hidden shadow-lg z-20 text-white animate-in fade-in duration-100 pointer-events-none select-none"
                      >
                        <div className="font-semibold truncate leading-tight flex items-center space-x-1.5">
                          {isTask && (
                            <span className="w-2.5 h-2.5 rounded-full border-[1.5px] border-white inline-block shrink-0 -mt-0.5" />
                          )}
                          <span className="truncate">{titleDisplay}</span>
                        </div>
                        <div className="text-[10px] opacity-90 truncate leading-tight mt-0.5">
                          {formatTimeRangeCompact(creatingEvent.startTime, creatingEvent.endTime)}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Timed Events */}
                  {dayEvents.map((event) => {
                    let topPx = 48;
                    let heightPx = 48;

                    if (event.startTime) {
                      const [h, m] = event.startTime.split(':').map(Number);
                      const startMinutes = Math.max(0, h * 48 + ((m || 0) / 60) * 48);
                      topPx = startMinutes;
                    }
                    if (event.endTime && event.startTime) {
                      const [sh, sm] = event.startTime.split(':').map(Number);
                      const [eh, em] = event.endTime.split(':').map(Number);
                      const durMinutes = ((eh * 60 + em) - (sh * 60 + sm));
                      if (durMinutes > 0) heightPx = Math.max(28, (durMinutes / 60) * 48);
                    }

                    const isTask = event.type === 'Zadanie';
                    const bgCol = isTask ? '#1a73e8' : (event.customBg || '#1a73e8');

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
                        <div className="font-semibold truncate flex items-center space-x-1.5">
                          {isTask && (
                            <span className="w-2.5 h-2.5 rounded-full border-[1.5px] border-white inline-block shrink-0 -mt-0.5" />
                          )}
                          <span className="truncate">{event.title}</span>
                        </div>
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
