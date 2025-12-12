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
import { TrendingUp, TrendingDown, DollarSign, Target, Plus, PieChart, Activity, Clock, Zap } from 'lucide-react';
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
        <div className="flex items-center gap-3 mb-8">
          <Activity className="w-6 h-6 text-bloomberg-500" />
          <h1 className="text-xl font-mono font-bold text-bloomberg-500 uppercase tracking-wider">
            Dashboard
          </h1>
        </div>
        <Card>
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
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <Activity className="w-6 h-6 text-bloomberg-500" />
          <h1 className="text-xl font-mono font-bold text-bloomberg-500 uppercase tracking-wider">
            Dashboard
          </h1>
          <span className="status-live">Live</span>
        </div>
        <div className="flex space-x-2">
          <Link href="/setups/new">
            <Button variant="secondary" size="sm">
              <Target className="w-3.5 h-3.5 mr-1.5 inline" />
              New Setup
            </Button>
          </Link>
          <Link href="/trades/new">
            <Button variant="success" size="sm">
              <Plus className="w-3.5 h-3.5 mr-1.5 inline" />
              New Trade
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Portfolio Value"
          value={formatCurrency(currentBalance, activePortfolio.currency, settings.hideAmounts)}
          icon={DollarSign}
          highlight={metrics.totalPnL > 0 ? 'profit' : metrics.totalPnL < 0 ? 'loss' : 'neutral'}
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
          highlight={metrics.winRate >= 50 ? 'profit' : 'loss'}
          trend={{
            value: `${metrics.winningTrades}W / ${metrics.losingTrades}L`,
            isPositive: metrics.winRate >= 50,
          }}
        />
        <StatCard
          title="Profit Factor"
          value={metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2)}
          icon={PieChart}
          highlight={metrics.profitFactor > 1 ? 'profit' : 'loss'}
          trend={{
            value: formatCurrency(metrics.averageWin, activePortfolio.currency, settings.hideAmounts),
            isPositive: metrics.profitFactor > 1,
          }}
        />
      </div>

      {/* Recent Trades */}
      <Card padding={false}>
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <span className="panel-title">Recent Trades</span>
            <span className="text-xs font-mono text-gray-600">({recentTrades.length})</span>
          </div>
          <Link href="/trades">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>

        {recentTrades.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No Trades Yet"
            description="Start by adding your first trade to begin tracking your performance"
            action={
              <Link href="/trades/new">
                <Button variant="success">
                  <Plus className="w-3.5 h-3.5 mr-1.5 inline" />
                  Add First Trade
                </Button>
              </Link>
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
                  <th className="text-right">P&L</th>
                  <th className="text-right">P&L %</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map((trade) => (
                  <tr key={trade.id}>
                    <td className="text-gray-400">
                      {formatDate(trade.exitDate || trade.entryDate, settings.dateFormat)}
                    </td>
                    <td>
                      <Link href={`/trades/${trade.id}`} className="text-bloomberg-400 hover:text-bloomberg-300 transition-colors">
                        {trade.ticker}
                      </Link>
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
                    <td className={`text-right font-medium ${trade.pnl !== undefined ? (trade.pnl >= 0 ? 'text-profit-400' : 'text-loss-400') : 'text-gray-600'}`}>
                      {trade.pnl !== undefined
                        ? formatCurrency(trade.pnl, activePortfolio.currency, settings.hideAmounts)
                        : '-'
                      }
                    </td>
                    <td className={`text-right font-medium ${trade.pnlPercentage !== undefined ? (trade.pnlPercentage >= 0 ? 'text-profit-400' : 'text-loss-400') : 'text-gray-600'}`}>
                      {trade.pnlPercentage !== undefined ? formatPercentage(trade.pnlPercentage) : '-'}
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

      {/* Quick Stats */}
      {metrics.totalTrades > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card padding={false}>
            <div className="panel-header">
              <span className="panel-title">Best Trade</span>
              <TrendingUp className="w-4 h-4 text-profit-500" />
            </div>
            <div className="p-4">
              <p className={`text-2xl font-mono font-bold ${metrics.bestTrade >= 0 ? 'text-profit-400' : 'text-loss-400'}`}>
                {formatCurrency(metrics.bestTrade, activePortfolio.currency, settings.hideAmounts)}
              </p>
            </div>
            <div className="h-0.5 bg-profit-500" />
          </Card>

          <Card padding={false}>
            <div className="panel-header">
              <span className="panel-title">Worst Trade</span>
              <TrendingDown className="w-4 h-4 text-loss-500" />
            </div>
            <div className="p-4">
              <p className={`text-2xl font-mono font-bold ${metrics.worstTrade >= 0 ? 'text-profit-400' : 'text-loss-400'}`}>
                {formatCurrency(metrics.worstTrade, activePortfolio.currency, settings.hideAmounts)}
              </p>
            </div>
            <div className="h-0.5 bg-loss-500" />
          </Card>

          <Card padding={false}>
            <div className="panel-header">
              <span className="panel-title">Avg Hold Time</span>
              <Clock className="w-4 h-4 text-bloomberg-500" />
            </div>
            <div className="p-4">
              <p className="text-2xl font-mono font-bold text-gray-100">
                {metrics.averageHoldTime.toFixed(1)} <span className="text-sm text-gray-500">days</span>
              </p>
            </div>
            <div className="h-0.5 bg-bloomberg-500/50" />
          </Card>
        </div>
      )}
    </div>
  );
}
