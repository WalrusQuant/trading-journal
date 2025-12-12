'use client';

import { useMemo } from 'react';
import { useTrades } from '../lib/contexts/TradeContext';
import { usePortfolios } from '../lib/contexts/PortfolioContext';
import { useSettings } from '../lib/contexts/SettingsContext';
import { useTags } from '../lib/contexts/TagContext';
import {
  calculatePerformanceMetrics,
  calculateDailyPnL,
  calculateCumulativePnL,
  groupTradesByTag,
} from '../lib/calculations';
import { formatCurrency, formatPercentage, getPnLColor } from '../lib/formatters';
import Card, { CardHeader, CardTitle } from '../components/Card';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import {
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Award,
  BarChart3,
  Activity,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { trades } = useTrades();
  const { activePortfolio } = usePortfolios();
  const { settings } = useSettings();
  const { tags } = useTags();

  const portfolioTrades = useMemo(() => {
    if (!activePortfolio) return [];
    return trades.filter((t) => t.portfolioId === activePortfolio.id);
  }, [trades, activePortfolio]);

  const closedTrades = portfolioTrades.filter((t) => t.status === 'closed');
  const metrics = useMemo(() => calculatePerformanceMetrics(portfolioTrades), [portfolioTrades]);
  const dailyPnL = useMemo(() => calculateDailyPnL(portfolioTrades), [portfolioTrades]);
  const tradesByTag = useMemo(() => groupTradesByTag(closedTrades), [closedTrades]);

  if (!activePortfolio || closedTrades.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-8">
          <BarChart3 className="w-6 h-6 text-bloomberg-500" />
          <h1 className="text-xl font-mono font-bold text-bloomberg-500 uppercase tracking-wider">
            Analytics
          </h1>
        </div>
        <Card>
          <EmptyState
            icon={BarChart3}
            title="No Data Available"
            description="Close some trades to see analytics and performance metrics"
          />
        </Card>
      </div>
    );
  }

  // Calculate tag performance
  const tagPerformance = Array.from(tradesByTag.entries())
    .map(([tagId, tagTrades]) => {
      const tag = tags.find((t) => t.id === tagId);
      const tagMetrics = calculatePerformanceMetrics(tagTrades);
      return {
        tag: tag?.name || 'Unknown',
        color: tag?.color || '#gray',
        totalTrades: tagMetrics.totalTrades,
        winRate: tagMetrics.winRate,
        totalPnL: tagMetrics.totalPnL,
      };
    })
    .sort((a, b) => b.totalPnL - a.totalPnL);

  // Asset type performance
  const assetTypeGroups = closedTrades.reduce((acc, trade) => {
    if (!acc[trade.assetType]) acc[trade.assetType] = [];
    acc[trade.assetType].push(trade);
    return acc;
  }, {} as Record<string, typeof closedTrades>);

  const assetTypePerformance = Object.entries(assetTypeGroups).map(([type, trades]) => {
    const metrics = calculatePerformanceMetrics(trades);
    return {
      type,
      totalTrades: metrics.totalTrades,
      winRate: metrics.winRate,
      totalPnL: metrics.totalPnL,
    };
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-bloomberg-500" />
        <h1 className="text-xl font-mono font-bold text-bloomberg-500 uppercase tracking-wider">
          Analytics
        </h1>
        <span className="status-live">Live</span>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total P&L"
          value={formatCurrency(metrics.totalPnL, activePortfolio.currency, settings.hideAmounts)}
          icon={DollarSign}
          highlight={metrics.totalPnL >= 0 ? 'profit' : 'loss'}
        />
        <StatCard
          title="Win Rate"
          value={`${metrics.winRate.toFixed(1)}%`}
          icon={Target}
          highlight={metrics.winRate >= 50 ? 'profit' : 'loss'}
        />
        <StatCard
          title="Profit Factor"
          value={metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2)}
          icon={Award}
          highlight={metrics.profitFactor > 1 ? 'profit' : 'loss'}
        />
        <StatCard
          title="Avg Hold Time"
          value={`${metrics.averageHoldTime.toFixed(1)}d`}
          icon={Activity}
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card padding={false}>
          <div className="panel-header">
            <span className="panel-title">Win/Loss Breakdown</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-terminal-border/50">
              <span className="text-sm font-mono text-gray-400">Winning Trades</span>
              <span className="text-lg font-mono font-semibold text-profit-400">
                {metrics.winningTrades}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-terminal-border/50">
              <span className="text-sm font-mono text-gray-400">Losing Trades</span>
              <span className="text-lg font-mono font-semibold text-loss-400">
                {metrics.losingTrades}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-terminal-border/50">
              <span className="text-sm font-mono text-gray-400">Average Win</span>
              <span className="text-lg font-mono font-semibold text-profit-400">
                {formatCurrency(metrics.averageWin, activePortfolio.currency, settings.hideAmounts)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-mono text-gray-400">Average Loss</span>
              <span className="text-lg font-mono font-semibold text-loss-400">
                {formatCurrency(metrics.averageLoss, activePortfolio.currency, settings.hideAmounts)}
              </span>
            </div>
          </div>
          <div className="h-0.5 bg-gradient-to-r from-profit-500/50 to-loss-500/50" />
        </Card>

        <Card padding={false}>
          <div className="panel-header">
            <span className="panel-title">Best & Worst</span>
          </div>
          <div className="p-4 space-y-4">
            <div className="p-3 bg-terminal-panel border border-terminal-border">
              <div className="flex items-center mb-2">
                <TrendingUp className="w-4 h-4 text-profit-500 mr-2" />
                <span className="text-xs font-mono text-gray-500 uppercase">Best Trade</span>
              </div>
              <p className="text-2xl font-mono font-bold text-profit-400">
                {formatCurrency(metrics.bestTrade, activePortfolio.currency, settings.hideAmounts)}
              </p>
            </div>
            <div className="p-3 bg-terminal-panel border border-terminal-border">
              <div className="flex items-center mb-2">
                <TrendingDown className="w-4 h-4 text-loss-500 mr-2" />
                <span className="text-xs font-mono text-gray-500 uppercase">Worst Trade</span>
              </div>
              <p className="text-2xl font-mono font-bold text-loss-400">
                {formatCurrency(metrics.worstTrade, activePortfolio.currency, settings.hideAmounts)}
              </p>
            </div>
          </div>
          <div className="h-0.5 bg-gradient-to-r from-profit-500/50 to-loss-500/50" />
        </Card>
      </div>

      {/* Asset Type Performance */}
      <Card padding={false} className="mb-4">
        <div className="panel-header">
          <span className="panel-title">Performance by Asset Type</span>
          <span className="text-xs font-mono text-gray-500">{assetTypePerformance.length} types</span>
        </div>

        <div className="overflow-x-auto">
          <table className="terminal-table">
            <thead>
              <tr>
                <th>Asset Type</th>
                <th className="text-right">Trades</th>
                <th className="text-right">Win Rate</th>
                <th className="text-right">Total P&L</th>
              </tr>
            </thead>
            <tbody>
              {assetTypePerformance.map((item) => (
                <tr key={item.type}>
                  <td className="text-bloomberg-400 font-medium uppercase">{item.type}</td>
                  <td className="text-right text-gray-300">{item.totalTrades}</td>
                  <td className={`text-right ${item.winRate >= 50 ? 'text-profit-400' : 'text-loss-400'}`}>
                    {item.winRate.toFixed(1)}%
                  </td>
                  <td className={`text-right font-medium ${item.totalPnL >= 0 ? 'text-profit-400' : 'text-loss-400'}`}>
                    {formatCurrency(item.totalPnL, activePortfolio.currency, settings.hideAmounts)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Tag Performance */}
      {tagPerformance.length > 0 && (
        <Card padding={false}>
          <div className="panel-header">
            <span className="panel-title">Performance by Tag</span>
            <span className="text-xs font-mono text-gray-500">{tagPerformance.length} tags</span>
          </div>

          <div className="overflow-x-auto">
            <table className="terminal-table">
              <thead>
                <tr>
                  <th>Tag</th>
                  <th className="text-right">Trades</th>
                  <th className="text-right">Win Rate</th>
                  <th className="text-right">Total P&L</th>
                </tr>
              </thead>
              <tbody>
                {tagPerformance.map((item) => (
                  <tr key={item.tag}>
                    <td>
                      <span
                        className="inline-flex items-center px-2 py-0.5 text-xs font-mono uppercase border"
                        style={{
                          backgroundColor: `${item.color}20`,
                          borderColor: `${item.color}50`,
                          color: item.color
                        }}
                      >
                        {item.tag}
                      </span>
                    </td>
                    <td className="text-right text-gray-300">{item.totalTrades}</td>
                    <td className={`text-right ${item.winRate >= 50 ? 'text-profit-400' : 'text-loss-400'}`}>
                      {item.winRate.toFixed(1)}%
                    </td>
                    <td className={`text-right font-medium ${item.totalPnL >= 0 ? 'text-profit-400' : 'text-loss-400'}`}>
                      {formatCurrency(item.totalPnL, activePortfolio.currency, settings.hideAmounts)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
