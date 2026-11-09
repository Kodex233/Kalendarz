import React, { useState, useEffect, useRef } from 'react';
import { buildShareUrl } from '../utils/networkUrl';
import { generateSecurePin } from '../utils/security';

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
  onUpdateParticipants,
  accessRequests = [],
  onApproveAccess,
  onRejectAccess,
  onRevokeAccess
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [newPersonInput, setNewPersonInput] = useState('');
  const [generalAccess, setGeneralAccess] = useState('restricted'); // 'restricted' | 'pin'
  const [isAccessDropdownOpen, setIsAccessDropdownOpen] = useState(false);
  const [activeRoleDropdownIndex, setActiveRoleDropdownIndex] = useState(null);
  const [pendingRoles, setPendingRoles] = useState({});

  const accessDropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);

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

  const pinToDisplay = currentPin || '849201';
  // Link NIGDY nie zawiera PIN-u na końcu - tylko czysty adres pokoju
  const shareUrl = buildShareUrl(roomCode);

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
    const randomPin = generateSecurePin();
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
      const removed = updated[index];
      updated.splice(index, 1);
      onUpdateParticipants(updated, { removedName: removed?.name });
    } else {
      updated[index] = { ...updated[index], role: newRole };
      onUpdateParticipants(updated, { changedName: updated[index]?.name, newRole });
    }
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

        {/* 3. Sekcja: Osoby z dostępem */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[#e3e3e3]">
              Osoby z dostępem
            </h3>
            {pendingRequests.length > 0 && (
              <span className="text-xs bg-[#ea4335] text-white px-2 py-0.5 rounded-full font-semibold animate-pulse">
                {pendingRequests.length} do zatwierdzenia
              </span>
            )}
          </div>

          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {/* Oczekujące prośby o dostęp (ZAAKCEPTUJ / ODRZUĆ obok roli) */}
            {pendingRequests.map((req, pIdx) => {
              const reqEmail = (req.email || '').toLowerCase().trim();
              const reqRole = pendingRoles[reqEmail] || 'Pełny dostęp';

              return (
                <div key={`req-${pIdx}`} className="flex items-center justify-between p-2 rounded-xl bg-[#1e1f20] border border-[#fbbc04]/30 relative animate-in fade-in">
                  <div className="flex items-center space-x-3 min-w-0">
                    {req.photoURL ? (
                      <img src={req.photoURL} alt={req.name} referrerPolicy="no-referrer" className="w-9 h-9 rounded-full ring-2 ring-[#fbbc04]/50 object-cover shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#fbbc04] text-[#131314] flex items-center justify-center font-bold text-sm shrink-0">
                        {(req.name || reqEmail)?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <p className="text-sm font-medium text-[#e3e3e3] truncate">
                          {req.name || reqEmail.split('@')[0]}
                        </p>
                        <span className="text-[10px] bg-[#fbbc04]/20 text-[#fbbc04] px-1.5 py-0.2 rounded font-semibold uppercase">
                          Oczekuje
                        </span>
                      </div>
                      <p className="text-xs text-[#9aa0a6] truncate font-mono">
                        {reqEmail}
                      </p>
                    </div>
                  </div>

                  {/* Rola + Zaakceptuj i Odrzuć OBOK ROLI */}
                  <div className="flex items-center space-x-1.5 shrink-0 pl-2">
                    <select
                      value={reqRole}
                      onChange={(e) => setPendingRoles(prev => ({ ...prev, [reqEmail]: e.target.value }))}
                      className="bg-[#282a2d] border border-[#444746] hover:border-[#747775] text-[#e3e3e3] rounded-md px-2 py-1 text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="Pełny dostęp">Pełny dostęp</option>
                      <option value="Edytor">Edytor</option>
                      <option value="Przeglądający">Przeglądający</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => onApproveAccess && onApproveAccess(reqEmail, req.name, reqRole)}
                      className="flex items-center space-x-1 px-3 py-1 bg-[#0b57d0] hover:bg-[#1b66c9] text-white text-xs font-medium rounded-full transition shadow-sm active:scale-95 cursor-pointer"
                      title="Zaakceptuj dostęp"
                    >
                      <svg className="w-3.5 h-3.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Zaakceptuj</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onRejectAccess && onRejectAccess(reqEmail)}
                      className="flex items-center space-x-1 px-2.5 py-1 bg-[#4c1f24] hover:bg-[#5c272d] text-[#f28b82] text-xs font-medium rounded-full transition active:scale-95 cursor-pointer"
                      title="Odrzuć prośbę"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Odrzuć</span>
                    </button>
                  </div>
                </div>
              );
            })}

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
                  (kliknij, aby skopiować)
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

        {/* 5. Footer: Kopiuj link (z lewej) oraz Gotowe (z prawej) */}
        <div className="mt-7 pt-1 flex items-center justify-between">
          {/* Przycisk Kopiuj link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-full border border-[#8e918f] hover:border-white text-[#8ab4f8] hover:bg-[#8ab4f8]/10 text-sm font-medium transition active:scale-95 cursor-pointer"
            title="Kopiuj link"
          >
            <svg className="w-4 h-4 fill-current text-[#8ab4f8]" viewBox="0 0 24 24">
              <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
            </svg>
            <span>{copiedLink ? 'Link skopiowany!' : 'Kopiuj link'}</span>
          </button>

          {/* Przycisk Gotowe */}
          <button
            type="button"
            onClick={onClose}
            className="px-7 py-2.5 bg-[#0b57d0] hover:bg-[#1b66c9] text-white rounded-full text-sm font-medium transition shadow-md active:scale-95 cursor-pointer"
          >
            Gotowe
          </button>
        </div>
      </div>
    </div>
  );
}
