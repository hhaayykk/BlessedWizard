# 🧙‍♂️ Blessed Wizard

**Blessed Wizard** is a **Telegram Mini App slot machine game** combined with a **Python Telegram Bot** that launches the app, manages referrals, and processes payments.

⚠️ Gambling-style mechanics. **18+ only.** Ensure compliance with local laws and regulations.

---

## Overview

- Telegram Mini App slot game
- Entry via Telegram Bot (`/start`)
- Referral system with bonuses
- Telegram Stars deposits
- Cryptocurrency withdrawals
- Firebase backend

---

## Features

- 🎰 5 reels / 20 paylines
- 📊 Configurable RTP (default 96%)
- 🔗 Referral system (`/start ref<user_id>`)
- 🎁 Promocodes & bonuses
- 💰 Telegram Stars payments
- 🔔 Withdrawal notifications via bot
- 🌍 TON / BTC / ETH / USDT withdrawals
- 📱 Mobile-first Mini App UI

---

## Architecture

Telegram Bot (Python) → Telegram Mini App (Web) → Firebase Firestore

---

## Tech Stack

WebApp: HTML, CSS, JavaScript, Telegram WebApp API  
Bot: Python 3, python-telegram-bot v20.7  
Backend: Firebase Firestore  

---

## Project Structure

webapp/ — Mini App frontend  
bot.py — Telegram bot  
requirements.txt — Python dependencies  
README.md  

---

## Installation

git clone https://github.com/hhaayykk/BlessedWizard  
cd BlessedWizard  
pip install -r requirements.txt  

---

## Configuration

- config.js — Firebase credentials  
- main.js — Game logic and RTP  
- bot.py — Bot token and Mini App URL  

---

## Usage

1. Open the Telegram bot  
2. Run /start  
3. Mini App launches  
4. Play slot machine  
5. Deposit via Telegram Stars  
6. Withdraw winnings  

---

## Deployment

- WebApp: Netlify / Vercel / GitHub Pages  
- Bot: python bot.py  
- Set Mini App URL via @BotFather  

---

## Security Notes

- Never commit real API keys  
- Validate withdrawals  
- Apply limits and anti-abuse checks  
