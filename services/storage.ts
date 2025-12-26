import { PlayerStats, DailyQuest, Theme, Affirmation, Wallpaper } from '../types';
import { generateDailyQuest, REWARDS, THEME_CONFIG, STICKER_CONFIG, AFFIRMATIONS, WHEEL_PRIZES, WALLPAPER_CONFIG } from './gameLogic';

const STORAGE_KEY = 'tictactoe_pastel_stats_v3'; 
const SETTINGS_KEY = 'tictactoe_pastel_settings';
const QUEST_KEY = 'tictactoe_pastel_quest';

interface GameSettings {
  soundEnabled: boolean;
}

// Default Stats
const defaultStats: PlayerStats = {
  displayName: 'Player',
  avatarId: 'cat', 
  currency: 50, 
  ownedThemes: ['classic'],
  ownedStickers: ['hi'],
  ownedWallpapers: ['cloudy'], // Default
  activeWallpaper: 'cloudy',
  unlockedAffirmations: [], 
  lastAffirmationDate: null,
  lastSpinDate: null, 
  totalWins: 0,
  totalLosses: 0,
  totalDraws: 0,
  gamesPlayed: 0,
  currentStreak: 0,
  maxStreak: 0,
  unlockedAchievements: []
};

const defaultSettings: GameSettings = {
  soundEnabled: true,
};

export const getStats = (): PlayerStats => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with default to handle new fields for existing users
      return { ...defaultStats, ...parsed };
    }
  } catch (e) {
    console.warn('LocalStorage access denied', e);
  }
  return defaultStats;
};

export const updateDisplayName = (name: string): PlayerStats => {
    try {
        const stats = getStats();
        const newStats = { ...stats, displayName: name };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
        return newStats;
    } catch (e) {
        return defaultStats;
    }
};

export const updateAvatar = (avatarId: string): PlayerStats => {
    try {
        const stats = getStats();
        const newStats = { ...stats, avatarId: avatarId };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
        return newStats;
    } catch (e) {
        return defaultStats;
    }
};

