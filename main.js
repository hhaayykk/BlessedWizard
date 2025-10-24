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
    TARGET_RTP: 96.0, // Target RTP 96% like Dog House
    MIN_RTP: 95.5,    // Tighter range for more consistent RTP
    MAX_RTP: 96.5,    // Tighter range for more consistent RTP
    BONUS_TRIGGER_CHANCE: 0.05, // 5% chance for big wins
    SMALL_WIN_MULTIPLIER_RANGE: [0.2, 0.8], // Small wins: 20%-80% of bet
    MEDIUM_WIN_MULTIPLIER_RANGE: [1.0, 3.0], // Medium wins: 1x-3x bet
    BIG_WIN_MULTIPLIER_RANGE: [5.0, 15.0], // Big wins: 5x-15x bet
    MEGA_WIN_MULTIPLIER_RANGE: [20.0, 50.0], // Mega wins: 20x-50x bet
    LOSS_STREAK_BONUS_TRIGGER: 6, // After 6 losses, increase win chance
    ADJUSTMENT_SPEED: 0.3 // How aggressively to correct RTP (0-1)
};

// Session statistics for RTP calculation
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
const MIN_WITHDRAW = 10;
const TRANSACTION_COOLDOWN = 30 * 60 * 1000;
const REFERRAL_BONUS_REFERRER = 5.0;
const REFERRAL_BONUS_NEW_USER = 5.0;
const BOT_USERNAME = "kazikkkbot";

// Slot symbols (weighted distribution like Dog House)
const symbols = [
    { name: 'petla', src: 'images/avelavokmagic.PNG', weight: 1 },      // Rarest - highest pay
    { name: 'magicball', src: 'images/ballmagic.png', weight: 2 },
    { name: 'book', src: 'images/bookmagic.png', weight: 3 },
    { name: 'hat', src: 'images/hatmagic.png', weight: 5 },
    { name: 'lighter', src: 'images/lightermagic.PNG', weight: 8 },
    { name: 'note', src: 'images/notemagic.png', weight: 12 },
    { name: 'poison', src: 'images/poisonmagic.png', weight: 15 }        // Most common - lowest pay
];

let SYMBOL_HEIGHT = 70;
const VISIBLE_LINES = 3;
const CENTER_INDEX = 10;

