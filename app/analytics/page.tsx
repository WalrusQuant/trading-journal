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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Analytics</h1>
        <EmptyState
          icon={BarChart3}
          title="No Data Available"
          description="Close some trades to see analytics and performance metrics"
        />
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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Analytics</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total P&L"
          value={formatCurrency(metrics.totalPnL, activePortfolio.currency, settings.hideAmounts)}
          icon={DollarSign}
        />
        <StatCard
          title="Win Rate"
          value={`${metrics.winRate.toFixed(1)}%`}
          icon={Target}
        />
        <StatCard
          title="Profit Factor"
          value={metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2)}
          icon={Award}
        />
        <StatCard
          title="Avg Hold Time"
          value={`${metrics.averageHoldTime.toFixed(1)}d`}
          icon={TrendingUp}
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Win/Loss Breakdown</CardTitle>
          </CardHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Winning Trades</span>
              <span className="text-lg font-semibold text-profit-600 dark:text-profit-400">
                {metrics.winningTrades}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Losing Trades</span>
              <span className="text-lg font-semibold text-loss-600 dark:text-loss-400">
                {metrics.losingTrades}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Average Win</span>
              <span className="text-lg font-semibold text-profit-600 dark:text-profit-400">
                {formatCurrency(metrics.averageWin, activePortfolio.currency, settings.hideAmounts)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Average Loss</span>
              <span className="text-lg font-semibold text-loss-600 dark:text-loss-400">
                {formatCurrency(metrics.averageLoss, activePortfolio.currency, settings.hideAmounts)}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Best & Worst</CardTitle>
          </CardHeader>

          <div className="space-y-4">
            <div>
              <div className="flex items-center mb-2">
                <TrendingUp className="w-5 h-5 text-profit-600 dark:text-profit-400 mr-2" />
                <span className="text-gray-600 dark:text-gray-400">Best Trade</span>
              </div>
              <p className={`text-2xl font-bold ${getPnLColor(metrics.bestTrade)}`}>
                {formatCurrency(metrics.bestTrade, activePortfolio.currency, settings.hideAmounts)}
              </p>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <TrendingDown className="w-5 h-5 text-loss-600 dark:text-loss-400 mr-2" />
                <span className="text-gray-600 dark:text-gray-400">Worst Trade</span>
              </div>
              <p className={`text-2xl font-bold ${getPnLColor(metrics.worstTrade)}`}>
                {formatCurrency(metrics.worstTrade, activePortfolio.currency, settings.hideAmounts)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Asset Type Performance */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Performance by Asset Type</CardTitle>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Asset Type
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Trades
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Win Rate
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Total P&L
                </th>
              </tr>
            </thead>
            <tbody>
              {assetTypePerformance.map((item) => (
                <tr
                  key={item.type}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {item.type}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-gray-100">
                    {item.totalTrades}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-gray-100">
                    {item.winRate.toFixed(1)}%
                  </td>
                  <td className={`py-3 px-4 text-sm text-right font-medium ${getPnLColor(item.totalPnL)}`}>
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
        <Card>
          <CardHeader>
            <CardTitle>Performance by Tag</CardTitle>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Tag
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Trades
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Win Rate
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Total P&L
                  </th>
                </tr>
              </thead>
              <tbody>
                {tagPerformance.map((item) => (
                  <tr
                    key={item.tag}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="py-3 px-4">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.tag}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-gray-100">
                      {item.totalTrades}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-gray-100">
                      {item.winRate.toFixed(1)}%
                    </td>
                    <td className={`py-3 px-4 text-sm text-right font-medium ${getPnLColor(item.totalPnL)}`}>
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
