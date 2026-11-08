import React, { useState } from 'react';
import { Users, Lock, ArrowRight, X, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function JoinRoomModal({
  isOpen,
  onClose,
  initialRoomCode = 'kodex',
  initialPin = '',
  onJoinSuccess
}) {
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [userName, setUserName] = useState('');
  const [pin, setPin] = useState(initialPin);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (initialRoomCode) setRoomCode(initialRoomCode);
    if (initialPin) setPin(initialPin);
  }, [initialRoomCode, initialPin]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      setError('Wpisz swoje imię lub pseudonim.');
      return;
    }
    if (!pin.trim()) {
      setError('Wpisz kod PIN dostępu od znajomego.');
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
      onClose();
    } catch (err) {
      setError(err.message || 'Nieprawidłowy kod PIN lub błąd połączenia.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        className="bg-[#1e1f20] text-[#e3e3e3] rounded-[28px] shadow-2xl w-full max-w-[440px] overflow-hidden border border-[#3c4043] animate-in zoom-in-95 duration-150 p-7 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 text-[#9aa0a6] hover:bg-[#282a2d] hover:text-[#e3e3e3] rounded-full transition"
          title="Zamknij"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-[#8ab4f8]/15 text-[#8ab4f8] flex items-center justify-center mb-4">
          <Users className="w-6 h-6 stroke-[2.2]" />
        </div>

        <h2 className="text-xl font-normal text-[#e3e3e3] font-['Google_Sans','Product_Sans',sans-serif]">
          Dołącz do kalendarza znajomego
        </h2>
        <p className="text-xs text-[#9aa0a6] mt-1.5 leading-relaxed">
          Wpisz swoje imię oraz kod PIN otrzymany od znajomego, aby przeglądać pełny kalendarz i wymieniać się terminami na żywo.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-[#4c1f24] border border-[#f28b82]/40 rounded-xl flex items-center space-x-2 text-xs text-[#fce8e6]">
            <AlertCircle className="w-4 h-4 text-[#f28b82] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#9aa0a6] mb-1.5">
              Twoje imię lub nazwa (np. Janek):
            </label>
            <input
              type="text"
              required
              placeholder="np. Kolega Janek"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-[#131314] border border-[#444746] focus:border-[#8ab4f8] rounded-xl px-4 py-2.5 text-sm text-[#e3e3e3] placeholder-[#747775] focus:outline-none transition"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9aa0a6] mb-1.5">
              Kod PIN dostępu (od właściciela kalendarza):
            </label>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={8}
                placeholder="np. 482910"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-[#131314] border border-[#444746] focus:border-[#8ab4f8] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#e3e3e3] placeholder-[#747775] font-mono tracking-wider focus:outline-none transition"
              />
              <Lock className="w-4 h-4 text-[#9aa0a6] absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-[#c4c7c5] hover:bg-[#282a2d] hover:text-white rounded-full transition"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#a8c7fa] hover:bg-[#b8d4ff] text-[#062e6f] font-semibold rounded-full text-sm transition shadow-sm disabled:opacity-50 flex items-center space-x-1.5 active:scale-95"
            >
              <span>{loading ? 'Łączenie...' : 'Dołącz do kalendarza'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
