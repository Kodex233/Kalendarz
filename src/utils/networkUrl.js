/**
 * Budowanie linku udostępniania kalendarza i zaproszeń.
 * Generuje w pełni publiczny link w domenie Firebase Hosting
 * (https://kalendarz-d284f.web.app?room=kodex).
 * 
 * WAŻNE: Ze względów bezpieczeństwa link NIGDY nie zawiera kodu PIN na końcu!
 * Użytkownik musi otrzymać PIN oddzielnie lub podać go ręcznie.
 */

export const PRODUCTION_APP_URL = 'https://kalendarz-d284f.web.app';

export function getShareOrigin() {
  if (typeof window === 'undefined') return PRODUCTION_APP_URL;

  const { hostname } = window.location;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  // Na localhost używamy publicznego adresu produkcyjnego Firebase,
  // aby skopiowany link działał dla każdej realnej osoby z zewnątrz.
  if (isLocalhost) {
    return PRODUCTION_APP_URL;
  }

  return window.location.origin;
}

export function buildShareUrl(roomCode) {
  const origin = getShareOrigin();
  const path = (typeof window !== 'undefined' && window.location.pathname) ? window.location.pathname : '/';
  const query = [];

  if (roomCode) {
    query.push(`room=${encodeURIComponent(roomCode)}`);
  }

  // Celowo nie dodajemy PIN-u do linku - hasło nie może znajdować się w URL-u!
  const queryString = query.length > 0 ? `?${query.join('&')}` : '';
  return `${origin}${path}${queryString}`;
}
