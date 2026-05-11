import {
  getFirestore, doc, setDoc, getDoc, addDoc, getDocs,
  collection, query, where, orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore'
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

// Deterministic chatId: sorted UIDs joined by '_' → same chat always found
export async function createChat(uid1, uid2) {
  const chatId = [uid1, uid2].sort().join('_')
  const ref = doc(db, 'chats', chatId)
  const existing = await getDoc(ref)
  if (!existing.exists()) {
    await setDoc(ref, {
      members: [uid1, uid2],
      lastMessage: '',
      updatedAt: serverTimestamp(),
    })
  }
  return chatId
}

export async function getUserChats(uid) {
  const q = query(collection(db, 'chats'), where('members', 'array-contains', uid))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export function sendMessage(chatId, senderId, text) {
  return addDoc(collection(db, 'chats', chatId, 'messages'), {
    text,
    senderId,
    createdAt: serverTimestamp(),
  })
}

// Returns unsubscribe function — call it to stop listening
export function listenMessages(chatId, callback) {
  const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}
