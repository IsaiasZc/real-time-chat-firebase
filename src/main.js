// App flow:
// 1. Load → onAuthChange fires
// 2. No user → showAuthView()
// 3. User logged in → showChatView() → sidebar ready
// 4. Enter UID → createChat → listenMessages → appendMessage
// 5. sendMessage → Firestore → onSnapshot → UI updates

import { register, login, logout, onAuthChange } from './auth.js'
import { createUserProfile, createChat, sendMessage, listenMessages } from './db.js'
import { showAuthView, showChatView, setUserInfo, showMessages, hideMessages, appendMessage, clearMessages } from './ui.js'

const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const loginBtn = document.getElementById('btn-login')
const registerBtn = document.getElementById('btn-register')
const logoutBtn = document.getElementById('btn-logout')
const errorMsg = document.getElementById('error-msg')
const otherUidInput = document.getElementById('other-uid')
const startChatBtn = document.getElementById('btn-start-chat')
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
let unsubscribeMessages = null

function stopListening() {
  if (unsubscribeMessages) {
    unsubscribeMessages()
    unsubscribeMessages = null
  }
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
  stopListening()
  logout()
})

startChatBtn.addEventListener('click', async () => {
  const otherUid = otherUidInput.value.trim()
  if (!otherUid || !currentUser) return

  stopListening()
  clearMessages()

  activeChatId = await createChat(currentUser.uid, otherUid)
  showMessages(activeChatId)

  unsubscribeMessages = listenMessages(activeChatId, (messages) => {
    clearMessages()
    messages.forEach(msg => {
      appendMessage(msg.text, msg.senderId === currentUser.uid)
    })
  })
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

onAuthChange((user) => {
  currentUser = user
  if (user) {
    setUserInfo(user.email)
    showChatView()
    stopListening()
    hideMessages()
  } else {
    showAuthView()
    stopListening()
  }
})
