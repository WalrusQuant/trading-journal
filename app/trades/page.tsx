'use client';

import { useMemo, useState } from 'react';
import { useTrades } from '../lib/contexts/TradeContext';
import { usePortfolios } from '../lib/contexts/PortfolioContext';
import { useSettings } from '../lib/contexts/SettingsContext';
import { useTags } from '../lib/contexts/TagContext';
import { filterTrades, sortTrades, exportToCSV, downloadFile } from '../lib/utils';
import { formatCurrency, formatPercentage, formatDate, getPnLColor } from '../lib/formatters';
import Button from '../components/Button';
import Card from '../components/Card';
import Select from '../components/Select';
import Input from '../components/Input';
import EmptyState from '../components/EmptyState';
import Link from 'next/link';
import { Plus, Download, TrendingUp, Search } from 'lucide-react';
import { FilterOptions, AssetType, TradeStatus, TradeDirection } from '../lib/types';

export default function TradesPage() {
  const { trades } = useTrades();
  const { activePortfolio } = usePortfolios();
  const { settings } = useSettings();
  const { tags } = useTags();

  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'ticker' | 'pnl' | 'pnlPercent'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const portfolioTrades = useMemo(() => {
    if (!activePortfolio) return [];
    return trades.filter(t => t.portfolioId === activePortfolio.id);
  }, [trades, activePortfolio]);

  const filteredTrades = useMemo(() => {
    const filtered = filterTrades(portfolioTrades, { ...filters, searchQuery });
    return sortTrades(filtered, sortBy, sortDirection);
  }, [portfolioTrades, filters, searchQuery, sortBy, sortDirection]);

  const handleExport = () => {
    const csv = exportToCSV(filteredTrades);
    downloadFile(csv, `trades-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  if (!activePortfolio) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Trades</h1>
        <EmptyState
          icon={TrendingUp}
          title="No Portfolio Found"
          description="Create a portfolio to start tracking your trades"
        />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-0">
          Trades
        </h1>
        <div className="flex space-x-3">
          {filteredTrades.length > 0 && (
            <Button variant="secondary" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2 inline" />
              Export CSV
            </Button>
          )}
          <Link href="/trades/new">
            <Button>
              <Plus className="w-4 h-4 mr-2 inline" />
              New Trade
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search ticker or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            options={[
              { value: 'all', label: 'All Asset Types' },
              { value: 'stock', label: 'Stock' },
              { value: 'option', label: 'Option' },
              { value: 'future', label: 'Future' },
              { value: 'crypto', label: 'Crypto' },
              { value: 'forex', label: 'Forex' },
            ]}
            value={filters.assetType || 'all'}
            onChange={(e) =>
              setFilters({
                ...filters,
                assetType: e.target.value === 'all' ? undefined : (e.target.value as AssetType),
              })
            }
          />

          <Select
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'open', label: 'Open' },
              { value: 'closed', label: 'Closed' },
            ]}
            value={filters.status || 'all'}
            onChange={(e) =>
              setFilters({
                ...filters,
                status: e.target.value === 'all' ? undefined : (e.target.value as TradeStatus),
              })
            }
          />

          <Select
            options={[
              { value: 'all', label: 'All Directions' },
              { value: 'long', label: 'Long' },
              { value: 'short', label: 'Short' },
            ]}
            value={filters.direction || 'all'}
            onChange={(e) =>
              setFilters({
                ...filters,
                direction: e.target.value === 'all' ? undefined : (e.target.value as TradeDirection),
              })
            }
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Select
            options={[
              { value: 'date', label: 'Sort by Date' },
              { value: 'ticker', label: 'Sort by Ticker' },
              { value: 'pnl', label: 'Sort by P&L' },
              { value: 'pnlPercent', label: 'Sort by P&L %' },
            ]}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-auto"
          />

          <Select
            options={[
              { value: 'desc', label: 'Descending' },
              { value: 'asc', label: 'Ascending' },
            ]}
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
            className="w-auto"
          />
        </div>
      </Card>

      {/* Results */}
      <Card padding={false}>
        {filteredTrades.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={TrendingUp}
              title={portfolioTrades.length === 0 ? 'No Trades Yet' : 'No Trades Found'}
              description={
                portfolioTrades.length === 0
                  ? 'Start by adding your first trade'
                  : 'Try adjusting your filters'
              }
              action={
                portfolioTrades.length === 0 ? (
                  <Link href="/trades/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2 inline" />
                      Add Your First Trade
                    </Button>
                  </Link>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Ticker
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Direction
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Entry
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Exit
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Qty
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    P&L
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    P&L %
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((trade) => (
                  <tr
                    key={trade.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                    onClick={() => (window.location.href = `/trades/${trade.id}`)}
                  >
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(trade.entryDate, settings.dateFormat)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                        {trade.ticker}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {trade.assetType}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {trade.direction === 'long' ? (
                        <span className="text-profit-600 dark:text-profit-400 capitalize">
                          Long
                        </span>
                      ) : (
                        <span className="text-loss-600 dark:text-loss-400 capitalize">Short</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-gray-100">
                      ${trade.entryPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-gray-100">
                      {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-gray-100">
                      {trade.quantity}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right font-medium ${
                        trade.pnl !== undefined ? getPnLColor(trade.pnl) : 'text-gray-600'
                      }`}
                    >
                      {trade.pnl !== undefined
                        ? formatCurrency(trade.pnl, activePortfolio.currency, settings.hideAmounts)
                        : '-'}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right font-medium ${
                        trade.pnlPercentage !== undefined
                          ? getPnLColor(trade.pnlPercentage)
                          : 'text-gray-600'
                      }`}
                    >
                      {trade.pnlPercentage !== undefined
                        ? formatPercentage(trade.pnlPercentage)
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          trade.status === 'open'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {trade.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Summary */}
      {filteredTrades.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredTrades.length} of {portfolioTrades.length} trades
        </div>
      )}
    </div>
  );
}
