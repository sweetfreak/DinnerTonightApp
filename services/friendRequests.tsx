import { db } from "../firebase/firebaseConfig";
import { doc, writeBatch, arrayUnion, arrayRemove } from "firebase/firestore";

export async function sendFriendRequest(fromUserId: string, toUserId: string) {
  const batch = writeBatch(db);
  
  const fromRef = doc(db, "users", fromUserId);
  const toRef = doc(db, "users", toUserId);
  
  batch.update(fromRef, {
    friendRequestsSent: arrayUnion(toUserId),
  });
  
  batch.update(toRef, {
    friendRequestsReceived: arrayUnion(fromUserId),
  });
  
  await batch.commit();
}

export async function acceptFriendRequest(currentUserId: string, requesterId: string) {
  const batch = writeBatch(db);
  
  const currentRef = doc(db, "users", currentUserId);
  const requesterRef = doc(db, "users", requesterId);
  
  batch.update(currentRef, {
    friends: arrayUnion(requesterId),
    friendRequestsReceived: arrayRemove(requesterId),
  });
  
  batch.update(requesterRef, {
    friends: arrayUnion(currentUserId),
    friendRequestsSent: arrayRemove(currentUserId),
  });
  
  await batch.commit();
}

export async function declineFriendRequest(currentUserId: string, requesterId: string) {
  const batch = writeBatch(db);
  
  const currentRef = doc(db, "users", currentUserId);
  const requesterRef = doc(db, "users", requesterId);
  
  batch.update(currentRef, {
    friendRequestsReceived: arrayRemove(requesterId),
  });
  
  batch.update(requesterRef, {
    friendRequestsSent: arrayRemove(currentUserId),
  });
  
  await batch.commit();
}