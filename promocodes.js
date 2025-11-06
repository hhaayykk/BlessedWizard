export const PROMOCODES = [
    {
        code: "WELCOME100",
        stars: 100,
        maxUses: 99999,
        currentUses: 0,
        active: true,
        expiresAt: null // Never expires
    },
    {
        code: "PHILIPPINES30",
        stars: 30,
        maxUses: 999999,
        currentUses: 0,
        active: true,
        expiresAt: null
    },
    {
        code: "MALAYALAM300",
        stars: 300,
        maxUses: 999999,
        currentUses: 0,
        active: true,
        expiresAt: null
    },
    {
        code: "INDONESIA30",
        stars: 30,
        maxUses: 999999,
        currentUses: 0,
        active: true,
        expiresAt: null
    }
];

/**
 * Add a new promocode
 * @param {string} code - The promocode string
 * @param {number} stars - Stars to reward
 * @param {number} maxUses - Maximum usage count
 * @param {number|null} expiresAt - Optional expiration timestamp
 */
export function addPromocode(code, stars, maxUses, expiresAt = null) {
    const newPromo = {
        code: code.toUpperCase(),
        stars: stars,
        maxUses: maxUses,
        currentUses: 0,
        active: true,
        expiresAt: expiresAt
    };
    
    PROMOCODES.push(newPromo);
    console.log(`✅ Promocode added: ${code} - ${stars} Stars (Max uses: ${maxUses})`);
}

/**
 * Deactivate a promocode
 * @param {string} code - The promocode to deactivate
 */
export function deactivatePromocode(code) {
    const promo = PROMOCODES.find(p => p.code.toUpperCase() === code.toUpperCase());
    if (promo) {
        promo.active = false;
        console.log(`❌ Promocode deactivated: ${code}`);
    }
}

// Example: Add a limited-time promocode
// addPromocode("NEWYEAR2025", 2025, 100, Date.now() + (7 * 24 * 60 * 60 * 1000)); // Expires in 7 days