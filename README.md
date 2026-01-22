Blessed Wizard - Telegram Web App Slot Machine Game
Blessed Wizard Logo
Blessed Wizard is a Telegram Web App-based slot machine game with casino-style gameplay, referral system, promocodes, and cryptocurrency withdrawals. Built with HTML, CSS, JavaScript, and integrated with Firebase for user data management and Telegram Stars for payments.
Table of Contents

Description
Features
Tech Stack
Installation
Configuration
Usage
Deployment
Contributing
License

Description
Blessed Wizard is an engaging slot machine game themed around magic and wizards. Players can spin reels, win stars (in-game currency), invite friends for bonuses, redeem promocodes, and withdraw earnings to cryptocurrency wallets. The game includes a smart RTP (Return to Player) system for balanced gameplay, leaderboards, and secure Firebase backend integration.
The app is designed as a Telegram Mini App, accessible via Telegram bots. It supports deposits via Telegram Stars and withdrawals to various crypto networks.
Important Note: This is a gambling-style game. Ensure compliance with local laws. The game promotes responsible gaming (18+ only).
Features

Slot Machine Gameplay: 5-reel slot with 20 paylines, weighted symbols, and dynamic win calculations.
RTP System: Configurable RTP (96%) with win types (small, medium, big, mega) and loss streak bonuses.
User Authentication: Via Telegram WebApp, with Firebase storage for balances, transactions, and profiles.
Referral System: Earn stars by inviting friends; supports normal and special referral codes.
Promocodes: Redeem codes for free stars; configurable via promocodes.js.
Deposits & Withdrawals: Deposit via Telegram Stars; withdraw to TON, BTC, ETH, USDT (with cooldown and min limits).
Notifications: Telegram bot sends withdrawal requests to a group chat.
Leaderboards & Profiles: Monthly leaderboards, user profiles with settings (music, language).
Auto Spin & Quick Spin: Automated spinning options.
Paytable & Modals: In-game paytable, bet settings, and auto-spin modals.
Responsive Design: Optimized for mobile devices (Telegram Mini App).

Tech Stack

Frontend: HTML5, CSS3, JavaScript (ES6+)
Backend/Database: Firebase (Firestore for users, balances, transactions, withdrawals)
Integrations:
Telegram WebApp API (for initData, payments, sharing)
Telegram Bot API (for notifications)

Libraries:
Firebase SDK (App, Auth, Firestore)
Font Awesome (icons)

Other: Stateful RTP logic, weighted random symbol generation.

Installation

Clone the repository:textgit clone https://github.com/yourusername/blessed-wizard.git
cd blessed-wizard
Install dependencies (none required, as it's vanilla JS with CDN links).
Set up Firebase:
Create a Firebase project at console.firebase.google.com.
Enable Firestore Database.
Update config.js with your Firebase config (apiKey, authDomain, etc.).

Set up Telegram Bot:
Create a bot via BotFather.
Update config.js with TELEGRAM_BOT_TOKEN, TELEGRAM_GROUP_CHAT_ID, and BOT_USERNAME.


Configuration

Firebase Rules: Configure Firestore security rules to allow read/write for authenticated users (or as per your needs).
Promocodes: Edit promocodes.js to add/remove codes.
RTP Settings: Adjust RTP_CONFIG in main.js for game balance.
Referral Bonuses: Modify constants like REFERRAL_BONUS_REFERRER in main.js.
Assets: Place images in the images/ folder (e.g., symbols, avatars).

For development:

Open index.html in a browser (simulates Telegram WebApp with query params for testing referrals, e.g., ?ref=123).

Usage

Deploy the app (see below).
Access via Telegram: Use the bot link, e.g., https://t.me/BlessedWizardBot.
In Telegram, open the Mini App.
Register/login via Telegram initData.
Play: Adjust bets, spin reels, check paytable.
Refer friends: Share referral link for bonuses.
Redeem promocodes in Profile.
Deposit/Withdraw via Wallet tab.

Testing Referrals:

Use URL params like ?ref=ref123 or special code ?start=dhs92bfjdjdsdf.

Admin Tasks:

Monitor withdrawals in Telegram group.
Update promocodes dynamically.

Deployment

Host on a static server (e.g., GitHub Pages, Vercel, Netlify).
Set up Telegram Mini App:
In BotFather, set the web app URL: /menu command, then webapp with your hosted URL.

For production:
Secure sensitive keys (do not commit config.js with real tokens; use env vars).
Enable Firebase authentication if needed.


Example Vercel Deployment:

Push to GitHub.
Connect to Vercel, deploy as static site.

Contributing
Contributions welcome! Fork the repo, create a branch, and submit a PR.

Report issues via GitHub Issues.
For major changes, discuss first.
