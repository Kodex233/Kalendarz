import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Search, 
  Settings, 
  Calendar as CalendarIcon,
  LogOut,
  User as UserIcon,
  ArrowLeft,
  X,
  Check
} from 'lucide-react';
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

export default function Navbar({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  onSelectDate,
  onToggleSidebar,
  user,
  onOpenAuth,
  onLogout,
  searchQuery,
  onSearchChange,
  activeView,
  onViewChange
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [pickerDate, setPickerDate] = useState(currentDate);

  // View settings toggles matching image 3
  const [viewOptions, setViewOptions] = useState({
    showWeekends: true,
    showRejected: false,
    showCompleted: true
  });

  const searchInputRef = useRef(null);
  const monthPickerRef = useRef(null);
  const viewMenuRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(e.target)) {
        setIsMonthPickerOpen(false);
      }
      if (viewMenuRef.current && !viewMenuRef.current.contains(e.target)) {
        setIsViewMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mini picker dates
  const monthStart = startOfMonth(pickerDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday first matching image 2
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const pickerDays = eachDayOfInterval({ start: startDate, end: endDate });

  const VIEW_LABELS = {
    day: 'Dzień',
    week: 'Tydzień',
    month: 'Miesiąc',
    year: 'Rok',
    agenda: 'Harmonogram',
    fourDays: '4 dni'
  };

  // FULL SEARCH MODE OVERLAY (Shows ONLY the search bar across the whole top bar)
  if (isSearchOpen) {
    return (
      <header className="h-16 border-b border-[#3c4043] px-4 flex items-center bg-[#282a2d] text-[#e3e3e3] select-none z-50 sticky top-0 animate-in fade-in duration-100">
        <button
          onClick={() => {
            setIsSearchOpen(false);
            onSearchChange('');
          }}
          className="p-2 hover:bg-[#35373a] rounded-full text-[#c4c7c5] transition mr-3"
          title="Zamknij wyszukiwanie"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 flex items-center">
          <Search className="w-5 h-5 text-[#9aa0a6] mr-3" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Szukaj w kalendarzu..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsSearchOpen(false);
                onSearchChange('');
              }
            }}
            className="w-full bg-transparent border-0 text-base text-[#e3e3e3] placeholder-[#9aa0a6] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="p-2 hover:bg-[#35373a] rounded-full text-[#9aa0a6] hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="h-16 border-b border-[#3c4043] px-4 flex items-center justify-between bg-[#1f1f1f] text-[#e3e3e3] select-none z-10 sticky top-0">
      {/* Left: Hamburger, Logo, Dzisiaj (larger radius), Navigation, Month Dropdown */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={onToggleSidebar}
          className="p-2.5 hover:bg-[#282a2d] rounded-full text-[#c4c7c5] transition"
          title="Menu główne"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mr-3 cursor-pointer">
          <div className="w-10 h-10 bg-[#8ab4f8] text-[#041e49] rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
            {format(new Date(), 'd')}
          </div>
          <span className="text-xl font-normal text-[#e3e3e3] tracking-tight font-['Product_Sans',sans-serif]">
            Kalendarz
          </span>
        </div>

        {/* Dzisiaj button: WIEKSZY RADIUS (rounded-full) matching image 2 */}
        <button
          onClick={onToday}
          className="px-5 py-2 border border-[#5f6368] hover:bg-[#282a2d] rounded-full text-sm font-medium text-[#e3e3e3] transition active:scale-95"
        >
          Dzisiaj
        </button>

        {/* < > arrows */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onPrevMonth}
            className="p-2 hover:bg-[#282a2d] rounded-full text-[#c4c7c5] transition"
            title="Poprzedni miesiąc"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onNextMonth}
            className="p-2 hover:bg-[#282a2d] rounded-full text-[#c4c7c5] transition"
            title="Następny miesiąc"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Month Dropdown Button matching image 2 */}
        <div className="relative" ref={monthPickerRef}>
          <button
            onClick={() => {
              setPickerDate(currentDate);
              setIsMonthPickerOpen(!isMonthPickerOpen);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg hover:bg-[#282a2d] text-xl font-medium text-[#e3e3e3] capitalize transition"
          >
            <span>{format(currentDate, 'LLLL yyyy', { locale: pl })}</span>
            <ChevronDown className={`w-4 h-4 text-[#9aa0a6] transition-transform ${isMonthPickerOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Month & Day Picker Popover directly below title (matching image 2) */}
          {isMonthPickerOpen && (
            <div className="absolute left-0 mt-2 z-50 w-64 bg-[#282a2d] border-0 ring-1 ring-white/10 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-[#e3e3e3] capitalize">
                  {format(pickerDate, 'LLLL yyyy', { locale: pl })}
                </span>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => setPickerDate(subMonths(pickerDate, 1))}
                    className="p-1 hover:bg-[#35373a] rounded-full text-[#9aa0a6] hover:text-[#e3e3e3] transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setPickerDate(addMonths(pickerDate, 1))}
                    className="p-1 hover:bg-[#35373a] rounded-full text-[#9aa0a6] hover:text-[#e3e3e3] transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Days header: N P W Ś C P S matching image 2 */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[#9aa0a6] mb-1.5">
                {['N', 'P', 'W', 'Ś', 'C', 'P', 'S'].map((d, i) => (
                  <div key={i}>{d}</div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {pickerDays.map((day, idx) => {
                  const isCurrentMonth = isSameMonth(day, pickerDate);
                  const isSelected = isSameDay(day, currentDate);

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        onSelectDate(day);
                        setIsMonthPickerOpen(false);
                      }}
                      className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs transition ${
                        isSelected 
                          ? 'bg-[#a8c7fa] text-[#041e49] font-bold shadow-xs'
                          : isCurrentMonth 
                          ? 'text-[#e3e3e3] hover:bg-[#35373a]' 
                          : 'text-[#5f6368]'
                      }`}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Search Icon, Settings Icon, View Switcher dropdown, User Profile */}
      <div className="flex items-center space-x-2">
        {/* Search Icon button (clicking expands full top search) */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="p-2.5 hover:bg-[#282a2d] rounded-full text-[#c4c7c5] hover:text-white transition"
          title="Szukaj w kalendarzu"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Settings Icon button */}
        <button
          onClick={() => alert('Ustawienia kalendarza')}
          className="p-2.5 hover:bg-[#282a2d] rounded-full text-[#c4c7c5] hover:text-white transition"
          title="Ustawienia"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* View Switcher Dropdown matching image 3 */}
        <div className="relative ml-1" ref={viewMenuRef}>
          <button
            onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
            className="flex items-center space-x-2 px-3.5 py-2 bg-transparent hover:bg-[#282a2d] border border-[#5f6368] rounded-lg text-sm font-medium text-[#e3e3e3] transition focus:outline-none"
          >
            <span>{VIEW_LABELS[activeView] || 'Miesiąc'}</span>
            <ChevronDown className={`w-4 h-4 text-[#9aa0a6] transition-transform ${isViewMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* View Menu Popover matching image 3 */}
          {isViewMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-[#282a2d] border-0 ring-1 ring-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => { onViewChange('day'); setIsViewMenuOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-[#e3e3e3] hover:bg-[#35373a] transition"
              >
                <span>Dzień</span>
                <span className="text-xs text-[#9aa0a6]">D</span>
              </button>
              <button
                onClick={() => { onViewChange('week'); setIsViewMenuOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-[#e3e3e3] hover:bg-[#35373a] transition"
              >
                <span>Tydzień</span>
                <span className="text-xs text-[#9aa0a6]">W</span>
              </button>
              <button
                onClick={() => { onViewChange('month'); setIsViewMenuOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-[#e3e3e3] hover:bg-[#35373a] transition"
              >
                <span>Miesiąc</span>
                <span className="text-xs text-[#9aa0a6]">M</span>
              </button>
              <button
                onClick={() => { onViewChange('year'); setIsViewMenuOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-[#e3e3e3] hover:bg-[#35373a] transition"
              >
                <span>Rok</span>
                <span className="text-xs text-[#9aa0a6]">Y</span>
              </button>
              <button
                onClick={() => { onViewChange('agenda'); setIsViewMenuOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-[#e3e3e3] hover:bg-[#35373a] transition"
              >
                <span>Harmonogram</span>
                <span className="text-xs text-[#9aa0a6]">A</span>
              </button>
              <button
                onClick={() => { onViewChange('fourDays'); setIsViewMenuOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-[#e3e3e3] hover:bg-[#35373a] transition"
              >
                <span>4 dni</span>
                <span className="text-xs text-[#9aa0a6]">X</span>
              </button>

              <div className="border-t border-[#3c4043] my-2"></div>

              {/* Checkboxes matching image 3 */}
              <button
                onClick={() => setViewOptions(p => ({ ...p, showWeekends: !p.showWeekends }))}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-[#e3e3e3] hover:bg-[#35373a] transition"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  {viewOptions.showWeekends && <Check className="w-4 h-4 text-[#8ab4f8] stroke-[2.5]" />}
                </div>
                <span>Pokaż weekendy</span>
              </button>
              <button
                onClick={() => setViewOptions(p => ({ ...p, showRejected: !p.showRejected }))}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-[#e3e3e3] hover:bg-[#35373a] transition"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  {viewOptions.showRejected && <Check className="w-4 h-4 text-[#8ab4f8] stroke-[2.5]" />}
                </div>
                <span>Pokaż odrzucone wydarzenia</span>
              </button>
              <button
                onClick={() => setViewOptions(p => ({ ...p, showCompleted: !p.showCompleted }))}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-[#e3e3e3] hover:bg-[#35373a] transition"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  {viewOptions.showCompleted && <Check className="w-4 h-4 text-[#8ab4f8] stroke-[2.5]" />}
                </div>
                <span>Pokaż ukończone zadania</span>
              </button>
            </div>
          )}
        </div>

        {/* User Auth Info */}
        {user ? (
          <div className="flex items-center space-x-2 pl-2">
            <div className="flex items-center space-x-2">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || user.email} 
                  className="w-8 h-8 rounded-full border border-[#5f6368] object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#8ab4f8] text-[#041e49] flex items-center justify-center font-bold text-xs">
                  {user.displayName ? user.displayName[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U')}
                </div>
              )}
            </div>
            <button
              onClick={onLogout}
              className="p-2 hover:bg-[#282a2d] rounded-full text-[#c4c7c5] transition"
              title="Wyloguj się"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center space-x-2 px-4 py-2 bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#041e49] rounded-full text-sm font-semibold transition shadow-sm ml-1"
          >
            <UserIcon className="w-4 h-4" />
            <span>Zaloguj się</span>
          </button>
        )}
      </div>
    </header>
  );
}
