import React from 'react';
import { 
  format, 
  startOfYear, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay 
} from 'date-fns';
import { pl } from 'date-fns/locale';

const MONTH_NAMES = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 
  'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 
  'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

export default function CalendarYear({
  currentDate,
  onSelectDate,
  onViewChange
}) {
  const currentYear = currentDate.getFullYear();
  const today = new Date();

  // Create mini calendar data for all 12 months
  const monthsData = React.useMemo(() => {
    return Array.from({ length: 12 }).map((_, monthIndex) => {
      const monthDate = new Date(currentYear, monthIndex, 1);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthStart);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday first matching screenshot
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

  const handleDayClick = (day) => {
    onSelectDate(day);
    if (onViewChange) onViewChange('day');
  };

  const handleMonthTitleClick = (monthDate) => {
    onSelectDate(monthDate);
    if (onViewChange) onViewChange('month');
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-5.5rem)] mb-4 bg-[#131314] text-[#e3e3e3] rounded-[28px] border-0 overflow-y-auto select-none m-3 ml-2 p-6 shadow-2xl">
      {/* 4 columns x 3 rows grid of 12 months matching image 1 and 4 */}
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

            {/* Week days row: N P W Ś C P S matching image 1/4 */}
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
                const isSelected = isSameDay(day, currentDate);

                let dayClass = 'text-[#e3e3e3] hover:bg-[#282a2d]';
                if (!isCurrent) {
                  dayClass = 'text-[#5f6368]';
                }
                if (isToday) {
                  dayClass = 'bg-[#a8c7fa] text-[#041e49] font-bold shadow-xs';
                } else if (isSelected && isCurrent) {
                  dayClass = 'bg-[#0f5223] text-[#a8c7fa] font-bold shadow-xs';
                }

                return (
                  <button
                    key={dIdx}
                    onClick={() => handleDayClick(day)}
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
    </div>
  );
}
