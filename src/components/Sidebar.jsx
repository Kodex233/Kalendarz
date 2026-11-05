import React from 'react';
import { 
  Users, 
  ArrowLeftRight, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Sparkles
} from 'lucide-react';
import CreateDropdown from './CreateDropdown';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { pl } from 'date-fns/locale';

export default function Sidebar({
  isOpen,
  onOpenCreateModal,
  selectedDate,
  onSelectDate,
  calendarsFilter,
  onToggleFilter,
  exchangeableEvents,
  onProposeSwapWithEvent,
  onOpenExchangeModal,
  user
}) {
  const [miniDate, setMiniDate] = React.useState(new Date());

  const monthStart = startOfMonth(miniDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const miniDays = eachDayOfInterval({ start: startDate, end: endDate });

  if (!isOpen) return null;

  return (
    <aside className="w-64 border-r border-[#3c4043] bg-[#1f1f1f] text-[#e3e3e3] flex flex-col p-4 space-y-6 select-none shrink-0 overflow-y-auto h-[calc(100vh-4rem)]">
      {/* Google-like "+ Utwórz ▾" button with smaller rounding and dropdown */}
      <div>
        <CreateDropdown onSelectType={onOpenCreateModal} />
      </div>

      {/* Mini Calendar Picker */}
      <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-200/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-700 capitalize">
            {format(miniDate, 'LLLL yyyy', { locale: pl })}
          </span>
          <div className="flex items-center space-x-0.5">
            <button 
              onClick={() => setMiniDate(subMonths(miniDate, 1))}
              className="p-1 hover:bg-gray-200 rounded-full text-gray-600 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setMiniDate(addMonths(miniDate, 1))}
              className="p-1 hover:bg-gray-200 rounded-full text-gray-600 transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-gray-400 mb-1">
          {['P', 'W', 'Ś', 'C', 'P', 'S', 'N'].map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>

        {/* Mini Month Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {miniDays.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, miniDate);
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={idx}
                onClick={() => onSelectDate(day)}
                className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-[11px] transition ${
                  isSelected 
                    ? 'bg-blue-600 text-white font-bold'
                    : isToday
                    ? 'border border-blue-600 text-blue-600 font-bold'
                    : isCurrentMonth 
                    ? 'text-gray-700 hover:bg-gray-200' 
                    : 'text-gray-300'
                }`}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Moje kalendarze / Filtry */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Moje kalendarze
        </h3>
        <div className="space-y-1">
          <label 
            onClick={() => onToggleFilter('myEvents')}
            className="flex items-center space-x-2 text-xs text-gray-700 hover:bg-gray-100 p-1.5 rounded cursor-pointer"
          >
            <input 
              type="checkbox" 
              checked={calendarsFilter.myEvents} 
              readOnly 
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span>Moje terminy</span>
          </label>

          <label 
            onClick={() => onToggleFilter('exchangeable')}
            className="flex items-center space-x-2 text-xs text-gray-700 hover:bg-gray-100 p-1.5 rounded cursor-pointer"
          >
            <input 
              type="checkbox" 
              checked={calendarsFilter.exchangeable} 
              readOnly 
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>Do wymiany (moje)</span>
          </label>

          <label 
            onClick={() => onToggleFilter('friendsExchangeable')}
            className="flex items-center space-x-2 text-xs text-gray-700 hover:bg-gray-100 p-1.5 rounded cursor-pointer"
          >
            <input 
              type="checkbox" 
              checked={calendarsFilter.friendsExchangeable} 
              readOnly 
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span>Terminy znajomych</span>
          </label>
        </div>
      </div>

      {/* Dostępne terminy znajomych na wymianę */}
      <div className="pt-2 border-t border-gray-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700">
            <Users className="w-3.5 h-3.5" />
            <span>Giełda terminów</span>
          </div>
          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">
            {exchangeableEvents.length}
          </span>
        </div>

        {exchangeableEvents.length === 0 ? (
          <div className="p-3 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center">
            <p className="text-xs text-gray-500">Brak dostępnych terminów od znajomych.</p>
            <p className="text-[10px] text-gray-400 mt-1">Udostępnij własny termin lub poproś kolegę o dodanie terminu!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {exchangeableEvents.slice(0, 5).map((ev) => (
              <div 
                key={ev.id}
                className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-lg hover:bg-amber-100/60 transition group text-left cursor-pointer"
                onClick={() => onProposeSwapWithEvent(ev)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 truncate max-w-[130px]">{ev.title}</span>
                  <ArrowLeftRight className="w-3 h-3 text-amber-600 group-hover:scale-110 transition" />
                </div>
                <div className="flex items-center space-x-1 text-[11px] text-gray-600 mt-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span>{ev.date} {ev.startTime}</span>
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5 truncate">
                  Od: {ev.userName || ev.userEmail || "Znajomy"}
                </div>
                <button 
                  className="w-full mt-2 py-1 bg-white hover:bg-amber-500 hover:text-white border border-amber-300 text-amber-700 text-[11px] font-medium rounded transition"
                >
                  Zaproponuj wymianę
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info footer */}
      <div className="mt-auto pt-4 border-t border-gray-100 text-[11px] text-gray-400">
        <p className="flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Synchronizacja Firestore Cloud</span>
        </p>
      </div>
    </aside>
  );
}
