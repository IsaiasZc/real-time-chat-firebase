// App flow:
// 1. Load → onAuthChange fires
// 2. No user → showAuthView()
// 3. User logged in → showChatView() → load users + listen chats
// 4. Click user → getOrCreateChat → listenMessages → appendMessage
// 5. sendMessage → Firestore → onSnapshot → UI updates

import { register, login, logout, onAuthChange } from './auth.js'
import { createUserProfile, getAllUsers, getOrCreateChat, listenUserChats, sendMessage, listenMessages } from './db.js'
import { showAuthView, showChatView, setUserInfo, showMessages, hideMessages, appendMessage, clearMessages, renderUserList, renderChatList } from './ui.js'

const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const loginBtn = document.getElementById('btn-login')
const registerBtn = document.getElementById('btn-register')
const logoutBtn = document.getElementById('btn-logout')
const errorMsg = document.getElementById('error-msg')
const messageInput = document.getElementById('message-input')
const sendBtn = document.getElementById('btn-send')

const ERROR_MESSAGES = {
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/email-already-in-use': 'Email ya registrado.',
  'auth/invalid-email': 'Email inválido.',
  'auth/weak-password': 'Contraseña muy débil (mínimo 6 caracteres).',
  'auth/user-not-found': 'Usuario no encontrado.',
  'auth/wrong-password': 'Contraseña incorrecta.',
}

function showError(code) {
  errorMsg.textContent = ERROR_MESSAGES[code] ?? 'Error desconocido. Intenta de nuevo.'
}

function clearError() {
  errorMsg.textContent = ''
}

function setLoading(btn, loading) {
  btn.disabled = loading
}

let currentUser = null
let activeChatId = null
let userMap = {}
let unsubscribeMessages = null
let unsubscribeChats = null

function stopListeningMessages() {
  if (unsubscribeMessages) {
    unsubscribeMessages()
    unsubscribeMessages = null
  }
}

function stopListeningChats() {
  if (unsubscribeChats) {
    unsubscribeChats()
    unsubscribeChats = null
  }
}

function openChat(chatId, title) {
  stopListeningMessages()
  clearMessages()
  activeChatId = chatId
  showMessages(title)
  unsubscribeMessages = listenMessages(chatId, ({ type, msg }) => {
    if (type === 'added') {
      appendMessage(msg.text, msg.senderId === currentUser.uid, msg.createdAt)
    }
  })
}

loginBtn.addEventListener('click', async () => {
  clearError()
  const email = emailInput.value.trim()
  const password = passwordInput.value
  if (!email || !password) return
  setLoading(loginBtn, true)
  try {
    await login(email, password)
  } catch (err) {
    showError(err.code)
  } finally {
    setLoading(loginBtn, false)
  }
})

registerBtn.addEventListener('click', async () => {
  clearError()
  const email = emailInput.value.trim()
  const password = passwordInput.value
  if (!email || !password) return
  setLoading(registerBtn, true)
  try {
    const { user } = await register(email, password)
    await createUserProfile(user.uid, { email: user.email })
  } catch (err) {
    showError(err.code)
  } finally {
    setLoading(registerBtn, false)
  }
})

logoutBtn.addEventListener('click', () => {
  stopListeningMessages()
  stopListeningChats()
  logout()
})

sendBtn.addEventListener('click', async () => {
  const text = messageInput.value.trim()
  if (!text || !activeChatId || !currentUser) return
  messageInput.value = ''
  await sendMessage(activeChatId, currentUser.uid, text)
})

messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendBtn.click()
})

onAuthChange(async (user) => {
  currentUser = user
  if (user) {
    setUserInfo(user.email)
    showChatView()
    hideMessages()

    const users = await getAllUsers()
    userMap = Object.fromEntries(users.map(u => [u.uid, u]))
    renderUserList(users, user.uid, async (selectedUser) => {
      const chatId = await getOrCreateChat(user.uid, selectedUser.uid)
      const title = selectedUser.displayName || selectedUser.email
      openChat(chatId, title)
    })

    stopListeningChats()
    unsubscribeChats = listenUserChats(user.uid, (chats) => {
      renderChatList(chats, userMap, user.uid, (chat, title) => {
        openChat(chat.id, title)
      })
    })
  } else {
    stopListeningMessages()
    stopListeningChats()
    showAuthView()
  }
})
