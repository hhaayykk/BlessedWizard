import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyBk9FvvlfxIUuUsZ7n-aA6pHCCHew1U8cQ",
  authDomain: "hastatkashxati.firebaseapp.com",
  projectId: "hastatkashxati",
  storageBucket: "hastatkashxati.firebasestorage.app",
  messagingSenderId: "316190502279",
  appId: "1:316190502279:web:2875b0ed8dea0961433722"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===============================
// RTP System Configuration (Dog House Style)
// ===============================
const RTP_CONFIG = {
    TARGET_RTP: 96.0,
    MIN_RTP: 95.5,
    MAX_RTP: 96.5,
    BONUS_TRIGGER_CHANCE: 0.05,
    SMALL_WIN_MULTIPLIER_RANGE: [0.2, 0.8],
    MEDIUM_WIN_MULTIPLIER_RANGE: [1.0, 3.0],
    BIG_WIN_MULTIPLIER_RANGE: [5.0, 15.0],
    MEGA_WIN_MULTIPLIER_RANGE: [20.0, 50.0],
    LOSS_STREAK_BONUS_TRIGGER: 6,
    ADJUSTMENT_SPEED: 0.3
};

let sessionStats = {
    totalBet: 0,
    totalWon: 0,
    spinCount: 0,
    lossStreak: 0,
    lastBigWin: 0,
    currentRTP: 100.0
};

// ===============================
// Game Variables
// ===============================
// Game Variables
// ===============================
let balance = 0;
let coins_per_line = 1;
let coin_value = 1.0;
let total_bet = 20 * coins_per_line * coin_value;
let isSpinning = false;
let isAutoSpinning = false;
let autoSpinEnabled = false;
let remainingSpins = 0;
let autoSpins = 5;
let quickSpin = false;
let transactionHistory = [];
let telegramId = null;

const MIN_WITHDRAW = 2000;
const TRANSACTION_COOLDOWN = 6 * 60 * 60 * 1000;
const REFERRAL_BONUS_REFERRER = 5.0;
const REFERRAL_BONUS_NEW_USER = 5.0;
const BOT_USERNAME = "kazikkkbot";

// Background Music
let backgroundMusic = null;
let isMusicPlaying = false;

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = "8265410692:AAGkx4V3CPymkRxaidj2gI9MvD2wJaiY0Ck";
const TELEGRAM_GROUP_CHAT_ID = "-1003226470463";

// Slot symbols
const symbols = [
    { name: 'petla', src: 'images/avelavokmagic.PNG', weight: 1 },
    { name: 'magicball', src: 'images/ballmagic.png', weight: 2 },
    { name: 'book', src: 'images/bookmagic.png', weight: 3 },
    { name: 'hat', src: 'images/hatmagic.png', weight: 5 },
    { name: 'lighter', src: 'images/lightermagic.PNG', weight: 8 },
    { name: 'note', src: 'images/notemagic.png', weight: 12 },
    { name: 'poison', src: 'images/poisonmagic.png', weight: 15 }
];

let SYMBOL_HEIGHT = 70;
const VISIBLE_LINES = 3;
const CENTER_INDEX = 10;

const paylines = [
    [0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [2, 2, 2, 2, 2], [0, 1, 2, 1, 0], [2, 1, 0, 1, 2],
    [0, 0, 1, 2, 2], [2, 2, 1, 0, 0], [1, 0, 0, 1, 1], [1, 2, 2, 1, 0], [0, 1, 1, 2, 2],
    [2, 1, 1, 0, 0], [0, 0, 0, 1, 2], [2, 2, 2, 1, 0], [1, 1, 0, 0, 1], [1, 1, 2, 2, 1],
    [0, 1, 2, 2, 2], [2, 1, 0, 0, 0], [0, 0, 1, 1, 2], [2, 2, 1, 1, 0], [1, 0, 1, 2, 1]
];

const paytable = {
    'petla': { 3: 5, 4: 15, 5: 100 },
    'magicball': { 3: 4, 4: 10, 5: 50 },
    'book': { 3: 3, 4: 8, 5: 30 },
    'hat': { 3: 2, 4: 5, 5: 20 },
    'lighter': { 3: 1.5, 4: 4, 5: 15 },
    'note': { 3: 1, 4: 3, 5: 10 },
    'poison': { 3: 0.8, 4: 2, 5: 8 }
};

let userProfile = {
    name: "Anonymous",
    telegramId: "Not Set",
    registrationDate: "Not Set",
    language: "en",
    avatarUrl: "images/default_avatar.jpg"
};

// DOM Elements
const gameContainer = document.getElementById('gameContainer');
const leadersContainer = document.getElementById('leadersContainer');
const balanceContainer = document.getElementById('balanceContainer');
const friendsContainer = document.getElementById('friendsContainer');
const profileContainer = document.getElementById('profileContainer');
const spinButton = document.getElementById('spinButton');
const autoButton = document.getElementById('autoButton');
const betSettingsButton = document.getElementById('betSettingsButton');
const paytableButton = document.getElementById('paytableButton');
const maxBetButton = document.getElementById('maxBetButton');
const okButton = document.getElementById('okButton');
const okAutoButton = document.getElementById('okAutoButton');
const okPaytableButton = document.getElementById('okPaytableButton');
const toggleAutoSpin = document.getElementById('toggleAutoSpin');
const decreaseAutoSpins = document.getElementById('decreaseAutoSpins');
const increaseAutoSpins = document.getElementById('increaseAutoSpins');
const autoSpinsModal = document.getElementById('autoSpinsModal');
const quickSpinCheckbox = document.getElementById('quickSpinCheckbox');
const autoSpinsRow = document.getElementById('autoSpinsRow');
const quickSpinRow = document.getElementById('quickSpinRow');
const dimmedOverlay = document.getElementById('dimmedOverlay');
const resultOverlay = document.getElementById('resultOverlay');
const resultText = document.getElementById('resultText');
const betSettingsModal = document.getElementById('betSettingsModal');
const autoSettingsModal = document.getElementById('autoSettingsModal');
const paytableModal = document.getElementById('paytableModal');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3'),
    document.getElementById('reel4'),
    document.getElementById('reel5')
];
const betLevelDisplay = document.getElementById('betLevel');
const coinValueDisplay = document.getElementById('coinValue');
const totalBetDisplay = document.getElementById('totalBet');
const betLevelModal = document.getElementById('betLevelModal');
const coinValueModal = document.getElementById('coinValueModal');
const totalBetModal = document.getElementById('totalBetModal');
const decreaseBetLevel = document.getElementById('decreaseBetLevel');
const increaseBetLevel = document.getElementById('increaseBetLevel');
const decreaseCoinValue = document.getElementById('decreaseCoinValue');
const increaseCoinValue = document.getElementById('increaseCoinValue');

