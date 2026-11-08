import React, { useState, useRef, useEffect } from 'react';
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

  // Stan aktywnego przeciągania myszką (tworzenie wydarzenia przez przeciąganie w dół przez kratki)
  const [dragState, setDragState] = useState(null);
  const dragRef = useRef(null);

  useEffect(() => {
    return () => {
      dragRef.current = null;
    };
  }, []);

  const handleColumnMouseDown = (e, day, dIdx) => {
    if (e.button !== 0) return; // Tylko lewy przycisk myszy
    e.preventDefault();

    const colElement = e.currentTarget;
    const colRect = colElement.getBoundingClientRect();
    const offsetY = Math.max(0, Math.min(colRect.height, e.clientY - colRect.top));

    // Zaokrąglenie do 15 minut (48px na godzinę -> 12px na 15 min)
    const rawMinutes = (offsetY / 48) * 60;
    const snappedStartMinutes = Math.min(23 * 60 + 45, Math.floor(rawMinutes / 15) * 15);
    const initialEndMinutes = Math.min(24 * 60, snappedStartMinutes + 60);

    const newDragInfo = {
      isDragging: true,
      day,
      dayIndex: dIdx,
      dateStr: format(day, 'yyyy-MM-dd'),
      startMinutes: snappedStartMinutes,
      currentMinutes: initialEndMinutes,
      colRect,
      startClientY: e.clientY,
      hasMoved: false
    };

    dragRef.current = newDragInfo;
    setDragState(newDragInfo);

    const handleMouseMove = (moveEvent) => {
      if (!dragRef.current) return;
      const info = dragRef.current;
      const deltaY = moveEvent.clientY - info.startClientY;
      if (Math.abs(deltaY) > 5) {
        info.hasMoved = true;
      }

      const curOffsetY = Math.max(0, Math.min(info.colRect.height, moveEvent.clientY - info.colRect.top));
      const curRawMinutes = (curOffsetY / 48) * 60;
      let curSnapped = Math.max(0, Math.min(24 * 60, Math.round(curRawMinutes / 15) * 15));

      if (curSnapped === info.startMinutes) {
        curSnapped = deltaY >= 0 ? Math.min(24 * 60, info.startMinutes + 30) : Math.max(0, info.startMinutes - 30);
      }

      info.currentMinutes = curSnapped;
      setDragState({ ...info });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      const info = dragRef.current;
      dragRef.current = null;
      setDragState(null);

      if (!info) return;

      let minM = Math.min(info.startMinutes, info.currentMinutes);
      let maxM = Math.max(info.startMinutes, info.currentMinutes);

      if (maxM - minM < 15) {
        maxM = minM + 60;
      }

      const startH = Math.floor(minM / 60);
      const startMin = minM % 60;
      const endH = Math.floor(maxM / 60);
      const endMin = maxM % 60;

      const startTime = `${startH.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
      const endTime = `${endH.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

      const topPx = (minM / 60) * 48;
      const heightPx = Math.max(28, ((maxM - minM) / 60) * 48);
      const slotRect = {
        top: info.colRect.top + topPx,
        bottom: info.colRect.top + topPx + heightPx,
        height: heightPx,
        left: info.colRect.left,
        right: info.colRect.right,
        width: info.colRect.width
      };

      onSelectSlot(info.day, startTime, {
        startTime,
        endTime,
        dayIndex: info.dayIndex,
        slotRect
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleColumnTouchStart = (e, day, dIdx) => {
    if (!e.touches || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const colElement = e.currentTarget;
    const colRect = colElement.getBoundingClientRect();
    const offsetY = Math.max(0, Math.min(colRect.height, touch.clientY - colRect.top));

    const rawMinutes = (offsetY / 48) * 60;
    const snappedStartMinutes = Math.min(23 * 60 + 45, Math.floor(rawMinutes / 15) * 15);
    const initialEndMinutes = Math.min(24 * 60, snappedStartMinutes + 60);

    const newDragInfo = {
      isDragging: true,
      day,
      dayIndex: dIdx,
      dateStr: format(day, 'yyyy-MM-dd'),
      startMinutes: snappedStartMinutes,
      currentMinutes: initialEndMinutes,
      colRect,
      startClientY: touch.clientY,
      hasMoved: false
    };

    dragRef.current = newDragInfo;
    setDragState(newDragInfo);

    const handleTouchMove = (moveEvent) => {
      if (!dragRef.current || !moveEvent.touches || moveEvent.touches.length !== 1) return;
      const curTouch = moveEvent.touches[0];
      const deltaY = curTouch.clientY - dragRef.current.startClientY;
      if (Math.abs(deltaY) > 8) {
        dragRef.current.hasMoved = true;
        if (moveEvent.cancelable) moveEvent.preventDefault();
      }

      const curOffsetY = Math.max(0, Math.min(dragRef.current.colRect.height, curTouch.clientY - dragRef.current.colRect.top));
      const curRawMinutes = (curOffsetY / 48) * 60;
      let curSnapped = Math.max(0, Math.min(24 * 60, Math.round(curRawMinutes / 15) * 15));

      if (curSnapped === dragRef.current.startMinutes) {
        curSnapped = deltaY >= 0 ? Math.min(24 * 60, dragRef.current.startMinutes + 30) : Math.max(0, dragRef.current.startMinutes - 30);
      }

      dragRef.current.currentMinutes = curSnapped;
      setDragState({ ...dragRef.current });
    };

    const handleTouchEnd = () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);

      const info = dragRef.current;
      dragRef.current = null;
      setDragState(null);

      if (!info) return;

      let minM = Math.min(info.startMinutes, info.currentMinutes);
      let maxM = Math.max(info.startMinutes, info.currentMinutes);

      if (maxM - minM < 15) {
        maxM = minM + 60;
      }

      const startH = Math.floor(minM / 60);
      const startMin = minM % 60;
      const endH = Math.floor(maxM / 60);
      const endMin = maxM % 60;

      const startTime = `${startH.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
      const endTime = `${endH.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

      const topPx = (minM / 60) * 48;
      const heightPx = Math.max(28, ((maxM - minM) / 60) * 48);
      const slotRect = {
        top: info.colRect.top + topPx,
        bottom: info.colRect.top + topPx + heightPx,
        height: heightPx,
        left: info.colRect.left,
        right: info.colRect.right,
        width: info.colRect.width
      };

      onSelectSlot(info.day, startTime, {
        startTime,
        endTime,
        dayIndex: info.dayIndex,
        slotRect
      });
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
  };

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
                  onMouseDown={(e) => handleColumnMouseDown(e, day, dIdx)}
                  onTouchStart={(e) => handleColumnTouchStart(e, day, dIdx)}
                  className={`relative h-full select-none cursor-pointer ${isLastColumn ? 'border-r-0' : 'border-r border-white/20'}`}
                >
                  {/* 24 Hour slots: siatka godzinowa */}
                  {Array.from({ length: HOURS_COUNT }).map((_, hIdx) => {
                    const isLast = hIdx === HOURS_COUNT - 1;
                    return (
                      <div 
                        key={hIdx} 
                        className={`h-12 border-t border-white/15 hover:bg-[#1f2022]/40 transition pointer-events-none ${
                          isLast ? 'border-b border-white/15' : ''
                        }`}
                      />
                    );
                  })}

                  {/* Red current time indicator line na aktualnej godzinie z połączonym kółkiem w kolorze #e06d69 */}
                  {isToday && (
                    <div 
                      className="absolute left-0 right-0 z-20 flex items-center -translate-y-1/2 pointer-events-none"
                      style={{ top: `${timeProgressMinutes}px` }}
                    >
                      <div className="w-2.5 h-2.5 bg-[#e06d69] rounded-full -ml-1.25 shrink-0 shadow-xs" />
                      <div className="flex-1 border-t-2 border-[#e06d69]" />
                    </div>
                  )}

                  {/* Podgląd podczas aktywnego przeciągania myszką w dół po siatce (1:1 z obrazem użytkownika) */}
                  {dragState && dragState.dateStr === dateStr && (() => {
                    const minM = Math.min(dragState.startMinutes, dragState.currentMinutes);
                    const maxM = Math.max(dragState.startMinutes, dragState.currentMinutes);
                    const topPx = (minM / 60) * 48;
                    const heightPx = Math.max(28, ((maxM - minM) / 60) * 48);

                    const startH = Math.floor(minM / 60);
                    const startMin = minM % 60;
                    const endH = Math.floor(maxM / 60);
                    const endMin = maxM % 60;
                    const sStr = `${startH.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
                    const eStr = `${endH.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

                    return (
                      <div
                        style={{
                          top: `${topPx}px`,
                          height: `${heightPx}px`,
                          backgroundColor: '#e8710a'
                        }}
                        className="absolute left-1 right-2 rounded-lg px-2.5 py-1 text-xs font-medium overflow-hidden shadow-2xl z-30 text-white pointer-events-none select-none border border-white/20 animate-in fade-in duration-75"
                      >
                        <div className="font-semibold truncate leading-tight">
                          (Bez tytułu)
                        </div>
                        <div className="text-[10px] opacity-90 truncate leading-tight mt-0.5">
                          {formatTimeRangeCompact(sStr, eStr)}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Podgląd dodawanego wydarzenia (Image 4): (Bez tytułu) z godziną w kafelku obok okienka */}
                  {creatingEvent && creatingEvent.date === dateStr && !dragState && (() => {
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
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                        }}
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
