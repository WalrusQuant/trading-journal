import { Trade, PerformanceMetrics, DailyPnL, AssetType } from './types';

export function calculateTradePnL(
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  direction: 'long' | 'short',
  fees: number = 0,
  assetType?: AssetType,
  tickValue?: number,
  tickSize?: number,
  multiplier?: number,
  pipValue?: number
): number {
  let pnl: number;
  const priceDiff = direction === 'long'
    ? (exitPrice - entryPrice)
    : (entryPrice - exitPrice);

  // Calculate P&L based on asset type
  switch (assetType) {
    case 'future':
      // Futures: (price difference in ticks) * tick value * contracts
      if (tickValue && tickSize) {
        const ticks = priceDiff / tickSize;
        pnl = ticks * tickValue * quantity - fees;
      } else {
        // Fallback if tick values not provided
        pnl = priceDiff * quantity - fees;
      }
      break;

    case 'option':
      // Options: price difference * contracts * multiplier (usually 100)
      const optionMultiplier = multiplier || 100;
      pnl = priceDiff * quantity * optionMultiplier - fees;
      break;

    case 'forex':
      // Forex: price difference * lot size * pip value
      if (pipValue) {
        // Assuming standard forex calculation
        pnl = (priceDiff * 10000) * quantity * pipValue - fees; // 10000 for pips calculation
      } else {
        pnl = priceDiff * quantity - fees;
      }
      break;

    case 'stock':
    case 'crypto':
    default:
      // Stock/Crypto: simple price difference * quantity
      pnl = priceDiff * quantity - fees;
      break;
  }

  return pnl;
}

export function calculatePnLPercentage(
  entryPrice: number,
  exitPrice: number,
  direction: 'long' | 'short'
): number {
  let percentage: number;

  if (direction === 'long') {
    percentage = ((exitPrice - entryPrice) / entryPrice) * 100;
  } else {
    percentage = ((entryPrice - exitPrice) / entryPrice) * 100;
  }

  return percentage;
}

export function calculateRiskRewardRatio(
  entryPrice: number,
  stopLoss: number,
  targetPrice: number,
  direction: 'long' | 'short'
): number {
  let risk: number;
  let reward: number;

  if (direction === 'long') {
    risk = entryPrice - stopLoss;
    reward = targetPrice - entryPrice;
  } else {
    risk = stopLoss - entryPrice;
    reward = entryPrice - targetPrice;
  }

  if (risk <= 0) return 0;

  return reward / risk;
}

export function calculatePerformanceMetrics(trades: Trade[]): PerformanceMetrics {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl !== undefined);

  if (closedTrades.length === 0) {
    return {
      totalPnL: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      averageWin: 0,
      averageLoss: 0,
      profitFactor: 0,
      bestTrade: 0,
      worstTrade: 0,
      averageHoldTime: 0,
    };
  }

  const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
  const losingTrades = closedTrades.filter(t => (t.pnl || 0) < 0);

  const totalWins = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0));

  const winRate = (winningTrades.length / closedTrades.length) * 100;
  const averageWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
  const averageLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;

  const pnlValues = closedTrades.map(t => t.pnl || 0);
  const bestTrade = Math.max(...pnlValues);
  const worstTrade = Math.min(...pnlValues);

  // Calculate average hold time in days
  const holdTimes = closedTrades
    .filter(t => t.exitDate)
    .map(t => {
      const entry = new Date(t.entryDate).getTime();
      const exit = new Date(t.exitDate!).getTime();
      return (exit - entry) / (1000 * 60 * 60 * 24); // Convert to days
    });

  const averageHoldTime = holdTimes.length > 0
    ? holdTimes.reduce((sum, time) => sum + time, 0) / holdTimes.length
    : 0;

  return {
    totalPnL,
    totalTrades: closedTrades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate,
    averageWin,
    averageLoss,
    profitFactor,
    bestTrade,
    worstTrade,
    averageHoldTime,
  };
}

export function calculateDailyPnL(trades: Trade[]): DailyPnL[] {
  const dailyMap = new Map<string, { pnl: number; trades: number }>();

  trades
    .filter(t => t.status === 'closed' && t.exitDate && t.pnl !== undefined)
    .forEach(trade => {
      const date = trade.exitDate!.split('T')[0]; // Get date part only
      const existing = dailyMap.get(date) || { pnl: 0, trades: 0 };
      dailyMap.set(date, {
        pnl: existing.pnl + (trade.pnl || 0),
        trades: existing.trades + 1,
      });
    });

  return Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      pnl: data.pnl,
      trades: data.trades,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function calculateCumulativePnL(trades: Trade[]): { date: string; cumulative: number }[] {
  const closedTrades = trades
    .filter(t => t.status === 'closed' && t.exitDate && t.pnl !== undefined)
    .sort((a, b) => (a.exitDate || '').localeCompare(b.exitDate || ''));

  let cumulative = 0;
  return closedTrades.map(trade => {
    cumulative += trade.pnl || 0;
    return {
      date: trade.exitDate!,
      cumulative,
    };
  });
}

export function groupTradesByTag(trades: Trade[]): Map<string, Trade[]> {
  const grouped = new Map<string, Trade[]>();

  trades.forEach(trade => {
    trade.tags.forEach(tag => {
      const existing = grouped.get(tag) || [];
      grouped.set(tag, [...existing, trade]);
    });
  });

  return grouped;
}

export function calculatePortfolioBalance(
  initialBalance: number,
  trades: Trade[],
  deposits: number = 0,
  withdrawals: number = 0
): number {
  const totalPnL = trades
    .filter(t => t.status === 'closed' && t.pnl !== undefined)
    .reduce((sum, t) => sum + (t.pnl || 0), 0);

  return initialBalance + totalPnL + deposits - withdrawals;
}