// ===============================
// Telegram Notification Function
// ===============================
async function sendTelegramNotification(withdrawalData) {
    try {
        const message = `
🔔 <b>NEW WITHDRAWAL REQUEST</b> 🔔

👤 <b>User:</b> ${withdrawalData.userName}
🆔 <b>User ID:</b> <code>${withdrawalData.userId}</code>

💰 <b>Amount:</b> ${Math.floor(withdrawalData.amount)} Stars
💳 <b>Method:</b> ${withdrawalData.method}
📍 <b>Wallet Address:</b> 
<code>${withdrawalData.walletAddress}</code>

⏰ <b>Time:</b> ${new Date(withdrawalData.timestamp).toLocaleString()}
📊 <b>Status:</b> ${withdrawalData.status.toUpperCase()}

━━━━━━━━━━━━━━━━━━━━
`;

        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_GROUP_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });

        const data = await response.json();
        
        if (data.ok) {
            console.log("✅ Telegram notification sent successfully");
            return true;
        } else {
            console.error("❌ Telegram API error:", data);
            return false;
        }
    } catch (error) {
        console.error("❌ Error sending Telegram notification:", error);
        return false;
    }
}

// ===============================
// RTP System Functions
// ===============================
function calculateCurrentRTP() {
    if (sessionStats.totalBet === 0) return 100.0;
    return (sessionStats.totalWon / sessionStats.totalBet) * 100;
}

function shouldTriggerWin() {
    const currentRTP = calculateCurrentRTP();
    
    if (currentRTP < RTP_CONFIG.MIN_RTP) {
        return Math.random() < 0.75;
    }
    
    if (currentRTP > RTP_CONFIG.MAX_RTP) {
        return Math.random() < 0.25;
    }
    
    if (sessionStats.lossStreak >= RTP_CONFIG.LOSS_STREAK_BONUS_TRIGGER) {
        return Math.random() < 0.85;
    }
    
    return Math.random() < 0.45;
}

function determineWinType() {
    const currentRTP = calculateCurrentRTP();
    const rand = Math.random();
    
    if (currentRTP < RTP_CONFIG.MIN_RTP) {
        if (rand < 0.15) return 'mega';
        if (rand < 0.35) return 'big';
        if (rand < 0.65) return 'medium';
        return 'small';
    }
    
    if (currentRTP > RTP_CONFIG.MAX_RTP) {
        if (rand < 0.70) return 'small';
        if (rand < 0.95) return 'medium';
        return 'big';
    }
    
    if (rand < 0.02) return 'mega';
    if (rand < 0.12) return 'big';
    if (rand < 0.42) return 'medium';
    return 'small';
}

function generateWeightedSymbol(forceWin = false, winType = 'medium') {
    if (forceWin) {
        let filteredSymbols;
        if (winType === 'mega') {
            filteredSymbols = symbols.filter(s => s.weight <= 3);
        } else if (winType === 'big') {
            filteredSymbols = symbols.filter(s => s.weight <= 5);
        } else if (winType === 'medium') {
            filteredSymbols = symbols.filter(s => s.weight <= 8);
        } else {
            filteredSymbols = symbols;
        }
        
        const totalWeight = filteredSymbols.reduce((sum, s) => sum + s.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const symbol of filteredSymbols) {
            random -= symbol.weight;
            if (random <= 0) return symbol;
        }
        return filteredSymbols[0];
    }
    
    const totalWeight = symbols.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const symbol of symbols) {
        random -= symbol.weight;
        if (random <= 0) return symbol;
    }
    return symbols[symbols.length - 1];
}

function generateSmartReelResult(shouldWin, winType) {
    const reelResults = Array(5).fill().map(() => Array(VISIBLE_LINES).fill(null));
    
    if (shouldWin) {
        const winningPayline = paylines[Math.floor(Math.random() * paylines.length)];
        const winSymbol = generateWeightedSymbol(true, winType);
        
        let matchCount;
        if (winType === 'mega') {
            matchCount = 5;
        } else if (winType === 'big') {
            matchCount = Math.random() < 0.6 ? 5 : 4;
        } else if (winType === 'medium') {
            matchCount = Math.random() < 0.3 ? 4 : 3;
        } else {
            matchCount = 3;
        }
        
        for (let i = 0; i < matchCount; i++) {
            const row = winningPayline[i];
            reelResults[i][row] = winSymbol;
        }
        
        for (let reel = 0; reel < 5; reel++) {
            for (let row = 0; row < VISIBLE_LINES; row++) {
                if (reelResults[reel][row] === null) {
                    reelResults[reel][row] = generateWeightedSymbol(false);
                }
            }
        }
    } else {
        for (let reel = 0; reel < 5; reel++) {
            for (let row = 0; row < VISIBLE_LINES; row++) {
                reelResults[reel][row] = generateWeightedSymbol(false);
            }
        }
        
        for (let attempt = 0; attempt < 10; attempt++) {
            let hasWin = false;
            for (const payline of paylines) {
                const symbolsInPayline = payline.map((row, reel) => reelResults[reel][row].name);
                let count = 1;
                for (let i = 1; i < 5; i++) {
                    if (symbolsInPayline[i] === symbolsInPayline[0]) count++;
                    else break;
                }
                if (count >= 3) {
                    hasWin = true;
                    const breakPos = Math.floor(Math.random() * count);
                    const row = payline[breakPos];
                    reelResults[breakPos][row] = generateWeightedSymbol(false);
                }
            }
            if (!hasWin) break;
        }
    }
    
    return reelResults;
}

// ===============================
// FIXED REFERRAL SYSTEM
// ===============================

function generateReferralLink(userId) {
    return `https://t.me/${BOT_USERNAME}?start=ref${userId}`;
}

function getReferrerFromURL() {
    try {
        console.log("=== CHECKING FOR REFERRER ===");
        
        // Method 1: Check Telegram WebApp initDataUnsafe (PRIMARY METHOD)
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
            const initData = window.Telegram.WebApp.initDataUnsafe;
            console.log("📱 Telegram initData:", initData);
            
            // Check start_param from Telegram
            if (initData.start_param) {
                const param = initData.start_param;
                console.log("🔍 Found start_param:", param);
                
                // Format: ref123456
                if (param.startsWith('ref')) {
                    const referrerId = param.substring(3); // Remove 'ref' prefix
                    
                    // Validate it's a number
                    if (/^\d+$/.test(referrerId)) {
                        console.log("✅ VALID REFERRER ID:", referrerId);
                        return referrerId;
                    } else {
                        console.warn("⚠️ Invalid referrer ID format:", referrerId);
                    }
                }
            }
        }
        
        // Method 2: Check URL hash (BACKUP METHOD for testing)
        if (window.location.hash) {
            const hash = window.location.hash.substring(1);
            console.log("🔍 URL hash:", hash);
            
            const hashParams = new URLSearchParams(hash);
            const startParam = hashParams.get('tgWebAppStartParam');
            
            if (startParam && startParam.startsWith('ref')) {
                const referrerId = startParam.substring(3);
                
                if (/^\d+$/.test(referrerId)) {
                    console.log("✅ VALID REFERRER ID from hash:", referrerId);
                    return referrerId;
                }
            }
        }
        
        console.log("❌ No referrer found");
        return null;
        
    } catch (error) {
        console.error("❌ Error getting referrer:", error);
        return null;
    }
}

