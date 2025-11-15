import { format, parseISO } from 'date-fns';

export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  hideAmounts: boolean = false
): string {
  if (hideAmounts) return '***';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatDate(dateString: string, dateFormat: string = 'MM/dd/yyyy'): string {
  try {
    const date = parseISO(dateString);
    return format(date, dateFormat);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'MM/dd/yyyy HH:mm');
  } catch {
    return dateString;
  }
}

export function formatAssetType(assetType: string): string {
  const types: Record<string, string> = {
    stock: 'Stock',
    option: 'Option',
    future: 'Future',
    crypto: 'Crypto',
    forex: 'Forex',
  };
  return types[assetType] || assetType;
}

export function formatDirection(direction: string): string {
  return direction.charAt(0).toUpperCase() + direction.slice(1);
}

export function formatDuration(days: number): string {
  if (days < 1) {
    const hours = Math.round(days * 24);
    return `${hours}h`;
  }
  if (days < 7) {
    return `${Math.round(days)}d`;
  }
  if (days < 30) {
    const weeks = Math.round(days / 7);
    return `${weeks}w`;
  }
  const months = Math.round(days / 30);
  return `${months}mo`;
}

export function getPnLColor(pnl: number): string {
  if (pnl > 0) return 'text-profit-600 dark:text-profit-400';
  if (pnl < 0) return 'text-loss-600 dark:text-loss-400';
  return 'text-gray-600 dark:text-gray-400';
}

export function getPnLBgColor(pnl: number): string {
  if (pnl > 0) return 'bg-profit-50 dark:bg-profit-900/20';
  if (pnl < 0) return 'bg-loss-50 dark:bg-loss-900/20';
  return 'bg-gray-50 dark:bg-gray-800';
}

export function getConfidenceLabel(confidence?: number): string {
  if (!confidence) return 'N/A';
  if (confidence >= 4) return 'Very High';
  if (confidence >= 3) return 'High';
  if (confidence >= 2) return 'Medium';
  return 'Low';
}

export function getStatusBadgeColor(status: string): string {
  const colors: Record<string, string> = {
    open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    converted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  };
  return colors[status] || colors.open;
}
