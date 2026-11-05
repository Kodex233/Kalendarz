import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Clock, 
  Calendar as CalIcon, 
  FileText, 
  Tag, 
  ArrowLeftRight, 
  Mail,
  Check
} from 'lucide-react';

const COLORS = [
  { id: 'blue', label: 'Błękitny', bg: 'bg-[#8ab4f8]' },
  { id: 'green', label: 'Szmaragdowy', bg: 'bg-[#81c995]' },
  { id: 'purple', label: 'Fioletowy', bg: 'bg-[#c58af9]' },
  { id: 'red', label: 'Koralowy', bg: 'bg-[#f28b82]' },
  { id: 'yellow', label: 'Bursztynowy', bg: 'bg-[#fdd663]' },
  { id: 'gray', label: 'Grafitowy', bg: 'bg-[#9aa0a6]' },
];

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  currentUserId,
  onOpenExchangeForEvent,
  eventType = 'Wydarzenie'
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [color, setColor] = useState('blue');
  const [description, setDescription] = useState('');
  const [isExchangeable, setIsExchangeable] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDate(initialData.date || '');
      setStartTime(initialData.startTime || '10:00');
      setEndTime(initialData.endTime || '11:00');
      setColor(initialData.color || 'blue');
      setDescription(initialData.description || '');
      setIsExchangeable(initialData.isExchangeable || false);
      setInvitedEmail(initialData.invitedEmail || '');
    } else {
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setStartTime('10:00');
      setEndTime('11:00');
      setColor('blue');
      setDescription('');
      setIsExchangeable(false);
      setInvitedEmail('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isOwner = !initialData || initialData.userId === currentUserId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onSave({
        title,
        date,
        startTime,
        endTime,
        color,
        description,
        isExchangeable,
        invitedEmail,
        type: eventType
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Błąd podczas zapisywania');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#282a2d] text-[#e3e3e3] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#3c4043] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#202124] border-b border-[#3c4043]">
          <h3 className="text-lg font-semibold text-[#e3e3e3]">
            {initialData ? (isOwner ? `Edytuj: ${initialData.type || 'termin'}` : 'Szczegóły terminu') : `Nowe: ${eventType}`}
          </h3>
          <div className="flex items-center space-x-2">
            {initialData && isOwner && (
              <button
                type="button"
                onClick={() => onDelete(initialData.id)}
                className="p-2 text-[#9aa0a6] hover:text-[#f28b82] hover:bg-[#35373a] rounded-full transition"
                title="Usuń termin"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-[#9aa0a6] hover:bg-[#35373a] hover:text-[#e3e3e3] rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <input
              type="text"
              placeholder={eventType === 'Zadanie' ? "Dodaj tytuł zadania..." : "Dodaj tytuł wydarzenia..."}
              value={title}
              disabled={!isOwner}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full text-xl font-medium bg-transparent border-b border-[#5f6368] pb-2 text-[#e3e3e3] focus:border-[#8ab4f8] focus:outline-none transition placeholder-[#9aa0a6]"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#9aa0a6] mb-1 flex items-center space-x-1">
                <CalIcon className="w-3.5 h-3.5 text-[#8ab4f8]" />
                <span>Data</span>
              </label>
              <input
                type="date"
                value={date}
                disabled={!isOwner}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-[#1f1f1f] border border-[#5f6368] rounded-lg p-2 text-sm text-[#e3e3e3] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#9aa0a6] mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-[#8ab4f8]" />
                <span>Od godziny</span>
              </label>
              <input
                type="time"
                value={startTime}
                disabled={!isOwner}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-[#1f1f1f] border border-[#5f6368] rounded-lg p-2 text-sm text-[#e3e3e3] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#9aa0a6] mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-[#8ab4f8]" />
                <span>Do godziny</span>
              </label>
              <input
                type="time"
                value={endTime}
                disabled={!isOwner}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-[#1f1f1f] border border-[#5f6368] rounded-lg p-2 text-sm text-[#e3e3e3] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
              />
            </div>
          </div>

          {/* Exchangeable Switch */}
          <div className="p-4 bg-[#332a15] border border-[#fdd663]/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ArrowLeftRight className="w-4 h-4 text-[#fdd663]" />
                <span className="text-sm font-semibold text-[#feefc3]">
                  Udostępnij na wymianę ze znajomym
                </span>
              </div>
              <input
                type="checkbox"
                id="exchangeCheck"
                checked={isExchangeable}
                disabled={!isOwner}
                onChange={(e) => setIsExchangeable(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded bg-[#1f1f1f] border-[#5f6368] focus:ring-[#fdd663]"
              />
            </div>
            <p className="text-xs text-[#fdd663]/80">
              Gdy ta opcja jest zaznaczona, Twoi koledzy mogą zaproponować zamianę swojego terminu na ten slot!
            </p>
          </div>

          {/* If looking at someone else's exchangeable event */}
          {initialData && !isOwner && initialData.isExchangeable && (
            <div className="p-4 bg-[#1b3a57] border border-[#8ab4f8]/30 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#c2e7ff]">Ten termin jest dostępny na wymianę!</p>
                <p className="text-[11px] text-[#8ab4f8]">Właściciel: {initialData.userName || initialData.userEmail}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenExchangeForEvent(initialData);
                }}
                className="px-3.5 py-1.5 bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#1f1f1f] rounded-lg text-xs font-bold shadow-xs"
              >
                Zaproponuj wymianę
              </button>
            </div>
          )}

          {/* Friend Invitation Email */}
          <div>
            <label className="block text-xs font-semibold text-[#9aa0a6] mb-1 flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-[#9aa0a6]" />
              <span>Zaproś znajomego (opcjonalnie e-mail)</span>
            </label>
            <input
              type="email"
              placeholder="np. kolega@gmail.com"
              value={invitedEmail}
              disabled={!isOwner}
              onChange={(e) => setInvitedEmail(e.target.value)}
              className="w-full bg-[#1f1f1f] border border-[#5f6368] rounded-lg p-2 text-sm text-[#e3e3e3] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
            />
          </div>

          {/* Color selector */}
          <div>
            <label className="block text-xs font-semibold text-[#9aa0a6] mb-2 flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 text-[#9aa0a6]" />
              <span>Kolor etykiety</span>
            </label>
            <div className="flex items-center space-x-3">
              {COLORS.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  disabled={!isOwner}
                  onClick={() => setColor(col.id)}
                  className={`w-7 h-7 rounded-full ${col.bg} flex items-center justify-center transition-transform ${
                    color === col.id ? 'scale-115 ring-2 ring-offset-2 ring-offset-[#282a2d] ring-white' : 'hover:scale-105'
                  }`}
                  title={col.label}
                >
                  {color === col.id && <Check className="w-4 h-4 text-[#1f1f1f] stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#9aa0a6] mb-1 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-[#9aa0a6]" />
              <span>Opis lub notatki</span>
            </label>
            <textarea
              rows={2}
              placeholder="Dodaj szczegóły spotkania lub wymiany..."
              value={description}
              disabled={!isOwner}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1f1f1f] border border-[#5f6368] rounded-lg p-2 text-sm text-[#e3e3e3] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#3c4043]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#5f6368] text-[#e3e3e3] hover:bg-[#35373a] rounded-lg text-sm font-medium transition"
            >
              Anuluj
            </button>
            {isOwner && (
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#1f1f1f] rounded-lg text-sm font-bold transition shadow-sm disabled:opacity-50"
              >
                {loading ? 'Zapisywanie...' : 'Zapisz'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
