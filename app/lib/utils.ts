import { Trade, FilterOptions, TradeSetup } from './types';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function filterTrades(trades: Trade[], filters: FilterOptions): Trade[] {
  return trades.filter(trade => {
    if (filters.assetType && trade.assetType !== filters.assetType) {
      return false;
    }

    if (filters.status && trade.status !== filters.status) {
      return false;
    }

    if (filters.direction && trade.direction !== filters.direction) {
      return false;
    }

    if (filters.dateFrom && trade.entryDate < filters.dateFrom) {
      return false;
    }

    if (filters.dateTo && trade.entryDate > filters.dateTo) {
      return false;
    }

    if (filters.tags && filters.tags.length > 0) {
      const hasTag = filters.tags.some(tag => trade.tags.includes(tag));
      if (!hasTag) return false;
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesTicker = trade.ticker.toLowerCase().includes(query);
      const matchesNotes = trade.notes?.toLowerCase().includes(query);
      if (!matchesTicker && !matchesNotes) return false;
    }

    return true;
  });
}

export function sortTrades(
  trades: Trade[],
  sortBy: 'date' | 'ticker' | 'pnl' | 'pnlPercent',
  direction: 'asc' | 'desc'
): Trade[] {
  const sorted = [...trades].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'date':
        comparison = (a.exitDate || a.entryDate).localeCompare(b.exitDate || b.entryDate);
        break;
      case 'ticker':
        comparison = a.ticker.localeCompare(b.ticker);
        break;
      case 'pnl':
        comparison = (a.pnl || 0) - (b.pnl || 0);
        break;
      case 'pnlPercent':
        comparison = (a.pnlPercentage || 0) - (b.pnlPercentage || 0);
        break;
    }

    return direction === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

export function exportToCSV(trades: Trade[]): string {
  const headers = [
    'ID',
    'Portfolio ID',
    'Asset Type',
    'Ticker',
    'Direction',
    'Entry Date',
    'Entry Price',
    'Exit Date',
    'Exit Price',
    'Quantity',
    'Fees',
    'P&L',
    'P&L %',
    'Tags',
    'Confidence',
    'Status',
    'Notes',
  ];

  const rows = trades.map(trade => [
    trade.id,
    trade.portfolioId,
    trade.assetType,
    trade.ticker,
    trade.direction,
    trade.entryDate,
    trade.entryPrice,
    trade.exitDate || '',
    trade.exitPrice || '',
    trade.quantity,
    trade.fees,
    trade.pnl || '',
    trade.pnlPercentage || '',
    trade.tags.join(';'),
    trade.confidence || '',
    trade.status,
    trade.notes ? `"${trade.notes.replace(/"/g, '""')}"` : '',
  ]);

  const csv = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  return csv;
}

export function downloadFile(content: string, filename: string, type: string = 'text/plain'): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getDateRangeFilter(range: 'today' | 'week' | 'month' | 'year' | 'all'): {
  dateFrom?: string;
  dateTo?: string;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case 'today':
      return {
        dateFrom: today.toISOString(),
        dateTo: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      };
    case 'week':
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        dateFrom: weekAgo.toISOString(),
        dateTo: undefined,
      };
    case 'month':
      const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      return {
        dateFrom: monthAgo.toISOString(),
        dateTo: undefined,
      };
    case 'year':
      const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      return {
        dateFrom: yearAgo.toISOString(),
        dateTo: undefined,
      };
    case 'all':
    default:
      return {};
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
