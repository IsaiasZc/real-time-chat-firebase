# Overview

One of the most useful skills in software development today is knowing how to work with cloud databases. They offer a fast and scalable way to store data without managing your own infrastructure, so you can focus on building the actual app. To learn how this works in practice, I decided to build a simple chat application using Firebase.

This is a real-time chat app where users can sign up, log in, and talk with other users. Authentication uses email and password, and both user information and conversations are stored in Firestore. The app works from any browser, and messages appear instantly — no page refresh needed.

**To use it**: register an account at the live URL, pick any user from the list, and start chatting. Messages show the sender's name and a timestamp.

My goal was to understand how cloud databases fit into a real web app — and how Firebase tools like authentication, Firestore, and hosting work together. I also wanted to practice organizing JavaScript code in modules without using a framework.

[Firebase Demo Video](https://youtu.be/sCditsf1dA4)
[Live Demo](https://fir-chat-faa3a.web.app)

# Cloud Database

This app uses **Firebase Firestore** — a NoSQL document database hosted on Google. Firestore supports real-time listeners, meaning the UI updates automatically whenever data changes in the database, without to do any manual fetch calls.

**Database structure:**

```
users/{uid}
    displayName: string
    email: string
    createdAt: timestamp

chats/{chatId}
    members: [uid1, uid2]
    lastMessage: string
    updatedAt: timestamp

chats/{chatId}/messages/{msgId}
    text: string
    senderId: uid
    createdAt: serverTimestamp()
```

Each chat document stores the two participant UIDs. Messages are a subcollection under their parent chat, ordered by `createdAt` using Firestore's `serverTimestamp()` to use consistent ordering across clients.

# Development Environment

- **Editor:** Visual Studio Code
- **Version control:** Git / GitHub
- **Package manager:** pnpm
- **Build tool:** Vite — handles env variable injection and bundles output to `public/` for Firebase Hosting
- **Deployment:** Firebase CLI (`firebase deploy`)

**Language and libraries:**

- Vanilla JavaScript (ES modules, no framework)
- Firebase SDK v12 (modular) — `firebase/auth`, `firebase/firestore`, `firebase/app`
- Basecoat CSS for minimal styling
- Vite for local dev server and production build

# Useful Websites

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Get Started](https://firebase.google.com/docs/firestore/quickstart)
- [Firebase Auth Guide](https://firebase.google.com/docs/auth/web/start)
- [Vite Documentation](https://vitejs.dev/guide/)
- [MDN Web Docs — JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

# Future Work

- Add group chat support (more than two members per chat)
- Show online/offline presence indicators for each user
- Support image and file attachments in messages
- Add message read receipts
- Improve Firestore security rules to validate message content server-side
- Fix UI bugs and add loading states for better UX
