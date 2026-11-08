import React, { useState, useEffect } from 'react';

/**
 * Generuje 4-cyfrowy kod PIN na podstawie bieżącego interwału 15-minutowego
 */
export function generate15MinPin(roomCode = 'kodex') {
  const intervalIndex = Math.floor(Date.now() / (15 * 60 * 1000));
  let hash = 0;
  const str = `${roomCode}_${intervalIndex}_kalendarz`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const positive = Math.abs(hash);
  const pinNum = 1000 + (positive % 9000);
  return String(pinNum);
}

/**
 * Oblicza ile sekund zostało do końca bieżącego 15-minutowego okna
 */
export function getRemainingSecondsIn15Min() {
  const now = Date.now();
  const nextInterval = (Math.floor(now / (15 * 60 * 1000)) + 1) * 15 * 60 * 1000;
  return Math.max(0, Math.floor((nextInterval - now) / 1000));
}

export default function InvitePopover({
  isOpen,
  onClose,
  roomCode = 'kodex',
  currentPin,
  onUpdatePin,
  participants = ['Kodex'],
  currentUser = 'Kodex',
  myEvents = [],
  exchangeableEvents = [],
  onDirectSwap
}) {
  const [copied, setCopied] = useState(false);
  const [remainingSecs, setRemainingSecs] = useState(getRemainingSecondsIn15Min());
  const [activeTab, setActiveTab] = useState('invite'); // 'invite' | 'swap'
  const [selectedMyEventId, setSelectedMyEventId] = useState('');
  const [selectedTargetEventId, setSelectedTargetEventId] = useState('');
  const [swapDone, setSwapDone] = useState(false);

  // Odliczanie czasu ważności PIN-u (15 minut)
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      const left = getRemainingSecondsIn15Min();
      setRemainingSecs(left);
      if (left === 0 && onUpdatePin) {
        const newPin = generate15MinPin(roomCode);
        onUpdatePin(newPin);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, roomCode, onUpdatePin]);

  if (!isOpen) return null;

  const minutes = Math.floor(remainingSecs / 60);
  const seconds = remainingSecs % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const pinToDisplay = currentPin || generate15MinPin(roomCode);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomCode)}&pin=${encodeURIComponent(pinToDisplay)}`
    : `https://kalendarz.pl/?room=${roomCode}&pin=${pinToDisplay}`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleManualRegeneratePin = () => {
    // Losowy nowy 4-cyfrowy PIN
    const randomPin = String(Math.floor(1000 + Math.random() * 9000));
    if (onUpdatePin) onUpdatePin(randomPin);
  };

  // Tylko realnie dołączeni znajomi (bez gospodarza)
  const connectedFriends = participants.filter(p => p !== currentUser && p !== 'Kodex');

  const myEvent = myEvents.find(e => e.id === selectedMyEventId) || myEvents[0];
  const targetEvent = exchangeableEvents.find(e => e.id === selectedTargetEventId) || exchangeableEvents[0];

  const handleExecuteSwap = () => {
    if (!myEvent || !targetEvent || !onDirectSwap) return;
    onDirectSwap(myEvent.id, targetEvent.id);
    setSwapDone(true);
    setTimeout(() => {
      setSwapDone(false);
      onClose();
    }, 1200);
  };

  return (
    <div 
      className="absolute right-0 top-full mt-2 w-[390px] bg-[#1e1f20] text-[#e3e3e3] border border-[#3c4043] rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Nagłówek w stylu Google */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-[#303134] bg-[#202124]">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
            {/* Google Material Person Add Icon */}
            <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
              <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-white tracking-wide">
              Zaproś do kalendarza
            </h3>
            <p className="text-[11px] text-[#9aa0a6]">
              Współdzielenie i wymiana na żywo
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-[#9aa0a6] hover:text-white hover:bg-[#35373a] rounded-full transition"
          title="Zamknij"
        >
          {/* Google Material Close Icon */}
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>

      {/* Zakładki: Zaproszenie / Szybka wymiana */}
      <div className="flex border-b border-[#303134] text-xs font-medium bg-[#1e1f20]">
        <button
          onClick={() => setActiveTab('invite')}
          className={`flex-1 py-2.5 text-center transition border-b-2 flex items-center justify-center space-x-1.5 ${
            activeTab === 'invite' 
              ? 'border-[#8ab4f8] text-[#8ab4f8]' 
              : 'border-transparent text-[#9aa0a6] hover:text-[#e3e3e3]'
          }`}
        >
          {/* Google Link Icon */}
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
          </svg>
          <span>Link i PIN</span>
        </button>
        <button
          onClick={() => setActiveTab('swap')}
          className={`flex-1 py-2.5 text-center transition border-b-2 flex items-center justify-center space-x-1.5 ${
            activeTab === 'swap' 
              ? 'border-[#8ab4f8] text-[#8ab4f8]' 
              : 'border-transparent text-[#9aa0a6] hover:text-[#e3e3e3]'
          }`}
        >
          {/* Google Swap Icon */}
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
          </svg>
          <span>Wymiana terminów</span>
        </button>
      </div>

      {activeTab === 'invite' ? (
        <div className="p-5 space-y-4">
          {/* 1. Link z przyciskiem Kopiuj */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[#c4c7c5] flex items-center justify-between">
              <span>Link dla znajomego:</span>
              <span className="text-[10px] text-[#81c995] font-normal flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#81c995] animate-pulse inline-block" />
                <span>Na żywo (Firebase)</span>
              </span>
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-[#131314] text-[#c4c7c5] text-xs font-mono px-3 py-2 rounded-xl border border-[#444746] focus:outline-none truncate select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2 bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#041e49] text-xs font-semibold rounded-xl transition flex items-center space-x-1.5 shrink-0 active:scale-95 shadow-sm"
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    <span>Skopiowano!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                    </svg>
                    <span>Kopiuj</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 2. PIN generowany co 15 minut z zegarem */}
          <div className="bg-[#131314] p-3.5 rounded-2xl border border-[#303134] flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5 text-[11px] text-[#9aa0a6]">
                {/* Google Material Lock Icon */}
                <svg className="w-3.5 h-3.5 fill-current text-[#fdd663]" viewBox="0 0 24 24">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                </svg>
                <span>Kod PIN:</span>
              </div>
              <div className="text-xl font-mono font-bold tracking-widest text-white">
                {pinToDisplay}
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="flex items-center justify-end space-x-1 text-[11px] text-[#9aa0a6]">
                {/* Google Schedule/Timer Icon */}
                <svg className="w-3.5 h-3.5 fill-current text-[#8ab4f8]" viewBox="0 0 24 24">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                </svg>
                <span>Ważny jeszcze:</span>
                <span className="font-mono text-white font-semibold">{timeFormatted}</span>
              </div>
              <button
                type="button"
                onClick={handleManualRegeneratePin}
                className="text-[11px] text-[#8ab4f8] hover:underline flex items-center justify-end space-x-1 ml-auto"
                title="Wygeneruj nowy PIN natychmiast"
              >
                {/* Google Refresh Icon */}
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                </svg>
                <span>Nowy PIN</span>
              </button>
            </div>
          </div>

          {/* 3. Połączone osoby – tylko realne! */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-medium text-[#9aa0a6] flex items-center space-x-1.5">
              {/* Google Group Icon */}
              <svg className="w-3.5 h-3.5 fill-current text-[#c4c7c5]" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
              <span>Uczestnicy kalendarza:</span>
            </span>

            <div className="bg-[#131314] rounded-2xl p-3 border border-[#303134] space-y-2 text-xs">
              {/* Gospodarz */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-[#1a73e8] text-white flex items-center justify-center text-[10px] font-bold">
                    K
                  </div>
                  <span className="text-white font-medium">{currentUser} (Ty)</span>
                </div>
                <span className="text-[10px] text-[#8ab4f8] bg-[#8ab4f8]/10 px-2 py-0.5 rounded-full font-medium">
                  Gospodarz
                </span>
              </div>

              {/* Dołączeni znajomi w czasie rzeczywistym */}
              {connectedFriends.length > 0 ? (
                connectedFriends.map((friendName, idx) => (
                  <div key={idx} className="flex items-center justify-between pt-1 border-t border-[#282a2d]">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-full bg-[#f6bf26] text-black flex items-center justify-center text-[10px] font-bold">
                        {friendName[0]?.toUpperCase() || 'Z'}
                      </div>
                      <span className="text-white font-medium">{friendName}</span>
                    </div>
                    <span className="text-[10px] text-[#81c995] bg-[#81c995]/10 px-2 py-0.5 rounded-full font-medium flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#81c995] inline-block" />
                      <span>Połączony</span>
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-center space-x-2 text-[11px] text-[#9aa0a6] pt-1 border-t border-[#282a2d]">
                  <span className="w-2 h-2 rounded-full bg-[#fdd663] animate-pulse shrink-0" />
                  <span>Oczekiwanie na dołączenie znajomego przez link...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Zakładka 2: Wymiana terminów */
        <div className="p-5 space-y-3.5">
          <p className="text-xs text-[#9aa0a6] leading-relaxed">
            Wybierz swój termin i termin znajomego, aby zamienić się godzinami na obu ekranach:
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-[#8ab4f8] font-medium mb-1">
                Twój termin:
              </label>
              <select
                value={selectedMyEventId || (myEvent ? myEvent.id : '')}
                onChange={(e) => setSelectedMyEventId(e.target.value)}
                className="w-full bg-[#131314] text-[#e3e3e3] text-xs font-medium rounded-xl p-2.5 border border-[#444746] focus:border-[#8ab4f8] focus:outline-none"
              >
                {myEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.date} {ev.startTime || ''})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[#fdd663] font-medium mb-1">
                Termin znajomego:
              </label>
              <select
                value={selectedTargetEventId || (targetEvent ? targetEvent.id : '')}
                onChange={(e) => setSelectedTargetEventId(e.target.value)}
                className="w-full bg-[#131314] text-[#e3e3e3] text-xs font-medium rounded-xl p-2.5 border border-[#444746] focus:border-[#fdd663] focus:outline-none"
              >
                {exchangeableEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.date} {ev.startTime || ''})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExecuteSwap}
            disabled={!myEvent || !targetEvent || swapDone}
            className={`w-full py-2.5 text-xs font-semibold rounded-xl transition shadow-md flex items-center justify-center space-x-1.5 active:scale-95 ${
              swapDone
                ? 'bg-[#81c995] text-[#041e49]'
                : 'bg-[#a8c7fa] hover:bg-[#b8d4ff] text-[#062e6f]'
            }`}
          >
            {swapDone ? (
              <>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                <span>Terminy zamienione w Firebase!</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
                </svg>
                <span>Zamień te terminy</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
