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
  { id: 'blue', label: 'Błękitny', bg: 'bg-blue-500' },
  { id: 'green', label: 'Szmaragdowy', bg: 'bg-emerald-500' },
  { id: 'purple', label: 'Fioletowy', bg: 'bg-purple-500' },
  { id: 'red', label: 'Koralowy', bg: 'bg-rose-500' },
  { id: 'yellow', label: 'Bursztynowy', bg: 'bg-amber-500' },
  { id: 'gray', label: 'Grafitowy', bg: 'bg-gray-600' },
];

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  currentUserId,
  onOpenExchangeForEvent
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
        invitedEmail
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Błąd podczas zapisywania wydarzenia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {initialData ? (isOwner ? 'Edytuj termin' : 'Szczegóły terminu') : 'Nowy termin'}
          </h3>
          <div className="flex items-center space-x-2">
            {initialData && isOwner && (
              <button
                type="button"
                onClick={() => onDelete(initialData.id)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                title="Usuń termin"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition"
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
              placeholder="Dodaj tytuł lub nazwę wydarzenia..."
              value={title}
              disabled={!isOwner}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full text-xl font-medium border-b border-gray-300 pb-2 focus:border-blue-600 focus:outline-none transition placeholder-gray-400"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center space-x-1">
                <CalIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Data</span>
              </label>
              <input
                type="date"
                value={date}
                disabled={!isOwner}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Od godziny</span>
              </label>
              <input
                type="time"
                value={startTime}
                disabled={!isOwner}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Do godziny</span>
              </label>
              <input
                type="time"
                value={endTime}
                disabled={!isOwner}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Exchangeable Switch */}
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ArrowLeftRight className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-900">
                  Udostępnij na wymianę ze znajomym
                </span>
              </div>
              <input
                type="checkbox"
                id="exchangeCheck"
                checked={isExchangeable}
                disabled={!isOwner}
                onChange={(e) => setIsExchangeable(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
            </div>
            <p className="text-xs text-amber-700">
              Gdy ta opcja jest zaznaczona, Twoi koledzy mogą zaproponować zamianę swojego terminu na ten slot!
            </p>
          </div>

          {/* If looking at someone else's exchangeable event */}
          {initialData && !isOwner && initialData.isExchangeable && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-900">Ten termin jest dostępny na wymianę!</p>
                <p className="text-[11px] text-blue-700">Właściciel: {initialData.userName || initialData.userEmail}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenExchangeForEvent(initialData);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Zaproponuj wymianę
              </button>
            </div>
          )}

          {/* Friend Invitation Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-gray-500" />
              <span>Zaproś znajomego (opcjonalnie e-mail)</span>
            </label>
            <input
              type="email"
              placeholder="np. kolega@gmail.com"
              value={invitedEmail}
              disabled={!isOwner}
              onChange={(e) => setInvitedEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Color selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 text-gray-500" />
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
                    color === col.id ? 'scale-115 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-105'
                  }`}
                  title={col.label}
                >
                  {color === col.id && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-gray-500" />
              <span>Opis lub notatki</span>
            </label>
            <textarea
              rows={2}
              placeholder="Dodaj szczegóły spotkania lub wymiany..."
              value={description}
              disabled={!isOwner}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition"
            >
              Anuluj
            </button>
            {isOwner && (
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50"
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
