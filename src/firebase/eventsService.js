import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  setDoc,
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  orderBy,
  runTransaction,
  deleteField
} from "firebase/firestore";
import { db } from "./config";
import { generatePinSalt, hashPin, generateSecurePin } from "../utils/security";

const EVENTS_COLLECTION = "events";
const EXCHANGES_COLLECTION = "exchanges";
const ROOMS_COLLECTION = "calendar_rooms";

/**
 * Zapewnij, że pokój istnieje w Firestore z bezpiecznym kryptograficznym hashem (PBKDF2)
 * Czysty PIN NIGDY nie jest przetrzymywany w bazie Firestore, dzięki czemu żadna wtyczka
 * ani skrypt zewnętrzny nie może go odczytać.
 */
export const ensureRoom = async (roomCode, { pin, hostName = 'Kodex' }) => {
  const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
  const snap = await getDoc(roomRef);
  const actualPin = pin || generateSecurePin();
  const salt = generatePinSalt();
  const pinHash = await hashPin(actualPin, salt);

  if (!snap.exists()) {
    const initialData = {
      roomCode,
      pinHash,
      pinSalt: salt,
      hostName,
      participants: [hostName],
      participantsData: {
        'Kodex': { name: 'Kodex', role: 'Właściciel', email: 'kodex233@gmail.com' }
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(roomRef, initialData);
    return { ...initialData, plainPin: actualPin };
  } else {
    const existing = snap.data();
    // Migracja / ulepszenie bezpieczeństwa: jeśli w bazie jest jeszcze czysty pin lub brak hasha
    if (!existing.pinHash || existing.pin) {
      const pinToHash = pin || existing.pin || actualPin;
      const newSalt = generatePinSalt();
      const newHash = await hashPin(pinToHash, newSalt);
      await updateDoc(roomRef, {
        pinHash: newHash,
        pinSalt: newSalt,
        pin: deleteField(), // Usunięcie czystego tekstu PIN z bazy!
        updatedAt: serverTimestamp()
      });
      return { ...existing, pinHash: newHash, pinSalt: newSalt, plainPin: pinToHash };
    }
    return existing;
  }
};

/**
 * Utwórz lub zaktualizuj pokój współdzielonego kalendarza (PIN, link, uczestnicy, role)
 * Gdy podany jest nowy PIN, zostaje on zahashowany (PBKDF2-50000), a plain PIN jest usuwany.
 */
export const createOrUpdateRoom = async (roomCode, { pin, hostName, participants, participantsData }) => {
  const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
  const snap = await getDoc(roomRef);

  let pinHash = undefined;
  let pinSalt = undefined;
  if (pin !== undefined && pin !== null) {
    pinSalt = generatePinSalt();
    pinHash = await hashPin(String(pin), pinSalt);
  }

  if (!snap.exists()) {
    const defaultPin = pin || generateSecurePin();
    const defaultSalt = pinSalt || generatePinSalt();
    const defaultHash = pinHash || await hashPin(defaultPin, defaultSalt);

    await setDoc(roomRef, {
      roomCode,
      pinHash: defaultHash,
      pinSalt: defaultSalt,
      hostName: hostName || 'Kodex',
      participants: (participants && participants.length > 0) ? participants : [hostName || 'Kodex'],
      participantsData: participantsData || {
        'Kodex': { name: 'Kodex', role: 'Właściciel', email: 'kodex233@gmail.com' }
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } else {
    const updateData = { updatedAt: serverTimestamp() };
    if (pinHash !== undefined && pinSalt !== undefined) {
      updateData.pinHash = pinHash;
      updateData.pinSalt = pinSalt;
      updateData.pin = deleteField(); // Skasuj plain PIN z Firestore
    }
    if (hostName) updateData.hostName = hostName;
    if (participants !== undefined) updateData.participants = participants;
    if (participantsData !== undefined) updateData.participantsData = participantsData;
    await updateDoc(roomRef, updateData);
  }
  return roomRef;
};

/**
 * Pobierz dane pokoju (weryfikacja PIN)
 */
export const getRoomData = async (roomCode) => {
  const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
  const snap = await getDoc(roomRef);
  if (snap.exists()) {
    return snap.data();
  }
  return null;
};

/**
 * Dołącz do pokoju jako uczestnik i zapisz w Firestore z przypisaną rolą
 */
export const joinRoom = async (roomCode, participantName, participantEmail, initialRole = 'Pełny dostęp') => {
  const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) {
    throw new Error(`Pokój o kodzie "${roomCode}" nie istnieje.`);
  }
  const data = snap.data();
  const currentParticipants = data.participants || [];
  const currentParticipantsData = data.participantsData || {};
  const cleanName = participantName.trim();
  const cleanEmail = participantEmail || `${cleanName.toLowerCase().replace(/\s+/g, '')}@gmail.com`;

  let updatedParticipants = currentParticipants;
  if (!currentParticipants.includes(cleanName)) {
    updatedParticipants = [...currentParticipants, cleanName];
  }

  const existingRole = currentParticipantsData[cleanName]?.role;
  const updatedParticipantsData = {
    ...currentParticipantsData,
    [cleanName]: {
      name: cleanName,
      email: cleanEmail,
      role: existingRole || initialRole
    }
  };

  await updateDoc(roomRef, {
    participants: updatedParticipants,
    participantsData: updatedParticipantsData,
    updatedAt: serverTimestamp()
  });

  return { ...data, participants: updatedParticipants, participantsData: updatedParticipantsData };
};

/**
 * Zaktualizuj listę uczestników i ich role w Firestore
 */
export const updateRoomParticipants = async (roomCode, participants, participantsData) => {
  const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
  const updatePayload = {
    participants,
    updatedAt: serverTimestamp()
  };
  if (participantsData) {
    updatePayload.participantsData = participantsData;
  }
  await updateDoc(roomRef, updatePayload);
};

/**
 * Usuń uczestnika z pokoju w Firestore
 */
export const removeParticipantFromRoom = async (roomCode, participantName) => {
  const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) return;
  const data = snap.data();
  const currentParticipants = data.participants || [];
  const currentParticipantsData = { ...(data.participantsData || {}) };
  delete currentParticipantsData[participantName];

  const updated = currentParticipants.filter(p => p !== participantName);
  await updateDoc(roomRef, {
    participants: updated,
    participantsData: currentParticipantsData,
    updatedAt: serverTimestamp()
  });
};

/**
 * Nasłuchiwanie stanu pokoju w czasie rzeczywistym
 */
export const subscribeToRoom = (roomCode, callback) => {
  const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
  return onSnapshot(roomRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    } else {
      callback(null);
    }
  }, (err) => {
    console.warn('Room subscription error:', err);
  });
};

/**
 * Nasłuchiwanie wydarzeń powiązanych z pokojem w czasie rzeczywistym
 */
export const subscribeToRoomEvents = (roomCode, callback) => {
  const q = query(
    collection(db, EVENTS_COLLECTION),
    where("roomCode", "==", roomCode)
  );

  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    callback(events);
  }, (err) => {
    console.warn('Room events subscription error:', err);
  });
};

