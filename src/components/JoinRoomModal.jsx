import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { checkPinRateLimit } from '../utils/security';

export default function JoinRoomModal({
  isOpen,
  onClose,
  initialRoomCode = 'kodex',
  onJoinSuccess
}) {
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [userName, setUserName] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Przy każdym otwarciu okna pole na PIN jest czyste i puste
  useEffect(() => {
    if (initialRoomCode) setRoomCode(initialRoomCode);
    setPin('');
    setError('');
  }, [initialRoomCode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      setError('Wpisz swoje imię lub pseudonim.');
      return;
    }
    if (!pin.trim()) {
      setError('Wpisz kod PIN dostępu od właściciela kalendarza.');
      return;
    }

    // Zabezpieczenie anty-bot / anty-wtyczka: sprawdzenie limitu prób
    const rateCheck = checkPinRateLimit();
    if (!rateCheck.allowed) {
      setError(rateCheck.message);
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onJoinSuccess({
        roomCode: roomCode.trim() || 'kodex',
        userName: userName.trim(),
        pin: pin.trim()
      });
      setPin('');
      onClose();
    } catch (err) {
      setError(err.message || 'Nieprawidłowy kod PIN lub błąd połączenia.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#131314] flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-[#282a2d] text-[#e3e3e3] rounded-[28px] shadow-2xl w-full max-w-[440px] overflow-hidden border border-[#444746]/60 animate-in zoom-in-95 duration-150 p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header w stylu Google z przyciskiem X w rogu (bez żadnych ikonek w nagłówku) */}
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-[20px] font-normal text-[#e3e3e3] font-['Google_Sans','Product_Sans',sans-serif]">
            Dołącz do kalendarza
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-[#35373a] text-[#c4c7c5] hover:text-white rounded-full transition cursor-pointer -mr-1"
            title="Zamknij"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#9aa0a6] mt-1 leading-relaxed">
          Wpisz swoje imię oraz kod PIN, aby przeglądać wspólny kalendarz i dodawać wydarzenia w czasie rzeczywistym.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-[#4c1f24] border border-[#f28b82]/40 rounded-xl flex items-center space-x-2 text-xs text-[#fce8e6]">
            <AlertCircle className="w-4 h-4 text-[#f28b82] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#c4c7c5] mb-1.5">
              Twoje imię lub pseudonim:
            </label>
            <input
              type="text"
              required
              placeholder="np. Kasia"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-[#1e1f20] border border-[#444746] focus:border-[#8ab4f8] rounded-xl px-4 py-2.5 text-sm text-[#e3e3e3] placeholder-[#747775] focus:outline-none transition"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#c4c7c5] mb-1.5">
              Kod kalendarza:
            </label>
            <input
              type="text"
              required
              placeholder="kodex"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="w-full bg-[#1e1f20] border border-[#444746] focus:border-[#8ab4f8] rounded-xl px-4 py-2.5 text-sm text-[#e3e3e3] placeholder-[#747775] focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#c4c7c5] mb-1.5">
              Kod PIN dostępu:
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              maxLength={6}
              autoComplete="new-password"
              data-lpignore="true"
              data-1p-ignore="true"
              data-form-type="other"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              placeholder="Wpisz 6-cyfrowy PIN"
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setPin(val);
              }}
              className="w-full bg-[#1e1f20] border border-[#444746] focus:border-[#8ab4f8] rounded-xl px-4 py-2.5 text-sm text-[#e3e3e3] placeholder-[#747775] font-mono tracking-widest focus:outline-none transition"
            />
          </div>

          {/* Przyciski w stylu Google: bez bordera na buttonie, bez strzałki */}
          <div className="pt-3 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-[#8ab4f8] hover:bg-[#8ab4f8]/10 rounded-full transition cursor-pointer"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-2.5 bg-[#0b57d0] hover:bg-[#1b66c9] text-white text-sm font-medium rounded-full transition shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Łączenie...' : 'Dołącz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
