# 🔗 URL Shortnerr API

A lightning-fast, production-ready REST API for shortening long URLs, built with the MERN stack.

## 🚀 Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (Mongoose)
* **Security:** Express Rate Limit, Crypto, CORS

## ✨ Key Features
* **Cryptographically Secure IDs:** Generates collision-free, secure 6-character short codes using Node's native `crypto` module.
* **Smart Duplication Prevention:** Checks the database before shortening to prevent redundant entries for the same original URL.
* **Built-in Analytics:** Automatically tracks and increments click counts for every redirect.
* **DDoS Protection:** Configured with `express-rate-limit` to prevent bot spam and database exhaustion.
* **Production Ready:** Fully configured CORS for secure frontend communication and dynamic port binding.

## 🛠️ Run Locally
1. Clone the repo: `git clone https://github.com/kattyshreyansh-maker/url-shortnerr-backend.git`
2. Install packages: `npm install`
3. Create a `.env` file with your `MONGO_URI` and `PORT`.
4. Start the server: `npm run dev`
