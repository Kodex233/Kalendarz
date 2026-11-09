import React, { useState } from 'react';
import { X, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../firebase/config';

export default function AuthModal({ isOpen, onClose, onGoogleLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleClick = async () => {
    setError('');
    setErrorDetails('');
    setLoading(true);
    try {
      if (onGoogleLogin) {
        await onGoogleLogin();
      } else {
        await loginWithGoogle();
      }
      onClose();
    } catch (err) {
      console.warn('Google login error:', err);
      if (err.code === 'auth/popup-blocked') {
        setError('Przeglądarka zablokowała wyskakujące okienko Google.');
        setErrorDetails('Zezwól na wyskakujące okienka dla tej witryny.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Okno logowania Google zostało zamknięte przed ukończeniem.');
      } else {
        setError('Błąd logowania Google: ' + (err.message || err.code));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setErrorDetails('');
    setLoading(true);

    try {
      if (isRegister) {
        await registerWithEmail(email, password, displayName);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Logowanie e-mail/hasło wymaga włączenia w konsoli Firebase Authentication.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Nieprawidłowy adres e-mail lub hasło.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Ten adres e-mail jest już zajęty.');
      } else if (err.code === 'auth/weak-password') {
        setError('Hasło musi mieć co najmniej 6 znaków.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#131314] flex items-center justify-center p-4">
      {/* Authentic Google Sign-in Card: bez bordera */}
      <div className="bg-[#1e1f20] text-[#e3e3e3] rounded-[28px] shadow-2xl w-full max-w-[460px] overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-9 relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 text-[#9aa0a6] hover:bg-[#282a2d] hover:text-[#e3e3e3] rounded-full transition"
          title="Zamknij"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Google G Logo */}
        <div className="flex justify-start mb-4">
          <svg className="w-8 h-8" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        </div>

        {/* Headings matching Google Sign-in */}
        <div className="text-left mb-6">
          <h2 className="text-[26px] font-normal text-[#e3e3e3] font-['Google_Sans','Product_Sans',sans-serif]">
            {isRegister ? 'Utwórz konto Google' : 'Zaloguj się'}
          </h2>
          <p className="text-base text-[#e3e3e3] mt-1.5 font-normal">
            Przejdź do: <span className="font-medium">Kalendarz</span>
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-[#4c1f24] border border-[#f28b82]/40 rounded-xl space-y-2 text-xs">
            <div className="flex items-start space-x-2 text-[#fce8e6]">
              <AlertCircle className="w-4 h-4 text-[#f28b82] shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
            {errorDetails && (
              <p className="text-[11px] text-[#f28b82]/90 pl-6 leading-relaxed">
                {errorDetails}
              </p>
            )}
          </div>
        )}

        {/* Official Google Sign-In Button: zgodny z ekranem głównym (jasnoszary, bez bordera) */}
        <button
          onClick={handleGoogleClick}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-[#35373a] hover:bg-[#434649] rounded-full text-[#e3e3e3] font-medium text-sm transition shadow-sm disabled:opacity-50 active:scale-[0.98] cursor-pointer mb-5"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Kontynuuj przez Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center my-5">
          <div className="flex-1 border-t border-[#3c4043]"></div>
          <span className="px-3 text-[11px] text-[#9aa0a6] font-medium tracking-wider uppercase">lub e-mail</span>
          <div className="flex-1 border-t border-[#3c4043]"></div>
        </div>

        {/* Email & Password Form: Google Outlined Fields */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isRegister && (
            <div>
              <input
                type="text"
                placeholder="Imię i nazwisko"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required={isRegister}
                className="w-full bg-transparent border border-[#747775] focus:border-[#a8c7fa] focus:ring-1 focus:ring-[#a8c7fa] rounded-md px-4 py-3.5 text-base text-[#e3e3e3] placeholder-[#9aa0a6] focus:outline-none transition"
              />
            </div>
          )}

          <div>
            <input
              type="email"
              placeholder="Adres e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border border-[#747775] focus:border-[#a8c7fa] focus:ring-1 focus:ring-[#a8c7fa] rounded-md px-4 py-3.5 text-base text-[#e3e3e3] placeholder-[#9aa0a6] focus:outline-none transition"
            />
            <button
              type="button"
              onClick={() => alert('Wpisz swój adres e-mail powyżej lub skorzystaj z logowania Google.')}
              className="text-sm font-medium text-[#a8c7fa] hover:text-[#c2e7ff] text-left block mt-1.5"
            >
              Nie pamiętasz adresu e-mail?
            </button>
          </div>

          <div>
            <input
              type="password"
              placeholder="Wpisz hasło"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-transparent border border-[#747775] focus:border-[#a8c7fa] focus:ring-1 focus:ring-[#a8c7fa] rounded-md px-4 py-3.5 text-base text-[#e3e3e3] placeholder-[#9aa0a6] focus:outline-none transition"
            />
          </div>

          {/* Google Guest Mode Info */}
          <div className="text-xs text-[#9aa0a6] leading-relaxed pt-2">
            To nie Twój komputer? Użyj trybu gościa, aby zalogować się prywatnie.{' '}
            <span className="text-[#a8c7fa] hover:underline cursor-pointer">
              Więcej informacji o korzystaniu z trybu gościa
            </span>
          </div>

          <div className="flex items-center justify-between pt-6">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setErrorDetails('');
              }}
              className="text-sm font-medium text-[#a8c7fa] hover:bg-[#a8c7fa]/10 px-4 py-2.5 rounded-full transition"
            >
              {isRegister ? 'Zaloguj się zamiast tego' : 'Utwórz konto'}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#a8c7fa] hover:bg-[#b8d4ff] text-[#062e6f] font-medium rounded-full text-sm transition shadow-sm disabled:opacity-50 active:scale-95"
            >
              {loading ? 'Czekaj...' : (isRegister ? 'Zarejestruj' : 'Dalej')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