// Paylines
const paylines = [
    [0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [2, 2, 2, 2, 2], [0, 1, 2, 1, 0], [2, 1, 0, 1, 2],
    [0, 0, 1, 2, 2], [2, 2, 1, 0, 0], [1, 0, 0, 1, 1], [1, 2, 2, 1, 0], [0, 1, 1, 2, 2],
    [2, 1, 1, 0, 0], [0, 0, 0, 1, 2], [2, 2, 2, 1, 0], [1, 1, 0, 0, 1], [1, 1, 2, 2, 1],
    [0, 1, 2, 2, 2], [2, 1, 0, 0, 0], [0, 0, 1, 1, 2], [2, 2, 1, 1, 0], [1, 0, 1, 2, 1]
];

// NEW PAYTABLE (Dog House style - balanced payouts)
const paytable = {
    'petla': { 3: 5, 4: 15, 5: 100 },        // Premium symbol
    'magicball': { 3: 4, 4: 10, 5: 50 },     // High symbol
    'book': { 3: 3, 4: 8, 5: 30 },           // High symbol
    'hat': { 3: 2, 4: 5, 5: 20 },            // Medium symbol
    'lighter': { 3: 1.5, 4: 4, 5: 15 },      // Medium symbol
    'note': { 3: 1, 4: 3, 5: 10 },           // Low symbol
    'poison': { 3: 0.8, 4: 2, 5: 8 }         // Low symbol
};

// User profile
let userProfile = {
    name: "Anonymous",
    telegramId: "Not Set",
    registrationDate: "Not Set",
    language: "en",
    avatarUrl: "images/default_avatar.jpg"
};

// ===============================
// DOM Elements
// ===============================
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
// RTP System Functions (Dog House Logic)
// ===============================

function calculateCurrentRTP() {
    if (sessionStats.totalBet === 0) return 100.0;
    return (sessionStats.totalWon / sessionStats.totalBet) * 100;
}

function shouldTriggerWin() {
    const currentRTP = calculateCurrentRTP();
    
    // If RTP is too low, increase win chances
    if (currentRTP < RTP_CONFIG.MIN_RTP) {
        return Math.random() < 0.75; // 75% chance to win
    }
    
    // If RTP is too high, decrease win chances
    if (currentRTP > RTP_CONFIG.MAX_RTP) {
        return Math.random() < 0.25; // 25% chance to win
    }
    
    // Loss streak bonus (like Dog House)
    if (sessionStats.lossStreak >= RTP_CONFIG.LOSS_STREAK_BONUS_TRIGGER) {
        return Math.random() < 0.85; // 85% chance to win after long loss streak
    }
    
    // Normal win rate around target RTP
    return Math.random() < 0.45; // 45% base win rate
}

function determineWinType() {
    const currentRTP = calculateCurrentRTP();
    const rand = Math.random();
    
    // If RTP is low, prefer bigger wins
    if (currentRTP < RTP_CONFIG.MIN_RTP) {
        if (rand < 0.15) return 'mega';
        if (rand < 0.35) return 'big';
        if (rand < 0.65) return 'medium';
        return 'small';
    }
    
    // If RTP is high, prefer smaller wins
    if (currentRTP > RTP_CONFIG.MAX_RTP) {
        if (rand < 0.70) return 'small';
        if (rand < 0.95) return 'medium';
        return 'big';
    }
    
    // Balanced distribution
    if (rand < 0.02) return 'mega';   // 2%
    if (rand < 0.12) return 'big';    // 10%
    if (rand < 0.42) return 'medium'; // 30%
    return 'small';                    // 58%
}

function generateWeightedSymbol(forceWin = false, winType = 'medium') {
    if (forceWin) {
        // For wins, prefer higher paying symbols based on win type
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
    
    // Normal weighted random selection
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
        // Choose a random payline to win
        const winningPayline = paylines[Math.floor(Math.random() * paylines.length)];
        const winSymbol = generateWeightedSymbol(true, winType);
        
        // Determine how many matching symbols (3, 4, or 5)
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
        
        // Fill winning positions
        for (let i = 0; i < matchCount; i++) {
            const row = winningPayline[i];
            reelResults[i][row] = winSymbol;
        }
        
        // Fill remaining positions with random symbols
        for (let reel = 0; reel < 5; reel++) {
            for (let row = 0; row < VISIBLE_LINES; row++) {
                if (reelResults[reel][row] === null) {
                    reelResults[reel][row] = generateWeightedSymbol(false);
                }
            }
        }
    } else {
        // Generate losing result
        for (let reel = 0; reel < 5; reel++) {
            for (let row = 0; row < VISIBLE_LINES; row++) {
                reelResults[reel][row] = generateWeightedSymbol(false);
            }
        }
        
        // Ensure it's actually a loss by breaking any 3+ matches
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
                    // Break the match
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
// Referral System Functions
// ===============================

function generateReferralLink(userId) {
    const botUsername = BOT_USERNAME;
    return `https://t.me/${botUsername}?start=ref_${userId}`;
}

function getReferrerFromStartParam() {
    try {
        console.log("=== CHECKING REFERRAL PARAMETER ===");
        
        if (window.Telegram && window.Telegram.WebApp) {
            const initData = Telegram.WebApp.initDataUnsafe;
            console.log("Full initDataUnsafe:", initData);
            
            if (initData && initData.start_param) {
                const startParam = initData.start_param;
                console.log("Found start_param:", startParam);
                if (startParam.startsWith('ref_')) {
                    const referrerId = startParam.substring(4);
                    console.log("✅ Referrer ID extracted:", referrerId);
                    return referrerId;
                }
            }
            
            const urlParams = new URLSearchParams(window.location.search);
            const tgStartParam = urlParams.get('tgWebAppStartParam');
            console.log("URL tgWebAppStartParam:", tgStartParam);
            if (tgStartParam && tgStartParam.startsWith('ref_')) {
                const referrerId = tgStartParam.substring(4);
                console.log("✅ Referrer ID from URL:", referrerId);
                return referrerId;
            }
            
            if (window.location.hash) {
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const hashStartParam = hashParams.get('tgWebAppStartParam');
                console.log("Hash tgWebAppStartParam:", hashStartParam);
                if (hashStartParam && hashStartParam.startsWith('ref_')) {
                    const referrerId = hashStartParam.substring(4);
                    console.log("✅ Referrer ID from hash:", referrerId);
                    return referrerId;
                }
            }
            
            console.log("❌ No referral parameter found");
        }
        console.log("===================================");
    } catch (error) {
        console.error("Error extracting referrer:", error);
    }
    return null;
}

async function processReferral(newUserId, referrerId) {
    if (!referrerId || newUserId === referrerId) {
        console.log("No valid referrer or self-referral");
        return false;
    }

    try {
        const referrerRef = doc(db, "users", referrerId);
        const referrerSnap = await getDoc(referrerRef);

        if (!referrerSnap.exists()) {
            console.log("Referrer not found");
            return false;
        }

        const referrerData = referrerSnap.data();
        const currentReferrals = referrerData.referrals || [];
        
        if (currentReferrals.some(ref => ref.userId === newUserId)) {
            console.log("User already referred by this referrer");
            return false;
        }

        const newReferrerBalance = (referrerData.balance || 0) + REFERRAL_BONUS_REFERRER;
        const newTotalEarned = (referrerData.totalEarned || 0) + REFERRAL_BONUS_REFERRER;

        const referralRecord = {
            userId: newUserId,
            userName: userProfile.name,
            timestamp: Date.now(),
            reward: REFERRAL_BONUS_REFERRER,
            status: 'completed'
        };

        currentReferrals.push(referralRecord);

        await updateDoc(referrerRef, {
            balance: newReferrerBalance,
            referrals: currentReferrals,
            totalEarned: newTotalEarned
        });

        console.log(`Referral processed: ${REFERRAL_BONUS_REFERRER} Stars credited to referrer ${referrerId}`);
        
        const newUserRef = doc(db, "users", newUserId);
        const newUserSnap = await getDoc(newUserRef);
        
        if (newUserSnap.exists()) {
            const newUserBalance = (newUserSnap.data().balance || 0) + REFERRAL_BONUS_NEW_USER;
            await updateDoc(newUserRef, {
                balance: newUserBalance
            });
            
            balance = newUserBalance;
            updateBalanceDisplay();
            
            console.log(`Referral bonus: ${REFERRAL_BONUS_NEW_USER} Stars credited to new user ${newUserId}`);
            
            setTimeout(() => {
                showSuccess(`Welcome! You received ${Math.floor(REFERRAL_BONUS_NEW_USER)} Stars bonus!`);
            }, 1000);
        }

        return true;

    } catch (error) {
        console.error("Error processing referral:", error);
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

            const friendsInvitedEl = document.getElementById('friendsInvited');
            const totalEarnedEl = document.getElementById('totalEarned');
            const referralLinkEl = document.getElementById('referralLink');

            if (friendsInvitedEl) friendsInvitedEl.textContent = referrals.length;
            if (totalEarnedEl) {
                totalEarnedEl.innerHTML = `⭐ ${Math.floor(totalEarned)}`;
            }

            const referralLink = generateReferralLink(userId);
            if (referralLinkEl) referralLinkEl.textContent = referralLink;
        }
    } catch (error) {
        console.error("Error loading referral info:", error);
    }
}

function shareReferralLink() {
    const referralLink = generateReferralLink(telegramId);
    const shareText = `🎰 Join Lucky Wizard and get 5 Stars bonus! Use my referral link:`;
    
    if (window.Telegram && window.Telegram.WebApp) {
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
        Telegram.WebApp.openTelegramLink(shareUrl);
    } else {
        copyText(document.getElementById('shareButton'), referralLink);
        showSuccess('Link copied to clipboard!');
    }
}

// ===============================
// Firebase Functions
// ===============================
async function createUserInFirebase(userId, userData) {
    try {
        const userRef = doc(db, "users", userId);
        await setDoc(userRef, {
            telegramId: userData.telegramId,
            name: userData.name,
            balance: 0.0,
            registrationDate: serverTimestamp(),
            language: "en",
            avatarUrl: userData.avatarUrl || "images/default_avatar.jpg",
            transactionHistory: [],
            referrals: [],
            totalEarned: 0
        });
        console.log("User created in Firebase");
        return true;
    } catch (error) {
        console.error("Error creating user:", error);
        return false;
    }
}

async function loadUserFromFirebase(userId) {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const data = userSnap.data();
            console.log("User data loaded from Firebase:", data);
            
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
        console.log("Balance updated in Firebase:", newBalance);
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

// ===============================
// User Initialization with Referral Support
// ===============================
async function initUser() {
    console.log("=== INITIALIZING USER WITH REFERRAL SUPPORT ===");
    try {
        let referrerId = null;

        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.ready();
            const initData = Telegram.WebApp.initDataUnsafe;
            
            referrerId = getReferrerFromStartParam();
            console.log("🔗 Referrer ID detected:", referrerId || "None");
            
            if (!initData || !initData.user) {
                console.warn("⚠️ Telegram initData not available! Using test mode.");
                telegramId = "test_user_" + Math.random().toString(36).substr(2, 9);
                userProfile.name = "Test User";
                userProfile.telegramId = telegramId;
                userProfile.avatarUrl = "images/default_avatar.jpg";
                balance = 0;
            } else {
                const user = initData.user;
                console.log("👤 Telegram user data:", user);
                telegramId = user.id.toString();
                const firstName = user.first_name || '';
                const lastName = user.last_name || '';
                userProfile.name = `${firstName} ${lastName}`.trim() || "Anonymous";
                userProfile.telegramId = telegramId;
                userProfile.avatarUrl = user.photo_url || "images/default_avatar.jpg";

                console.log("📂 Loading user from Firebase...");
                const userExists = await loadUserFromFirebase(telegramId);
                
                if (!userExists) {
                    console.log("🆕 New user! Creating account...");
                    await createUserInFirebase(telegramId, {
                        telegramId: telegramId,
                        name: userProfile.name,
                        avatarUrl: userProfile.avatarUrl
                    });
                    await loadUserFromFirebase(telegramId);

                    if (referrerId) {
                        console.log("🎁 Processing referral bonus...");
                        const referralProcessed = await processReferral(telegramId, referrerId);
                        if (referralProcessed) {
                            console.log("✅ Referral bonus credited successfully!");
                            setTimeout(() => {
                                showSuccess(`🎉 Welcome! You and your friend both received 5 Stars bonus!`);
                            }, 1000);
                        } else {
                            console.log("❌ Referral bonus failed");
                        }
                    } else {
                        console.log("ℹ️ No referrer - regular registration (0 Stars starting balance)");
                        setTimeout(() => {
                            showSuccess(`Welcome to Lucky Wizard! Invite friends to earn 5 Stars each!`);
                        }, 1000);
                    }
                } else {
                    console.log("👋 Welcome back! Existing user loaded.");
                }
            }
        } else {
            console.warn("⚠️ Telegram WebApp not available!");
            telegramId = "test_user_" + Math.random().toString(36).substr(2, 9);
            userProfile.name = "Test User";
            userProfile.telegramId = telegramId;
            balance = 0;
        }
        
        updateBalanceDisplay();
        updateProfileDisplay();
        initializeGame();
        console.log("=== INITIALIZATION COMPLETE ===");
    } catch (error) {
        console.error("❌ Error initializing user:", error);
        showError('Error loading data. Demo mode available.');
        balance = 0;
        updateBalanceDisplay();
        updateProfileDisplay();
        initializeGame();
    }
}

// ===============================
// Game Initialization
// ===============================
function initializeGame() {
    console.log("Initializing game...");
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
function generateRandomTag() {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
}

function copyText(element, text) {
    navigator.clipboard.writeText(text).then(() => {
        element.style.filter = 'brightness(50%)';
        setTimeout(() => element.style.filter = 'brightness(100%)', 1000);
    }).catch(err => console.error("Copy error:", err));
}

function hasTransactedInLast30Minutes() {
    const now = Date.now();
    return transactionHistory.some(t => now - t.timestamp < TRANSACTION_COOLDOWN);
}

function getTimeRemaining() {
    const now = Date.now();
    const lastTransaction = transactionHistory[transactionHistory.length - 1];
    const timeSinceLast = (now - lastTransaction.timestamp) / (1000 * 60);
    return (30 - timeSinceLast).toFixed(1);
}

function isValidAmount(amountStr) {
    return /^\d+(\.\d{1,2})?$/.test(amountStr);
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
    }, 3000);
}

function showSuccess(message) {
    resultText.textContent = message;
    resultText.classList.add('win-message');
    resultOverlay.classList.add('show');
    setTimeout(() => {
        resultOverlay.classList.remove('show');
        resultText.classList.remove('win-message');
    }, 3000);
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
        
        const response = await fetch(`https://api.telegram.org/bot8265410692:AAGkx4V3CPymkRxaidj2gI9MvD2wJaiY0Ck/createInvoiceLink`, {
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
            <p>100% Secure Deposit</p>
        </div>
    `;
    
    document.getElementById('depositButton').addEventListener('click', loadDeposit);
    document.getElementById('withdrawButton').addEventListener('click', loadWithdraw);
    
    const depositInput = document.getElementById('depositAmountInput');
    const depositError = document.getElementById('depositError');
    const depositSubmitBtn = document.getElementById('depositSubmitBtn');
    
    // Quick amount buttons
    document.querySelectorAll('.quick-amount-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = btn.dataset.amount;
            depositInput.value = amount;
            depositInput.style.color = '#e0e0ff';
        });
    });
    
    // Validate input in real-time
    depositInput.addEventListener('input', () => {
        const amount = parseInt(depositInput.value);
        
        if (!depositInput.value || isNaN(amount) || amount < 1000 || amount > 999999) {
            depositInput.style.color = '#ff4d4d';
        } else {
            depositInput.style.color = '#e0e0ff';
        }
    });
    
    // Submit deposit
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
                <p>Withdraw your Stars to cryptocurrency. Minimum withdrawal: ${MIN_WITHDRAW} Stars.</p>
            </div>

            <div class="currency-title">Select Payment Method</div>
            <select class="withdrawal-input" id="withdrawalMethod">
                <option value="TON">Toncoin (TON)</option>
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="USDT_TRC20">USDT TRC-20</option>
                <option value="USDT_ERC20">USDT ERC-20</option>
                <option value="USDT_BEP20">USDT BEP-20</option>
            </select>
            
            <div class="currency-title" style="margin-top: 15px;">Amount (Stars)</div>
            <div style="display: flex; gap: 10px;">
                <input type="number" class="withdrawal-input" id="withdrawalAmount" placeholder="e.g., 100" min="${MIN_WITHDRAW}">
                <button class="max-button" id="maxButton">Max</button>
            </div>
            
            <div class="currency-title" style="margin-top: 15px;">Wallet Address</div>
            <input type="text" class="withdrawal-input" id="withdrawalWallet" placeholder="Enter your wallet address">
            
            <div class="error-message" id="amountError"></div>
            <button class="withdraw-submit" id="submitWithdraw">Withdraw</button>
            
            <div id="withdrawalStatus" class="withdrawal-status" style="display: none;">
                <i class="fas fa-clock"></i>
                <p><strong>Withdrawal in process</strong></p>
                <p>Your withdrawal request is being processed. This can take some time.</p>
            </div>
            
            <div class="deposit-warning" style="margin-top: 15px;">
                <p>Processing time: 24-48 hours</p>
                <p>Double-check your wallet address before submitting</p>
            </div>
        </div>
    `;
    
    document.getElementById('depositButton').addEventListener('click', loadDeposit);
    document.getElementById('withdrawButton').addEventListener('click', loadWithdraw);
    document.getElementById('maxButton').addEventListener('click', () => {
        document.getElementById('withdrawalAmount').value = Math.floor(balance);
        document.getElementById('amountError').textContent = '';
    });
    document.getElementById('submitWithdraw').addEventListener('click', handleWithdrawSubmit);
}

async function handleWithdrawSubmit() {
    const amountInput = document.getElementById('withdrawalAmount');
    const errorEl = document.getElementById('amountError');
    const amount = parseFloat(amountInput.value);

    if (!amount || amount < MIN_WITHDRAW) {
        errorEl.textContent = `Minimum withdrawal is ${MIN_WITHDRAW} Stars`;
        return;
    }

    if (amount > balance) {
        errorEl.textContent = 'Insufficient balance';
        return;
    }

    if (hasTransactedInLast30Minutes()) {
        errorEl.textContent = `Please wait ${getTimeRemaining()} minutes`;
        return;
    }

    showSuccess(`Withdrawal of ${Math.floor(amount)} Stars processed!`);
    const newBalance = balance - amount;
    await updateBalanceInFirebase(telegramId, newBalance);
    
    const transaction = {
        type: 'withdrawal',
        method: 'telegram_stars',
        amount: amount,
        timestamp: Date.now(),
        status: 'completed'
    };
    await addTransactionToFirebase(telegramId, transaction);
    
    setTimeout(() => loadWithdraw(), 1000);
}

// ===============================
// Slot Machine Functions (Dog House Style)
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
    
    isSpinning = true;
    lockButtons();
    
    // Update session stats
    sessionStats.totalBet += total_bet;
    sessionStats.spinCount++;
    
    const newBalance = balance - total_bet;
    await updateBalanceInFirebase(telegramId, newBalance);

    // RTP System: Determine if this spin should win
    const shouldWin = shouldTriggerWin();
    const winType = shouldWin ? determineWinType() : 'none';
    
    console.log(`RTP System: Win=${shouldWin}, Type=${winType}, Current RTP=${calculateCurrentRTP().toFixed(2)}%`);
    
    // Generate smart reel results based on RTP decision
    const reelResults = generateSmartReelResult(shouldWin, winType);
    
    const speedFactor = quickSpin ? 0.1 : 0.25;
    let maxTime = 0;

    reels.forEach((reel, i) => {
        const reelSymbols = generateReelSymbols();
        reel.innerHTML = createReelHTML(reelSymbols);
        reel.style.transition = 'none';
        reel.style.transform = 'translateY(0)';
        void reel.offsetWidth;

        const startDelay = 100 * i;
        const spinDuration = (2 + i * 0.5) * speedFactor;
        setTimeout(() => {
            const stopPosition = -SYMBOL_HEIGHT * (CENTER_INDEX - Math.floor(VISIBLE_LINES / 2));
            reel.style.transition = `transform ${spinDuration}s cubic-bezier(0.3, 0.1, 0.3, 1)`;
            reel.style.transform = `translateY(${stopPosition - SYMBOL_HEIGHT * 20}px)`;
            setTimeout(() => {
                reel.style.transition = `transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)`;
                reel.style.transform = `translateY(${stopPosition}px)`;
                reel.innerHTML = createReelHTML(reelResults[i].concat(generateReelSymbols().slice(VISIBLE_LINES)));
            }, spinDuration * 1000 - 500);
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

    // Update session stats
    sessionStats.totalWon += totalWin;
    sessionStats.currentRTP = calculateCurrentRTP();

    if (totalWin > 0) {
        sessionStats.lossStreak = 0; // Reset loss streak
        
        const roundedWin = Math.floor(totalWin);
        const newBalance = balance + roundedWin;
        await updateBalanceInFirebase(telegramId, newBalance);
        
        // Determine win message based on multiplier
        const multiplier = roundedWin / total_bet;
        let winMessage;
        if (multiplier >= 20) {
            winMessage = `🎉 MEGA WIN! ${roundedWin} Stars!`;
        } else if (multiplier >= 5) {
            winMessage = `🔥 BIG WIN! ${roundedWin} Stars!`;
        } else if (multiplier >= 2) {
            winMessage = `✨ NICE WIN! ${roundedWin} Stars!`;
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
        sessionStats.lossStreak++; // Increase loss streak
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
    }, quickSpin ? 500 : 1500);
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

document.getElementById('profileButton').addEventListener('click', () => {
    document.querySelectorAll('.telegram-nav-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById('profileButton').classList.add('active');
    gameContainer.style.display = 'none';
    leadersContainer.style.display = 'none';
    balanceContainer.style.display = 'none';
    friendsContainer.style.display = 'none';
    profileContainer.style.display = 'block';
    updateProfileDisplay();
    dimmedOverlay.classList.remove('show');
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
    console.log("Page loaded, starting initialization...");
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

window.copyText = copyText;