'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useSetups } from '../lib/contexts/SetupContext';
import { usePortfolios } from '../lib/contexts/PortfolioContext';
import { formatDate } from '../lib/formatters';
import { useSettings } from '../lib/contexts/SettingsContext';
import Card from '../components/Card';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';
import { Plus, Target } from 'lucide-react';

export default function SetupsPage() {
  const { setups } = useSetups();
  const { activePortfolio } = usePortfolios();
  const { settings } = useSettings();

  const portfolioSetups = useMemo(() => {
    if (!activePortfolio) return [];
    return setups.filter((s) => s.portfolioId === activePortfolio.id);
  }, [setups, activePortfolio]);

  const activeSetups = portfolioSetups.filter((s) => s.status === 'active');
  const convertedSetups = portfolioSetups.filter((s) => s.status === 'converted');
  const cancelledSetups = portfolioSetups.filter((s) => s.status === 'cancelled');

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Trade Setups</h1>
        <Link href="/setups/new">
          <Button>
            <Plus className="w-4 h-4 mr-2 inline" />
            New Setup
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Setups</p>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-2">
            {activeSetups.length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">Converted</p>
          <p className="text-3xl font-bold text-profit-600 dark:text-profit-400 mt-2">
            {convertedSetups.length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
          <p className="text-3xl font-bold text-gray-600 dark:text-gray-400 mt-2">
            {cancelledSetups.length}
          </p>
        </Card>
      </div>

      {/* Setups List */}
      <Card padding={false}>
        {portfolioSetups.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Target}
              title="No Trade Setups"
              description="Create trade setups to plan your trades before entering positions"
              action={
                <Link href="/setups/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2 inline" />
                    Create Your First Setup
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
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
                    Target
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Stop Loss
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    R:R
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {portfolioSetups.map((setup) => (
                  <tr
                    key={setup.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                    onClick={() => (window.location.href = `/setups/${setup.id}`)}
                  >
                    <td className="py-3 px-4 text-sm font-medium text-primary-600 dark:text-primary-400">
                      {setup.ticker}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {setup.assetType}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={
                          setup.direction === 'long'
                            ? 'text-profit-600 dark:text-profit-400 capitalize'
                            : 'text-loss-600 dark:text-loss-400 capitalize'
                        }
                      >
                        {setup.direction}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-gray-100">
                      ${setup.entryPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-gray-100">
                      ${setup.targetPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-gray-100">
                      ${setup.stopLoss.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                      1:{setup.riskRewardRatio.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={
                          setup.status === 'active'
                            ? 'success'
                            : setup.status === 'converted'
                            ? 'info'
                            : 'default'
                        }
                      >
                        {setup.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(setup.createdAt, settings.dateFormat)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
