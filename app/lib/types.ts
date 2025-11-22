export type AssetType = 'stock' | 'option' | 'future' | 'crypto' | 'forex';
export type TradeDirection = 'long' | 'short';
export type TradeStatus = 'open' | 'closed';
export type SetupStatus = 'active' | 'converted' | 'cancelled';
export type TagCategory = 'strategy' | 'setup' | 'condition' | 'mistake' | 'other';
export type Theme = 'light' | 'dark';

export interface Trade {
  id: string;
  portfolioId: string;
  assetType: AssetType;
  ticker: string;
  direction: TradeDirection;
  entryDate: string;
  entryPrice: number;
  exitDate?: string;
  exitPrice?: number;
  quantity: number;
  fees: number;
  pnl?: number;
  pnlPercentage?: number;
  tags: string[];
  confidence?: number; // 1-5
  notes?: string;
  images?: string[]; // base64 or URLs
  status: TradeStatus;
  createdAt: string;
  updatedAt: string;
  // Asset-specific fields
  tickValue?: number; // For futures: dollar value per tick (e.g., $12.50 for ES)
  tickSize?: number; // For futures: minimum price movement (e.g., 0.25 for ES)
  multiplier?: number; // For options: contract multiplier (usually 100)
  pipValue?: number; // For forex: value per pip
}

export interface TradeSetup {
  id: string;
  portfolioId: string;
  ticker: string;
  assetType: AssetType;
  direction: TradeDirection;
  entryPrice: number;
  stopLoss: number;
  targetPrice: number;
  positionSize: number;
  riskRewardRatio: number;
  notes?: string;
  status: SetupStatus;
  convertedTradeId?: string;
  createdAt: string;
}

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  initialBalance: number;
  currentBalance: number;
  currency: string;
  createdAt: string;
  deposits: Transaction[];
  withdrawals: Transaction[];
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  category: TagCategory;
}

export interface UserSettings {
  defaultAssetType: AssetType;
  defaultPositionSize: number;
  defaultRiskAmount: number;
  currency: string;
  dateFormat: string;
  theme: Theme;
  hideAmounts: boolean;
  defaultTags: string[];
  favoriteTickers: string[];
}

export interface PerformanceMetrics {
  totalPnL: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  bestTrade: number;
  worstTrade: number;
  averageHoldTime: number;
}

export interface DailyPnL {
  date: string;
  pnl: number;
  trades: number;
}

export interface FilterOptions {
  assetType?: AssetType;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  status?: TradeStatus;
  direction?: TradeDirection;
  searchQuery?: string;
}
