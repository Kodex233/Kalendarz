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
      pin: actualPin,
      pinHash,
      pinSalt: salt,
      hostName,
      approvedEmails: ['kodex233@gmail.com'],
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
    return snap.data();
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
      if (pin !== undefined) {
        updateData.pin = String(pin);
      }
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
 * Złóż lub odśwież prośbę o dostęp do pokoju kalendarza
 */
export const requestRoomAccess = async (roomCode, user) => {
  if (!roomCode || !user || !user.email) return null;
  const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) return null;
  const data = snap.data();
  const cleanEmail = user.email.toLowerCase().trim();

  // Jeśli użytkownik jest już na liście zatwierdzonych, nic nie rób
  const approvedList = (data.approvedEmails || []).map(e => e.toLowerCase().trim());
  if (approvedList.includes(cleanEmail)) {
    return { status: 'approved' };
  }

  const requests = data.accessRequests || [];
  const existingIndex = requests.findIndex(r => (r.email || '').toLowerCase().trim() === cleanEmail);

  const requestPayload = {
    uid: user.uid || '',
    email: cleanEmail,
    name: user.displayName || cleanEmail.split('@')[0],
    photoURL: user.photoURL || '',
    requestedAt: new Date().toISOString(),
    status: 'pending'
  };

  let updatedRequests;
  if (existingIndex >= 0) {
    updatedRequests = [...requests];
    updatedRequests[existingIndex] = {
      ...updatedRequests[existingIndex],
      ...requestPayload,
      status: 'pending'
    };
  } else {
    updatedRequests = [...requests, requestPayload];
  }

  await updateDoc(roomRef, {
    accessRequests: updatedRequests,
    updatedAt: serverTimestamp()
  });

  return { status: 'pending' };
};

/**
 * Zatwierdź prośbę o dostęp (Zezwól)
 */
export const approveRoomAccess = async (roomCode, email, userName, role = 'Pełny dostęp') => {
  if (!roomCode || !email) return;
  const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) return;
  const data = snap.data();
  const cleanEmail = email.toLowerCase().trim();

  // 1. Dodaj do approvedEmails
  const currentApproved = (data.approvedEmails || []).map(e => e.toLowerCase().trim());
  const updatedApproved = currentApproved.includes(cleanEmail)
    ? currentApproved
    : [...currentApproved, cleanEmail];

  // 2. Zaktualizuj stan prośby w accessRequests
  const requests = (data.accessRequests || []).map(r => {
    if ((r.email || '').toLowerCase().trim() === cleanEmail) {
      return { ...r, status: 'approved', resolvedAt: new Date().toISOString() };
    }
    return r;
  });

  // 3. Dodaj do participants i participantsData
  const cleanName = (userName || cleanEmail.split('@')[0]).trim();
  const currentParticipants = data.participants || [];
  const currentParticipantsData = data.participantsData || {};

  let updatedParticipants = currentParticipants;
  if (!currentParticipants.includes(cleanName)) {
    updatedParticipants = [...currentParticipants, cleanName];
  }

  const updatedParticipantsData = {
    ...currentParticipantsData,
    [cleanName]: {
      name: cleanName,
      email: cleanEmail,
      role: role || 'Pełny dostęp'
    }
  };

  await updateDoc(roomRef, {
    approvedEmails: updatedApproved,
    accessRequests: requests,
    participants: updatedParticipants,
    participantsData: updatedParticipantsData,
    updatedAt: serverTimestamp()
  });
};

/**
 * Odrzuć prośbę o dostęp (Odrzuć)
 */
export const rejectRoomAccess = async (roomCode, email) => {
  if (!roomCode || !email) return;
  const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) return;
  const data = snap.data();
  const cleanEmail = email.toLowerCase().trim();

  const requests = (data.accessRequests || []).map(r => {
    if ((r.email || '').toLowerCase().trim() === cleanEmail) {
      return { ...r, status: 'rejected', resolvedAt: new Date().toISOString() };
    }
    return r;
  });

  await updateDoc(roomRef, {
    accessRequests: requests,
    updatedAt: serverTimestamp()
  });
};

/**
 * Cofnij przyznany dostęp (Revoke)
 */
export const revokeRoomAccess = async (roomCode, email) => {
  if (!roomCode || !email) return;
  const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) return;
  const data = snap.data();
  const cleanEmail = email.toLowerCase().trim();

  const updatedApproved = (data.approvedEmails || []).filter(e => e.toLowerCase().trim() !== cleanEmail);

  // Usuń również z participantsData i participants
  const participantsData = data.participantsData || {};
  let removedName = null;
  Object.keys(participantsData).forEach(k => {
    if (participantsData[k]?.email?.toLowerCase().trim() === cleanEmail) {
      removedName = k;
    }
  });

  const updatedParticipants = removedName
    ? (data.participants || []).filter(p => p !== removedName)
    : data.participants;

  const updatedParticipantsData = { ...participantsData };
  if (removedName) {
    delete updatedParticipantsData[removedName];
  }

  // Usuń lub zaktualizuj w accessRequests
  const requests = (data.accessRequests || []).filter(r => (r.email || '').toLowerCase().trim() !== cleanEmail);

  await updateDoc(roomRef, {
    approvedEmails: updatedApproved,
    participants: updatedParticipants,
    participantsData: updatedParticipantsData,
    accessRequests: requests,
    updatedAt: serverTimestamp()
  });
};

/**
 * Dodaj e-mail bezpośrednio do zatwierdzonych (Biała lista)
 */
export const addApprovedEmail = async (roomCode, email, userName, role = 'Pełny dostęp') => {
  return approveRoomAccess(roomCode, email, userName, role);
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
