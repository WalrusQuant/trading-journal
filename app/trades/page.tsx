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
import { Plus, Download, TrendingUp, Search, Filter } from 'lucide-react';
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
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-6 h-6 text-bloomberg-500" />
          <h1 className="text-xl font-mono font-bold text-bloomberg-500 uppercase tracking-wider">
            Trades
          </h1>
        </div>
        <Card>
          <EmptyState
            icon={TrendingUp}
            title="No Portfolio Found"
            description="Create a portfolio to start tracking your trades"
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <TrendingUp className="w-6 h-6 text-bloomberg-500" />
          <h1 className="text-xl font-mono font-bold text-bloomberg-500 uppercase tracking-wider">
            Trades
          </h1>
          <span className="text-xs font-mono text-gray-500">({portfolioTrades.length})</span>
        </div>
        <div className="flex space-x-2">
          {filteredTrades.length > 0 && (
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <Download className="w-3.5 h-3.5 mr-1.5 inline" />
              Export
            </Button>
          )}
          <Link href="/trades/new">
            <Button variant="success" size="sm">
              <Plus className="w-3.5 h-3.5 mr-1.5 inline" />
              New Trade
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card padding={false} className="mb-4">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <span className="panel-title">Filters</span>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search ticker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              options={[
                { value: 'all', label: 'All Types' },
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

          <div className="mt-3 flex flex-wrap gap-2">
            <Select
              options={[
                { value: 'date', label: 'Sort: Date' },
                { value: 'ticker', label: 'Sort: Ticker' },
                { value: 'pnl', label: 'Sort: P&L' },
                { value: 'pnlPercent', label: 'Sort: P&L %' },
              ]}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-auto"
            />

            <Select
              options={[
                { value: 'desc', label: 'DESC' },
                { value: 'asc', label: 'ASC' },
              ]}
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
              className="w-auto"
            />
          </div>
        </div>
      </Card>

      {/* Results */}
      <Card padding={false}>
        <div className="panel-header">
          <span className="panel-title">Trade History</span>
          <span className="text-xs font-mono text-gray-500">{filteredTrades.length} results</span>
        </div>

        {filteredTrades.length === 0 ? (
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
                  <Button variant="success">
                    <Plus className="w-3.5 h-3.5 mr-1.5 inline" />
                    Add First Trade
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="terminal-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Ticker</th>
                  <th>Type</th>
                  <th>Direction</th>
                  <th className="text-right">Entry</th>
                  <th className="text-right">Exit</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">P&L</th>
                  <th className="text-right">P&L %</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((trade) => (
                  <tr
                    key={trade.id}
                    className="cursor-pointer"
                    onClick={() => (window.location.href = `/trades/${trade.id}`)}
                  >
                    <td className="text-gray-400">
                      {formatDate(trade.entryDate, settings.dateFormat)}
                    </td>
                    <td>
                      <span className="text-bloomberg-400 font-medium">
                        {trade.ticker}
                      </span>
                    </td>
                    <td className="text-gray-500 uppercase text-xs">
                      {trade.assetType}
                    </td>
                    <td>
                      {trade.direction === 'long' ? (
                        <span className="text-profit-400 uppercase text-xs">Long</span>
                      ) : (
                        <span className="text-loss-400 uppercase text-xs">Short</span>
                      )}
                    </td>
                    <td className="text-right text-gray-300">
                      ${trade.entryPrice.toFixed(2)}
                    </td>
                    <td className="text-right text-gray-300">
                      {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '-'}
                    </td>
                    <td className="text-right text-gray-300">
                      {trade.quantity}
                    </td>
                    <td className={`text-right font-medium ${
                      trade.pnl !== undefined
                        ? (trade.pnl >= 0 ? 'text-profit-400' : 'text-loss-400')
                        : 'text-gray-600'
                    }`}>
                      {trade.pnl !== undefined
                        ? formatCurrency(trade.pnl, activePortfolio.currency, settings.hideAmounts)
                        : '-'}
                    </td>
                    <td className={`text-right font-medium ${
                      trade.pnlPercentage !== undefined
                        ? (trade.pnlPercentage >= 0 ? 'text-profit-400' : 'text-loss-400')
                        : 'text-gray-600'
                    }`}>
                      {trade.pnlPercentage !== undefined
                        ? formatPercentage(trade.pnlPercentage)
                        : '-'}
                    </td>
                    <td className="text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-mono uppercase border ${
                        trade.status === 'open'
                          ? 'bg-info-500/10 text-info-400 border-info-500/30'
                          : 'bg-terminal-card text-gray-400 border-terminal-border'
                      }`}>
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
        <div className="mt-3 text-xs font-mono text-gray-500">
          Showing {filteredTrades.length} of {portfolioTrades.length} trades
        </div>
      )}
    </div>
  );
}
