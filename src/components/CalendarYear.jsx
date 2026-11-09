import React, { useState, useRef, useEffect } from 'react';
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
import { X } from 'lucide-react';

const MONTH_NAMES = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 
  'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 
  'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

export default function CalendarYear({
  currentDate,
  events = [],
  onSelectDate,
  onViewChange,
  onSelectEvent
}) {
  const currentYear = currentDate.getFullYear();
  const today = new Date();
  
  // State for day popover matching image 2
  const [selectedDayInfo, setSelectedDayInfo] = useState(null);
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setSelectedDayInfo(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthsData = React.useMemo(() => {
    return Array.from({ length: 12 }).map((_, monthIndex) => {
      const monthDate = new Date(currentYear, monthIndex, 1);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthStart);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday first
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      return {
        monthIndex,
        name: MONTH_NAMES[monthIndex],
        monthDate,
        days
      };
    });
  }, [currentYear]);

  // When clicking a day in year view: show popup with events anchored near clicked day
  const handleDayClick = (day, e) => {
    e.stopPropagation();
    onSelectDate(day);
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayEvents = events.filter(ev => ev.date === dateStr);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const popoverWidth = 260;
    const popoverHeight = 160;

    let left = rect.left + rect.width / 2 - popoverWidth / 2;
    if (left < 16) left = 16;
    if (left + popoverWidth > window.innerWidth - 16) {
      left = window.innerWidth - popoverWidth - 16;
    }

    let top = rect.bottom + 8;
    if (top + popoverHeight > window.innerHeight - 16) {
      top = rect.top - popoverHeight - 8;
    }

    setSelectedDayInfo({
      day,
      dateStr,
      events: dayEvents,
      coords: { top, left }
    });
  };

  const handleGoToDay = (day) => {
    onSelectDate(day);
    if (onViewChange) {
      onViewChange('day');
    }
    setSelectedDayInfo(null);
  };

  const handleMonthTitleClick = (monthDate) => {
    onSelectDate(monthDate);
    if (onViewChange) onViewChange('month');
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-5.2rem)] mb-3 mr-4 m-2 ml-2 mt-1 bg-[#131314] text-[#e3e3e3] rounded-[28px] border-0 overflow-y-auto select-none px-6 py-4 shadow-2xl relative">
      {/* 4 kolumny miesięcy x 3 wiersze - idealnie dopasowane, bez ucinania z prawej i na dole */}
      <div className="grid grid-cols-4 gap-x-8 gap-y-5 max-w-7xl mx-auto w-full">
        {monthsData.map(({ monthIndex, name, monthDate, days }) => (
          <div key={monthIndex} className="flex flex-col space-y-1.5 min-w-0">
            {/* Nazwa miesiąca: w linii z cyframi */}
            <button
              onClick={() => handleMonthTitleClick(monthDate)}
              className="text-left text-[15px] font-semibold text-[#e3e3e3] hover:text-[#8ab4f8] transition cursor-pointer pl-1"
            >
              {name}
            </button>

            {/* Wiersz dni tygodnia: N P W Ś C P S */}
            <div className="grid grid-cols-7 text-center text-[11px] font-medium text-[#9aa0a6] pb-0.5">
              {['N', 'P', 'W', 'Ś', 'C', 'P', 'S'].map((d, i) => (
                <div key={i} className="py-0.5">{d}</div>
              ))}
            </div>

            {/* Siatka dni */}
            <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
              {days.map((day, dIdx) => {
                const isCurrent = isSameMonth(day, monthDate);
                const isToday = isSameDay(day, today);
                const isSelected = selectedDayInfo ? isSameDay(day, selectedDayInfo.day) : isSameDay(day, currentDate);

                let dayClass = 'text-[#e3e3e3] hover:bg-[#282a2d]';
                if (!isCurrent) {
                  dayClass = 'text-[#5f6368]';
                }
                if (isToday) {
                  dayClass = 'bg-[#a8c7fa] text-[#041e49] font-bold shadow-xs';
                } else if (isSelected && isCurrent) {
                  // Wybrany dzień: tło #004a77 i napis #c2e7ff jak w kalendarzu w lewym menu
                  dayClass = 'bg-[#004a77] text-[#c2e7ff] font-bold shadow-xs';
                }

                return (
                  <button
                    key={dIdx}
                    type="button"
                    onClick={(e) => handleDayClick(day, e)}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleGoToDay(day);
                    }}
                    className={`w-[26px] h-[26px] mx-auto rounded-full flex items-center justify-center text-xs transition ${dayClass} cursor-pointer`}
                    title={format(day, 'd MMMM yyyy', { locale: pl })}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Okienko z wydarzeniami w danym dniu w roku (bez border, z mniejszym paddingiem) */}
      {selectedDayInfo && (
        <div 
          ref={popoverRef}
          style={selectedDayInfo.coords ? { 
            top: `${selectedDayInfo.coords.top}px`, 
            left: `${selectedDayInfo.coords.left}px` 
          } : undefined}
          className={`fixed z-50 bg-[#282a2d] text-[#e3e3e3] rounded-[20px] shadow-[0_12px_36px_rgba(0,0,0,0.65)] px-2.5 py-2 border-0 w-[240px] text-center animate-in fade-in zoom-in-95 duration-75 select-none ${
            !selectedDayInfo.coords ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''
          }`}
        >
          {/* Nagłówek okienka z X w rogu, wycentrowanym skrótem dnia i dużą cyfrą */}
          <div className="relative flex flex-col items-center justify-center pt-0.5">
            <button
              type="button"
              onClick={() => setSelectedDayInfo(null)}
              className="absolute right-0 top-0 p-1 text-[#9aa0a6] hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
              title="Zamknij"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[11px] font-semibold uppercase text-[#9aa0a6] tracking-wider">
              {format(selectedDayInfo.day, 'EEE.', { locale: pl })}
            </span>

            {/* Kliknięcie liczby przenosi od razu do widoku dnia BEZ animacji */}
            <button
              type="button"
              onClick={() => handleGoToDay(selectedDayInfo.day)}
              className="text-2xl font-normal text-white my-0.5 hover:text-[#8ab4f8] transition cursor-pointer"
              title="Przejdź do widoku dnia"
            >
              {format(selectedDayInfo.day, 'd')}
            </button>
          </div>

          {/* Lista wydarzeń lub napis o braku wydarzeń (napisy bliżej krawędzi) */}
          {selectedDayInfo.events.length > 0 ? (
            <div className="space-y-1 text-left mt-1.5 max-h-48 overflow-y-auto">
              {selectedDayInfo.events.map(ev => (
                <div
                  key={ev.id}
                  onClick={() => {
                    if (onSelectEvent) onSelectEvent(ev);
                    setSelectedDayInfo(null);
                  }}
                  className="px-2 py-1 rounded-md text-xs font-medium text-white truncate cursor-pointer hover:brightness-110 transition shadow-xs flex items-center justify-between"
                  style={{ backgroundColor: ev.customBg || '#1e8e3e' }}
                  title={`${ev.title}${ev.startTime ? ' (' + ev.startTime + ')' : ''}`}
                >
                  <span className="truncate">{ev.title}</span>
                  {ev.startTime && (
                    <span className="text-[10px] opacity-90 ml-1 shrink-0 font-normal">
                      {ev.startTime}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11.5px] text-[#9aa0a6] mt-2 mb-0.5 text-center px-1 leading-snug">
              Na ten dzień nie ma zaplanowanych wydarzeń.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
