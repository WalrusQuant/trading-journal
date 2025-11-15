import { Trade, TradeSetup, Portfolio, Tag, UserSettings } from './types';

const STORAGE_VERSION = '1.0';
const STORAGE_KEYS = {
  VERSION: 'tradetracker_version',
  TRADES: 'tradetracker_trades',
  SETUPS: 'tradetracker_setups',
  PORTFOLIOS: 'tradetracker_portfolios',
  TAGS: 'tradetracker_tags',
  SETTINGS: 'tradetracker_settings',
  ACTIVE_PORTFOLIO: 'tradetracker_active_portfolio',
};

// Type-safe localStorage wrapper
export const storage = {
  // Trades
  getTrades: (): Trade[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.TRADES);
    return data ? JSON.parse(data) : [];
  },

  saveTrades: (trades: Trade[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(trades));
  },

  addTrade: (trade: Trade): void => {
    const trades = storage.getTrades();
    trades.push(trade);
    storage.saveTrades(trades);
  },

  updateTrade: (id: string, updates: Partial<Trade>): void => {
    const trades = storage.getTrades();
    const index = trades.findIndex(t => t.id === id);
    if (index !== -1) {
      trades[index] = { ...trades[index], ...updates, updatedAt: new Date().toISOString() };
      storage.saveTrades(trades);
    }
  },

  deleteTrade: (id: string): void => {
    const trades = storage.getTrades().filter(t => t.id !== id);
    storage.saveTrades(trades);
  },

  // Trade Setups
  getSetups: (): TradeSetup[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.SETUPS);
    return data ? JSON.parse(data) : [];
  },

  saveSetups: (setups: TradeSetup[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SETUPS, JSON.stringify(setups));
  },

  addSetup: (setup: TradeSetup): void => {
    const setups = storage.getSetups();
    setups.push(setup);
    storage.saveSetups(setups);
  },

  updateSetup: (id: string, updates: Partial<TradeSetup>): void => {
    const setups = storage.getSetups();
    const index = setups.findIndex(s => s.id === id);
    if (index !== -1) {
      setups[index] = { ...setups[index], ...updates };
      storage.saveSetups(setups);
    }
  },

  deleteSetup: (id: string): void => {
    const setups = storage.getSetups().filter(s => s.id !== id);
    storage.saveSetups(setups);
  },

  // Portfolios
  getPortfolios: (): Portfolio[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.PORTFOLIOS);
    return data ? JSON.parse(data) : [];
  },

  savePortfolios: (portfolios: Portfolio[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(portfolios));
  },

  addPortfolio: (portfolio: Portfolio): void => {
    const portfolios = storage.getPortfolios();
    portfolios.push(portfolio);
    storage.savePortfolios(portfolios);
  },

  updatePortfolio: (id: string, updates: Partial<Portfolio>): void => {
    const portfolios = storage.getPortfolios();
    const index = portfolios.findIndex(p => p.id === id);
    if (index !== -1) {
      portfolios[index] = { ...portfolios[index], ...updates };
      storage.savePortfolios(portfolios);
    }
  },

  deletePortfolio: (id: string): void => {
    const portfolios = storage.getPortfolios().filter(p => p.id !== id);
    storage.savePortfolios(portfolios);
  },

  // Tags
  getTags: (): Tag[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.TAGS);
    return data ? JSON.parse(data) : getDefaultTags();
  },

  saveTags: (tags: Tag[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
  },

  addTag: (tag: Tag): void => {
    const tags = storage.getTags();
    tags.push(tag);
    storage.saveTags(tags);
  },

  updateTag: (id: string, updates: Partial<Tag>): void => {
    const tags = storage.getTags();
    const index = tags.findIndex(t => t.id === id);
    if (index !== -1) {
      tags[index] = { ...tags[index], ...updates };
      storage.saveTags(tags);
    }
  },

  deleteTag: (id: string): void => {
    const tags = storage.getTags().filter(t => t.id !== id);
    storage.saveTags(tags);
  },

  // Settings
  getSettings: (): UserSettings => {
    if (typeof window === 'undefined') return getDefaultSettings();
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : getDefaultSettings();
  },

  saveSettings: (settings: UserSettings): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Active Portfolio
  getActivePortfolioId: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PORTFOLIO);
  },

  setActivePortfolioId: (id: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PORTFOLIO, id);
  },

  // Data Management
  exportData: () => {
    return {
      version: STORAGE_VERSION,
      exportDate: new Date().toISOString(),
      trades: storage.getTrades(),
      setups: storage.getSetups(),
      portfolios: storage.getPortfolios(),
      tags: storage.getTags(),
      settings: storage.getSettings(),
    };
  },

  importData: (data: any): void => {
    if (data.trades) storage.saveTrades(data.trades);
    if (data.setups) storage.saveSetups(data.setups);
    if (data.portfolios) storage.savePortfolios(data.portfolios);
    if (data.tags) storage.saveTags(data.tags);
    if (data.settings) storage.saveSettings(data.settings);
  },

  clearAll: (): void => {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};

// Default values
function getDefaultSettings(): UserSettings {
  return {
    defaultAssetType: 'stock',
    defaultPositionSize: 100,
    defaultRiskAmount: 100,
    currency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    theme: 'light',
    hideAmounts: false,
    defaultTags: [],
    favoriteTickers: [],
  };
}

function getDefaultTags(): Tag[] {
  return [
    { id: '1', name: 'Momentum', color: '#3b82f6', category: 'strategy' },
    { id: '2', name: 'Breakout', color: '#8b5cf6', category: 'strategy' },
    { id: '3', name: 'Reversal', color: '#ec4899', category: 'strategy' },
    { id: '4', name: 'Swing', color: '#10b981', category: 'strategy' },
    { id: '5', name: 'Day Trade', color: '#f59e0b', category: 'strategy' },
    { id: '6', name: 'Cup & Handle', color: '#06b6d4', category: 'setup' },
    { id: '7', name: 'Head & Shoulders', color: '#6366f1', category: 'setup' },
    { id: '8', name: 'Double Top/Bottom', color: '#a855f7', category: 'setup' },
    { id: '9', name: 'Trending', color: '#22c55e', category: 'condition' },
    { id: '10', name: 'Ranging', color: '#eab308', category: 'condition' },
    { id: '11', name: 'Volatile', color: '#ef4444', category: 'condition' },
    { id: '12', name: 'FOMO', color: '#dc2626', category: 'mistake' },
    { id: '13', name: 'Revenge Trading', color: '#b91c1c', category: 'mistake' },
    { id: '14', name: 'Broke Rules', color: '#991b1b', category: 'mistake' },
  ];
}
