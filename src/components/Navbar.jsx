import React from 'react';
import { 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  ArrowLeftRight, 
  Calendar as CalendarIcon,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

export default function Navbar({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  onToggleSidebar,
  user,
  onOpenAuth,
  onLogout,
  onOpenExchangeModal,
  pendingExchangesCount,
  searchQuery,
  onSearchChange,
  activeView,
  onViewChange
}) {
  return (
    <header className="h-16 border-b border-[#3c4043] px-4 flex items-center justify-between bg-[#1f1f1f] text-[#e3e3e3] select-none z-10 sticky top-0">
      {/* Left: Hamburger, Logo, Navigation */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={onToggleSidebar}
          className="p-2.5 hover:bg-[#282a2d] rounded-full text-[#c4c7c5] transition"
          title="Menu główne"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mr-4 cursor-pointer">
          <div className="w-10 h-10 bg-[#8ab4f8] text-[#1f1f1f] rounded-lg flex items-center justify-center shadow-sm">
            <CalendarIcon className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span className="text-xl font-normal text-[#e3e3e3] tracking-tight font-['Product_Sans',sans-serif]">
            Kalendarz
          </span>
          <span className="text-[11px] bg-[#1b3a57] text-[#c2e7ff] font-medium px-2 py-0.5 rounded-full border border-[#8ab4f8]/30">
            Wymiana
          </span>
        </div>

        <button
          onClick={onToday}
          className="px-4 py-2 border border-[#5f6368] hover:bg-[#282a2d] rounded-md text-sm font-medium text-[#e3e3e3] transition"
        >
          Dzisiaj
        </button>

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

        <h2 className="text-xl font-medium text-[#e3e3e3] capitalize min-w-[180px]">
          {format(currentDate, 'LLLL yyyy', { locale: pl })}
        </h2>
      </div>

      {/* Middle: Search */}
      <div className="flex-1 max-w-xl mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-[#9aa0a6] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Szukaj terminów lub znajomych..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#282a2d] hover:bg-[#35373a] focus:bg-[#202124] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none border border-transparent rounded-lg text-sm text-[#e3e3e3] placeholder-[#9aa0a6] transition"
          />
        </div>
      </div>

      {/* Right: Exchange action, View dropdown, User profile */}
      <div className="flex items-center space-x-3">
        {/* Wymiana terminów badge button */}
        <button
          onClick={onOpenExchangeModal}
          className="relative flex items-center space-x-2 px-3.5 py-2 bg-[#332a15] hover:bg-[#433519] border border-[#fdd663]/40 text-[#feefc3] rounded-lg text-sm font-medium transition shadow-xs"
          title="Wymień się terminem z kolegą"
        >
          <ArrowLeftRight className="w-4 h-4 text-[#fdd663]" />
          <span className="hidden sm:inline">Wymiana terminów</span>
          {pendingExchangesCount > 0 && (
            <span className="w-5 h-5 bg-[#f28b82] text-[#1f1f1f] text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {pendingExchangesCount}
            </span>
          )}
        </button>

        {/* View Switcher */}
        <select
          value={activeView}
          onChange={(e) => onViewChange(e.target.value)}
          className="bg-[#282a2d] border border-[#5f6368] rounded-md px-3 py-1.5 text-sm font-medium text-[#e3e3e3] hover:bg-[#35373a] focus:outline-none focus:ring-1 focus:ring-[#8ab4f8]"
        >
          <option value="month">Miesiąc</option>
          <option value="week">Tydzień</option>
          <option value="agenda">Plan zajęć</option>
        </select>

        {/* User Auth Info */}
        {user ? (
          <div className="flex items-center space-x-2 pl-2 border-l border-[#3c4043]">
            <div className="flex items-center space-x-2">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || user.email} 
                  className="w-8 h-8 rounded-full border border-[#5f6368] object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#8ab4f8] text-[#1f1f1f] flex items-center justify-center font-bold text-xs">
                  {user.displayName ? user.displayName[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U')}
                </div>
              )}
              <div className="hidden lg:block text-left text-xs">
                <p className="font-semibold text-[#e3e3e3] truncate max-w-[120px]">{user.displayName || user.email.split('@')[0]}</p>
                <p className="text-[#9aa0a6] truncate max-w-[120px]">{user.email}</p>
              </div>
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
            className="flex items-center space-x-2 px-4 py-2 bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#1f1f1f] rounded-lg text-sm font-semibold transition shadow-sm"
          >
            <UserIcon className="w-4 h-4" />
            <span>Zaloguj się</span>
          </button>
        )}
      </div>
    </header>
  );
}
