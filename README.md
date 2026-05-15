# Firebase Chat

A real-time chat app built with Firebase as part of CSE 310 at BYU-Idaho.

**Live demo:** https://fir-chat-faa3a.web.app

---

## What it does

- Register and log in with email and password
- See a list of all registered users
- Start a 1-on-1 conversation with any user
- Send and receive messages in real time
- Messages show the sender's name and timestamp

---

## Built with

- Vanilla JavaScript (no framework)
- Vite
- Firebase Authentication
- Firebase Firestore
- Firebase Hosting

---

## Run locally

```bash
pnpm install
pnpm dev
```

You need a `.env` file with your Firebase config. See `.env.example` for the required variables.

---

## What I learned

This project helped me understand how Firebase works as a backend: authentication, database, security rules, and hosting — all without writing a server. The hardest part was learning how Firestore queries and real-time listeners work together.
