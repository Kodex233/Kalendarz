import React from 'react';
import { 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  HelpCircle, 
  Settings, 
  ArrowLeftRight, 
  Calendar as CalendarIcon,
  LogOut,
  User as UserIcon,
  Sparkles
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
    <header className="h-16 border-b border-gray-200 px-4 flex items-center justify-between bg-white select-none z-10 sticky top-0">
      {/* Left: Hamburger, Logo, Navigation */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={onToggleSidebar}
          className="p-2.5 hover:bg-gray-100 rounded-full text-gray-600 transition"
          title="Menu główne"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mr-4">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-sm">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <span className="text-xl font-normal text-gray-700 tracking-tight font-['Product_Sans',sans-serif]">
            Kalendarz
          </span>
          <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full">
            Wymiana
          </span>
        </div>

        <button
          onClick={onToday}
          className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-md text-sm font-medium text-gray-700 transition"
        >
          Dzisiaj
        </button>

        <div className="flex items-center space-x-1">
          <button
            onClick={onPrevMonth}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition"
            title="Poprzedni miesiąc"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onNextMonth}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition"
            title="Następny miesiąc"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <h2 className="text-xl font-medium text-gray-800 capitalize min-w-[180px]">
          {format(currentDate, 'LLLL yyyy', { locale: pl })}
        </h2>
      </div>

      {/* Middle: Search */}
      <div className="flex-1 max-w-xl mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Szukaj terminów lub znajomych..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 hover:bg-gray-200/80 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none border border-transparent rounded-lg text-sm transition"
          />
        </div>
      </div>

      {/* Right: Exchange action, View dropdown, User profile */}
      <div className="flex items-center space-x-3">
        {/* Wymiana terminów badge button */}
        <button
          onClick={onOpenExchangeModal}
          className="relative flex items-center space-x-2 px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 rounded-lg text-sm font-medium transition shadow-sm"
          title="Wymień się terminem z kolegą"
        >
          <ArrowLeftRight className="w-4 h-4 text-amber-600" />
          <span className="hidden sm:inline">Wymiana terminów</span>
          {pendingExchangesCount > 0 && (
            <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {pendingExchangesCount}
            </span>
          )}
        </button>

        {/* View Switcher */}
        <select
          value={activeView}
          onChange={(e) => onViewChange(e.target.value)}
          className="bg-transparent border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="month">Miesiąc</option>
          <option value="week">Tydzień</option>
          <option value="agenda">Plan zajęć</option>
        </select>

        {/* User Auth Info */}
        {user ? (
          <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
            <div className="flex items-center space-x-2">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || user.email} 
                  className="w-8 h-8 rounded-full border border-gray-300 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  {user.displayName ? user.displayName[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U')}
                </div>
              )}
              <div className="hidden lg:block text-left text-xs">
                <p className="font-semibold text-gray-800 truncate max-w-[120px]">{user.displayName || user.email.split('@')[0]}</p>
                <p className="text-gray-500 truncate max-w-[120px]">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition"
              title="Wyloguj się"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
          >
            <UserIcon className="w-4 h-4" />
            <span>Zaloguj się</span>
          </button>
        )}
      </div>
    </header>
  );
}