async function processReferral(newUserId, referrerId) {
    console.log("=== PROCESSING REFERRAL ===");
    console.log(`New User: ${newUserId}`);
    console.log(`Referrer: ${referrerId}`);
    
    // Validation
    if (!referrerId || !newUserId) {
        console.log("❌ Missing user IDs");
        return false;
    }
    
    if (newUserId === referrerId) {
        console.log("❌ Cannot refer yourself");
        return false;
    }

    try {
        // Check if new user already processed a referral
        const newUserRef = doc(db, "users", newUserId);
        const newUserSnap = await getDoc(newUserRef);
        
        if (newUserSnap.exists()) {
            const userData = newUserSnap.data();
            
            if (userData.referredBy) {
                console.log("⚠️ User already has a referrer:", userData.referredBy);
                return false;
            }
            
            if (userData.hasProcessedReferral) {
                console.log("⚠️ User already processed a referral");
                return false;
            }
        }

        // Check if referrer exists
        const referrerRef = doc(db, "users", referrerId);
        const referrerSnap = await getDoc(referrerRef);

        if (!referrerSnap.exists()) {
            console.log("❌ Referrer account not found");
            return false;
        }

        const referrerData = referrerSnap.data();
        const currentReferrals = referrerData.referrals || [];
        
        // Check if this user is already in referrer's list
        const alreadyReferred = currentReferrals.some(ref => ref.userId === newUserId);
        if (alreadyReferred) {
            console.log("⚠️ User already in referrer's list");
            return false;
        }

        console.log("💰 Crediting referral bonuses...");

        // 1. Credit REFERRER
        const referrerNewBalance = (referrerData.balance || 0) + REFERRAL_BONUS_REFERRER;
        const referrerNewTotal = (referrerData.totalEarned || 0) + REFERRAL_BONUS_REFERRER;

        const newReferralEntry = {
            userId: newUserId,
            userName: userProfile.name,
            timestamp: Date.now(),
            reward: REFERRAL_BONUS_REFERRER,
            status: 'completed'
        };

        currentReferrals.push(newReferralEntry);

        await updateDoc(referrerRef, {
            balance: referrerNewBalance,
            referrals: currentReferrals,
            totalEarned: referrerNewTotal
        });

        console.log(`✅ Referrer credited: +${REFERRAL_BONUS_REFERRER} Stars (New balance: ${referrerNewBalance})`);
        
        // 2. Credit NEW USER
        const currentNewUserBalance = newUserSnap.exists() ? (newUserSnap.data().balance || 0) : 0;
        const newUserNewBalance = currentNewUserBalance + REFERRAL_BONUS_NEW_USER;
        
        await updateDoc(newUserRef, {
            balance: newUserNewBalance,
            hasProcessedReferral: true,
            referredBy: referrerId,
            referralProcessedAt: Date.now()
        });
        
        // Update local balance
        balance = newUserNewBalance;
        updateBalanceDisplay();
        
        console.log(`✅ New user credited: +${REFERRAL_BONUS_NEW_USER} Stars (New balance: ${newUserNewBalance})`);
        console.log("✅ REFERRAL COMPLETE!");

        // Show success message to user
        setTimeout(() => {
            showSuccess(`🎉 Referral Bonus!\nYou received ${REFERRAL_BONUS_NEW_USER} Stars!`);
        }, 1500);

        return true;

    } catch (error) {
        console.error("❌ Referral processing error:", error);
        return false;
    }
}

async function loadReferralInfo(userId) {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            const referrals = data.referrals || [];
            const totalEarned = data.totalEarned || 0;

            document.getElementById('friendsInvited').textContent = referrals.length;
            document.getElementById('totalEarned').innerHTML = `⭐ ${Math.floor(totalEarned)}`;

            const referralLink = generateReferralLink(userId);
            document.getElementById('referralLink').textContent = referralLink;
            
            console.log(`📊 Loaded referral info: ${referrals.length} friends, ${totalEarned} earned`);
        }
    } catch (error) {
        console.error("Error loading referral info:", error);
    }
}

function shareReferralLink() {
    if (!telegramId) {
        showError('User not initialized');
        return;
    }
    
    const referralLink = generateReferralLink(telegramId);
    const shareText = `🎰 Join Lucky Wizard and get ${REFERRAL_BONUS_NEW_USER} Stars bonus!\n\nPlay slots and win real Telegram Stars!\n\nUse my link:`;
    
    if (window.Telegram && window.Telegram.WebApp) {
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
        
        try {
            Telegram.WebApp.openTelegramLink(shareUrl);
            console.log("📤 Opened share dialog");
        } catch (error) {
            console.error("Share error:", error);
            copyText(document.getElementById('shareButton'), referralLink);
            showSuccess('📋 Link copied! Share it manually.');
        }
    } else {
        copyText(document.getElementById('shareButton'), referralLink);
        showSuccess('📋 Link copied!');
    }
}

// ===============================
// Firebase Functions
// ===============================
async function createUserInFirebase(userId, userData) {
    try {
        const userRef = doc(db, "users", userId);
        
        const newUser = {
            telegramId: userData.telegramId,
            name: userData.name,
            balance: 0.0,
            registrationDate: serverTimestamp(),
            language: "en",
            avatarUrl: userData.avatarUrl || "images/default_avatar.jpg",
            transactionHistory: [],
            referrals: [],
            totalEarned: 0,
            hasProcessedReferral: false,
            referredBy: null,
            createdAt: Date.now()
        };
        
        await setDoc(userRef, newUser);
        console.log("✅ User created in Firebase:", userId);
        return true;
    } catch (error) {
        console.error("❌ Error creating user:", error);
        return false;
    }
}

async function loadUserFromFirebase(userId) {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const data = userSnap.data();
            console.log("📦 User data loaded:", data);
            
            balance = data.balance || 0;
            transactionHistory = data.transactionHistory || [];
            userProfile.registrationDate = data.registrationDate ? 
                new Date(data.registrationDate.seconds * 1000).toLocaleDateString() : 
                new Date().toLocaleDateString();
            userProfile.language = data.language || "en";
            userProfile.name = data.name || "Anonymous";
            userProfile.telegramId = data.telegramId;
            userProfile.avatarUrl = data.avatarUrl || "images/default_avatar.jpg";
            
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error loading user:", error);
        return false;
    }
}

async function updateBalanceInFirebase(userId, newBalance) {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            balance: newBalance
        });
        balance = newBalance;
        updateBalanceDisplay();
        console.log("💰 Balance updated:", newBalance);
        return true;
    } catch (error) {
        console.error("Error updating balance:", error);
        showError('Error saving balance');
        return false;
    }
}

async function addTransactionToFirebase(userId, transaction) {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const currentHistory = userSnap.data().transactionHistory || [];
            currentHistory.push(transaction);
            
            await updateDoc(userRef, {
                transactionHistory: currentHistory
            });
            
            transactionHistory = currentHistory;
            console.log("Transaction added to Firebase");
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error adding transaction:", error);
        return false;
    }
}

async function saveWithdrawalRequest(userId, withdrawalData) {
    try {
        const withdrawalId = `${userId}_${Date.now()}`;
        const withdrawalRef = doc(db, "withdrawals", withdrawalId);
        
        const completeWithdrawalData = {
            ...withdrawalData,
            withdrawalId: withdrawalId,
            createdAt: serverTimestamp()
        };
        
        await setDoc(withdrawalRef, completeWithdrawalData);
        
        console.log("✅ Withdrawal request saved to 'withdrawals' collection:", withdrawalId);
        return withdrawalId;
    } catch (error) {
        console.error("❌ Error saving withdrawal request:", error);
        throw error;
    }
}

