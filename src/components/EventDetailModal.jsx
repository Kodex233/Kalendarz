import React from 'react';
import { 
  X, 
  Edit3, 
  Trash2, 
  Mail, 
  MoreVertical, 
  Bell, 
  Calendar as CalendarIcon, 
  Link as LinkIcon,
  ArrowLeftRight
} from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

export default function EventDetailModal({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onOpenExchange,
  calendarName = 'Kalendarz',
  calendarColor = '#1a73e8',
  userRole = 'Pełny dostęp'
}) {
  if (!isOpen || !event) return null;

  const formattedDate = event.date ? (() => {
    try {
      const d = new Date(event.date + 'T00:00:00');
      return format(d, 'EEEE, d MMMM', { locale: pl });
    } catch {
      return event.date;
    }
  })() : '';

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    alert('Link do wydarzenia skopiowany do schowka!');
  };

  const handleDelete = () => {
    if (event && event.id) {
      onDelete(event.id);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div 
        className="bg-[#1e1f20] text-[#e3e3e3] rounded-[28px] shadow-2xl w-full max-w-[490px] overflow-hidden border-0 animate-in fade-in zoom-in-95 duration-150 p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Right Action Icons: precyzyjne ułożenie i poprawiona ikonka ołówka ze szczeliną */}
        <div className="flex items-center justify-end space-x-1 text-[#c4c7c5] -mr-1">
          {userRole !== 'Przeglądający' && (
            <>
              <button
                onClick={() => {
                  onClose();
                  onEdit(event);
                }}
                className="p-2 hover:bg-[#35373a] hover:text-white rounded-full transition cursor-pointer"
                title="Edytuj wydarzenie"
              >
                {/* Ołówek edycji z wewnętrzną szczeliną zgodny ze zdjęciem Google Material */}
                <svg className="w-5 h-5 fill-current text-[#c4c7c5] hover:text-white" viewBox="0 0 24 24">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM5.92 19H5v-.92l9.06-9.06.92.92L5.92 19zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
              </button>

              <button
                onClick={handleDelete}
                className="p-2 hover:bg-[#35373a] hover:text-[#f28b82] rounded-full transition cursor-pointer"
                title="Usuń wydarzenie"
              >
                {/* Kosz ze zdjęcia Google Material */}
                <svg className="w-5 h-5 fill-current text-[#c4c7c5] hover:text-[#f28b82] transition" viewBox="0 0 24 24">
                  <path d="M15 4V3H9v1H4v2h1v13c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V6h1V4h-5zm2 15H7V6h10v13zM9 8h2v9H9zm4 0h2v9h-2z" />
                </svg>
              </button>
            </>
          )}

          <button
            onClick={() => {
              if (event.invitedEmail) {
                window.location.href = `mailto:${event.invitedEmail}`;
              } else {
                alert('Brak zaproszonych gości do wysłania e-maila');
              }
            }}
            className="p-2 hover:bg-[#35373a] hover:text-white rounded-full transition"
            title="Wyślij e-mail do gości"
          >
            <Mail className="w-5 h-5 text-[#c4c7c5] hover:text-white" />
          </button>

          <button
            onClick={() => alert('Więcej opcji')}
            className="p-2 hover:bg-[#35373a] hover:text-white rounded-full transition"
            title="Opcje"
          >
            <MoreVertical className="w-5 h-5 text-[#c4c7c5] hover:text-white" />
          </button>

          <button
            onClick={onClose}
            className="p-2 hover:bg-[#35373a] hover:text-white rounded-full transition"
            title="Zamknij"
          >
            <X className="w-5 h-5 text-[#c4c7c5] hover:text-white" />
          </button>
        </div>

        {/* Title with colored square */}
        <div className="flex items-start space-x-3.5 pt-0.5">
          <span 
            className="w-4 h-4 rounded-[4px] mt-1.5 shrink-0" 
            style={{ backgroundColor: event.customBg || calendarColor }}
          />
          <div>
            <h2 className="text-[22px] font-normal text-[#e3e3e3] tracking-wide leading-tight">
              {event.title || '(Bez tytułu)'}
            </h2>
            <p className="text-xs text-[#9aa0a6] mt-1 capitalize">
              {formattedDate} • {event.startTime || '12:00'}–{event.endTime || '1:00pm'}
            </p>
          </div>
        </div>

        {/* Zaproś przez link button: napis i ikonka na niebiesko jasno jak w aplikacji */}
        <div className="pl-7">
          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-2.5 px-4 py-2 rounded-full border border-[#5f6368] hover:bg-[#a8c7fa]/15 text-xs font-medium text-[#a8c7fa] transition cursor-pointer"
          >
            <LinkIcon className="w-4 h-4 text-[#a8c7fa]" />
            <span>Zaproś przez link</span>
          </button>
        </div>

        {/* 30 minut wcześniej notification row */}
        <div className="flex items-center space-x-3 text-xs text-[#c4c7c5] pl-1">
          <Bell className="w-5 h-5 text-[#c4c7c5] shrink-0" />
          <span>30 minut wcześniej</span>
        </div>

        {/* Calendar row */}
        <div className="flex items-center space-x-3 text-xs text-[#c4c7c5] pl-1">
          <CalendarIcon className="w-5 h-5 text-[#c4c7c5] shrink-0" />
          <span>{calendarName}</span>
        </div>
      </div>
    </div>
  );
}
