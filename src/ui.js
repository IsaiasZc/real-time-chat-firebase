const authView = document.getElementById('auth-view')
const chatView = document.getElementById('chat-view')
const userDisplay = document.getElementById('user-display')
const emptyState = document.getElementById('empty-state')
const chatSection = document.getElementById('chat-section')
const chatTitle = document.getElementById('chat-title')
const messagesList = document.getElementById('messages-list')

export function showAuthView() {
  authView.style.display = 'flex'
  chatView.style.display = 'none'
}

export function showChatView() {
  authView.style.display = 'none'
  chatView.style.display = 'grid'
}

export function setUserInfo(email) {
  userDisplay.textContent = email
}

export function showMessages(chatId) {
  emptyState.style.display = 'none'
  chatSection.style.display = 'flex'
  chatTitle.textContent = chatId
}

export function hideMessages() {
  emptyState.style.display = 'flex'
  chatSection.style.display = 'none'
  messagesList.innerHTML = ''
}

export function appendMessage(text, isOwn) {
  const row = document.createElement('div')
  row.className = `msg-row ${isOwn ? 'msg-own' : 'msg-other'}`
  const bubble = document.createElement('span')
  bubble.className = `bubble ${isOwn ? 'bubble-own' : 'bubble-other'}`
  bubble.textContent = text
  row.appendChild(bubble)
  messagesList.appendChild(row)
  messagesList.scrollTop = messagesList.scrollHeight
}

export function clearMessages() {
  messagesList.innerHTML = ''
}
