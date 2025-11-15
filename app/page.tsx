'use client';

import { useTrades } from './lib/contexts/TradeContext';
import { usePortfolios } from './lib/contexts/PortfolioContext';
import { useSettings } from './lib/contexts/SettingsContext';
import { calculatePerformanceMetrics, calculatePortfolioBalance } from './lib/calculations';
import { formatCurrency, formatPercentage, formatDate, getPnLColor } from './lib/formatters';
import StatCard from './components/StatCard';
import Card, { CardHeader, CardTitle } from './components/Card';
import Button from './components/Button';
import EmptyState from './components/EmptyState';
import Link from 'next/link';
import { TrendingUp, TrendingDown, DollarSign, Target, Plus, PieChart } from 'lucide-react';
import { useMemo } from 'react';

export default function Dashboard() {
  const { trades } = useTrades();
  const { activePortfolio } = usePortfolios();
  const { settings } = useSettings();

  const portfolioTrades = useMemo(() => {
    if (!activePortfolio) return [];
    return trades.filter(t => t.portfolioId === activePortfolio.id);
  }, [trades, activePortfolio]);

  const metrics = useMemo(() => {
    return calculatePerformanceMetrics(portfolioTrades);
  }, [portfolioTrades]);

  const recentTrades = useMemo(() => {
    return [...portfolioTrades]
      .sort((a, b) => (b.exitDate || b.entryDate).localeCompare(a.exitDate || a.entryDate))
      .slice(0, 10);
  }, [portfolioTrades]);

  const currentBalance = useMemo(() => {
    if (!activePortfolio) return 0;
    const deposits = activePortfolio.deposits.reduce((sum, d) => sum + d.amount, 0);
    const withdrawals = activePortfolio.withdrawals.reduce((sum, w) => sum + w.amount, 0);
    return calculatePortfolioBalance(
      activePortfolio.initialBalance,
      portfolioTrades,
      deposits,
      withdrawals
    );
  }, [activePortfolio, portfolioTrades]);

  if (!activePortfolio) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Dashboard
        </h1>
        <EmptyState
          icon={PieChart}
          title="No Portfolio Found"
          description="Create a portfolio to start tracking your trades"
          action={
            <Link href="/portfolios">
              <Button>Create Portfolio</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-0">
          Dashboard
        </h1>
        <div className="flex space-x-3">
          <Link href="/setups/new">
            <Button variant="secondary">
              <Target className="w-4 h-4 mr-2 inline" />
              New Setup
            </Button>
          </Link>
          <Link href="/trades/new">
            <Button>
              <Plus className="w-4 h-4 mr-2 inline" />
              New Trade
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Portfolio Value"
          value={formatCurrency(currentBalance, activePortfolio.currency, settings.hideAmounts)}
          icon={DollarSign}
          trend={
            metrics.totalPnL !== 0
              ? {
                  value: formatCurrency(metrics.totalPnL, activePortfolio.currency, settings.hideAmounts),
                  isPositive: metrics.totalPnL > 0,
                }
              : undefined
          }
        />
        <StatCard
          title="Total Trades"
          value={metrics.totalTrades}
          icon={TrendingUp}
        />
        <StatCard
          title="Win Rate"
          value={`${metrics.winRate.toFixed(1)}%`}
          icon={Target}
          trend={{
            value: `${metrics.winningTrades}W / ${metrics.losingTrades}L`,
            isPositive: metrics.winRate >= 50,
          }}
        />
        <StatCard
          title="Profit Factor"
          value={metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2)}
          icon={PieChart}
          trend={{
            value: formatCurrency(metrics.averageWin, activePortfolio.currency, settings.hideAmounts),
            isPositive: metrics.profitFactor > 1,
          }}
        />
      </div>

      {/* Recent Trades */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Trades</CardTitle>
            <Link href="/trades">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>

        {recentTrades.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No Trades Yet"
            description="Start by adding your first trade to begin tracking your performance"
            action={
              <Link href="/trades/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Add Your First Trade
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
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
                {recentTrades.map((trade) => (
                  <tr
                    key={trade.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(trade.exitDate || trade.entryDate, settings.dateFormat)}
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/trades/${trade.id}`} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
                        {trade.ticker}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {trade.assetType}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {trade.direction === 'long' ? (
                        <span className="text-profit-600 dark:text-profit-400 capitalize">Long</span>
                      ) : (
                        <span className="text-loss-600 dark:text-loss-400 capitalize">Short</span>
                      )}
                    </td>
                    <td className={`py-3 px-4 text-sm text-right font-medium ${trade.pnl !== undefined ? getPnLColor(trade.pnl) : 'text-gray-600'}`}>
                      {trade.pnl !== undefined
                        ? formatCurrency(trade.pnl, activePortfolio.currency, settings.hideAmounts)
                        : '-'
                      }
                    </td>
                    <td className={`py-3 px-4 text-sm text-right font-medium ${trade.pnlPercentage !== undefined ? getPnLColor(trade.pnlPercentage) : 'text-gray-600'}`}>
                      {trade.pnlPercentage !== undefined ? formatPercentage(trade.pnlPercentage) : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        trade.status === 'open'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
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

      {/* Quick Stats */}
      {metrics.totalTrades > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Best Trade</p>
                <p className={`text-2xl font-bold mt-2 ${getPnLColor(metrics.bestTrade)}`}>
                  {formatCurrency(metrics.bestTrade, activePortfolio.currency, settings.hideAmounts)}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-profit-600 dark:text-profit-400" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Worst Trade</p>
                <p className={`text-2xl font-bold mt-2 ${getPnLColor(metrics.worstTrade)}`}>
                  {formatCurrency(metrics.worstTrade, activePortfolio.currency, settings.hideAmounts)}
                </p>
              </div>
              <TrendingDown className="w-10 h-10 text-loss-600 dark:text-loss-400" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Hold Time</p>
                <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100">
                  {metrics.averageHoldTime.toFixed(1)} days
                </p>
              </div>
              <Target className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
