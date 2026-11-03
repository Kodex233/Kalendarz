# 📅 Kalendarz - Aplikacja à la Google Calendar z wymianą terminów

Nowoczesny kalendarz webowy wzorowany na interfejsie **Google Calendar**, wzbogacony o dedykowaną funkcję **wymiany terminów ze znajomymi** (spotkań, dyżurów, terminów wizyt lub konsultacji).

Aplikacja jest zintegrowana z chmurą **Google Firebase**:
- **Baza danych**: Cloud Firestore (aktualizacje w czasie rzeczywistym `onSnapshot`, transakcje atomowe `runTransaction` przy zamianie terminów)
- **Autoryzacja**: Firebase Authentication (Google Sign-In oraz E-mail / Hasło)
- **Projekt Firebase**: `kalendarz-d284f`

---

## ✨ Główne funkcjonalności

1. **Interfejs Google Calendar**:
   - Miesięczny widok siatki z numeracją dni, wyróżnieniem bieżącego dnia ("Dzisiaj") i kolorowymi etykietami.
   - Pasek boczny (Sidebar) z mini-kalendarzem do szybkiej nawigacji i selektorami kalendarzy.
   - Przycisk `+ Utwórz` w oficjalnym stylu Google.
   - Wyszukiwarka terminów po tytule, opisie lub znajomym.

2. **Wymiana terminami ze znajomymi ("Giełda terminów")**:
   - Opcja oznaczenia dowolnego terminu jako `Udostępnij na wymianę ze znajomym`.
   - Moduł propozycji wymiany: wybierasz swój termin i wskazujesz termin kolegi, który chcesz otrzymać.
   - Odbiorca propozycji widzi porównanie obu terminów i może jednym kliknięciem zaakceptować lub odrzucić zamianę.
   - **Atomowa transakcja Firestore**: Po akceptacji terminy i godziny zostają automatycznie zamienione w bazie bez ryzyka konfliktów.

3. **Uwierzytelnianie**:
   - Logowanie przez konto Google (OAuth popup).
   - Logowanie i rejestracja adresem e-mail i hasłem.
   - Tryb gościa / demo dla szybkiego przetestowania bez natychmiastowego logowania.

---

## 🚀 Uruchomienie lokalne

1. **Zainstaluj zależności**:
   ```bash
   npm install
   ```

2. **Uruchom serwer developerski**:
   ```bash
   npm run dev
   ```

3. **Budowanie produkcyjne**:
   ```bash
   npm run build
   ```

---

## 🛠️ Technologie
- **React 18** + **Vite**
- **Tailwind CSS**
- **Firebase SDK v10/v11** (Auth & Firestore)
- **Lucide React** (ikony)
- **date-fns** (obsługa dat w języku polskim)
