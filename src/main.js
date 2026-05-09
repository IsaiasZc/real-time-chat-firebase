import { register, login, logout, onAuthChange } from './auth.js'
import { createUserProfile } from './db.js'

const authView = document.getElementById('auth-view')
const appView = document.getElementById('app-view')
const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const loginBtn = document.getElementById('btn-login')
const registerBtn = document.getElementById('btn-register')
const logoutBtn = document.getElementById('btn-logout')
const userDisplay = document.getElementById('user-display')
const errorMsg = document.getElementById('error-msg')

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

logoutBtn.addEventListener('click', () => logout())

onAuthChange((user) => {
  if (user) {
    authView.style.display = 'none'
    appView.style.display = 'block'
    userDisplay.textContent = user.email
  } else {
    authView.style.display = 'block'
    appView.style.display = 'none'
  }
})
