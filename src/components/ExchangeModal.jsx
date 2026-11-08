import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowLeftRight, 
  Check, 
  Calendar, 
  User, 
  Sparkles,
  Clock
} from 'lucide-react';

export default function ExchangeModal({
  isOpen,
  onClose,
  myEvents = [],
  exchangeableEvents = [],
  onDirectSwap,
  user
}) {
  const [selectedMyEventId, setSelectedMyEventId] = useState('');
  const [selectedTargetEventId, setSelectedTargetEventId] = useState('');
  const [swapped, setSwapped] = useState(false);

  // Domyślny wybór pierwszych dostępnych wydarzeń
  useEffect(() => {
    if (isOpen) {
      setSwapped(false);
      if (myEvents.length > 0 && !selectedMyEventId) {
        setSelectedMyEventId(myEvents[0].id);
      }
      if (exchangeableEvents.length > 0 && !selectedTargetEventId) {
        setSelectedTargetEventId(exchangeableEvents[0].id);
      }
    }
  }, [isOpen, myEvents, exchangeableEvents]);

  if (!isOpen) return null;

  const myEvent = myEvents.find(e => e.id === selectedMyEventId) || myEvents[0];
  const targetEvent = exchangeableEvents.find(e => e.id === selectedTargetEventId) || exchangeableEvents[0];

  const handleSwap = () => {
    if (!myEvent || !targetEvent) {
      alert('Wybierz oba terminy do zamiany.');
      return;
    }

    onDirectSwap(myEvent.id, targetEvent.id);
    setSwapped(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-[#1e1f20] text-[#e3e3e3] rounded-[28px] shadow-2xl w-full max-w-[620px] overflow-hidden border border-[#3c4043] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#303134] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#8ab4f8]/15 text-[#8ab4f8] flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-normal text-[#e3e3e3] tracking-wide">
                Wymiana terminów z kolegą
              </h2>
              <p className="text-xs text-[#9aa0a6] mt-0.5">
                Wybierz swój termin i termin kolegi, aby natychmiast zamienić się godzinami
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#9aa0a6] hover:bg-[#282a2d] hover:text-[#e3e3e3] rounded-full transition"
            title="Zamknij"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: Prosty wybór 1:1 */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center relative">
            {/* 1. Twój termin */}
            <div className="bg-[#131314] p-4 rounded-2xl border border-[#303134] space-y-3">
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#8ab4f8]">
                <User className="w-4 h-4" />
                <span>Twój termin (Kodex):</span>
              </div>

              {myEvents.length === 0 ? (
                <p className="text-xs text-[#9aa0a6]">Brak terminów w Twoim kalendarzu.</p>
              ) : (
                <select
                  value={selectedMyEventId || (myEvent ? myEvent.id : '')}
                  onChange={(e) => setSelectedMyEventId(e.target.value)}
                  className="w-full bg-[#282a2d] text-[#e3e3e3] text-sm font-medium rounded-xl p-2.5 border border-[#444746] focus:border-[#8ab4f8] focus:outline-none"
                >
                  {myEvents.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              )}

              {myEvent && (
                <div className="pt-1 text-xs text-[#c4c7c5] space-y-1 bg-[#1e1f20] p-2.5 rounded-xl border border-white/5">
                  <div className="font-semibold text-white flex items-center space-x-1.5">
                    <span 
                      className="w-2.5 h-2.5 rounded-full inline-block" 
                      style={{ backgroundColor: myEvent.customBg || '#1a73e8' }} 
                    />
                    <span className="truncate">{myEvent.title}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[#9aa0a6]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{myEvent.date}</span>
                    <span>•</span>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{myEvent.startTime || '10:00'}–{myEvent.endTime || '11:00'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Ikona wymiany w środku */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-[#282a2d] border border-[#444746] items-center justify-center text-[#fdd663] shadow-md">
              <ArrowLeftRight className="w-4 h-4" />
            </div>

            {/* 2. Termin kolegi */}
            <div className="bg-[#131314] p-4 rounded-2xl border border-[#303134] space-y-3">
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#fdd663]">
                <User className="w-4 h-4" />
                <span>Termin kolegi (Janek):</span>
              </div>

              {exchangeableEvents.length === 0 ? (
                <p className="text-xs text-[#9aa0a6]">Brak terminów u kolegi.</p>
              ) : (
                <select
                  value={selectedTargetEventId || (targetEvent ? targetEvent.id : '')}
                  onChange={(e) => setSelectedTargetEventId(e.target.value)}
                  className="w-full bg-[#282a2d] text-[#e3e3e3] text-sm font-medium rounded-xl p-2.5 border border-[#444746] focus:border-[#fdd663] focus:outline-none"
                >
                  {exchangeableEvents.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              )}

              {targetEvent && (
                <div className="pt-1 text-xs text-[#c4c7c5] space-y-1 bg-[#1e1f20] p-2.5 rounded-xl border border-white/5">
                  <div className="font-semibold text-white flex items-center space-x-1.5">
                    <span 
                      className="w-2.5 h-2.5 rounded-full inline-block" 
                      style={{ backgroundColor: targetEvent.customBg || '#f6bf26' }} 
                    />
                    <span className="truncate">{targetEvent.title}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[#9aa0a6]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{targetEvent.date}</span>
                    <span>•</span>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{targetEvent.startTime || '12:00'}–{targetEvent.endTime || '13:00'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Podgląd po wymianie */}
          {myEvent && targetEvent && (
            <div className="bg-[#282a2d]/70 border border-[#3c4043] rounded-2xl p-4 text-xs text-[#c4c7c5] space-y-1.5">
              <div className="flex items-center space-x-1.5 text-[#81c995] font-semibold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Podgląd po wymianie:</span>
              </div>
              <p>
                • <strong>{myEvent.title}</strong> przejdzie na:{' '}
                <span className="text-white font-medium">{targetEvent.date} ({targetEvent.startTime}–{targetEvent.endTime})</span>
              </p>
              <p>
                • <strong>{targetEvent.title}</strong> przejdzie na:{' '}
                <span className="text-white font-medium">{myEvent.date} ({myEvent.startTime}–{myEvent.endTime})</span>
              </p>
            </div>
          )}

          {/* Przycisk akcji */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-[#c4c7c5] hover:bg-[#282a2d] hover:text-white rounded-full transition"
            >
              Anuluj
            </button>
            <button
              type="button"
              onClick={handleSwap}
              disabled={!myEvent || !targetEvent || swapped}
              className={`px-6 py-2.5 text-sm font-semibold rounded-full transition shadow-md flex items-center space-x-2 ${
                swapped 
                  ? 'bg-[#81c995] text-[#062e6f]' 
                  : 'bg-[#a8c7fa] hover:bg-[#b8d4ff] text-[#062e6f] active:scale-95'
              }`}
            >
              {swapped ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Terminy zamienione!</span>
                </>
              ) : (
                <>
                  <ArrowLeftRight className="w-4 h-4 stroke-[2.5]" />
                  <span>Wymień terminy teraz</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
