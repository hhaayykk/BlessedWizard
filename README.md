# 🧙‍♂️ Blessed Wizard — Telegram Web App Slot Machine Game

**Blessed Wizard** is a Telegram Mini App–based slot machine game featuring casino-style gameplay, referral rewards, promocodes, and cryptocurrency withdrawals. The project is built with modern web technologies and integrates Firebase for backend services and Telegram APIs for authentication, payments, and notifications.

> ⚠️ **Disclaimer:** This project contains gambling-style mechanics. Ensure compliance with local laws and regulations before deployment. Intended for **18+ users only** and promotes responsible gaming.

---

## 📌 Table of Contents

- Overview  
- Features  
- Technology Stack  
- Project Structure  
- Installation  
- Configuration  
- Usage  
- Deployment  
- Security Notes  
- Contributing  
- License  

---

## 🎮 Overview

Blessed Wizard is a magic-themed slot machine game designed specifically for Telegram Mini Apps. Players can spin reels, earn in-game currency (**Stars**), invite friends via referrals, redeem promocodes, and withdraw winnings to supported cryptocurrency networks.

The game includes a configurable **RTP (Return to Player)** system, leaderboards, auto-spin features, and a Firebase-powered backend for secure storage of user data and transactions.

---

## ✨ Features

### Gameplay
- 5-reel slot machine with 20 paylines  
- Weighted symbol probabilities  
- Dynamic win calculation engine  
- Configurable RTP (default: 96%)  
- Win tiers: small, medium, big, mega  
- Loss-streak compensation logic  

### User System
- Telegram WebApp authentication  
- Firebase-based user profiles and balances  
- Monthly leaderboards  
- Profile settings (language, music, preferences)  

### Economy
- In-game currency (Stars)  
- Deposits via Telegram Stars  
- Withdrawals to TON, BTC, ETH, USDT  
- Withdrawal cooldowns and minimum limits  

### Growth & Engagement
- Referral system (standard & special referral codes)  
- Promocode redemption system  
- Auto-spin and quick-spin modes  
- In-game paytable and modal dialogs  

### Notifications
- Telegram bot integration  
- Automatic withdrawal requests sent to a Telegram group  

### UI / UX
- Mobile-first responsive design  
- Optimized for Telegram Mini App environment  
- Wizard / magic-themed visuals  

---

## 🛠 Technology Stack

**Frontend:** HTML5, CSS3, JavaScript (ES6+)  
**Backend:** Firebase Firestore  
**Integrations:** Telegram WebApp API, Telegram Bot API  
**Libraries:** Firebase SDK, Font Awesome  

---

## 📁 Project Structure

/images  
/js  
- main.js  
- config.js  
- promocodes.js  
index.html  
styles.css  

---

## 🚀 Installation

```bash
git clone https://github.com/yourusername/blessed-wizard.git
cd blessed-wizard
```

No local dependencies required. All libraries are loaded via CDN.

---

## ⚙️ Configuration

- Update Firebase credentials in `config.js`  
- Configure RTP and referral logic in `main.js`  
- Manage promocodes in `promocodes.js`  

---

## ▶️ Usage

- Open via Telegram bot  
- Authenticate automatically  
- Play slot machine  
- Invite friends  
- Redeem promocodes  
- Deposit or withdraw funds  

---

## 🌍 Deployment

Host on GitHub Pages, Vercel, or Netlify.  
Set Mini App URL via **@BotFather** using `/menu`.

---

## 🔐 Security Notes

- Do not commit real API keys  
- Use environment variables  
- Enable Firebase Authentication  
- Apply withdrawal validation and limits  

---

## 🤝 Contributing

Fork the repository, create a branch, and submit a pull request.  
For major changes, open an issue first.
