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

  // When clicking a day in year view: show popup with events instead of switching to day view!
  const handleDayClick = (day, e) => {
    e.stopPropagation();
    onSelectDate(day);
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayEvents = events.filter(ev => ev.date === dateStr);
    
    // Position popup near clicked element or centered
    setSelectedDayInfo({
      day,
      dateStr,
      events: dayEvents
    });
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
                  // W małych kalendarzach zielony pasujący do liczby
                  dayClass = 'bg-[#0f5223] text-[#a8c7fa] font-bold shadow-xs';
                }

                return (
                  <button
                    key={dIdx}
                    onClick={(e) => handleDayClick(day, e)}
                    className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-[11px] transition ${dayClass}`}
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

      {/* Small popover when day is clicked matching image 2 */}
      {selectedDayInfo && (
        <div 
          ref={popoverRef}
          className="fixed z-50 bg-[#282a2d] text-[#e3e3e3] rounded-2xl shadow-2xl p-4 border border-[#3c4043] w-64 text-center animate-in fade-in zoom-in-95 duration-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          {/* Header with day abbreviation and close button */}
          <div className="flex items-center justify-between pb-1 text-[#9aa0a6]">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {format(selectedDayInfo.day, 'EEE.', { locale: pl })}
            </span>
            <button
              onClick={() => setSelectedDayInfo(null)}
              className="p-1 hover:bg-[#35373a] hover:text-white rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Large day number */}
          <div className="text-3xl font-normal text-[#e3e3e3] my-2">
            {format(selectedDayInfo.day, 'd')}
          </div>

          {/* Events or empty message */}
          {selectedDayInfo.events.length > 0 ? (
            <div className="space-y-1.5 text-left mt-2 max-h-36 overflow-y-auto pt-1">
              {selectedDayInfo.events.map(ev => (
                <div
                  key={ev.id}
                  onClick={() => {
                    if (onSelectEvent) onSelectEvent(ev);
                    setSelectedDayInfo(null);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-[#1e1f20] hover:bg-[#35373a] cursor-pointer transition flex items-center space-x-2 text-xs"
                >
                  <span 
                    className="w-2 h-2 rounded-full shrink-0" 
                    style={{ backgroundColor: ev.customBg || '#1a73e8' }} 
                  />
                  <div className="flex-1 truncate">
                    <span className="font-medium">{ev.title}</span>
                    {ev.startTime && <span className="text-[#9aa0a6] text-[10px] ml-1.5">{ev.startTime}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#9aa0a6] mt-2 leading-relaxed">
              Na ten dzień nie ma zaplanowanych wydarzeń.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
