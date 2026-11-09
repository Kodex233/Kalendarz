import React, { useState } from 'react';
import { 
  X, 
  Check, 
  UserCheck, 
  UserX, 
  Clock, 
  ShieldCheck, 
  Plus, 
  Copy, 
  CheckCheck, 
  Key,
  Users
} from 'lucide-react';

export default function AccessRequestsModal({
  isOpen,
  onClose,
  roomCode = 'kodex',
  roomPin = '202626',
  approvedEmails = [],
  accessRequests = [],
  onApprove,
  onReject,
  onRevoke,
  onAddEmail,
  ownerEmail = 'kodex233@gmail.com'
}) {
  const [newEmailInput, setNewEmailInput] = useState('');
  const [copiedPin, setCopiedPin] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState({});

  if (!isOpen) return null;

  const pendingRequests = (accessRequests || []).filter(r => r.status === 'pending');
  const cleanOwnerEmail = (ownerEmail || 'kodex233@gmail.com').toLowerCase().trim();

  const handleCopyPin = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomPin);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  const handleAddEmailSubmit = (e) => {
    e.preventDefault();
    const clean = newEmailInput.trim().toLowerCase();
    if (!clean || !clean.includes('@')) return;
    if (onAddEmail) {
      onAddEmail(clean);
    }
    setNewEmailInput('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#131314]/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-[#282a2d] text-[#e3e3e3] rounded-[28px] shadow-2xl w-full max-w-[560px] max-h-[90vh] flex flex-col overflow-hidden border border-[#444746] animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#3c4043]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#1b66c9]/20 flex items-center justify-center text-[#8ab4f8]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[19px] font-normal text-[#e3e3e3] font-['Google_Sans','Product_Sans',sans-serif] flex items-center space-x-2">
                <span>Zarządzanie dostępem</span>
                {pendingRequests.length > 0 && (
                  <span className="bg-[#ea4335] text-white text-xs font-semibold px-2 py-0.5 rounded-full animate-pulse">
                    {pendingRequests.length} nowe
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#9aa0a6] mt-0.5">
                Zezwalaj na dostęp lub odrzucaj osoby logujące się przez Google
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-[#35373a] text-[#c4c7c5] hover:text-white rounded-full transition cursor-pointer -mr-1"
            title="Zamknij"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-sm">
          {/* Sekcja 1: Oczekujące prośby (Zezwól / Odrzuć) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-[#c4c7c5] uppercase tracking-wider flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#fbbc04]" />
                <span>Oczekujące prośby o wejście ({pendingRequests.length})</span>
              </h3>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#1e1f20]/60 border border-[#3c4043]/60 text-center text-xs text-[#9aa0a6]">
                Brak oczekujących próśb. Gdy ktoś zaloguje się przez Google, pojawi się tutaj.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req, idx) => {
                  const reqEmail = (req.email || '').toLowerCase().trim();
                  const currentRole = selectedRoles[reqEmail] || 'Pełny dostęp';

                  return (
                    <div 
                      key={idx} 
                      className="p-3.5 rounded-2xl bg-[#1e1f20] border border-[#3c4043] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {req.photoURL ? (
                          <img 
                            src={req.photoURL} 
                            alt={req.name || reqEmail} 
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full ring-2 ring-[#3c4043] shrink-0 object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#0b57d0] text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {(req.name || reqEmail)?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#e3e3e3] truncate">
                            {req.name || reqEmail.split('@')[0]}
                          </p>
                          <p className="text-xs text-[#9aa0a6] truncate font-mono">
                            {reqEmail}
                          </p>
                        </div>
                      </div>

                      {/* Akcje: Wybór roli + Zezwól + Odrzuć */}
                      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                        <select
                          value={currentRole}
                          onChange={(e) => setSelectedRoles(prev => ({ ...prev, [reqEmail]: e.target.value }))}
                          className="bg-[#282a2d] border border-[#444746] rounded-full px-2.5 py-1.5 text-xs text-[#e3e3e3] focus:outline-none focus:border-[#8ab4f8]"
                        >
                          <option value="Pełny dostęp">Pełny dostęp</option>
                          <option value="Edytor">Edytor</option>
                          <option value="Przeglądający">Przeglądający</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => onApprove && onApprove(reqEmail, req.name, currentRole)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#0b57d0] hover:bg-[#1b66c9] text-white text-xs font-medium rounded-full transition shadow-sm active:scale-95 cursor-pointer"
                          title="Zezwól na dostęp"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Zezwól</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onReject && onReject(reqEmail)}
                          className="flex items-center space-x-1 px-2.5 py-1.5 bg-[#4c1f24] hover:bg-[#5c272d] text-[#f28b82] text-xs font-medium rounded-full transition active:scale-95 cursor-pointer"
                          title="Odrzuć prośbę"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Odrzuć</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sekcja 2: Szybkie dodawanie (Biała lista e-maili) */}
          <div className="pt-2 border-t border-[#3c4043]">
            <h3 className="text-xs font-semibold text-[#c4c7c5] uppercase tracking-wider mb-2 flex items-center space-x-2">
              <Plus className="w-4 h-4 text-[#8ab4f8]" />
              <span>Dodaj e-mail z góry (Biała lista)</span>
            </h3>
            <form onSubmit={handleAddEmailSubmit} className="flex items-center space-x-2">
              <input
                type="email"
                required
                placeholder="np. znajomy@gmail.com"
                value={newEmailInput}
                onChange={(e) => setNewEmailInput(e.target.value)}
                className="flex-1 bg-transparent border border-[#747775] hover:border-[#9aa0a6] focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#8ab4f8] rounded-lg px-3.5 py-2 text-xs sm:text-sm text-[#e3e3e3] placeholder-[#9aa0a6] focus:outline-none transition"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#35373a] hover:bg-[#434649] text-[#e3e3e3] hover:text-white rounded-lg text-xs font-medium transition cursor-pointer shrink-0"
              >
                Dodaj
              </button>
            </form>
          </div>

          {/* Sekcja 3: Zatwierdzone konta Google */}
          <div className="pt-2 border-t border-[#3c4043]">
            <h3 className="text-xs font-semibold text-[#c4c7c5] uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Users className="w-4 h-4 text-[#8ab4f8]" />
              <span>Osoby z aktywnym dostępem ({approvedEmails.length})</span>
            </h3>

            <div className="space-y-2">
              {approvedEmails.map((email, idx) => {
                const clean = (email || '').toLowerCase().trim();
                const isOwner = clean === cleanOwnerEmail;

                return (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#1e1f20] transition"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#3c4043] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {clean[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-[#e3e3e3] truncate font-mono">
                          {clean}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      {isOwner ? (
                        <span className="text-xs text-[#8ab4f8] font-medium bg-[#1b66c9]/20 px-2.5 py-1 rounded-full">
                          Właściciel
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onRevoke && onRevoke(clean)}
                          className="text-xs text-[#f28b82] hover:text-white hover:bg-[#4c1f24] px-2.5 py-1 rounded-full transition cursor-pointer"
                        >
                          Cofnij dostęp
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sekcja 4: Opcja awaryjna - Kod PIN */}
          <div className="pt-3 border-t border-[#3c4043] flex items-center justify-between bg-[#1e1f20]/40 p-3.5 rounded-2xl border border-[#3c4043]/40">
            <div className="flex items-center space-x-2.5 min-w-0">
              <Key className="w-4 h-4 text-[#fbbc04] shrink-0" />
              <div>
                <p className="text-xs text-[#9aa0a6]">
                  PIN pokoju (alternatywne wejście):
                </p>
                <p className="text-sm font-mono font-bold text-[#8ab4f8] tracking-widest">
                  {roomPin}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyPin}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#35373a] hover:bg-[#434649] text-[#e3e3e3] rounded-full text-xs font-medium transition cursor-pointer shrink-0"
            >
              {copiedPin ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-[#8ab4f8]" />
                  <span>Skopiowano</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Kopiuj PIN</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#3c4043] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-[#0b57d0] hover:bg-[#1b66c9] text-white text-sm font-medium rounded-full transition shadow-md active:scale-95 cursor-pointer"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
