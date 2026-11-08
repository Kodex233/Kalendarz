import React, { useState, useEffect, useRef } from 'react';

/**
 * Generuje 4-cyfrowy kod PIN rotowany co 15 minut
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

export function getRemainingSecondsIn15Min() {
  const now = Date.now();
  const nextInterval = (Math.floor(now / (15 * 60 * 1000)) + 1) * 15 * 60 * 1000;
  return Math.max(0, Math.floor((nextInterval - now) / 1000));
}

export default function ShareCalendarModal({
  isOpen,
  onClose,
  calendarName = 'kodex',
  ownerEmail = 'kodex233@gmail.com',
  ownerName = 'kodex (you)',
  roomCode = 'kodex',
  currentPin,
  onUpdatePin,
  participants = [],
  onUpdateParticipants
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [newPersonInput, setNewPersonInput] = useState('');
  const [generalAccess, setGeneralAccess] = useState('restricted'); // 'restricted' | 'pin'
  const [isAccessDropdownOpen, setIsAccessDropdownOpen] = useState(false);
  const [activeRoleDropdownIndex, setActiveRoleDropdownIndex] = useState(null);
  const [remainingSecs, setRemainingSecs] = useState(getRemainingSecondsIn15Min());

  const accessDropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);

  // Odliczanie czasu ważności PIN-u (15 min)
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      const left = getRemainingSecondsIn15Min();
      setRemainingSecs(left);
      if (left === 0 && onUpdatePin) {
        onUpdatePin(generate15MinPin(roomCode));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, roomCode, onUpdatePin]);

  // Obsługa kliknięć poza menu kontekstowe
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accessDropdownRef.current && !accessDropdownRef.current.contains(e.target)) {
        setIsAccessDropdownOpen(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setActiveRoleDropdownIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const minutes = Math.floor(remainingSecs / 60);
  const seconds = remainingSecs % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const pinToDisplay = currentPin || generate15MinPin(roomCode);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomCode)}&pin=${encodeURIComponent(pinToDisplay)}`
    : `https://kalendarz.pl/?room=${roomCode}&pin=${pinToDisplay}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyPin = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pinToDisplay);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  const handleRegeneratePin = () => {
    const randomPin = String(Math.floor(1000 + Math.random() * 9000));
    if (onUpdatePin) onUpdatePin(randomPin);
  };

  // Dodawanie nowej osoby z inputa
  const handleAddPerson = (e) => {
    if (e.key === 'Enter' && newPersonInput.trim()) {
      e.preventDefault();
      const name = newPersonInput.trim();
      const newPerson = {
        name,
        email: name.includes('@') ? name : `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        role: 'Pełny dostęp',
        isOwner: false
      };
      if (onUpdateParticipants) {
        onUpdateParticipants([...participants, newPerson]);
      }
      setNewPersonInput('');
    }
  };

  const handleUpdateRole = (index, newRole) => {
    if (!onUpdateParticipants) return;
    const updated = [...participants];
    if (newRole === 'remove') {
      updated.splice(index, 1);
    } else {
      updated[index] = { ...updated[index], role: newRole };
    }
    onUpdateParticipants(updated);
    setActiveRoleDropdownIndex(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-[#282a2d] text-[#e3e3e3] rounded-[28px] shadow-2xl w-full max-w-[512px] overflow-hidden border border-[#444746] animate-in zoom-in-95 duration-150 p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header z tytułem i przyciskiem zamknięcia X (bez pytajnika i bez zębatki) */}
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-[20px] font-normal text-[#e3e3e3] font-['Google_Sans','Product_Sans',sans-serif]">
            Udostępnij plik „{calendarName}”
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-[#35373a] text-[#c4c7c5] hover:text-white rounded-full transition -mr-1"
            title="Zamknij"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        {/* 2. Pole tekstowe: Dodaj osoby... (Zgodne 1:1 z Image 1) */}
        <div className="mt-1">
          <input
            type="text"
            placeholder="Dodaj osoby, grupy, obszary i wydarzenia w kalendarzu"
            value={newPersonInput}
            onChange={(e) => setNewPersonInput(e.target.value)}
            onKeyDown={handleAddPerson}
            className="w-full bg-transparent border border-[#747775] hover:border-[#c4c7c5] focus:border-[#a8c7fa] focus:ring-1 focus:ring-[#a8c7fa] rounded-md px-4 py-2.5 text-sm text-[#e3e3e3] placeholder-[#9aa0a6] focus:outline-none transition font-normal"
          />
        </div>

        {/* 3. Sekcja: Osoby z dostępem (Image 1) */}
        <div className="mt-5">
          <h3 className="text-sm font-medium text-[#e3e3e3] mb-3">
            Osoby z dostępem
          </h3>

          <div className="space-y-3">
            {/* Właściciel: kodex (you) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-[#e8710a] text-white flex items-center justify-center font-bold text-sm select-none shrink-0">
                  k
                </div>
                <div>
                  <p className="text-sm font-normal text-[#e3e3e3] leading-snug">
                    {ownerName}
                  </p>
                  <p className="text-xs text-[#9aa0a6] leading-snug">
                    {ownerEmail}
                  </p>
                </div>
              </div>

              <span className="text-xs text-[#9aa0a6] font-normal select-none pr-1">
                Właściciel
              </span>
            </div>

            {/* Inne osoby (z możliwością zmiany uprawnień obok osoby!) */}
            {participants.map((person, idx) => (
              <div key={idx} className="flex items-center justify-between relative">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-sm select-none shrink-0">
                    {person.name?.[0]?.toLowerCase() || 'u'}
                  </div>
                  <div>
                    <p className="text-sm font-normal text-[#e3e3e3] leading-snug">
                      {person.name}
                    </p>
                    <p className="text-xs text-[#9aa0a6] leading-snug">
                      {person.email || 'janek@firma.pl'}
                    </p>
                  </div>
                </div>

                {/* Rozwijana lista uprawnień: Przeglądający / Edytor / Pełny dostęp / Usuń */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveRoleDropdownIndex(activeRoleDropdownIndex === idx ? null : idx)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 hover:bg-[#35373a] rounded text-xs font-normal text-[#e3e3e3] transition focus:outline-none"
                  >
                    <span>{person.role || 'Pełny dostęp'}</span>
                    <svg className="w-3.5 h-3.5 text-[#9aa0a6]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </button>

                  {/* Menu wyboru uprawnień */}
                  {activeRoleDropdownIndex === idx && (
                    <div 
                      ref={roleDropdownRef}
                      className="absolute right-0 mt-1 w-64 bg-[#282a2d] border border-[#444746] rounded-lg shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                    >
                      <button
                        type="button"
                        onClick={() => handleUpdateRole(idx, 'Przeglądający')}
                        className="w-full text-left px-4 py-2 hover:bg-[#35373a] text-xs transition"
                      >
                        <div className="flex items-center justify-between font-normal text-[#e3e3e3]">
                          <span>Przeglądający</span>
                          {person.role === 'Przeglądający' && (
                            <svg className="w-4 h-4 text-[#8ab4f8]" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                          )}
                        </div>
                        <span className="text-[11px] text-[#9aa0a6] block mt-0.5">
                          Może tylko oglądać wydarzenia
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateRole(idx, 'Edytor')}
                        className="w-full text-left px-4 py-2 hover:bg-[#35373a] text-xs transition"
                      >
                        <div className="flex items-center justify-between font-normal text-[#e3e3e3]">
                          <span>Edytor</span>
                          {person.role === 'Edytor' && (
                            <svg className="w-4 h-4 text-[#8ab4f8]" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                          )}
                        </div>
                        <span className="text-[11px] text-[#9aa0a6] block mt-0.5">
                          Może dodawać i edytować wydarzenia
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateRole(idx, 'Pełny dostęp')}
                        className="w-full text-left px-4 py-2 hover:bg-[#35373a] text-xs transition"
                      >
                        <div className="flex items-center justify-between font-normal text-[#e3e3e3]">
                          <span>Pełny dostęp</span>
                          {(!person.role || person.role === 'Pełny dostęp') && (
                            <svg className="w-4 h-4 text-[#8ab4f8]" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                          )}
                        </div>
                        <span className="text-[11px] text-[#9aa0a6] block mt-0.5">
                          Może dosłownie wszystko (edycja i wymiana)
                        </span>
                      </button>

                      <div className="border-t border-[#444746] my-1" />

                      <button
                        type="button"
                        onClick={() => handleUpdateRole(idx, 'remove')}
                        className="w-full text-left px-4 py-2 hover:bg-[#4c1f24] text-xs text-[#f28b82] transition"
                      >
                        Usuń dostęp
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Sekcja: Dostęp ogólny (Zgodna 1:1 z Image 1 i Image 2) */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-[#e3e3e3] mb-3">
            Dostęp ogólny
          </h3>

          <div className="flex items-start space-x-3">
            {/* Ikona Kłódki w kółku */}
            <div className="w-9 h-9 rounded-full bg-[#3c4043] flex items-center justify-center text-[#e3e3e3] shrink-0 mt-0.5">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
            </div>

            {/* Dropdown dostępu ogólnego */}
            <div className="flex-1 relative">
              <button
                type="button"
                onClick={() => setIsAccessDropdownOpen(!isAccessDropdownOpen)}
                className="flex items-center space-x-1.5 hover:bg-[#35373a] px-2 py-1 -ml-2 rounded transition focus:outline-none"
              >
                <span className="text-sm font-normal text-[#e3e3e3]">
                  {generalAccess === 'restricted' ? 'Dostęp ograniczony' : 'Każda osoba mająca link'}
                </span>
                <svg className="w-3.5 h-3.5 text-[#c4c7c5]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>

              <p className="text-xs text-[#9aa0a6] leading-relaxed pr-1 mt-0.5">
                {generalAccess === 'restricted'
                  ? 'Tylko osoby z przyznanym dostępem mogą otwierać elementy za pomocą tego linku'
                  : 'Każda osoba w internecie z linkiem i kodem PIN może wyświetlać ten kalendarz'}
              </p>

              {/* Menu wyboru dostępu ogólnego (Image 2) */}
              {isAccessDropdownOpen && (
                <div 
                  ref={accessDropdownRef}
                  className="absolute left-0 mt-1 w-64 bg-[#282a2d] border border-[#444746] rounded-lg shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setGeneralAccess('restricted');
                      setIsAccessDropdownOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-[#35373a] text-sm text-[#e3e3e3] transition text-left"
                  >
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      {generalAccess === 'restricted' && (
                        <svg className="w-4 h-4 text-[#8ab4f8]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                    </div>
                    <span>Dostęp ograniczony</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGeneralAccess('pin');
                      setIsAccessDropdownOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-[#35373a] text-sm text-[#e3e3e3] transition text-left"
                  >
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      {generalAccess === 'pin' && (
                        <svg className="w-4 h-4 text-[#8ab4f8]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                    </div>
                    <span>Każda osoba mająca link</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sekcja PIN pod dostępem - duży czytelny napis jak inne nagłówki, podkreślenie na niebiesko */}
          <div className="mt-4 pt-3 border-t border-[#444746]/40 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="text-sm font-medium text-[#e3e3e3]">
                PIN:
              </span>
              <span 
                onClick={handleCopyPin}
                title="Kliknij, aby skopiować PIN"
                className="text-base font-bold font-mono tracking-wider cursor-pointer hover:text-[#b8d4ff] transition select-all"
                style={{
                  color: '#8ab4f8',
                  textDecoration: 'underline',
                  textDecorationColor: '#8ab4f8',
                  textUnderlineOffset: '4px'
                }}
              >
                {pinToDisplay}
              </span>
              {copiedPin ? (
                <span className="text-xs font-medium text-[#8ab4f8] animate-in fade-in">
                  (Skopiowano!)
                </span>
              ) : (
                <span className="text-xs text-[#9aa0a6]">
                  (ważny: {timeFormatted})
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleRegeneratePin}
              className="text-xs text-[#8ab4f8] hover:text-[#b8d4ff] hover:underline transition font-medium cursor-pointer"
              title="Wygeneruj nowy PIN"
            >
              Nowy PIN
            </button>
          </div>
        </div>

        {/* 5. Footer: Kopiuj link (z lewej) oraz Gotowe (z prawej) - 1:1 Image 1 */}
        <div className="mt-7 pt-1 flex items-center justify-between">
          {/* Przycisk Kopiuj link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-full border border-[#8e918f] hover:border-white text-[#8ab4f8] hover:bg-[#8ab4f8]/10 text-sm font-medium transition active:scale-95"
          >
            <svg className="w-4 h-4 fill-current text-[#8ab4f8]" viewBox="0 0 24 24">
              <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
            </svg>
            <span>{copiedLink ? 'Link skopiowany!' : 'Kopiuj link'}</span>
          </button>

          {/* Przycisk Gotowe (niebieski pill Google Image 1) */}
          <button
            type="button"
            onClick={onClose}
            className="px-7 py-2.5 bg-[#0b57d0] hover:bg-[#1b66c9] text-white rounded-full text-sm font-medium transition shadow-md active:scale-95"
          >
            Gotowe
          </button>
        </div>
      </div>
    </div>
  );
}
