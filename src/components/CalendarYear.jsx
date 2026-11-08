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
    <div className="flex-1 flex flex-col h-[calc(100vh-5.5rem)] mb-5 mr-4 m-3 ml-2 mt-1 bg-[#131314] text-[#e3e3e3] rounded-[28px] border-0 overflow-y-auto select-none p-6 shadow-2xl relative">
      {/* 4 columns x 3 rows grid of 12 months */}
      <div className="grid grid-cols-4 gap-x-8 gap-y-7">
        {monthsData.map(({ monthIndex, name, monthDate, days }) => (
          <div key={monthIndex} className="flex flex-col space-y-2">
            {/* Month Name */}
            <button
              onClick={() => handleMonthTitleClick(monthDate)}
              className="text-left text-sm font-semibold text-[#e3e3e3] hover:text-[#8ab4f8] transition cursor-pointer"
            >
              {name}
            </button>

            {/* Week days row: N P W Ś C P S */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-[#9aa0a6]">
              {['N', 'P', 'W', 'Ś', 'C', 'P', 'S'].map((d, i) => (
                <div key={i} className="py-0.5">{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
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
                  // Wybrany dzień: niebieskie kółko Google jak na zdjęciu Image 1 i 2
                  dayClass = 'bg-[#1a73e8] text-white font-medium shadow-xs';
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
                    className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-[11px] transition ${dayClass} cursor-pointer`}
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

      {/* Okienko z wydarzeniami w danym dniu w roku (1:1 z obrazami Image 1 i Image 2) */}
      {selectedDayInfo && (
        <div 
          ref={popoverRef}
          style={selectedDayInfo.coords ? { 
            top: `${selectedDayInfo.coords.top}px`, 
            left: `${selectedDayInfo.coords.left}px` 
          } : undefined}
          className={`fixed z-50 bg-[#282a2d] text-[#e3e3e3] rounded-[20px] shadow-[0_12px_36px_rgba(0,0,0,0.65)] p-4 border border-[#444746] w-[260px] text-center animate-in fade-in zoom-in-95 duration-75 select-none ${
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

            <span className="text-xs font-semibold uppercase text-[#9aa0a6] tracking-wider">
              {format(selectedDayInfo.day, 'EEE.', { locale: pl })}
            </span>

            {/* Kliknięcie liczby przenosi od razu do widoku dnia BEZ animacji */}
            <button
              type="button"
              onClick={() => handleGoToDay(selectedDayInfo.day)}
              className="text-3xl font-normal text-white my-1 hover:text-[#8ab4f8] transition cursor-pointer"
              title="Przejdź do widoku dnia"
            >
              {format(selectedDayInfo.day, 'd')}
            </button>
          </div>

          {/* Lista wydarzeń lub napis o braku wydarzeń (Image 1 i Image 2) */}
          {selectedDayInfo.events.length > 0 ? (
            <div className="space-y-1.5 text-left mt-2.5 max-h-48 overflow-y-auto pr-0.5">
              {selectedDayInfo.events.map(ev => (
                <div
                  key={ev.id}
                  onClick={() => {
                    if (onSelectEvent) onSelectEvent(ev);
                    setSelectedDayInfo(null);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white truncate cursor-pointer hover:brightness-110 transition shadow-xs flex items-center justify-between"
                  style={{ backgroundColor: ev.customBg || '#1e8e3e' }}
                  title={`${ev.title}${ev.startTime ? ' (' + ev.startTime + ')' : ''}`}
                >
                  <span className="truncate">{ev.title}</span>
                  {ev.startTime && (
                    <span className="text-[10px] opacity-90 ml-1.5 shrink-0 font-normal">
                      {ev.startTime}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#9aa0a6] mt-3 mb-1 text-center leading-relaxed">
              Na ten dzień nie ma zaplanowanych wydarzeń.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
