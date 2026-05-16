import {
  getFirestore, doc, setDoc, getDoc, addDoc, getDocs, updateDoc,
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

export function getAllUsers() {
  return getDocs(collection(db, 'users')).then(snap =>
    snap.docs.map(d => ({ uid: d.id, ...d.data() }))
  )
}

// Deterministic chatId: sorted UIDs joined by '_' = same chat always found
export async function getOrCreateChat(uid1, uid2) {
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

export function listenUserChats(uid, callback) {
  const q = query(
    collection(db, 'chats'),
    where('members', 'array-contains', uid),
    orderBy('updatedAt', 'desc')
  )
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export async function sendMessage(chatId, senderId, text) {
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    text,
    senderId,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: text,
    updatedAt: serverTimestamp(),
  })
}

// Returns unsubscribe function — call it to stop listening
// Uses docChanges() to only process new/modified/removed docs instead of full list
export function listenMessages(chatId, callback) {
  const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt'))
  return onSnapshot(q, (snap) => {
    snap.docChanges().forEach(change => {
      callback({ type: change.type, msg: { id: change.doc.id, ...change.doc.data() } })
    })
  })
}