// ===============================
// User Initialization
// ===============================
async function initUser() {
    console.log("==========================================================");
    console.log("🚀 INITIALIZING USER");
    console.log("==========================================================");
    
    try {
        // STEP 1: Get referrer ID FIRST (before anything else)
        const referrerId = getReferrerFromURL();
        console.log("🔗 Referrer ID:", referrerId || "None");

        // STEP 2: Initialize Telegram WebApp
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.ready();
            Telegram.WebApp.expand();
            
            const initData = Telegram.WebApp.initDataUnsafe;
            console.log("📱 Telegram WebApp initialized");
            
            if (!initData || !initData.user) {
                console.warn("⚠️ Running in TEST mode (no Telegram user)");
                telegramId = "test_" + Math.random().toString(36).substr(2, 9);
                userProfile.name = "Test User";
                userProfile.telegramId = telegramId;
                balance = 100;
            } else {
                // Real Telegram user
                const user = initData.user;
                telegramId = user.id.toString();
                userProfile.name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || "Anonymous";
                userProfile.telegramId = telegramId;
                userProfile.avatarUrl = user.photo_url || "images/default_avatar.jpg";
                
                console.log("👤 User identified:", telegramId, userProfile.name);

                // STEP 3: Check if user exists in Firebase
                const userExists = await loadUserFromFirebase(telegramId);
                
                if (!userExists) {
                    console.log("🆕 NEW USER - Creating account...");
                    
                    // Create new user
                    await createUserInFirebase(telegramId, {
                        telegramId: telegramId,
                        name: userProfile.name,
                        avatarUrl: userProfile.avatarUrl
                    });
                    
                    // Reload user data
                    await loadUserFromFirebase(telegramId);
                    
                    // STEP 4: Process referral for NEW users only
                    if (referrerId) {
                        console.log("🎁 NEW USER with REFERRAL - Processing...");
                        
                        // Small delay to ensure Firebase write is complete
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        const referralSuccess = await processReferral(telegramId, referrerId);
                        
                        if (referralSuccess) {
                            console.log("✅ REFERRAL BONUS APPLIED!");
                        } else {
                            console.log("❌ Referral processing failed");
                            showSuccess("Welcome to Lucky Wizard!");
                        }
                    } else {
                        console.log("👋 NEW USER without referral");
                        setTimeout(() => showSuccess("Welcome to Lucky Wizard!"), 1000);
                    }
                } else {
                    console.log("👋 RETURNING USER");
                }
            }
        } else {
            console.warn("⚠️ Telegram WebApp not available - TEST MODE");
            telegramId = "test_" + Math.random().toString(36).substr(2, 9);
            userProfile.name = "Test User";
            balance = 100;
        }
        
        // STEP 5: Update UI
        updateBalanceDisplay();
        updateProfileDisplay();
        initializeGame();
        
        console.log("==========================================================");
        console.log("✅ USER INITIALIZATION COMPLETE");
        console.log(`User ID: ${telegramId}`);
        console.log(`Balance: ${balance}`);
        console.log(`Referrer: ${referrerId || 'None'}`);
        console.log("==========================================================");
        
    } catch (error) {
        console.error("❌ INITIALIZATION ERROR:", error);
        showError('Error loading user. Demo mode enabled.');
        telegramId = "demo_user";
        balance = 100;
        updateBalanceDisplay();
        initializeGame();
    }
}

// ===============================
// Game Initialization
// ===============================
function initializeGame() {
    console.log("🎮 Initializing game...");
    SYMBOL_HEIGHT = updateSymbolHeight();
    reels.forEach(reel => {
        reel.innerHTML = createReelHTML(generateReelSymbols());
        reel.style.transform = `translateY(${-SYMBOL_HEIGHT * (CENTER_INDEX - Math.floor(VISIBLE_LINES / 2))}px)`;
    });
    updateBalanceDisplay();
    updateBetDisplay();
    loadDeposit();
}

// ===============================
// Display Updates
// ===============================
function updateBalanceDisplay() {
    const balanceText = `⭐ ${Math.floor(balance)} Stars`;
    const balanceElements = ['currentBalance', 'currentBalanceLeaders', 'currentBalanceWallet', 'currentBalanceFriends', 'currentBalanceProfile'];
    balanceElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = balanceText;
    });
}

function updateBetDisplay() {
    total_bet = 20 * coins_per_line * coin_value;
    betLevelDisplay.textContent = coins_per_line;
    coinValueDisplay.textContent = coin_value.toFixed(2);
    totalBetDisplay.textContent = Math.floor(total_bet);
    betLevelModal.textContent = coins_per_line;
    coinValueModal.textContent = coin_value.toFixed(2);
    totalBetModal.textContent = Math.floor(total_bet);
}

function updateProfileDisplay() {
    const nameEl = document.getElementById('profileName');
    const idEl = document.getElementById('telegramId');
    const dateEl = document.getElementById('registrationDate');
    const avatarEl = document.getElementById('profileAvatar');
    const langEl = document.getElementById('languageSelect');
    
    if (nameEl) nameEl.textContent = userProfile.name;
    if (idEl) idEl.textContent = `Telegram ID: ${userProfile.telegramId}`;
    if (dateEl) dateEl.textContent = `Registered: ${userProfile.registrationDate}`;
    if (avatarEl) avatarEl.src = userProfile.avatarUrl;
    if (langEl) langEl.value = userProfile.language;
}

// ===============================
// Utility Functions
// ===============================
function copyText(element, text) {
    navigator.clipboard.writeText(text).then(() => {
        element.style.filter = 'brightness(50%)';
        setTimeout(() => element.style.filter = 'brightness(100%)', 1000);
        showSuccess('📋 Link copied to clipboard!');
    }).catch(err => {
        console.error("Copy error:", err);
        showError('Failed to copy');
    });
}

function hasTransactedInLast6Hours() {
    if (transactionHistory.length === 0) return false;
    
    const now = Date.now();
    const lastWithdrawal = transactionHistory
        .filter(t => t.type === 'withdrawal')
        .sort((a, b) => b.timestamp - a.timestamp)[0];
    
    if (!lastWithdrawal) return false;
    
    return (now - lastWithdrawal.timestamp) < TRANSACTION_COOLDOWN;
}

function getTimeRemainingFormatted() {
    const now = Date.now();
    const lastWithdrawal = transactionHistory
        .filter(t => t.type === 'withdrawal')
        .sort((a, b) => b.timestamp - a.timestamp)[0];
    
    if (!lastWithdrawal) return "0h 0m";
    
    const timeSinceLast = now - lastWithdrawal.timestamp;
    const timeRemaining = TRANSACTION_COOLDOWN - timeSinceLast;
    
    if (timeRemaining <= 0) return "0h 0m";
    
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
}

function updateSymbolHeight() {
    const width = window.innerWidth;
    if (width <= 320) return 50;
    if (width <= 360) return 60;
    return 70;
}

function showError(message) {
    resultText.textContent = message;
    resultText.classList.add('lose-message');
    resultOverlay.classList.add('show');
    setTimeout(() => {
        resultOverlay.classList.remove('show');
        resultText.classList.remove('lose-message');
    }, 2000);
}

function showSuccess(message) {
    resultText.textContent = message;
    resultText.classList.add('win-message');
    resultOverlay.classList.add('show');
    setTimeout(() => {
        resultOverlay.classList.remove('show');
        resultText.classList.remove('win-message');
    }, 2000);
}

