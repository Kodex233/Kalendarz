import React from 'react';
import { 
  X, 
  Edit3, 
  Trash2, 
  Mail, 
  MoreVertical, 
  Bell, 
  Calendar as CalendarIcon, 
  Link as LinkIcon 
} from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

export default function EventDetailModal({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  calendarName = 'kodex',
  calendarColor = '#1a73e8'
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
        {/* Top Right Action Icons: większe ikonki w-5 h-5 */}
        <div className="flex items-center justify-end space-x-1.5 text-[#c4c7c5]">
          <button
            onClick={() => {
              onClose();
              onEdit(event);
            }}
            className="p-2 hover:bg-[#35373a] hover:text-white rounded-full transition"
            title="Edytuj wydarzenie"
          >
            {/* Ołówek edycji ze zdjęcia Image 2 */}
            <svg className="w-5 h-5 text-[#c4c7c5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          <button
            onClick={handleDelete}
            className="p-2 hover:bg-[#35373a] hover:text-[#f28b82] rounded-full transition"
            title="Usuń wydarzenie"
          >
            {/* Kosz ze zdjęcia Image 1 */}
            <svg className="w-5 h-5 text-[#c4c7c5] hover:text-[#f28b82] transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
          </button>

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
            <Mail className="w-5 h-5 text-[#c4c7c5]" />
          </button>

          <button
            onClick={() => alert('Więcej opcji')}
            className="p-2 hover:bg-[#35373a] hover:text-white rounded-full transition"
            title="Opcje"
          >
            <MoreVertical className="w-5 h-5 text-[#c4c7c5]" />
          </button>

          <button
            onClick={onClose}
            className="p-2 hover:bg-[#35373a] hover:text-white rounded-full transition ml-1"
            title="Zamknij"
          >
            <X className="w-5 h-5 text-[#c4c7c5]" />
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

        {/* Zaproś przez link button */}
        <div className="pl-7">
          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-2.5 px-4 py-2 rounded-full border border-[#5f6368] hover:bg-[#282a2d] text-xs font-medium text-[#e3e3e3] transition"
          >
            <LinkIcon className="w-4 h-4 text-[#c4c7c5]" />
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
