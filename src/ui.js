const authView = document.getElementById('auth-view')
const chatView = document.getElementById('chat-view')
const userDisplay = document.getElementById('user-display')
const emptyState = document.getElementById('empty-state')
const chatSection = document.getElementById('chat-section')
const chatTitle = document.getElementById('chat-title')
const messagesList = document.getElementById('messages-list')
const usersList = document.getElementById('users-list')
const chatsList = document.getElementById('chats-list')

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

export function showMessages(title) {
  emptyState.style.display = 'none'
  chatSection.style.display = 'flex'
  chatTitle.textContent = title
}

export function hideMessages() {
  emptyState.style.display = 'flex'
  chatSection.style.display = 'none'
  messagesList.innerHTML = ''
}

export function appendMessage(text, isOwn, timestamp) {
  const row = document.createElement('div')
  row.className = `msg-row ${isOwn ? 'msg-own' : 'msg-other'}`
  const bubble = document.createElement('span')
  bubble.className = `bubble ${isOwn ? 'bubble-own' : 'bubble-other'}`
  bubble.textContent = text
  if (timestamp) {
    const time = document.createElement('span')
    time.className = 'msg-time'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    time.textContent = new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date)
    bubble.appendChild(time)
  }
  row.appendChild(bubble)
  messagesList.appendChild(row)
  messagesList.scrollTop = messagesList.scrollHeight
}

export function clearMessages() {
  messagesList.innerHTML = ''
}

export function renderUserList(users, currentUid, onSelect) {
  usersList.innerHTML = ''
  users
    .filter(u => u.uid !== currentUid)
    .forEach(user => {
      const item = document.createElement('div')
      item.className = 'user-item'
      item.textContent = user.displayName || user.email
      item.addEventListener('click', () => onSelect(user))
      usersList.appendChild(item)
    })
}

export function renderChatList(chats, userMap, currentUid, onSelect) {
  chatsList.innerHTML = ''
  chats.forEach(chat => {
    const otherUid = chat.members.find(uid => uid !== currentUid)
    const otherUser = userMap[otherUid]
    const name = otherUser?.displayName || otherUser?.email || otherUid

    const item = document.createElement('div')
    item.className = 'chat-item'

    const nameEl = document.createElement('div')
    nameEl.className = 'chat-item-name'
    nameEl.textContent = name

    const lastEl = document.createElement('div')
    lastEl.className = 'chat-item-last'
    lastEl.textContent = chat.lastMessage || 'Sin mensajes'

    item.appendChild(nameEl)
    item.appendChild(lastEl)
    item.addEventListener('click', () => onSelect(chat, name))
    chatsList.appendChild(item)
  })
}