/**
 * Zapisz lub zaktualizuj wydarzenie w pokoju
 */
export const saveRoomEvent = async (roomCode, eventData) => {
  const cleanData = {};
  Object.keys(eventData || {}).forEach(k => {
    if (k !== 'id' && eventData[k] !== undefined) {
      cleanData[k] = eventData[k];
    }
  });
  if (!cleanData.calendarId || cleanData.calendarId === 'kodex') {
    cleanData.calendarId = 'kalendarz';
  }
  cleanData.roomCode = roomCode || 'kodex';

  if (eventData.id && !eventData.id.startsWith('demo-') && !eventData.id.startsWith('starter-')) {
    const ref = doc(db, EVENTS_COLLECTION, eventData.id);
    await setDoc(ref, {
      ...cleanData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return eventData.id;
  } else {
    const ref = await addDoc(collection(db, EVENTS_COLLECTION), {
      ...cleanData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return ref.id;
  }
};

/**
 * Rzeczywista natychmiastowa wymiana dwóch terminów w Firebase Firestore
 */
export const swapRoomEventsInFirestore = async (myEv, targetEv, roomCode) => {
  const myDate = myEv.date;
  const myStart = myEv.startTime;
  const myEnd = myEv.endTime;

  const targetDate = targetEv.date;
  const targetStart = targetEv.startTime;
  const targetEnd = targetEv.endTime;

  // Zapisz oba wydarzenia z zamienionymi terminami
  await saveRoomEvent(roomCode, {
    ...myEv,
    date: targetDate,
    startTime: targetStart,
    endTime: targetEnd
  });

  await saveRoomEvent(roomCode, {
    ...targetEv,
    date: myDate,
    startTime: myStart,
    endTime: myEnd
  });
};

/**
 * Real-time subscription to events for a specific user
 */
export const subscribeToUserEvents = (userId, callback, errorCallback) => {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, EVENTS_COLLECTION),
    where("userId", "==", userId)
  );

  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(events);
  }, (error) => {
    console.error("Error subscribing to user events:", error);
    if (errorCallback) errorCallback(error);
  });
};

