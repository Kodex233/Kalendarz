import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle } from 'lucide-react';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../firebase/config';

export default function AuthModal({ isOpen, onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Logowanie przez Google nie zostało jeszcze włączone w konsoli Firebase Auth.');
      } else {
        setError('Błąd logowania Google: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#282a2d] text-[#e3e3e3] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[#3c4043] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#202124] border-b border-[#3c4043]">
          <h3 className="text-lg font-bold text-[#e3e3e3]">
            {isRegister ? 'Utwórz konto w Kalendarzu' : 'Zaloguj się do Kalendarza'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-[#9aa0a6] hover:bg-[#35373a] hover:text-[#e3e3e3] rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#4c1f24] border border-[#f28b82]/30 rounded-lg flex items-start space-x-2 text-[#fce8e6] text-xs">
              <AlertCircle className="w-4 h-4 text-[#f28b82] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 bg-[#1f1f1f] hover:bg-[#35373a] border border-[#5f6368] rounded-xl text-[#e3e3e3] font-medium text-sm transition shadow-xs disabled:opacity-50"
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

          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-[#3c4043]"></div>
            <span className="px-3 text-xs text-[#9aa0a6] font-medium">LUB PRZEZ E-MAIL</span>
            <div className="flex-1 border-t border-[#3c4043]"></div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-[#9aa0a6] mb-1">Twoje imię / Nick</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#9aa0a6] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="np. Michał"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#1f1f1f] border border-[#5f6368] rounded-lg text-sm text-[#e3e3e3] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#9aa0a6] mb-1">Adres e-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9aa0a6] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="twoj@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#1f1f1f] border border-[#5f6368] rounded-lg text-sm text-[#e3e3e3] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#9aa0a6] mb-1">Hasło</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9aa0a6] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#1f1f1f] border border-[#5f6368] rounded-lg text-sm text-[#e3e3e3] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#1f1f1f] font-bold rounded-xl text-sm transition shadow-sm disabled:opacity-50 mt-2"
            >
              {loading ? 'Przetwarzanie...' : (isRegister ? 'Zarejestruj się' : 'Zaloguj się')}
            </button>
          </form>

          {/* Toggle register / login */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-xs text-[#8ab4f8] hover:underline font-medium"
            >
              {isRegister ? 'Masz już konto? Zaloguj się' : 'Nie masz konta? Zarejestruj się bezpłatnie'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
