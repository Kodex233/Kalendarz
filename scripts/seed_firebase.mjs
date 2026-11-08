import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCt4Y0K_E5OmEiqZvRb8UELose64hm0htE",
  authDomain: "kalendarz-d284f.firebaseapp.com",
  projectId: "kalendarz-d284f",
  storageBucket: "kalendarz-d284f.firebasestorage.app",
  messagingSenderId: "55700214296",
  appId: "1:55700214296:web:f826375ffa5ddf9796296d",
  measurementId: "G-FNEGJ3D1KZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  console.log("Łączenie z Firebase Firestore...");
  
  // Wyczyść stare testowe dokumenty jeśli istnieją
  const existingSnap = await getDocs(collection(db, "events"));
  for (const docItem of existingSnap.docs) {
    await deleteDoc(doc(db, "events", docItem.id));
  }
  console.log(`Usunięto ${existingSnap.size} starych dokumentów, przygotowuję czysty zestaw danych.`);

  // 1. Wydarzenia Kodexa (Twój kalendarz)
  const myEvents = [
    {
      title: "Spotkanie projektowe",
      date: "2026-11-08",
      startTime: "10:30",
      endTime: "11:30",
      color: "blue",
      customBg: "#1a73e8",
      calendarId: "kodex",
      description: "Omówienie harmonogramu i terminów z zespołem",
      isExchangeable: true,
      userId: "user-kodex",
      userName: "Kodex",
      userEmail: "kodex233@gmail.com"
    },
    {
      title: "Zarządzanie infrastrukturą Cloud",
      date: "2026-11-10",
      startTime: "09:00",
      endTime: "10:30",
      color: "blue",
      customBg: "#1a73e8",
      calendarId: "kodex",
      description: "Przegląd logów i wydajności bazy Firebase",
      isExchangeable: true,
      userId: "user-kodex",
      userName: "Kodex",
      userEmail: "kodex233@gmail.com"
    },
    {
      title: "Dyżur helpdesk - Kodex",
      date: "2026-11-12",
      startTime: "12:00",
      endTime: "15:00",
      color: "blue",
      customBg: "#1a73e8",
      calendarId: "kodex",
      description: "Dyżur czwartkowy - chętnie wymienię się z Jankiem na piątek",
      isExchangeable: true,
      userId: "user-kodex",
      userName: "Kodex",
      userEmail: "kodex233@gmail.com"
    }
  ];

  // 2. Cały kalendarz kolegi (Kolega Janek) - widoczny w całości!
  const friendEvents = [
    {
      title: "Konsultacje semestralne - Kolega Janek",
      date: "2026-11-10",
      startTime: "12:00",
      endTime: "13:30",
      color: "yellow",
      customBg: "#f6bf26",
      calendarId: "inne",
      description: "Konsultacje ze studentami w sali 204. Otwarty termin do wymiany.",
      isExchangeable: true,
      userId: "friend-janek",
      userName: "Kolega Janek",
      userEmail: "janek@firma.pl"
    },
    {
      title: "Dyżur poranny - Kolega Janek",
      date: "2026-11-09",
      startTime: "08:00",
      endTime: "11:00",
      color: "teal",
      customBg: "#00897b",
      calendarId: "inne",
      description: "Dyżur techniczny poniedziałek",
      isExchangeable: true,
      userId: "friend-janek",
      userName: "Kolega Janek",
      userEmail: "janek@firma.pl"
    },
    {
      title: "Warsztaty frontend - Kolega Janek",
      date: "2026-11-11",
      startTime: "14:00",
      endTime: "16:00",
      color: "purple",
      customBg: "#8e24aa",
      calendarId: "inne",
      description: "Prezentacja komponentów i architektury",
      isExchangeable: true,
      userId: "friend-janek",
      userName: "Kolega Janek",
      userEmail: "janek@firma.pl"
    },
    {
      title: "Dyżur piątkowy - Kolega Janek",
      date: "2026-11-13",
      startTime: "10:00",
      endTime: "13:00",
      color: "red",
      customBg: "#e67c73",
      calendarId: "inne",
      description: "Dyżur weekendowy support",
      isExchangeable: true,
      userId: "friend-janek",
      userName: "Kolega Janek",
      userEmail: "janek@firma.pl"
    }
  ];

  const allEvents = [...myEvents, ...friendEvents];
  for (const ev of allEvents) {
    const docRef = await addDoc(collection(db, "events"), {
      ...ev,
      roomCode: "kodex",
      createdAt: serverTimestamp()
    });
    console.log(`✓ Dodano do Firebase: ${ev.title} (ID: ${docRef.id}, Użytkownik: ${ev.userName})`);
  }

  // Utwórz pokój kodex z kodem PIN 1234 (tylko prawdziwy gospodarz, znajomi pojawiają się po dołączeniu)
  await setDoc(doc(db, "calendar_rooms", "kodex"), {
    roomCode: "kodex",
    pin: "1234",
    hostName: "Kodex",
    participants: ["Kodex"],
    updatedAt: serverTimestamp()
  }, { merge: true });

  console.log(`\nSukces! Pokój 'kodex' (PIN: 1234) i ${allEvents.length} wydarzeń zapisano w Firebase Firestore.`);
  process.exit(0);
}

main().catch(err => {
  console.error("Błąd seedowania Firebase:", err);
  process.exit(1);
});