export const purchaseTheme = (themeId: Theme): { success: boolean, stats: PlayerStats } => {
    try {
        const stats = getStats();
        const cost = THEME_CONFIG[themeId].cost;
        
        if (stats.ownedThemes.includes(themeId)) {
             return { success: true, stats };
        }

        if (stats.currency >= cost) {
            const newStats = {
                ...stats,
                currency: stats.currency - cost,
                ownedThemes: [...stats.ownedThemes, themeId]
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
            return { success: true, stats: newStats };
        }
    } catch (e) {}
    return { success: false, stats: defaultStats };
};

export const purchaseSticker = (stickerId: string): { success: boolean, stats: PlayerStats } => {
    try {
        const stats = getStats();
        const config = STICKER_CONFIG[stickerId];
        if (!config) return { success: false, stats };

        if (stats.ownedStickers.includes(stickerId)) {
             return { success: true, stats };
        }

        if (stats.currency >= config.cost) {
            const newStats = {
                ...stats,
                currency: stats.currency - config.cost,
                ownedStickers: [...stats.ownedStickers, stickerId]
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
            return { success: true, stats: newStats };
        }
    } catch (e) {}
    return { success: false, stats: defaultStats };
};

export const purchaseWallpaper = (id: Wallpaper): { success: boolean, stats: PlayerStats } => {
    try {
        const stats = getStats();
        const config = WALLPAPER_CONFIG[id];
        
        if (stats.ownedWallpapers.includes(id)) {
             const newStats = { ...stats, activeWallpaper: id };
             localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
             return { success: true, stats: newStats };
        }

        if (stats.currency >= config.cost) {
            const newStats = {
                ...stats,
                currency: stats.currency - config.cost,
                ownedWallpapers: [...stats.ownedWallpapers, id],
                activeWallpaper: id
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
            return { success: true, stats: newStats };
        }
    } catch (e) {}
    return { success: false, stats: defaultStats };
};

export const setWallpaper = (id: Wallpaper): PlayerStats => {
     try {
        const stats = getStats();
        if (stats.ownedWallpapers.includes(id)) {
            const newStats = { ...stats, activeWallpaper: id };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
            return newStats;
        }
    } catch (e) {}
    return defaultStats;
};

export const canSpinWheel = (): boolean => {
    try {
        const stats = getStats();
        const today = new Date().toISOString().split('T')[0];
        return stats.lastSpinDate !== today;
    } catch (e) {
        return false;
    }
};

export const recordSpin = (prizeValue: number): PlayerStats => {
    try {
        const stats = getStats();
        const today = new Date().toISOString().split('T')[0];
        
        const newStats = {
            ...stats,
            currency: stats.currency + prizeValue,
            lastSpinDate: today
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
        return newStats;
    } catch (e) {
        return defaultStats;
    }
};

export const checkAndUnlockAffirmation = (): { stats: PlayerStats, newAffirmation: Affirmation | null } => {
    try {
        const stats = getStats();
        const today = new Date().toISOString().split('T')[0];

        // Only one per day
        if (stats.lastAffirmationDate === today) {
            return { stats, newAffirmation: null };
        }

        // Find locked affirmations
        const locked = AFFIRMATIONS.filter(a => !stats.unlockedAffirmations.includes(a.id));
        
        if (locked.length === 0) {
             return { stats, newAffirmation: null };
        }

        // Pick random
        const next = locked[Math.floor(Math.random() * locked.length)];
        
        const newStats = {
            ...stats,
            unlockedAffirmations: [...stats.unlockedAffirmations, next.id],
            lastAffirmationDate: today
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
        return { stats: newStats, newAffirmation: next };

    } catch (e) {
        return { stats: defaultStats, newAffirmation: null };
    }
};

export const updateGameStats = (result: 'win' | 'loss' | 'draw', newAchievements: string[] = []): PlayerStats => {
  try {
    const stats = getStats();
    
    const newStats: PlayerStats = { ...stats };
    newStats.gamesPlayed += 1;
    
    // Add Rewards
    if (result === 'win') newStats.currency += REWARDS.WIN;
    if (result === 'draw') newStats.currency += REWARDS.DRAW;
    if (result === 'loss') newStats.currency += REWARDS.LOSS;

    if (newAchievements.length > 0) {
        newStats.unlockedAchievements = [...newStats.unlockedAchievements, ...newAchievements];
    }

    if (result === 'win') {
      newStats.totalWins += 1;
      newStats.currentStreak += 1;
      if (newStats.currentStreak > newStats.maxStreak) {
        newStats.maxStreak = newStats.currentStreak;
      }
    } else if (result === 'loss') {
      newStats.totalLosses += 1;
      newStats.currentStreak = 0;
    } else {
      newStats.totalDraws += 1;
      // Draws pause streak
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
    return newStats;
  } catch (e) {
    console.warn('LocalStorage access denied', e);
    return defaultStats;
  }
};

// Helper to add Quest Reward
export const claimQuestReward = (): PlayerStats => {
     try {
        const stats = getStats();
        const newStats = { ...stats, currency: stats.currency + REWARDS.QUEST };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
        return newStats;
    } catch (e) {
        return defaultStats;
    }
};

export const getDailyQuest = (): DailyQuest => {
    let quest: DailyQuest | null = null;
    try {
        const stored = localStorage.getItem(QUEST_KEY);
        if (stored) {
            quest = JSON.parse(stored);
        }
    } catch (e) {}

    const today = new Date().toISOString().split('T')[0];
    if (!quest || quest.date !== today) {
        const newQuest = generateDailyQuest(quest); 
        saveDailyQuest(newQuest);
        return newQuest;
    }

    return quest;
};

export const saveDailyQuest = (quest: DailyQuest) => {
    try {
        localStorage.setItem(QUEST_KEY, JSON.stringify(quest));
    } catch (e) {
        console.warn(e);
    }
};

export const getSettings = (): GameSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('LocalStorage access denied', e);
  }
  return defaultSettings;
};

export const saveSettings = (settings: Partial<GameSettings>) => {
  try {
    const current = getSettings();
    const newSettings = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    return newSettings;
  } catch (e) {
    console.warn('LocalStorage access denied', e);
    return defaultSettings;
  }
};

// Promo Code System
const PROMO_KEY = 'tictactoe_pastel_promos';
const ACTIVE_DISCOUNT_KEY = 'tictactoe_pastel_discount';

interface PromoData {
  usedCodes: string[];
  earnedCodes: string[];
}

interface ActiveDiscount {
  percentage: number;
  expiresAt: number; // timestamp
}

const getPromoData = (): PromoData => {
  try {
    const stored = localStorage.getItem(PROMO_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return { usedCodes: [], earnedCodes: [] };
};

const savePromoData = (data: PromoData) => {
  try {
    localStorage.setItem(PROMO_KEY, JSON.stringify(data));
  } catch (e) {}
};

export const saveEarnedPromoCode = (code: string) => {
  const data = getPromoData();
  if (!data.earnedCodes.includes(code)) {
    data.earnedCodes.push(code);
    savePromoData(data);
  }
};

export const getEarnedPromoCodes = (): string[] => {
  return getPromoData().earnedCodes;
};

export const isPromoCodeUsed = (code: string): boolean => {
  return getPromoData().usedCodes.includes(code);
};

export const isPromoCodeValid = (code: string): boolean => {
  const data = getPromoData();
  return data.earnedCodes.includes(code) && !data.usedCodes.includes(code);
};

export const redeemPromoCode = (code: string): { success: boolean; stats: PlayerStats; message: string } => {
  try {
    const data = getPromoData();
    const stats = getStats();

    // Check if code was earned by this player
    if (!data.earnedCodes.includes(code)) {
      return { success: false, stats, message: 'Invalid promo code' };
    }

    // Check if already used
    if (data.usedCodes.includes(code)) {
      return { success: false, stats, message: 'Code already used' };
    }

    // Mark as used
    data.usedCodes.push(code);
    savePromoData(data);

    // Give rewards: +25 Hearts + 50% discount for 10 minutes
    const newStats = {
      ...stats,
      currency: stats.currency + 25
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));

    // Activate discount
    const discount: ActiveDiscount = {
      percentage: 50,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    };
    localStorage.setItem(ACTIVE_DISCOUNT_KEY, JSON.stringify(discount));

    return { 
      success: true, 
      stats: newStats, 
      message: '+25 Hearts + 50% discount for 10 min!' 
    };
  } catch (e) {
    return { success: false, stats: getStats(), message: 'Error redeeming code' };
  }
};

export const getActiveDiscount = (): ActiveDiscount | null => {
  try {
    const stored = localStorage.getItem(ACTIVE_DISCOUNT_KEY);
    if (stored) {
      const discount: ActiveDiscount = JSON.parse(stored);
      if (discount.expiresAt > Date.now()) {
        return discount;
      }
      // Expired, clear it
      localStorage.removeItem(ACTIVE_DISCOUNT_KEY);
    }
  } catch (e) {}
  return null;
};

export const applyDiscount = (originalPrice: number): number => {
  const discount = getActiveDiscount();
  if (discount) {
    return Math.floor(originalPrice * (1 - discount.percentage / 100));
  }
  return originalPrice;
};


// Add hearts (from purchase)
export const addHearts = (amount: number): PlayerStats => {
  try {
    const stats = getStats();
    const newStats = { ...stats, currency: stats.currency + amount };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
    return newStats;
  } catch (e) {
    return getStats();
  }
};
