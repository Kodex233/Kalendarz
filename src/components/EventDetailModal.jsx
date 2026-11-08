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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-[#282a2d] text-[#e3e3e3] rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden border-0 ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-150 p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Right Action Icons matching image 5 */}
        <div className="flex items-center justify-end space-x-1 text-[#9aa0a6]">
          <button
            onClick={() => {
              onClose();
              onEdit(event);
            }}
            className="p-1.5 hover:bg-[#35373a] hover:text-[#e3e3e3] rounded-full transition"
            title="Edytuj wydarzenie"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onDelete(event.id);
              onClose();
            }}
            className="p-1.5 hover:bg-[#35373a] hover:text-[#f28b82] rounded-full transition"
            title="Usuń wydarzenie"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (event.invitedEmail) {
                window.location.href = `mailto:${event.invitedEmail}`;
              } else {
                alert('Brak zaproszonych gości do wysłania e-maila');
              }
            }}
            className="p-1.5 hover:bg-[#35373a] hover:text-[#e3e3e3] rounded-full transition"
            title="Wyślij e-mail do gości"
          >
            <Mail className="w-4 h-4" />
          </button>

          <button
            onClick={() => alert('Więcej opcji')}
            className="p-1.5 hover:bg-[#35373a] hover:text-[#e3e3e3] rounded-full transition"
            title="Opcje"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#35373a] hover:text-[#e3e3e3] rounded-full transition ml-1"
            title="Zamknij"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title with colored square matching image 5 */}
        <div className="flex items-start space-x-3 pt-1">
          <span 
            className="w-4 h-4 rounded-[4px] mt-1 shrink-0" 
            style={{ backgroundColor: event.customBg || calendarColor }}
          />
          <div>
            <h2 className="text-xl font-normal text-[#e3e3e3] tracking-wide leading-tight">
              {event.title || '(Bez tytułu)'}
            </h2>
            <p className="text-xs text-[#9aa0a6] mt-1 capitalize">
              {formattedDate} • {event.startTime || '12:00'}–{event.endTime || '1:00pm'}
            </p>
          </div>
        </div>

        {/* Zaproś przez link button matching image 5 */}
        <div className="pl-7">
          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-2 px-4 py-1.5 rounded-full border border-[#5f6368] hover:bg-[#35373a] text-xs font-medium text-[#e3e3e3] transition"
          >
            <LinkIcon className="w-3.5 h-3.5 text-[#9aa0a6]" />
            <span>Zaproś przez link</span>
          </button>
        </div>

        {/* 30 minut wcześniej notification row */}
        <div className="flex items-center space-x-3 text-xs text-[#c4c7c5] pl-1">
          <Bell className="w-4 h-4 text-[#9aa0a6] shrink-0" />
          <span>30 minut wcześniej</span>
        </div>

        {/* Calendar row */}
        <div className="flex items-center space-x-3 text-xs text-[#c4c7c5] pl-1">
          <CalendarIcon className="w-4 h-4 text-[#9aa0a6] shrink-0" />
          <span>{calendarName}</span>
        </div>
      </div>
    </div>
  );
}
