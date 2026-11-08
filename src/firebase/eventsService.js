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
  runTransaction
} from "firebase/firestore";
import { db } from "./config";

const EVENTS_COLLECTION = "events";
const EXCHANGES_COLLECTION = "exchanges";
const ROOMS_COLLECTION = "calendar_rooms";

/**
 * Utwórz lub zaktualizuj pokój współdzielonego kalendarza (PIN, link, uczestnicy)
 */
export const createOrUpdateRoom = async (roomCode, { pin, hostName, participants = [] }) => {
  const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
  await setDoc(roomRef, {
    roomCode,
    pin: String(pin),
    hostName: hostName || 'Kodex',
    participants: participants.length > 0 ? participants : [hostName || 'Kodex'],
    updatedAt: serverTimestamp()
  }, { merge: true });
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
 * Dołącz do pokoju jako uczestnik
 */
export const joinRoom = async (roomCode, participantName) => {
  const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) {
    throw new Error('Pokój o podanym kodzie nie istnieje.');
  }
  const data = snap.data();
  const currentParticipants = data.participants || [];
  if (!currentParticipants.includes(participantName)) {
    await updateDoc(roomRef, {
      participants: [...currentParticipants, participantName],
      updatedAt: serverTimestamp()
    });
  }
  return data;
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
  if (eventData.id && !eventData.id.startsWith('demo-')) {
    const ref = doc(db, EVENTS_COLLECTION, eventData.id);
    await setDoc(ref, {
      ...eventData,
      roomCode,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return eventData.id;
  } else {
    const cleanData = { ...eventData };
    delete cleanData.id;
    const ref = await addDoc(collection(db, EVENTS_COLLECTION), {
      ...cleanData,
      roomCode,
      createdAt: serverTimestamp()
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
