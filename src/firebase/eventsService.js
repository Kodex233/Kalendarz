import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
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