/**
 * Real-time subscription to public exchangeable slots from other friends
 */
export const subscribeToExchangeableEvents = (currentUserId, callback, errorCallback) => {
  const q = query(
    collection(db, EVENTS_COLLECTION),
    where("isExchangeable", "==", true)
  );

  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(ev => ev.userId !== currentUserId);
    callback(events);
  }, (error) => {
    console.error("Error subscribing to exchangeable events:", error);
    if (errorCallback) errorCallback(error);
  });
};

/**
 * Real-time subscription to exchange proposals
 */
export const subscribeToExchanges = (userEmail, userId, callback, errorCallback) => {
  if (!userEmail && !userId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, EXCHANGES_COLLECTION)
  );

  return onSnapshot(q, (snapshot) => {
    const exchanges = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(ex => 
        ex.fromUserId === userId || 
        ex.toUserId === userId || 
        (userEmail && ex.toUserEmail && ex.toUserEmail.toLowerCase() === userEmail.toLowerCase())
      );
    callback(exchanges);
  }, (error) => {
    console.error("Error subscribing to exchanges:", error);
    if (errorCallback) errorCallback(error);
  });
};

/**
 * Create a new calendar event
 */
export const createEvent = async (eventData) => {
  return await addDoc(collection(db, EVENTS_COLLECTION), {
    ...eventData,
    createdAt: serverTimestamp()
  });
};

/**
 * Update an existing event
 */
export const updateEvent = async (eventId, updateData) => {
  const ref = doc(db, EVENTS_COLLECTION, eventId);
  return await updateDoc(ref, {
    ...updateData,
    updatedAt: serverTimestamp()
  });
};

/**
 * Delete an event
 */
export const deleteEvent = async (eventId) => {
  const ref = doc(db, EVENTS_COLLECTION, eventId);
  return await deleteDoc(ref);
};

/**
 * Propose an exchange of terms between friends
 */
export const proposeExchange = async ({
  myEventId,
  myEventTitle,
  myEventDate,
  myEventTime,
  targetEventId,
  targetEventTitle,
  targetEventDate,
  targetEventTime,
  targetUserId,
  targetUserEmail,
  fromUserId,
  fromUserEmail,
  fromUserName,
  message
}) => {
  return await addDoc(collection(db, EXCHANGES_COLLECTION), {
    myEventId,
    myEventTitle,
    myEventDate,
    myEventTime,
    targetEventId,
    targetEventTitle,
    targetEventDate,
    targetEventTime,
    targetUserId,
    targetUserEmail,
    fromUserId,
    fromUserEmail,
    fromUserName: fromUserName || fromUserEmail,
    message: message || "Czy możemy wymienić się tymi terminami?",
    status: "pending", // pending, accepted, rejected, cancelled
    createdAt: serverTimestamp()
  });
};

/**
 * Accept or reject exchange proposal (performs atomic swap in Firestore)
 */
export const respondToExchange = async (exchangeId, accept, exchange) => {
  const exchangeRef = doc(db, EXCHANGES_COLLECTION, exchangeId);

  if (!accept) {
    return await updateDoc(exchangeRef, {
      status: "rejected",
      resolvedAt: serverTimestamp()
    });
  }

  // Atomically swap the event dates or details
  return await runTransaction(db, async (transaction) => {
    const myDocRef = doc(db, EVENTS_COLLECTION, exchange.myEventId);
    const targetDocRef = doc(db, EVENTS_COLLECTION, exchange.targetEventId);

    const myDoc = await transaction.get(myDocRef);
    const targetDoc = await transaction.get(targetDocRef);

    if (!myDoc.exists() || !targetDoc.exists()) {
      throw new Error("Jeden z wymienianych terminów już nie istnieje!");
    }

    const myData = myDoc.data();
    const targetData = targetDoc.data();

    // Swap date and time between events
    transaction.update(myDocRef, {
      date: targetData.date,
      startTime: targetData.startTime,
      endTime: targetData.endTime,
      updatedAt: serverTimestamp()
    });

    transaction.update(targetDocRef, {
      date: myData.date,
      startTime: myData.startTime,
      endTime: myData.endTime,
      updatedAt: serverTimestamp()
    });

    transaction.update(exchangeRef, {
      status: "accepted",
      resolvedAt: serverTimestamp()
    });
  });
};
