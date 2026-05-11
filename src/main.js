import { register, login, logout, onAuthChange } from './auth.js'
import { createUserProfile, createChat, sendMessage, listenMessages } from './db.js'

const authView = document.getElementById('auth-view')
const appView = document.getElementById('app-view')
const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const loginBtn = document.getElementById('btn-login')
const registerBtn = document.getElementById('btn-register')
const logoutBtn = document.getElementById('btn-logout')
const userDisplay = document.getElementById('user-display')
const uidDisplay = document.getElementById('uid-display')
const errorMsg = document.getElementById('error-msg')

const otherUidInput = document.getElementById('other-uid')
const startChatBtn = document.getElementById('btn-start-chat')
const chatSection = document.getElementById('chat-section')
const chatTitle = document.getElementById('chat-title')
const messagesList = document.getElementById('messages-list')
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
  messagesList.innerHTML = ''

  activeChatId = await createChat(currentUser.uid, otherUid)
  chatTitle.textContent = `Chat: ${activeChatId}`
  chatSection.style.display = 'block'

  unsubscribeMessages = listenMessages(activeChatId, (messages) => {
    messagesList.innerHTML = ''
    messages.forEach(msg => {
      const isOwn = msg.senderId === currentUser.uid
      const row = document.createElement('div')
      row.className = `msg-row ${isOwn ? 'msg-own' : 'msg-other'}`
      const bubble = document.createElement('span')
      bubble.className = `bubble ${isOwn ? 'bubble-own' : 'bubble-other'}`
      bubble.textContent = msg.text
      row.appendChild(bubble)
      messagesList.appendChild(row)
    })
    messagesList.scrollTop = messagesList.scrollHeight
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
    authView.style.display = 'none'
    appView.style.display = 'block'
    userDisplay.textContent = user.email
    uidDisplay.textContent = `UID: ${user.uid}`
    chatSection.style.display = 'none'
    stopListening()
  } else {
    authView.style.display = 'block'
    appView.style.display = 'none'
    stopListening()
  }
})