// ===============================
// Telegram Stars Payment Integration
// ===============================
async function handleStarsDeposit(stars) {
    if (!window.Telegram || !window.Telegram.WebApp) {
        showError('Telegram WebApp not available');
        return;
    }

    if (!telegramId) {
        showError('User not initialized');
        return;
    }

    try {
        console.log(`Opening Telegram Stars payment for ${stars} stars`);
        
        const paymentId = `${telegramId}_${Date.now()}`;
        
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/createInvoiceLink`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: `${stars} Stars`,
                description: `Purchase ${stars} Stars for Lucky Wizard`,
                payload: paymentId,
                provider_token: "",
                currency: "XTR",
                prices: [{
                    label: `${stars} Stars`,
                    amount: stars
                }]
            })
        });

        const data = await response.json();
        
        if (data.ok && data.result) {
            const invoiceLink = data.result;
            console.log('Invoice link created:', invoiceLink);
            
            Telegram.WebApp.openInvoice(invoiceLink, async (status) => {
                console.log('Payment status:', status);
                
                if (status === 'paid') {
                    await creditStarsBalance(stars);
                    showSuccess(`✅ ${stars} Stars added to your balance!`);
                    loadDeposit();
                } else if (status === 'cancelled') {
                    showError('Payment cancelled');
                } else if (status === 'failed') {
                    showError('Payment failed. Please try again.');
                }
            });
        } else {
            throw new Error('Failed to create invoice');
        }
        
    } catch (error) {
        console.error('Stars payment error:', error);
        showError('Error opening payment. Please try again.');
    }
}

async function creditStarsBalance(stars) {
    if (!telegramId) {
        console.error('User not initialized');
        return false;
    }

    try {
        const newBalance = balance + stars;
        
        const success = await updateBalanceInFirebase(telegramId, newBalance);
        
        if (success) {
            const transaction = {
                type: 'deposit',
                method: 'telegram_stars',
                amount: stars,
                timestamp: Date.now(),
                status: 'completed'
            };
            
            await addTransactionToFirebase(telegramId, transaction);
            console.log(`${stars} Stars credited successfully`);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error crediting Stars balance:', error);
        return false;
    }
}

function loadDeposit() {
    balanceContainer.innerHTML = `
        <div class="page-header">
            <img src="images/logo.png" alt="Lucky Wizard" class="logo">
            <div class="wallet-balance" id="currentBalanceWallet">⭐ ${Math.floor(balance)} Stars</div>
        </div>
        <div class="wallet-divider"></div>
        <div class="deposit-withdraw-row">
            <button class="deposit-btn active" id="depositButton">Deposit</button>
            <button class="withdraw-btn" id="withdrawButton">Withdraw</button>
        </div>
        <div class="currency-section">
            <div class="currency-title">Payment Method</div>
            <div class="currency-item">
                ⭐
                <span class="currency-name">Telegram Stars</span>
            </div>
        </div>
        <div class="stars-deposit-section">
            <div class="stars-info">
                <i class="fas fa-info-circle"></i>
                <p>Minimum deposit: 1,000 Stars<br>
                Maximum deposit: 999 999 Stars</p>
            </div>
            <div class="deposit-amount-container">
                <div class="deposit-input-wrapper">
                    <span class="deposit-star-icon">⭐</span>
                    <input type="number" 
                           class="deposit-amount-input" 
                           id="depositAmountInput" 
                           placeholder="Enter amount"
                           min="1000" 
                           max="999999"
                           step="100">
                    <span class="deposit-unit">Stars</span>
                </div>
                <div class="deposit-quick-amounts">
                    <button class="quick-amount-btn" data-amount="1000">1 000</button>
                    <button class="quick-amount-btn" data-amount="5000">5 000</button>
                    <button class="quick-amount-btn" data-amount="10000">20 000</button>
                    <button class="quick-amount-btn" data-amount="50000">50 000</button>
                </div>
                <button class="deposit-submit" id="depositSubmitBtn">
                    <i class="fas fa-bolt"></i> Deposit
                </button>
            </div>
        </div>
        <div class="deposit-warning"> 
            <i class="fas fa-shield-alt"></i> 100% Secure Deposit
        </div>
    `;
    
    document.getElementById('depositButton').addEventListener('click', loadDeposit);
    document.getElementById('withdrawButton').addEventListener('click', loadWithdraw);
    
    const depositInput = document.getElementById('depositAmountInput');
    const depositSubmitBtn = document.getElementById('depositSubmitBtn');
    
    document.querySelectorAll('.quick-amount-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = btn.dataset.amount;
            depositInput.value = amount;
            depositInput.style.color = '#e0e0ff';
        });
    });
    
    depositInput.addEventListener('input', () => {
        const amount = parseInt(depositInput.value);
        
        if (!depositInput.value || isNaN(amount) || amount < 1000 || amount > 999999) {
            depositInput.style.color = '#ff4d4d';
        } else {
            depositInput.style.color = '#e0e0ff';
        }
    });
    
    depositSubmitBtn.addEventListener('click', () => {
        const amount = parseInt(depositInput.value);
        
        if (!amount || isNaN(amount) || amount < 1000 || amount > 999999) {
            depositInput.style.color = '#ff4d4d';
            return;
        }
        
        handleStarsDeposit(amount);
    });
}

function loadWithdraw() {
    const canWithdraw = !hasTransactedInLast6Hours();
    const timeRemaining = canWithdraw ? "" : getTimeRemainingFormatted();
    
    balanceContainer.innerHTML = `
        <div class="page-header">
            <img src="images/logo.png" alt="Lucky Wizard" class="logo">
            <div class="wallet-balance" id="currentBalanceWallet">⭐ ${Math.floor(balance)} Stars</div>
        </div>
        <div class="wallet-divider"></div>
        <div class="deposit-withdraw-row">
            <button class="deposit-btn" id="depositButton">Deposit</button>
            <button class="withdraw-btn active" id="withdrawButton">Withdraw</button>
        </div>
        <div class="withdrawal-section">
            <div class="stars-info">
                <i class="fas fa-info-circle"></i>
                <p>
                    Withdraw your Stars to Cryptocurrency.<br>
                    <i></i>Minimum withdrawal: ${MIN_WITHDRAW} Stars<br>
                    <i></i> Withdrawals every 6 hours<br>
                    <i></i> Processing time: 24-48 hours
                </p>
                ${!canWithdraw ? `<strong style="color: #ff4d4d; display:block; margin-top:5px;"></strong>` : ''}
            </div>

            <div class="currency-title">Select Payment Method</div>
            <select class="withdrawal-input" id="withdrawalMethod" ${!canWithdraw ? 'disabled' : ''}>
                <option value="TON">Toncoin (TON)</option>
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="USDT_TRC20">USDT TRC-20</option>
                <option value="USDT_ERC20">USDT ERC-20</option>
                <option value="USDT_BEP20">USDT BEP-20</option>
            </select>
            
            <div class="currency-title" style="margin-top: 10px;">Amount (Stars) 1 Star = 0.01$</div>
            <div style="display: flex; gap: 10px;">
                <input type="number" 
                       class="withdrawal-input" 
                       id="withdrawalAmount" 
                       placeholder="e.g., 2000" 
                       min="${MIN_WITHDRAW}"
                       ${!canWithdraw ? 'disabled' : ''}>
                <button class="max-button" id="maxButton" ${!canWithdraw ? 'disabled' : ''}>Max</button>
            </div>
            
            <div class="currency-title" style="margin-top: 10px;">Wallet Address</div>
            <input type="text" 
                   class="withdrawal-input" 
                   id="withdrawalWallet" 
                   placeholder="Enter your wallet address"
                   ${!canWithdraw ? 'disabled' : ''}>
            
            <div class="error-message" id="amountError"></div>

            <button class="withdraw-submit" 
                    id="submitWithdraw" 
                    ${!canWithdraw ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                ${canWithdraw ? 'Withdraw' : `Wait ${timeRemaining}`}
            </button>

            <p style="margin-top: 12px; text-align:center; font-size: 13px; opacity: 0.8;">
                <i class="fas fa-shield-alt"></i> Double-check your wallet address before submitting
            </p>
        </div>
    `;
    
    document.getElementById('depositButton').addEventListener('click', loadDeposit);
    document.getElementById('withdrawButton').addEventListener('click', loadWithdraw);
    
    if (canWithdraw) {
        document.getElementById('maxButton').addEventListener('click', () => {
            document.getElementById('withdrawalAmount').value = Math.floor(balance);
            document.getElementById('amountError').textContent = '';
        });
        document.getElementById('submitWithdraw').addEventListener('click', handleWithdrawSubmit);
    }
}

async function handleWithdrawSubmit() {
    const amountInput = document.getElementById('withdrawalAmount');
    const walletInput = document.getElementById('withdrawalWallet');
    const methodSelect = document.getElementById('withdrawalMethod');
    const errorEl = document.getElementById('amountError');
    const amount = parseFloat(amountInput.value);
    const walletAddress = walletInput.value.trim();
    const method = methodSelect.value;

    if (!amount || amount < MIN_WITHDRAW) {
        errorEl.textContent = `Minimum withdrawal is ${MIN_WITHDRAW} Stars`;
        errorEl.style.color = '#ff4d4d';
        return;
    }

    if (amount > balance) {
        errorEl.textContent = 'Insufficient balance';
        errorEl.style.color = '#ff4d4d';
        return;
    }

    if (!walletAddress || walletAddress.length < 10) {
        errorEl.textContent = 'Please enter a valid wallet address';
        errorEl.style.color = '#ff4d4d';
        return;
    }

    if (hasTransactedInLast6Hours()) {
        const timeRemaining = getTimeRemainingFormatted();
        errorEl.textContent = `Please wait ${timeRemaining} before next withdrawal`;
        errorEl.style.color = '#ff4d4d';
        return;
    }

    const submitBtn = document.getElementById('submitWithdraw');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    errorEl.textContent = '';

    try {
        const newBalance = balance - amount;
        await updateBalanceInFirebase(telegramId, newBalance);
        
        const transaction = {
            type: 'withdrawal',
            method: method,
            amount: amount,
            walletAddress: walletAddress,
            timestamp: Date.now(),
            status: 'pending'
        };
        
        await addTransactionToFirebase(telegramId, transaction);
        
        const withdrawalData = {
            userId: telegramId,
            userName: userProfile.name,
            amount: amount,
            method: method,
            walletAddress: walletAddress,
            timestamp: Date.now(),
            status: 'pending',
            processedAt: null,
            processedBy: null
        };
        
        await saveWithdrawalRequest(telegramId, withdrawalData);
        await sendTelegramNotification(withdrawalData);
        
        showSuccess(`✅ Withdrawal of ${Math.floor(amount)} Stars submitted!\nNext withdrawal available in 6 hours.`);
        
        setTimeout(() => loadWithdraw(), 2000);
        
    } catch (error) {
        console.error('Withdrawal error:', error);
        errorEl.textContent = 'Accepted! (In process...)';
        errorEl.style.color = '#2fca1bff';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Withdraw';
    }
}

// ===============================
// Slot Machine Functions
// ===============================
function generateReelSymbols() {
    const reelSymbols = [];
    for (let i = 0; i < CENTER_INDEX + VISIBLE_LINES; i++) {
        reelSymbols.push(generateWeightedSymbol(false));
    }
    return reelSymbols;
}

function createReelHTML(reelSymbols) {
    return reelSymbols.map(symbol => `<div class="symbol"><img src="${symbol.src}" alt="${symbol.name}"></div>`).join('');
}

function toggleBetSettingsModal() {
    autoSettingsModal.classList.remove('show');
    betSettingsModal.classList.toggle('show');
    dimmedOverlay.classList.toggle('show', betSettingsModal.classList.contains('show'));
}

function toggleAutoSettingsModal() {
    betSettingsModal.classList.remove('show');
    autoSettingsModal.classList.toggle('show');
    dimmedOverlay.classList.toggle('show', autoSettingsModal.classList.contains('show'));
    updateAutoSettingsState();
}

function togglePaytableModal() {
    paytableModal.classList.toggle('show');
    dimmedOverlay.classList.toggle('show', paytableModal.classList.contains('show'));
}

function updateAutoSettingsState() {
    toggleAutoSpin.textContent = autoSpinEnabled ? 'Disable Auto Spin' : 'Enable Auto Spin';
    toggleAutoSpin.classList.toggle('active', autoSpinEnabled);
    autoSpinsRow.classList.toggle('disabled-setting', !autoSpinEnabled);
    quickSpinRow.classList.toggle('disabled-setting', !autoSpinEnabled);
    decreaseAutoSpins.disabled = !autoSpinEnabled;
    increaseAutoSpins.disabled = !autoSpinEnabled;
    quickSpinCheckbox.disabled = !autoSpinEnabled;
    okAutoButton.textContent = autoSpinEnabled ? 'SPIN' : 'CANCEL';
}

async function spinReels() {
    if (isSpinning || balance < total_bet) {
        if (balance < total_bet) {
            showError('Insufficient funds! Top up your balance.');
            isAutoSpinning = false;
            autoButton.textContent = 'Auto';
        }
        return;
    }
    
    if (!isAutoSpinning) {
        quickSpin = quickSpinCheckbox.checked;
    }
    
    isSpinning = true;
    lockButtons();
    
    sessionStats.totalBet += total_bet;
    sessionStats.spinCount++;
    
    const newBalance = balance - total_bet;
    await updateBalanceInFirebase(telegramId, newBalance);

    const shouldWin = shouldTriggerWin();
    const winType = shouldWin ? determineWinType() : 'none';
    
    console.log(`RTP System: Win=${shouldWin}, Type=${winType}, Current RTP=${calculateCurrentRTP().toFixed(2)}%`);
    
    const reelResults = generateSmartReelResult(shouldWin, winType);
    
    const speedFactor = quickSpin ? 0.5 : 1.0;
    const delayFactor = quickSpin ? 0.4 : 1.0;
    let maxTime = 0;

    reels.forEach((reel, i) => {
        const extendedSymbols = [];
        
        for (let j = 0; j < 10; j++) {
            extendedSymbols.push(generateWeightedSymbol(false));
        }
        
        extendedSymbols.push(...reelResults[i]);
        
        for (let j = 0; j < 40; j++) {
            extendedSymbols.push(generateWeightedSymbol(false));
        }
        
        reel.innerHTML = createReelHTML(extendedSymbols);
        
        const startIndex = 40 + VISIBLE_LINES;
        reel.style.transition = 'none';
        reel.style.transform = `translateY(-${SYMBOL_HEIGHT * (startIndex - Math.floor(VISIBLE_LINES / 2))}px)`;
        void reel.offsetWidth;

        const startDelay = (50 + (i * 120)) * delayFactor;
        const spinDuration = quickSpin ? 0.5 : (2.0 + i * 0.2);
        
        setTimeout(() => {
            const resultStartIndex = 10;
            const finalPosition = -SYMBOL_HEIGHT * (resultStartIndex - Math.floor(VISIBLE_LINES / 2));
            
            reel.style.transition = `transform ${spinDuration}s cubic-bezier(0.25, 0.1, 0.25, 1)`;
            reel.style.transform = `translateY(${finalPosition}px)`;
            
        }, startDelay);
        
        maxTime = Math.max(maxTime, startDelay + spinDuration * 1000);
    });

    setTimeout(() => {
        isSpinning = false;
        unlockButtons();
        checkWin(reelResults);
    }, maxTime + 100);
}

async function checkWin(reelResults) {
    let totalWin = 0;
    const winLines = [];
    
    paylines.forEach(payline => {
        const symbolsInPayline = payline.map((row, reel) => reelResults[reel][row].name);
        let count = 1;
        let currentSym = symbolsInPayline[0];
        for (let i = 1; i < 5; i++) {
            if (symbolsInPayline[i] === currentSym) count++;
            else break;
        }
        if (count >= 3 && paytable[currentSym]?.[count]) {
            const winAmount = (coins_per_line * coin_value) * paytable[currentSym][count];
            totalWin += winAmount;
            winLines.push({ payline, count });
        }
    });

    sessionStats.totalWon += totalWin;
    sessionStats.currentRTP = calculateCurrentRTP();

    if (totalWin > 0) {
        sessionStats.lossStreak = 0;
        
        const roundedWin = Math.floor(totalWin);
        const newBalance = balance + roundedWin;
        await updateBalanceInFirebase(telegramId, newBalance);
        
        const multiplier = roundedWin / total_bet;
        let winMessage;
        if (multiplier >= 20) {
            winMessage = `MEGA WIN! ${roundedWin} Stars!`;
        } else if (multiplier >= 5) {
            winMessage = `BIG WIN! ${roundedWin} Stars!`;
        } else if (multiplier >= 2) {
            winMessage = `NICE WIN! ${roundedWin} Stars!`;
        } else {
            winMessage = `Win ${roundedWin} Stars!`;
        }
        
        resultText.textContent = winMessage;
        resultText.classList.add('win-message');
        
        reels.forEach((reel, reelIndex) => {
            const symbols = reel.querySelectorAll('.symbol');
            winLines.forEach(({ payline, count }) => {
                for (let pos = 0; pos < count; pos++) {
                    const row = payline[pos];
                    const symbolIndex = row + (CENTER_INDEX - Math.floor(VISIBLE_LINES / 2));
                    if (symbols[symbolIndex]) symbols[symbolIndex].classList.add('win');
                }
            });
        });
        
        console.log(`Win! Amount: ${roundedWin}, Multiplier: ${multiplier.toFixed(2)}x, RTP: ${sessionStats.currentRTP.toFixed(2)}%`);
    } else {
        sessionStats.lossStreak++;
        resultText.textContent = 'Try again!';
        resultText.classList.add('lose-message');
        console.log(`Loss. Streak: ${sessionStats.lossStreak}, RTP: ${sessionStats.currentRTP.toFixed(2)}%`);
    }

    resultOverlay.classList.add('show');
    setTimeout(() => {
        resultOverlay.classList.remove('show');
        resultText.classList.remove('win-message', 'lose-message');
        reels.forEach(reel => reel.querySelectorAll('.symbol').forEach(symbol => symbol.classList.remove('win')));
        if (isAutoSpinning && remainingSpins > 0 && balance >= total_bet) {
            remainingSpins--;
            spinReels();
        } else if (isAutoSpinning) {
            isAutoSpinning = false;
            autoButton.textContent = 'Auto';
            unlockButtons();
        }
    }, quickSpin ? 300 : 600);
}

function lockButtons() {
    spinButton.classList.add('dimmed');
    autoButton.classList.add('dimmed');
    betSettingsButton.classList.add('dimmed');
    paytableButton.classList.add('dimmed');
    maxBetButton.classList.add('dimmed');
    spinButton.disabled = true;
    autoButton.disabled = true;
    betSettingsButton.disabled = true;
    paytableButton.disabled = true;
    maxBetButton.disabled = true;
    document.querySelectorAll('.telegram-nav-button').forEach(btn => {
        btn.classList.add('dimmed');
        btn.disabled = true;
    });
}

function unlockButtons() {
    spinButton.classList.remove('dimmed');
    autoButton.classList.remove('dimmed');
    betSettingsButton.classList.remove('dimmed');
    paytableButton.classList.remove('dimmed');
    maxBetButton.classList.remove('dimmed');
    spinButton.disabled = false;
    autoButton.disabled = false;
    betSettingsButton.disabled = false;
    paytableButton.disabled = false;
    maxBetButton.disabled = false;
    document.querySelectorAll('.telegram-nav-button').forEach(btn => {
        btn.classList.remove('dimmed');
        btn.disabled = false;
    });
}

// ===============================
// Navigation Event Listeners
// ===============================
document.getElementById('leadersButton').addEventListener('click', () => {
    document.querySelectorAll('.telegram-nav-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById('leadersButton').classList.add('active');
    gameContainer.style.display = 'none';
    leadersContainer.style.display = 'block';
    balanceContainer.style.display = 'none';
    friendsContainer.style.display = 'none';
    profileContainer.style.display = 'none';
    dimmedOverlay.classList.remove('show');
});

document.getElementById('walletButton').addEventListener('click', () => {
    document.querySelectorAll('.telegram-nav-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById('walletButton').classList.add('active');
    gameContainer.style.display = 'none';
    leadersContainer.style.display = 'none';
    balanceContainer.style.display = 'block';
    friendsContainer.style.display = 'none';
    profileContainer.style.display = 'none';
    loadDeposit();
    dimmedOverlay.classList.remove('show');
});

document.getElementById('playButton').addEventListener('click', () => {
    document.querySelectorAll('.telegram-nav-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById('playButton').classList.add('active');
    gameContainer.style.display = 'block';
    leadersContainer.style.display = 'none';
    balanceContainer.style.display = 'none';
    friendsContainer.style.display = 'none';
    profileContainer.style.display = 'none';
    dimmedOverlay.classList.remove('show');
});

document.getElementById('friendsButton').addEventListener('click', () => {
    document.querySelectorAll('.telegram-nav-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById('friendsButton').classList.add('active');
    gameContainer.style.display = 'none';
    leadersContainer.style.display = 'none';
    balanceContainer.style.display = 'none';
    friendsContainer.style.display = 'block';
    profileContainer.style.display = 'none';
    dimmedOverlay.classList.remove('show');
    
    if (telegramId) {
        loadReferralInfo(telegramId);
    }
});

// Replace the music-related code in your main.js with this updated version

// Background Music

function initBackgroundMusic() {
    console.log('🎵 Initializing background music...');
    
    // Try multiple audio formats in case .mp4 doesn't work
    backgroundMusic = new Audio('spooky.mp4');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;
    backgroundMusic.preload = 'auto';
    
    // Add error handler
    backgroundMusic.addEventListener('error', (e) => {
        console.error('❌ Music file error:', e);
        console.error('❌ Failed to load: spooky.mp4');
        showError('Music file not found. Check spooky.mp4');
    });
    
    backgroundMusic.addEventListener('canplaythrough', () => {
        console.log('✅ Music file loaded successfully');
    });
    
    // Check saved preference (default to ON)
    const musicPreference = localStorage.getItem('musicEnabled');
    
    // Default to ON (music plays by default)
    if (musicPreference !== 'false') {
        isMusicPlaying = true;
        localStorage.setItem('musicEnabled', 'true');
        
        // Try to play immediately
        console.log('🎵 Attempting to play music...');
        const playPromise = backgroundMusic.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('✅ Music is playing!');
                updateMusicButtonState();
            }).catch(error => {
                console.log('⚠️ Autoplay blocked:', error.message);
                console.log('⚠️ Music will start on user interaction');
            });
        }
        
        // Set up multiple interaction triggers
        const startMusicOnInteraction = () => {
            if (isMusicPlaying && backgroundMusic.paused) {
                console.log('🎵 Starting music from user interaction...');
                backgroundMusic.play()
                    .then(() => {
                        console.log('✅ Music started!');
                        updateMusicButtonState();
                    })
                    .catch(err => console.error('❌ Play error:', err));
            }
        };
        
        // Listen to multiple events
        document.addEventListener('click', startMusicOnInteraction, { once: true });
        document.addEventListener('touchstart', startMusicOnInteraction, { once: true });
        document.addEventListener('keydown', startMusicOnInteraction, { once: true });
        
        // Also try when spin button is clicked
        if (spinButton) {
            spinButton.addEventListener('click', startMusicOnInteraction, { once: true });
        }
    } else {
        // User previously turned it OFF
        isMusicPlaying = false;
    }
    
    // Update button to match current state immediately
    updateMusicButtonState();
}

function toggleBackgroundMusic() {
    if (!backgroundMusic) {
        initBackgroundMusic();
    }
    
    if (isMusicPlaying) {
        backgroundMusic.pause();
        isMusicPlaying = false;
        localStorage.setItem('musicEnabled', 'false');
    } else {
        backgroundMusic.play().catch(error => {
            console.log('Music play prevented by browser:', error);
            showError('Click anywhere to enable music');
        });
        isMusicPlaying = true;
        localStorage.setItem('musicEnabled', 'true');
    }
    
    updateMusicButtonState();
}

function updateMusicButtonState() {
    const musicToggle = document.getElementById('musicToggle');
    const musicStatus = musicToggle.querySelector('.music-status');
    const musicIcon = musicToggle.querySelector('i');
    
    if (isMusicPlaying) {
        musicToggle.classList.add('active');
        musicStatus.textContent = 'ON';
        musicIcon.classList.remove('fa-volume-mute');
        musicIcon.classList.add('fa-volume-up');
    } else {
        musicToggle.classList.remove('active');
        musicStatus.textContent = 'OFF';
        musicIcon.classList.remove('fa-volume-up');
        musicIcon.classList.add('fa-volume-mute');
    }
}

// Add event listener for the music toggle button
// Place this with your other event listeners at the bottom of main.js
document.getElementById('musicToggle').addEventListener('click', toggleBackgroundMusic);

// Initialize music when profile is opened
document.getElementById('profileButton').addEventListener('click', () => {
    document.querySelectorAll('.telegram-nav-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById('profileButton').classList.add('active');
    gameContainer.style.display = 'none';
    leadersContainer.style.display = 'none';
    balanceContainer.style.display = 'none';
    friendsContainer.style.display = 'none';
    profileContainer.style.display = 'block';
    updateProfileDisplay();
    
    // Update music button state when profile is opened
    if (backgroundMusic) {
        updateMusicButtonState();
    }
    
    dimmedOverlay.classList.remove('show');
});

// Initialize background music on page load
window.addEventListener('load', () => {
    console.log("📄 Page loaded, starting initialization...");
    gameContainer.style.display = 'block';
    initBackgroundMusic(); // Initialize music system
    initUser();
});

// ===============================
// Control Event Listeners
// ===============================
spinButton.addEventListener('click', spinReels);
betSettingsButton.addEventListener('click', toggleBetSettingsModal);
paytableButton.addEventListener('click', togglePaytableModal);
okButton.addEventListener('click', toggleBetSettingsModal);
okPaytableButton.addEventListener('click', togglePaytableModal);

maxBetButton.addEventListener('click', () => {
    coins_per_line = 10;
    coin_value = 5.0;
    updateBetDisplay();
});

decreaseBetLevel.addEventListener('click', () => {
    coins_per_line = Math.max(1, coins_per_line - 1);
    updateBetDisplay();
});

increaseBetLevel.addEventListener('click', () => {
    coins_per_line = Math.min(10, coins_per_line + 1);
    updateBetDisplay();
});

decreaseCoinValue.addEventListener('click', () => {
    coin_value = Math.max(1.0, coin_value - 1.0);
    updateBetDisplay();
});

increaseCoinValue.addEventListener('click', () => {
    coin_value = Math.min(5.0, coin_value + 1.0);
    updateBetDisplay();
});

toggleAutoSpin.addEventListener('click', () => {
    autoSpinEnabled = !autoSpinEnabled;
    updateAutoSettingsState();
});

decreaseAutoSpins.addEventListener('click', () => {
    autoSpins = Math.max(5, autoSpins - 5);
    autoSpinsModal.textContent = autoSpins;
});

increaseAutoSpins.addEventListener('click', () => {
    autoSpins = Math.min(20, autoSpins + 5);
    autoSpinsModal.textContent = autoSpins;
});

okAutoButton.addEventListener('click', () => {
    if (autoSpinEnabled) {
        remainingSpins = autoSpins - 1;
        quickSpin = quickSpinCheckbox.checked;
        isAutoSpinning = true;
        autoButton.textContent = 'Stop';
        toggleAutoSettingsModal();
        spinReels();
    } else {
        toggleAutoSettingsModal();
    }
});

autoButton.addEventListener('click', () => {
    if (isAutoSpinning) {
        isAutoSpinning = false;
        autoButton.textContent = 'Auto';
        unlockButtons();
    } else {
        toggleAutoSettingsModal();
    }
});

const shareButton = document.getElementById('shareButton');
if (shareButton) {
    shareButton.addEventListener('click', shareReferralLink);
}

// ===============================
// Window Event Listeners
// ===============================
window.addEventListener('load', () => {
    console.log("📄 Page loaded, starting initialization...");
    gameContainer.style.display = 'block';
    initUser();
});

window.addEventListener('resize', () => {
    SYMBOL_HEIGHT = updateSymbolHeight();
    if (!isSpinning) {
        reels.forEach(reel => {
            reel.style.transform = `translateY(${-SYMBOL_HEIGHT * (CENTER_INDEX - Math.floor(VISIBLE_LINES / 2))}px)`;
        });
    }
});

document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
        console.error(`Image loading error: ${img.src}`);
        img.src = 'images/default_avatar.jpg';
    });
});

// Export copyText function globally
window.copyText = copyText;

console.log("✅ Lucky Wizard - Full system loaded and ready!");
console.log("🔗 Referral system: ACTIVE");
console.log("💰 Payment system: ACTIVE");
console.log("🎰 Game engine: ACTIVE");