# 📅 Kalendarz - Aplikacja à la Google Calendar z wymianą terminów (Dark Mode)

Nowoczesny kalendarz webowy w wiernym stylu **Google Calendar Dark Mode**, wzbogacony o dedykowaną funkcję **wymiany terminów ze znajomymi** (spotkań, dyżurów, terminów wizyt lub konsultacji).

Aplikacja jest zintegrowana z chmurą **Google Firebase**:
- **Baza danych**: Cloud Firestore (aktualizacje w czasie rzeczywistym `onSnapshot`, transakcje atomowe `runTransaction` przy zamianie terminów)
- **Autoryzacja**: Firebase Authentication (Google Sign-In oraz E-mail / Hasło)
- **Projekt Firebase**: `kalendarz-d284f`

---

## ✨ Kluczowe funkcjonalności

1. **Google Calendar Dark Mode**:
   - Pełny ciemny motyw (`#1f1f1f` / `#282a2d`) z dokładnym odwzorowaniem palety kolorów Google.
   - Pasek boczny z interaktywnym mini-kalendarzem do szybkiej nawigacji po datach.
   - Nowy przycisk **`+ Utwórz ▾`** z mniejszym zaokrągleniem (`rounded-2xl`), białym plusem oraz rozwijanym menu:
     - *Wydarzenie*
     - *Zadanie*
     - *Harmonogram spotkań*

2. **Zarządzanie kalendarzami**:
   - **Zwijane sekcje ze strzałkami**: *Moje kalendarze* oraz *Inne kalendarze*.
   - **Duże kolorowe ticki**: powiększone checkboxy (`w-5 h-5`) z indywidualnymi kolorami tła (`kodex`, `Familijne`, `Lista zadań`, `Urodziny`, `Święta w Polsce`).
   - **Menu 3 kropek (⋮)** po najechaniu na kalendarz:
     - *Wyświetl tylko ten* (izolacja widoku)
     - *Ustawienia i udostępnianie*
     - **Paleta 24 oficjalnych kolorów Google Calendar** + próbnik własnego koloru (`+`).
   - **Przycisk usuwania (✕)**: szybkie usunięcie kalendarza z listy po najechaniu kursorem.
   - Dodawanie własnych kalendarzy przyciskiem `+` w sekcji *Inne kalendarze*.

3. **Giełda terminów (Wymiana ze znajomym)**:
   - Opcja oznaczenia dowolnego terminu jako `Udostępnij na wymianę ze znajomym`.
   - Moduł propozycji wymiany: wybierasz swój termin i wskazujesz termin kolegi, który chcesz otrzymać.
   - Odbiorca propozycji widzi porównanie obu terminów i może jednym kliknięciem zaakceptować lub odrzucić zamianę.
   - **Atomowa transakcja Firestore**: Po akceptacji terminy i godziny zostają automatycznie zamienione w bazie bez ryzyka konfliktów.

4. **Uwierzytelnianie**:
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
- **Tailwind CSS (Dark Mode)**
- **Firebase SDK v10/v11** (Auth & Firestore)
- **Lucide React** (ikony)
- **date-fns** (obsługa dat w języku polskim)
