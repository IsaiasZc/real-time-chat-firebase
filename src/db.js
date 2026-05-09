import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import app from './firebase.js'

// Data model:
// users/{uid}                     { displayName, email, createdAt }
// chats/{chatId}                  { members: [uid1, uid2], lastMessage, updatedAt }
// chats/{chatId}/messages/{msgId} { text, senderId, createdAt }

export const db = getFirestore(app)

export function createUserProfile(uid, data) {
  const ref = doc(db, 'users', uid)
  return setDoc(ref, {
    displayName: data.displayName ?? data.email,
    email: data.email,
    createdAt: serverTimestamp(),
  })
}
