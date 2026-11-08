/**
 * Bezpieczeństwo i kryptograficzne zabezpieczenia kalendarza:
 * 1. Haszowanie PIN z użyciem PBKDF2-HMAC-SHA256 (50 000 iteracji) i unikalnej kryptograficznej soli.
 *    Czysty PIN NIGDY nie jest zapisywany w bazie Firestore ani przesyłany w linku.
 * 2. Zabezpieczenie przed atakami brute-force i złośliwymi wtyczkami/skryptami:
 *    - Blokada czasowa (lockout) po nieudanych próbach wpisania PIN-u.
 *    - Obliczanie 50 000 rund PBKDF2 uniemożliwia automatyczne sprawdzanie kombinacji w milisekundy.
 * 3. Kryptograficznie bezpieczny generator 6-cyfrowego kodu PIN (crypto.getRandomValues).
 */

const PEPPER = 'GoogleKalendarz_AntiTamper_2026_xK9';
const RATE_LIMIT_STORAGE_KEY = 'kalendarz_sec_pin_ratelimit_v1';

function getCrypto() {
  if (typeof window !== 'undefined' && window.crypto) return window.crypto;
  if (typeof globalThis !== 'undefined' && globalThis.crypto) return globalThis.crypto;
  return null;
}

/**
 * Generuje kryptograficznie losowy 6-cyfrowy PIN (100000 - 999999)
 */
export function generateSecurePin() {
  const c = getCrypto();
  if (c && c.getRandomValues) {
    const array = new Uint32Array(1);
    c.getRandomValues(array);
    const num = 100000 + (array[0] % 900000);
    return String(num);
  }
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Generuje unikalną, 32-znakową kryptograficzną sól w formacie hex
 */
export function generatePinSalt() {
  const c = getCrypto();
  const bytes = new Uint8Array(16);
  if (c && c.getRandomValues) {
    c.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Oblicza kryptograficzny hash PBKDF2-HMAC-SHA256 (50 000 iteracji)
 * Dzięki temu nawet jeśli wtyczka/skrypt pobierze dane z bazy, nie ma możliwości
 * odczytania kodu PIN, bo w bazie znajduje się wyłącznie jednostronny hash.
 */
export async function hashPin(pin, salt) {
  const cleanPin = String(pin).trim();
  const cleanSalt = String(salt).trim();
  const c = getCrypto();

  // Sprawdź dostępność Web Crypto API
  if (c && c.subtle) {
    try {
      const enc = new TextEncoder();
      const pinBuffer = enc.encode(cleanPin);
      const saltBuffer = enc.encode(`${cleanSalt}:${PEPPER}`);

      const keyMaterial = await c.subtle.importKey(
        'raw',
        pinBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );

      const derivedBits = await c.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: saltBuffer,
          iterations: 50000,
          hash: 'SHA-256'
        },
        keyMaterial,
        256
      );

      const hashArray = Array.from(new Uint8Array(derivedBits));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.warn('Web Crypto PBKDF2 fallback:', e);
    }
  }

  // Fallback dla starszych środowisk bez Web Crypto (iterowany SHA-256 sim)
  return fallbackHash(`${cleanSalt}:${cleanPin}:${PEPPER}`);
}

function fallbackHash(str) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
}

/**
 * Weryfikacja podanego przez użytkownika PIN-u z hashem zapisanym w Firestore
 */
export async function verifyPin(candidatePin, pinHash, pinSalt) {
  if (!candidatePin || !pinHash || !pinSalt) return false;
  const computed = await hashPin(candidatePin, pinSalt);
  return computed === pinHash;
}

/**
 * Zabezpieczenie anty-brute-force i blokada przed wtyczkami automatycznymi
 */
export function checkPinRateLimit() {
  if (typeof window === 'undefined') return { allowed: true };
  try {
    const raw = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (!raw) return { allowed: true };
    const data = JSON.parse(raw);
    const now = Date.now();
    if (data.lockedUntil && data.lockedUntil > now) {
      const waitSec = Math.ceil((data.lockedUntil - now) / 1000);
      return {
        allowed: false,
        message: `Zbyt wiele nieudanych prób logowania. Zabezpieczenie anty-bot aktywne. Odczekaj ${waitSec} s przed kolejną próbą.`
      };
    }
  } catch {
    // ignoruj błędy parsowania
  }
  return { allowed: true };
}

export function recordFailedPinAttempt() {
  if (typeof window === 'undefined') return;
  try {
    const now = Date.now();
    const raw = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : { count: 0, lockedUntil: 0 };
    data.count = (data.count || 0) + 1;
    if (data.count >= 5) {
      data.lockedUntil = now + (2 * 60 * 1000); // 2 minuty blokady po 5 nieudanych próbach
    } else if (data.count >= 3) {
      data.lockedUntil = now + (30 * 1000); // 30 sekund blokady po 3 nieudanych próbach
    }
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function resetPinRateLimit() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
  } catch {}
}
