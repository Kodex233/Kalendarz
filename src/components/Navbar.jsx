import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Settings, 
  HelpCircle, 
  LogOut, 
  User as UserIcon, 
  ArrowLeft, 
  ArrowLeftRight,
  X, 
  Check, 
  RotateCcw,
  Calendar as CalendarIcon
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
import InvitePopover from './InvitePopover';

export default function Navbar({
  currentDate,
  onPrevDate,
  onNextDate,
  onToday,
  onSelectDate,
  onToggleSidebar,
  user,
  onOpenAuth,
  onLogout,
  searchQuery,
  onSearchChange,
  activeView,
  onViewChange,
  advancedFilters = {},
  onAdvancedFiltersChange,
  myCalendars = [],
  otherCalendars = [],
  onOpenExchangeModal,
  pendingExchangesCount = 0,
  roomCode = 'kodex',
  roomPin = '1234',
  participants = ['Kodex'],
  onUpdatePin,
  myEvents = [],
  exchangeableEvents = [],
  onDirectSwap,
  currentUser = 'Kodex'
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [isSearchInMenuOpen, setIsSearchInMenuOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [pickerDate, setPickerDate] = useState(currentDate);

  // Advanced search form state matching image 2
  const [formFilters, setFormFilters] = useState({
    searchIn: advancedFilters.searchIn || 'Aktywne kalendarze',
    what: advancedFilters.what || '',
    who: advancedFilters.who || '',
    where: advancedFilters.where || '',
    notContain: advancedFilters.notContain || '',
    dateFrom: advancedFilters.dateFrom || '',
    dateTo: advancedFilters.dateTo || ''
  });

  const [viewOptions, setViewOptions] = useState({
    showWeekends: true,
    showRejected: false,
    showCompleted: true
  });

  const searchInputRef = useRef(null);
  const monthPickerRef = useRef(null);
  const viewMenuRef = useRef(null);
  const advancedSearchRef = useRef(null);
  const searchInRef = useRef(null);
  const invitePopoverRef = useRef(null);

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
      if (searchInRef.current && !searchInRef.current.contains(e.target)) {
        setIsSearchInMenuOpen(false);
      }
      if (invitePopoverRef.current && !invitePopoverRef.current.contains(e.target)) {
        setIsInviteOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mini picker dates
  const monthStart = startOfMonth(pickerDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
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

  // Header date display string based on current view
  const headerDateLabel = React.useMemo(() => {
    if (activeView === 'day') {
      return format(currentDate, 'd MMMM yyyy', { locale: pl });
    }
    if (activeView === 'year') {
      return format(currentDate, 'yyyy');
    }
    if (activeView === 'agenda') {
      return 'Lis 2026 – lis 2027';
    }
    return format(currentDate, 'LLLL yyyy', { locale: pl });
  }, [currentDate, activeView]);

  const handleApplyAdvancedSearch = (e) => {
    if (e) e.preventDefault();
    if (onAdvancedFiltersChange) {
      onAdvancedFiltersChange(formFilters);
    }
    if (formFilters.what && !searchQuery) {
      onSearchChange(formFilters.what);
    }
    setIsAdvancedSearchOpen(false);
  };

  const handleResetAdvancedSearch = () => {
    const resetValues = {
      searchIn: 'Aktywne kalendarze',
      what: '',
      who: '',
      where: '',
      notContain: '',
      dateFrom: '',
      dateTo: ''
    };
    setFormFilters(resetValues);
    if (onAdvancedFiltersChange) {
      onAdvancedFiltersChange(resetValues);
    }
    onSearchChange('');
  };

  // ==========================================
  // FULL SEARCH MODE (Matching Image 1 & Image 2)
  // ==========================================
  if (isSearchOpen) {
    return (
      <header className="h-16 px-4 flex items-center bg-[#1e1f20] text-[#e3e3e3] select-none z-50 sticky top-0 border-0">
        {/* Left: Back Arrow and "Szukaj" label */}
        <div className="w-64 shrink-0 flex items-center space-x-3">
          <button
            onClick={() => {
              setIsSearchOpen(false);
              setIsAdvancedSearchOpen(false);
            }}
            className="p-2.5 hover:bg-[#282a2d] rounded-full text-[#c4c7c5] transition"
            title="Wstecz"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xl font-normal text-[#e3e3e3]">Szukaj</span>
        </div>

        {/* Center: Search pill container aligned with calendar, hover does NOT brighten background */}
        <div className="relative flex-1 max-w-2xl ml-3" ref={advancedSearchRef}>
          <div className="flex items-center bg-[#131314] rounded-full px-4 py-2 transition shadow-inner">
            <Search className="w-5 h-5 text-[#9aa0a6] mr-3 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Szukaj"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setFormFilters(prev => ({ ...prev, what: e.target.value }));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsSearchOpen(false);
                  setIsAdvancedSearchOpen(false);
                }
              }}
              className="w-full bg-transparent border-0 text-base text-[#e3e3e3] placeholder-[#9aa0a6] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  onSearchChange('');
                  setFormFilters(prev => ({ ...prev, what: '' }));
                }}
                className="p-1 hover:bg-[#35373a] rounded-full text-[#9aa0a6] hover:text-white transition mr-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
              className="p-1 text-[#9aa0a6] hover:text-[#e3e3e3] hover:bg-[#35373a] rounded-full transition ml-1"
              title="Opcje wyszukiwania zaawansowanego"
            >
              <ChevronDown className={`w-5 h-5 transition-transform ${isAdvancedSearchOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* ADVANCED SEARCH POPOVER: tło #131314, bez border, lekki jasny cień na dole */}
          {isAdvancedSearchOpen && (
            <div className="absolute left-0 right-0 top-0 mt-0 z-50 bg-[#131314] rounded-[24px] shadow-[0_16px_40px_rgba(255,255,255,0.06)] p-6 border-0 animate-in fade-in zoom-in-95 duration-150 text-[#e3e3e3]">
              <div className="flex items-center bg-[#131314] rounded-full px-4 py-2 mb-6 border border-[#3c4043]/40">
                <Search className="w-5 h-5 text-[#9aa0a6] mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Szukaj"
                  value={formFilters.what}
                  onChange={(e) => setFormFilters({ ...formFilters, what: e.target.value })}
                  className="w-full bg-transparent border-0 text-base text-[#e3e3e3] placeholder-[#9aa0a6] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsAdvancedSearchOpen(false)}
                  className="p-1 text-[#9aa0a6] hover:text-[#e3e3e3] rounded-full"
                >
                  <ChevronDown className="w-5 h-5 rotate-180" />
                </button>
              </div>

              <form onSubmit={handleApplyAdvancedSearch} className="space-y-4">
                {/* Szukaj w: custom dropdown matching user photo media_1794165585967_1e9f7bff.png */}
                <div className="flex items-center relative" ref={searchInRef}>
                  <span className="w-28 text-sm text-[#e3e3e3] shrink-0 font-normal">Szukaj w:</span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsSearchInMenuOpen(!isSearchInMenuOpen)}
                      className="bg-[#282a2d] hover:bg-[#323438] text-[#e3e3e3] px-3.5 py-2 rounded-t-md border-b-2 border-[#8ab4f8] flex items-center space-x-2 text-sm cursor-pointer select-none min-w-[210px] justify-between transition"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <Check className="w-4 h-4 text-[#e3e3e3] shrink-0" />
                        <span className="truncate">{formFilters.searchIn}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-[#9aa0a6] transition-transform ${isSearchInMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown list matching user photo */}
                    {isSearchInMenuOpen && (
                      <div className="absolute left-0 top-full mt-0 w-64 bg-[#282a2d] rounded-b-xl shadow-2xl py-1.5 border border-white/5 z-50 animate-in fade-in zoom-in-95 duration-100 text-[#e3e3e3]">
                        {/* 1. Aktywne kalendarze */}
                        <div
                          onClick={() => {
                            setFormFilters(prev => ({ ...prev, searchIn: 'Aktywne kalendarze' }));
                            setIsSearchInMenuOpen(false);
                          }}
                          className="flex items-center px-4 py-2 hover:bg-[#35373a] cursor-pointer text-sm"
                        >
                          <Check className="w-4 h-4 mr-2.5 text-[#e3e3e3] shrink-0" />
                          <span>Aktywne kalendarze</span>
                        </div>

                        {/* 2. Wszystkie kalendarze */}
                        <div
                          onClick={() => {
                            setFormFilters(prev => ({ ...prev, searchIn: 'Wszystkie kalendarze' }));
                            setIsSearchInMenuOpen(false);
                          }}
                          className="flex items-center px-4 py-2 hover:bg-[#35373a] cursor-pointer text-sm"
                        >
                          <CalendarIcon className="w-4 h-4 mr-2.5 text-[#9aa0a6] shrink-0" />
                          <span>Wszystkie kalendarze</span>
                        </div>

                        <div className="border-t border-[#3c4043] my-1"></div>

                        {/* 3. Wszystkie moje kalendarze */}
                        <div
                          onClick={() => {
                            setFormFilters(prev => ({ ...prev, searchIn: 'Wszystkie moje kalendarze' }));
                            setIsSearchInMenuOpen(false);
                          }}
                          className="flex items-center px-4 py-2 hover:bg-[#35373a] cursor-pointer text-sm"
                        >
                          <CalendarIcon className="w-4 h-4 mr-2.5 text-[#9aa0a6] shrink-0" />
                          <span>Wszystkie moje kalendarze</span>
                        </div>

                        {/* Moje kalendarze list with color dots */}
                        {myCalendars.map(cal => (
                          <div
                            key={cal.id}
                            onClick={() => {
                              setFormFilters(prev => ({ ...prev, searchIn: cal.name }));
                              setIsSearchInMenuOpen(false);
                            }}
                            className="flex items-center px-4 py-2 hover:bg-[#35373a] cursor-pointer text-sm pl-6"
                          >
                            <span 
                              className="w-3 h-3 rounded-full mr-2.5 shrink-0" 
                              style={{ backgroundColor: cal.color }}
                            />
                            <span className="truncate">{cal.name}</span>
                          </div>
                        ))}

                        <div className="border-t border-[#3c4043] my-1"></div>

                        {/* 4. Wszystkie inne kalendarze */}
                        <div
                          onClick={() => {
                            setFormFilters(prev => ({ ...prev, searchIn: 'Wszystkie inne kalendarze' }));
                            setIsSearchInMenuOpen(false);
                          }}
                          className="flex items-center px-4 py-2 hover:bg-[#35373a] cursor-pointer text-sm"
                        >
                          <CalendarIcon className="w-4 h-4 mr-2.5 text-[#9aa0a6] shrink-0" />
                          <span>Wszystkie inne kalendarze</span>
                        </div>

                        {/* Inne kalendarze list with color dots */}
                        {otherCalendars.map(cal => (
                          <div
                            key={cal.id}
                            onClick={() => {
                              setFormFilters(prev => ({ ...prev, searchIn: cal.name }));
                              setIsSearchInMenuOpen(false);
                            }}
                            className="flex items-center px-4 py-2 hover:bg-[#35373a] cursor-pointer text-sm pl-6"
                          >
                            <span 
                              className="w-3 h-3 rounded-full mr-2.5 shrink-0" 
                              style={{ backgroundColor: cal.color }}
                            />
                            <span className="truncate">{cal.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Co: bez borderu, ciemnoszary input jak na zdjęciu */}
                <div className="flex items-center">
                  <span className="w-28 text-sm text-[#e3e3e3] shrink-0 font-normal">Co</span>
                  <input
                    type="text"
                    value={formFilters.what}
                    onChange={(e) => setFormFilters({ ...formFilters, what: e.target.value })}
                    className="flex-1 bg-[#282a2d] text-[#e3e3e3] text-sm rounded-md px-4 py-2.5 border-0 focus:outline-none placeholder-[#9aa0a6]"
                  />
                </div>

                {/* Kto: placeholder "Dowolna osoba lub twórcę" ze zdjęcia */}
                <div className="flex items-center">
                  <span className="w-28 text-sm text-[#e3e3e3] shrink-0 font-normal">Kto</span>
                  <input
                    type="text"
                    placeholder="Dowolna osoba lub twórcę"
                    value={formFilters.who}
                    onChange={(e) => setFormFilters({ ...formFilters, who: e.target.value })}
                    className="flex-1 bg-[#282a2d] text-[#e3e3e3] text-sm rounded-md px-4 py-2.5 border-0 focus:outline-none placeholder-[#9aa0a6]"
                  />
                </div>

                {/* Gdzie */}
                <div className="flex items-center">
                  <span className="w-28 text-sm text-[#e3e3e3] shrink-0 font-normal">Gdzie</span>
                  <input
                    type="text"
                    value={formFilters.where}
                    onChange={(e) => setFormFilters({ ...formFilters, where: e.target.value })}
                    className="flex-1 bg-[#282a2d] text-[#e3e3e3] text-sm rounded-md px-4 py-2.5 border-0 focus:outline-none placeholder-[#9aa0a6]"
                  />
                </div>

                {/* Nie zawiera: placeholder "Słowa w wydarzeniu" ze zdjęcia */}
                <div className="flex items-center">
                  <span className="w-28 text-sm text-[#e3e3e3] shrink-0 font-normal">Nie zawiera</span>
                  <input
                    type="text"
                    placeholder="Słowa w wydarzeniu"
                    value={formFilters.notContain}
                    onChange={(e) => setFormFilters({ ...formFilters, notContain: e.target.value })}
                    className="flex-1 bg-[#282a2d] text-[#e3e3e3] text-sm rounded-md px-4 py-2.5 border-0 focus:outline-none placeholder-[#9aa0a6]"
                  />
                </div>

                {/* Data: bez ikonek kalendarza, mniejszy radius, jaśniejszy szary, bez borderu */}
                <div className="flex items-center">
                  <span className="w-28 text-sm text-[#e3e3e3] shrink-0 font-normal">Data</span>
                  <div className="flex-1 flex items-center space-x-2">
                    <input
                      type="date"
                      value={formFilters.dateFrom}
                      onChange={(e) => setFormFilters({ ...formFilters, dateFrom: e.target.value })}
                      className="bg-[#282a2d] text-[#e3e3e3] text-sm rounded-md px-4 py-2 border-0 focus:outline-none [appearance:none] [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden"
                    />
                    <span className="text-[#9aa0a6] text-sm px-1">do</span>
                    <input
                      type="date"
                      value={formFilters.dateTo}
                      onChange={(e) => setFormFilters({ ...formFilters, dateTo: e.target.value })}
                      className="bg-[#282a2d] text-[#e3e3e3] text-sm rounded-md px-4 py-2 border-0 focus:outline-none [appearance:none] [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={handleResetAdvancedSearch}
                    className="px-4 py-2 text-sm font-medium text-[#8ab4f8] hover:text-[#aecbfa] hover:bg-[#35373a] rounded-full transition"
                  >
                    Resetuj
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-sm font-medium text-[#8ab4f8] hover:text-[#aecbfa] hover:bg-[#35373a] rounded-full transition"
                  >
                    Szukaj
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </header>
    );
  }

  // ==========================================
  // NORMAL NAVBAR MODE
  // ==========================================
  return (
    <header className="h-[68px] px-4 flex items-center justify-between bg-[#1e1f20] text-[#e3e3e3] select-none z-20 sticky top-0 border-0">
      {/* Left: Hamburger + Logo in fixed width matching sidebar, slightly shifted left */}
      <div className="flex items-center">
        <div className="w-60 shrink-0 flex items-center space-x-3">
          <button 
            onClick={onToggleSidebar}
            className="p-2.5 hover:bg-[#282a2d] rounded-full text-[#c4c7c5] hover:text-white transition"
            title="Menu główne"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-2.5 cursor-pointer">
            <img 
              src="/calendar-logo.png" 
              alt="KALEND67" 
              className="w-11 h-11 object-contain rounded-xl drop-shadow-md" 
            />
            <span className="text-[22px] font-normal text-[#e3e3e3] tracking-tight font-['Product_Sans',sans-serif]">
              KALEND67
            </span>
          </div>
        </div>

        {/* Navigation starts directly aligned with calendar: shifted slightly left (ml-1.5), Dzisiaj border whiter */}
        <div className="flex items-center space-x-3 ml-1.5">
          {/* Dzisiaj button: border bardziej biały */}
          <button
            onClick={onToday}
            className="px-6 py-2.5 border border-[#8e918f] hover:border-white hover:bg-[#282a2d] rounded-full text-sm font-medium text-[#e3e3e3] transition active:scale-95"
          >
            Dzisiaj
          </button>

          {/* < > arrows: advance by current view mode */}
          <div className="flex items-center space-x-1">
            <button
              onClick={onPrevDate}
              className="p-2.5 hover:bg-[#282a2d] rounded-full text-[#c4c7c5] hover:text-white transition"
              title="Poprzedni"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onNextDate}
              className="p-2.5 hover:bg-[#282a2d] rounded-full text-[#c4c7c5] hover:text-white transition"
              title="Następny"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Month/Date Dropdown Button: większa strzałka i kolor jak miesiąc */}
          <div className="relative" ref={monthPickerRef}>
            <button
              onClick={() => {
                setPickerDate(currentDate);
                setIsMonthPickerOpen(!isMonthPickerOpen);
              }}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-[#282a2d] text-2xl font-normal text-[#e3e3e3] capitalize transition"
            >
              <span>{headerDateLabel}</span>
              <ChevronDown className={`w-5 h-5 text-[#e3e3e3] transition-transform ${isMonthPickerOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Month & Day Picker Popover */}
            {isMonthPickerOpen && (
              <div className="absolute left-0 mt-2 z-50 w-64 bg-[#1e1f20] border border-[#303134] rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-white/5">
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

                {/* Days header: N P W Ś C P S */}
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
      </div>

      {/* Right: Search Icon, Help, Settings, View Switcher dropdown, User Profile - większe ikonki */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="p-2.5 hover:bg-[#282a2d] rounded-full text-[#c4c7c5] hover:text-white transition"
          title="Szukaj w kalendarzu"
        >
          {/* Ikonka wyszukiwarki ze zdjęcia Image 5 */}
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </button>

        <button
          onClick={() => alert('Pomoc i opinie')}
          className="p-2.5 hover:bg-[#282a2d] rounded-full text-[#c4c7c5] hover:text-white transition"
          title="Pomoc"
        >
          <HelpCircle className="w-6 h-6" />
        </button>

        <button
          onClick={() => alert('Ustawienia kalendarza')}
          className="p-2.5 hover:bg-[#282a2d] rounded-full text-[#c4c7c5] hover:text-white transition"
          title="Ustawienia"
        >
          {/* Ikonka koła zębatego ze zdjęcia Image 3 */}
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54A.484.484 0 0 0 14 2h-4c-.25 0-.46.18-.49.42l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.63 8.47c-.12.21-.08.47.12.61L4.78 10.66c-.04.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
          </svg>
        </button>

        {/* Przycisk Zaproś / Współdzielenie z okienkiem pod spodem */}
        <div className="relative" ref={invitePopoverRef}>
          <button
            onClick={() => setIsInviteOpen(!isInviteOpen)}
            className="flex items-center space-x-2 px-4 h-10 bg-[#282a2d] hover:bg-[#35373a] text-white border border-[#444746] hover:border-white/50 rounded-full text-sm font-medium transition focus:outline-none shadow-xs"
            title="Zaproś znajomego do kalendarza i wymieniaj terminy"
          >
            {/* Google Material Person Add Icon - biała */}
            <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 24 24">
              <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <span className="text-white font-medium">Zaproś</span>
          </button>

          {/* Profesjonalne, minimalistyczne okienko pod buttonem */}
          <InvitePopover
            isOpen={isInviteOpen}
            onClose={() => setIsInviteOpen(false)}
            roomCode={roomCode}
            currentPin={roomPin}
            onUpdatePin={onUpdatePin}
            participants={participants}
            currentUser={currentUser}
            myEvents={myEvents}
            exchangeableEvents={exchangeableEvents}
            onDirectSwap={onDirectSwap}
          />
        </div>

        {/* View Switcher Dropdown: border bardziej biały, wysokość h-10 */}
        <div className="relative ml-1" ref={viewMenuRef}>
          <button
            onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
            className="flex items-center space-x-2 px-5 h-10 bg-transparent hover:bg-[#282a2d] border border-[#8e918f] hover:border-white rounded-full text-sm font-medium text-[#e3e3e3] transition focus:outline-none"
          >
            <span>{VIEW_LABELS[activeView] || 'Tydzień'}</span>
            <ChevronDown className={`w-4 h-4 text-[#e3e3e3] transition-transform ${isViewMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* View Menu Popover: ciemniejsze tło (#1e1f20), mniejszy radius (rounded-xl), zwiększona szerokość (w-72), 1 linia tekstu */}
          {isViewMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[#1e1f20] border border-[#303134] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-white/5">
              <button
                onClick={() => { onViewChange('day'); setIsViewMenuOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-[#e3e3e3] hover:bg-[#282a2d] transition"
              >
                <span>Dzień</span>
                <span className="text-xs text-[#9aa0a6]">D</span>
              </button>
              <button
                onClick={() => { onViewChange('week'); setIsViewMenuOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-[#e3e3e3] hover:bg-[#282a2d] transition"
              >
                <span>Tydzień</span>
                <span className="text-xs text-[#9aa0a6]">W</span>
              </button>
              <button
                onClick={() => { onViewChange('month'); setIsViewMenuOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-[#e3e3e3] hover:bg-[#282a2d] transition"
              >
                <span>Miesiąc</span>
                <span className="text-xs text-[#9aa0a6]">M</span>
              </button>
              <button
                onClick={() => { onViewChange('year'); setIsViewMenuOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-[#e3e3e3] hover:bg-[#282a2d] transition"
              >
                <span>Rok</span>
                <span className="text-xs text-[#9aa0a6]">Y</span>
              </button>
              <button
                onClick={() => { onViewChange('agenda'); setIsViewMenuOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-[#e3e3e3] hover:bg-[#282a2d] transition"
              >
                <span>Harmonogram</span>
                <span className="text-xs text-[#9aa0a6]">A</span>
              </button>
              <button
                onClick={() => { onViewChange('fourDays'); setIsViewMenuOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-[#e3e3e3] hover:bg-[#282a2d] transition"
              >
                <span>4 dni</span>
                <span className="text-xs text-[#9aa0a6]">X</span>
              </button>

              <div className="border-t border-[#303134] my-2"></div>

              {/* Checkboxes: tekst w 1 linii bez zawijania */}
              <button
                onClick={() => setViewOptions(p => ({ ...p, showWeekends: !p.showWeekends }))}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-[#e3e3e3] hover:bg-[#282a2d] transition"
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  {viewOptions.showWeekends && <Check className="w-4 h-4 text-[#8ab4f8] stroke-[2.5]" />}
                </div>
                <span className="whitespace-nowrap">Pokaż weekendy</span>
              </button>
              <button
                onClick={() => setViewOptions(p => ({ ...p, showRejected: !p.showRejected }))}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-[#e3e3e3] hover:bg-[#282a2d] transition"
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  {viewOptions.showRejected && <Check className="w-4 h-4 text-[#8ab4f8] stroke-[2.5]" />}
                </div>
                <span className="whitespace-nowrap">Pokaż odrzucone wydarzenia</span>
              </button>
              <button
                onClick={() => setViewOptions(p => ({ ...p, showCompleted: !p.showCompleted }))}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-[#e3e3e3] hover:bg-[#282a2d] transition"
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  {viewOptions.showCompleted && <Check className="w-4 h-4 text-[#8ab4f8] stroke-[2.5]" />}
                </div>
                <span className="whitespace-nowrap">Pokaż ukończone zadania</span>
              </button>
            </div>
          )}
        </div>

        {/* User Auth Info */}
        {user ? (
          <div className="flex items-center space-x-2 pl-2">
            <div 
              className="w-9 h-9 rounded-full bg-[#d93025] text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-[#3c4043] cursor-pointer"
              title={user.displayName || user.email}
            >
              {user.displayName ? user.displayName[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'K')}
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
            className="px-6 h-10 flex items-center justify-center bg-[#a8c7fa] hover:bg-[#b8d4ff] text-[#062e6f] font-medium rounded-full text-sm transition shadow-sm active:scale-95 ml-1"
          >
            Zaloguj się
          </button>
        )}
      </div>
    </header>
  );
}
