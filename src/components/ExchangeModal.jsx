import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowLeftRight, 
  Check, 
  Calendar, 
  User, 
  Sparkles,
  Clock,
  Copy,
  CheckCheck,
  Lock,
  Share2,
  Users
} from 'lucide-react';

export default function ExchangeModal({
  isOpen,
  onClose,
  myEvents = [],
  exchangeableEvents = [],
  onDirectSwap,
  roomCode = 'kodex',
  roomPin = '1234',
  participants = ['Kodex'],
  onUpdatePin,
  currentUserRole = 'Kodex'
}) {
  const [selectedMyEventId, setSelectedMyEventId] = useState('');
  const [selectedTargetEventId, setSelectedTargetEventId] = useState('');
  const [swapped, setSwapped] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [pinInput, setPinInput] = useState(roomPin);
  const [pinSaved, setPinSaved] = useState(false);

  useEffect(() => {
    setPinInput(roomPin);
  }, [roomPin]);

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

  // Generuj link do udostępnienia dla kolegi
  const shareableUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomCode)}&pin=${encodeURIComponent(roomPin)}`
    : `https://kalendarz.pl/?room=${roomCode}&pin=${roomPin}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSavePin = () => {
    if (onUpdatePin && pinInput.trim()) {
      onUpdatePin(pinInput.trim());
      setPinSaved(true);
      setTimeout(() => setPinSaved(false), 2000);
    }
  };

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
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-[#1e1f20] text-[#e3e3e3] rounded-[28px] shadow-2xl w-full max-w-[640px] overflow-hidden border border-[#3c4043] animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#303134] flex items-center justify-between bg-[#1e1f20]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#8ab4f8]/15 text-[#8ab4f8] flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-normal text-[#e3e3e3] tracking-wide">
                Wymiana terminów i udostępnianie kalendarza
              </h2>
              <p className="text-xs text-[#9aa0a6]">
                Wyślij koledze link z PIN-em, aby widział Twój kalendarz i mógł wymieniać terminy na żywo
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* 1. SEKCJA: Link i PIN dla kolegi z innego komputera */}
          <div className="bg-[#131314] p-4 rounded-2xl border border-[#303134] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8ab4f8] flex items-center space-x-1.5">
                <Share2 className="w-4 h-4" />
                <span>Link do wspólnego kalendarza dla kolegi:</span>
              </span>
              <div className="flex items-center space-x-1.5 text-[11px] text-[#81c995] bg-[#81c995]/10 px-2.5 py-0.5 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#81c995] animate-pulse" />
                <span>Firebase Live Sync</span>
              </div>
            </div>

            {/* Link box z przyciskiem kopiowania */}
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-[#282a2d] rounded-xl px-3 py-2 text-xs font-mono text-[#c4c7c5] truncate border border-[#444746]">
                {shareableUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2 bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#041e49] font-medium text-xs rounded-xl transition flex items-center space-x-1.5 shrink-0 active:scale-95"
              >
                {copiedLink ? (
                  <>
                    <CheckCheck className="w-4 h-4" />
                    <span>Skopiowano!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Kopiuj link</span>
                  </>
                )}
              </button>
            </div>

            {/* PIN i połączone osoby */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-center space-x-2 bg-[#282a2d] px-3 py-2 rounded-xl border border-[#444746]">
                <Lock className="w-4 h-4 text-[#fdd663] shrink-0" />
                <span className="text-xs text-[#9aa0a6] shrink-0">PIN dostępu:</span>
                <input
                  type="text"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-16 bg-[#1e1f20] text-center font-mono font-bold text-sm text-[#e3e3e3] rounded-lg px-1.5 py-0.5 border border-[#5f6368] focus:border-[#8ab4f8] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSavePin}
                  className="text-[11px] text-[#8ab4f8] hover:underline shrink-0 font-medium ml-auto"
                >
                  {pinSaved ? 'Zapisano ✓' : 'Zmień PIN'}
                </button>
              </div>

              <div className="flex items-center space-x-2 bg-[#282a2d] px-3 py-2 rounded-xl border border-[#444746] text-xs">
                <Users className="w-4 h-4 text-[#81c995] shrink-0" />
                <span className="text-[#9aa0a6]">Osoby:</span>
                <span className="font-semibold text-white truncate">
                  {participants.join(', ')}
                </span>
              </div>
            </div>
          </div>

          {/* 2. SEKCJA: Prosta wymiana terminów 1:1 */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-[#c4c7c5] flex items-center space-x-1.5">
              <ArrowLeftRight className="w-4 h-4 text-[#fdd663]" />
              <span>Wybierz terminy do natychmiastowej zamiany miejscami:</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center relative">
              {/* Twój termin */}
              <div className="bg-[#131314] p-3.5 rounded-2xl border border-[#303134] space-y-2.5">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#8ab4f8]">
                  <User className="w-3.5 h-3.5" />
                  <span>Twój termin ({currentUserRole}):</span>
                </div>

                {myEvents.length === 0 ? (
                  <p className="text-xs text-[#9aa0a6]">Brak terminów w kalendarzu.</p>
                ) : (
                  <select
                    value={selectedMyEventId || (myEvent ? myEvent.id : '')}
                    onChange={(e) => setSelectedMyEventId(e.target.value)}
                    className="w-full bg-[#282a2d] text-[#e3e3e3] text-sm font-medium rounded-xl p-2 border border-[#444746] focus:border-[#8ab4f8] focus:outline-none"
                  >
                    {myEvents.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({ev.date})
                      </option>
                    ))}
                  </select>
                )}

                {myEvent && (
                  <div className="text-xs text-[#c4c7c5] space-y-1 bg-[#1e1f20] p-2 rounded-xl border border-white/5">
                    <div className="font-semibold text-white flex items-center space-x-1.5">
                      <span 
                        className="w-2.5 h-2.5 rounded-full inline-block shrink-0" 
                        style={{ backgroundColor: myEvent.customBg || '#1a73e8' }} 
                      />
                      <span className="truncate">{myEvent.title}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[#9aa0a6] text-[11px]">
                      <Calendar className="w-3 h-3" />
                      <span>{myEvent.date}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{myEvent.startTime || '10:00'}–{myEvent.endTime || '11:00'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Ikona w środku */}
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#282a2d] border border-[#444746] items-center justify-center text-[#fdd663] shadow-md">
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </div>

              {/* Termin kolegi */}
              <div className="bg-[#131314] p-3.5 rounded-2xl border border-[#303134] space-y-2.5">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#fdd663]">
                  <User className="w-3.5 h-3.5" />
                  <span>Termin kolegi (z kalendarza):</span>
                </div>

                {exchangeableEvents.length === 0 ? (
                  <p className="text-xs text-[#9aa0a6]">Brak terminów u kolegi.</p>
                ) : (
                  <select
                    value={selectedTargetEventId || (targetEvent ? targetEvent.id : '')}
                    onChange={(e) => setSelectedTargetEventId(e.target.value)}
                    className="w-full bg-[#282a2d] text-[#e3e3e3] text-sm font-medium rounded-xl p-2 border border-[#444746] focus:border-[#fdd663] focus:outline-none"
                  >
                    {exchangeableEvents.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({ev.date})
                      </option>
                    ))}
                  </select>
                )}

                {targetEvent && (
                  <div className="text-xs text-[#c4c7c5] space-y-1 bg-[#1e1f20] p-2 rounded-xl border border-white/5">
                    <div className="font-semibold text-white flex items-center space-x-1.5">
                      <span 
                        className="w-2.5 h-2.5 rounded-full inline-block shrink-0" 
                        style={{ backgroundColor: targetEvent.customBg || '#f6bf26' }} 
                      />
                      <span className="truncate">{targetEvent.title}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[#9aa0a6] text-[11px]">
                      <Calendar className="w-3 h-3" />
                      <span>{targetEvent.date}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{targetEvent.startTime || '12:00'}–{targetEvent.endTime || '13:00'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Podgląd po wymianie */}
          {myEvent && targetEvent && (
            <div className="bg-[#282a2d]/70 border border-[#3c4043] rounded-2xl p-3.5 text-xs text-[#c4c7c5] space-y-1">
              <div className="flex items-center space-x-1.5 text-[#81c995] font-semibold text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Efekt zamiany na obu komputerach:</span>
              </div>
              <p>
                • <strong>{myEvent.title}</strong> trafi na: <span className="text-white font-medium">{targetEvent.date} ({targetEvent.startTime}–{targetEvent.endTime})</span>
              </p>
              <p>
                • <strong>{targetEvent.title}</strong> trafi na: <span className="text-white font-medium">{myEvent.date} ({myEvent.startTime}–{myEvent.endTime})</span>
              </p>
            </div>
          )}

          {/* Przyciski na dole */}
          <div className="flex items-center justify-end space-x-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-[#c4c7c5] hover:bg-[#282a2d] hover:text-white rounded-full transition"
            >
              Zamknij
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
                  <span>Terminy zamienione w Firebase!</span>
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
