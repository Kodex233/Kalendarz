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
  X, 
  Check, 
  RotateCcw 
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
  onAdvancedFiltersChange
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
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
      if (advancedSearchRef.current && !advancedSearchRef.current.contains(e.target)) {
        // If clicking outside advanced search, keep open only if clicked within search container
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

  // Header date display string based on current view
  const headerDateLabel = React.useMemo(() => {
    if (activeView === 'day') {
      return format(currentDate, 'd MMMM yyyy', { locale: pl });
    }
    if (activeView === 'year') {
      return format(currentDate, 'yyyy');
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
      <header className="h-16 px-4 flex items-center bg-[#1e1f20] text-[#e3e3e3] select-none z-50 sticky top-0 border-b border-[#303134]/40">
        {/* Left: Back Arrow and "Szukaj" label matching image 1 */}
        <div className="flex items-center space-x-3 mr-4">
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

        {/* Center: Search pill container with dropdown arrow matching image 1 & image 2 */}
        <div className="relative flex-1 max-w-2xl" ref={advancedSearchRef}>
          <div className="flex items-center bg-[#131314] hover:bg-[#282a2d]/70 focus-within:bg-[#282a2d] rounded-full px-4 py-2 transition shadow-inner">
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

          {/* ADVANCED SEARCH POPOVER (Matching Image 2 directly) */}
          {isAdvancedSearchOpen && (
            <div className="absolute left-0 right-0 top-0 mt-0 z-50 bg-[#1e1f20] rounded-[24px] shadow-2xl p-6 border border-[#303134]/80 animate-in fade-in zoom-in-95 duration-150 text-[#e3e3e3]">
              {/* Top search row matching image 2 */}
              <div className="flex items-center bg-[#131314] rounded-full px-4 py-2 mb-6">
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

              {/* Form fields matching image 2 */}
              <form onSubmit={handleApplyAdvancedSearch} className="space-y-4">
                {/* 1. Szukaj w: */}
                <div className="flex items-center">
                  <span className="w-28 text-sm text-[#9aa0a6] shrink-0">Szukaj w:</span>
                  <div className="flex-1">
                    <select
                      value={formFilters.searchIn}
                      onChange={(e) => setFormFilters({ ...formFilters, searchIn: e.target.value })}
                      className="w-full bg-[#282a2d] text-[#e3e3e3] text-sm rounded-lg px-3 py-2 border-0 focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
                    >
                      <option value="Aktywne kalendarze">✓ Aktywne kalendarze</option>
                      <option value="Wszystkie kalendarze">Wszystkie kalendarze</option>
                    </select>
                  </div>
                </div>

                {/* 2. Co */}
                <div className="flex items-center">
                  <span className="w-28 text-sm text-[#9aa0a6] shrink-0">Co</span>
                  <input
                    type="text"
                    placeholder="Słowa kluczowe w wydarzeniu"
                    value={formFilters.what}
                    onChange={(e) => setFormFilters({ ...formFilters, what: e.target.value })}
                    className="flex-1 bg-[#282a2d] text-[#e3e3e3] text-sm rounded-lg px-3 py-2 border-0 placeholder-[#747775] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
                  />
                </div>

                {/* 3. Kto */}
                <div className="flex items-center">
                  <span className="w-28 text-sm text-[#9aa0a6] shrink-0">Kto</span>
                  <input
                    type="text"
                    placeholder="Wpisz uczestnika, organizatora lub twórcę"
                    value={formFilters.who}
                    onChange={(e) => setFormFilters({ ...formFilters, who: e.target.value })}
                    className="flex-1 bg-[#282a2d] text-[#e3e3e3] text-sm rounded-lg px-3 py-2 border-0 placeholder-[#747775] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
                  />
                </div>

                {/* 4. Gdzie */}
                <div className="flex items-center">
                  <span className="w-28 text-sm text-[#9aa0a6] shrink-0">Gdzie</span>
                  <input
                    type="text"
                    placeholder="Podaj lokalizację lub salę"
                    value={formFilters.where}
                    onChange={(e) => setFormFilters({ ...formFilters, where: e.target.value })}
                    className="flex-1 bg-[#282a2d] text-[#e3e3e3] text-sm rounded-lg px-3 py-2 border-0 placeholder-[#747775] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
                  />
                </div>

                {/* 5. Nie zawiera */}
                <div className="flex items-center">
                  <span className="w-28 text-sm text-[#9aa0a6] shrink-0">Nie zawiera</span>
                  <input
                    type="text"
                    placeholder="Słowa kluczowe niezawarte w wydarzeniu"
                    value={formFilters.notContain}
                    onChange={(e) => setFormFilters({ ...formFilters, notContain: e.target.value })}
                    className="flex-1 bg-[#282a2d] text-[#e3e3e3] text-sm rounded-lg px-3 py-2 border-0 placeholder-[#747775] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
                  />
                </div>

                {/* 6. Data: Od dnia do Do dnia */}
                <div className="flex items-center">
                  <span className="w-28 text-sm text-[#9aa0a6] shrink-0">Data</span>
                  <div className="flex-1 flex items-center space-x-2">
                    <input
                      type="date"
                      value={formFilters.dateFrom}
                      onChange={(e) => setFormFilters({ ...formFilters, dateFrom: e.target.value })}
                      className="bg-[#282a2d] text-[#e3e3e3] text-sm rounded-lg px-3 py-1.5 border-0 focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
                    />
                    <span className="text-[#9aa0a6] text-sm">do</span>
                    <input
                      type="date"
                      value={formFilters.dateTo}
                      onChange={(e) => setFormFilters({ ...formFilters, dateTo: e.target.value })}
                      className="bg-[#282a2d] text-[#e3e3e3] text-sm rounded-lg px-3 py-1.5 border-0 focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Bottom Actions matching image 2: Resetuj and Szukaj */}
                <div className="flex items-center justify-end space-x-3 pt-4">
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
    <header className="h-16 px-4 flex items-center justify-between bg-[#1e1f20] text-[#e3e3e3] select-none z-20 sticky top-0 border-b border-[#303134]/30">
      {/* Left: Hamburger, Logo, Dzisiaj, Navigation, Month/Date Dropdown */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={onToggleSidebar}
          className="p-2.5 hover:bg-[#282a2d] rounded-full text-[#c4c7c5] transition"
          title="Menu główne"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mr-3 cursor-pointer">
          <div className="w-10 h-10 bg-[#1a73e8] text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
            {format(new Date(), 'd')}
          </div>
          <span className="text-xl font-normal text-[#e3e3e3] tracking-tight font-['Product_Sans',sans-serif]">
            Kalendarz
          </span>
        </div>

        {/* Dzisiaj button: WIEKSZY RADIUS (rounded-full) */}
        <button
          onClick={onToday}
          className="px-5 py-2 border border-[#5f6368] hover:bg-[#282a2d] rounded-full text-sm font-medium text-[#e3e3e3] transition active:scale-95"
        >
          Dzisiaj
        </button>

        {/* < > arrows: advance by current view mode */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onPrevDate}
            className="p-2 hover:bg-[#282a2d] rounded-full text-[#c4c7c5] transition"
            title="Poprzedni"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onNextDate}
            className="p-2 hover:bg-[#282a2d] rounded-full text-[#c4c7c5] transition"
            title="Następny"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Month/Date Dropdown Button matching image 2 */}
        <div className="relative" ref={monthPickerRef}>
          <button
            onClick={() => {
              setPickerDate(currentDate);
              setIsMonthPickerOpen(!isMonthPickerOpen);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg hover:bg-[#282a2d] text-xl font-medium text-[#e3e3e3] capitalize transition"
          >
            <span>{headerDateLabel}</span>
            <ChevronDown className={`w-4 h-4 text-[#9aa0a6] transition-transform ${isMonthPickerOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Month & Day Picker Popover */}
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

      {/* Right: Search Icon, Help, Settings, View Switcher dropdown, User Profile */}
      <div className="flex items-center space-x-2">
        {/* Search Icon button: opens search mode */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="p-2.5 hover:bg-[#282a2d] rounded-full text-[#c4c7c5] hover:text-white transition"
          title="Szukaj w kalendarzu"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Support Icon button */}
        <button
          onClick={() => alert('Pomoc i opinie')}
          className="p-2.5 hover:bg-[#282a2d] rounded-full text-[#c4c7c5] hover:text-white transition"
          title="Pomoc"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Settings Icon button */}
        <button
          onClick={() => alert('Ustawienia kalendarza')}
          className="p-2.5 hover:bg-[#282a2d] rounded-full text-[#c4c7c5] hover:text-white transition"
          title="Ustawienia"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* View Switcher Dropdown: WIĘKSZY RADIUS (rounded-full) */}
        <div className="relative ml-1" ref={viewMenuRef}>
          <button
            onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
            className="flex items-center space-x-2 px-5 py-2 bg-transparent hover:bg-[#282a2d] border border-[#5f6368] rounded-full text-sm font-medium text-[#e3e3e3] transition focus:outline-none"
          >
            <span>{VIEW_LABELS[activeView] || 'Tydzień'}</span>
            <ChevronDown className={`w-4 h-4 text-[#9aa0a6] transition-transform ${isViewMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* View Menu Popover */}
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

              {/* Checkboxes */}
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

        {/* User Auth Info: Elegancki avatar / Zaloguj button */}
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
            className="flex items-center space-x-2 px-5 py-2 border border-[#5f6368] hover:border-[#8ab4f8] hover:bg-[#282a2d] text-[#8ab4f8] rounded-full text-sm font-semibold transition shadow-xs ml-1"
          >
            <UserIcon className="w-4 h-4" />
            <span>Zaloguj się</span>
          </button>
        )}
      </div>
    </header>
  );
}
