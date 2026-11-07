import React from 'react';
import { format, isSameDay } from 'date-fns';
import { pl } from 'date-fns/locale';

const STANDARD_HOLIDAYS_2026_2027 = [
  { id: 'hol-1', title: 'Dzień Niepodległości', date: '2026-11-11', startTime: '', endTime: '', isAllDay: true, customBg: '#34a853', calendarId: 'swieta' },
  { id: 'hol-2', title: 'Wigilia Bożego Narodzenia', date: '2026-12-24', startTime: '', endTime: '', isAllDay: true, customBg: '#34a853', calendarId: 'swieta' },
  { id: 'hol-3', title: 'Boże Narodzenie', date: '2026-12-25', startTime: '', endTime: '', isAllDay: true, customBg: '#34a853', calendarId: 'swieta' },
  { id: 'hol-4', title: 'Boże Narodzenie', date: '2026-12-26', startTime: '', endTime: '', isAllDay: true, customBg: '#34a853', calendarId: 'swieta' },
  { id: 'hol-5', title: 'Narodowy Dzień Zwycięskiego Powstania Wielkopolskiego', date: '2026-12-27', startTime: '', endTime: '', isAllDay: true, customBg: '#34a853', calendarId: 'swieta' },
  { id: 'hol-6', title: 'Sylwester (święto)', date: '2026-12-31', startTime: '', endTime: '', isAllDay: true, customBg: '#34a853', calendarId: 'swieta' },
  { id: 'hol-7', title: 'Nowy Rok', date: '2027-01-01', startTime: '', endTime: '', isAllDay: true, customBg: '#34a853', calendarId: 'swieta' },
  { id: 'hol-8', title: 'Święto Trzech Króli', date: '2027-01-06', startTime: '', endTime: '', isAllDay: true, customBg: '#34a853', calendarId: 'swieta' },
  { id: 'hol-9', title: 'Walentynki', date: '2027-02-14', startTime: '', endTime: '', isAllDay: true, customBg: '#34a853', calendarId: 'swieta' },
  { id: 'hol-10', title: 'Wielki Piątek', date: '2027-03-26', startTime: '', endTime: '', isAllDay: true, customBg: '#34a853', calendarId: 'swieta' },
  { id: 'hol-11', title: 'Wielka Sobota', date: '2027-03-27', startTime: '', endTime: '', isAllDay: true, customBg: '#34a853', calendarId: 'swieta' },
  { id: 'hol-12', title: 'Niedziela Wielkanocna', date: '2027-03-28', startTime: '', endTime: '', isAllDay: true, customBg: '#34a853', calendarId: 'swieta' },
  { id: 'hol-13', title: 'Poniedziałek Wielkanocny', date: '2027-03-29', startTime: '', endTime: '', isAllDay: true, customBg: '#34a853', calendarId: 'swieta' },
  { id: 'hol-14', title: 'Święto Pracy', date: '2027-05-01', startTime: '', endTime: '', isAllDay: true, customBg: '#34a853', calendarId: 'swieta' },
  { id: 'hol-15', title: 'Dzień Flagi Rzeczypospolitej Polskiej', date: '2027-05-02', startTime: '', endTime: '', isAllDay: true, customBg: '#34a853', calendarId: 'swieta' },
  { id: 'hol-16', title: 'Święto Konstytucji 3 Maja', date: '2027-05-03', startTime: '', endTime: '', isAllDay: true, customBg: '#34a853', calendarId: 'swieta' }
];

export default function CalendarAgenda({
  currentDate,
  events = [],
  onSelectEvent
}) {
  const allAgendaEvents = React.useMemo(() => {
    const list = [...events];
    STANDARD_HOLIDAYS_2026_2027.forEach(hol => {
      if (!list.some(e => e.date === hol.date && e.title === hol.title)) {
        list.push(hol);
      }
    });

    list.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.startTime || '').localeCompare(b.startTime || '');
    });

    return list;
  }, [events]);

  const formatDateHeader = (dateStr) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      const dayNum = format(d, 'd');
      const monthAbbr = format(d, 'LLL', { locale: pl }).toUpperCase();
      const dayAbbr = format(d, 'EEE', { locale: pl }).toUpperCase();
      return { dayNum, label: `${monthAbbr}, ${dayAbbr}.` };
    } catch {
      return { dayNum: '', label: dateStr };
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-5.5rem)] mb-5 mr-4 m-3 ml-2 mt-1 bg-[#131314] text-[#e3e3e3] rounded-[28px] border-0 overflow-hidden select-none shadow-2xl">
      {/* Red current time indicator line at the top */}
      <div className="flex items-center space-x-3 pt-5 pb-3 px-6 shrink-0 border-b border-white/20">
        <div className="w-8 h-8 rounded-full bg-[#a8c7fa] text-[#041e49] font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
          8
        </div>
        <span className="text-xs font-semibold text-[#a8c7fa] tracking-wider uppercase shrink-0">
          LIS, NIEDZ.
        </span>
        <div className="w-3 h-3 bg-[#ea4335] rounded-full shrink-0 -mr-1.5 z-10" />
        <div className="flex-1 border-t-2 border-[#ea4335]" />
      </div>

      {/* Events list: kratki do końca krawędzi, scrollbar wewnątrz tła kalendarza */}
      <div className="flex-1 overflow-y-auto pb-4 pr-1">
        <div className="w-full">
          {allAgendaEvents.map((event) => {
            const { dayNum, label } = formatDateHeader(event.date);
            const isAllDay = event.isAllDay || !event.startTime;
            const timeText = isAllDay ? 'Cały dzień' : `${event.startTime}–${event.endTime}`;
            const dotColor = event.customBg || '#34a853';

            return (
              <div
                key={event.id}
                onClick={() => onSelectEvent(event)}
                className="w-full flex items-center py-3.5 px-6 border-b border-white/20 hover:bg-[#1a1b1e] cursor-pointer transition text-sm group"
              >
                {/* Column 1: Date */}
                <div className="w-40 flex items-baseline space-x-2 shrink-0">
                  <span className="text-base font-semibold text-[#e3e3e3] w-6 text-right">
                    {dayNum}
                  </span>
                  <span className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wider group-hover:text-white transition">
                    {label}
                  </span>
                </div>

                {/* Column 2: Dot + Time / Duration */}
                <div className="w-44 flex items-center space-x-2.5 shrink-0 text-xs text-[#c4c7c5]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: dotColor }}
                  />
                  <span className="truncate">{timeText}</span>
                </div>

                {/* Column 3: Event Title */}
                <div className="flex-1 font-normal text-[#e3e3e3] group-hover:text-white truncate">
                  {event.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
