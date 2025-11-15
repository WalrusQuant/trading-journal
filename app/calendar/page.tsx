'use client';

import { useMemo, useState } from 'react';
import { useTrades } from '../lib/contexts/TradeContext';
import { usePortfolios } from '../lib/contexts/PortfolioContext';
import { useSettings } from '../lib/contexts/SettingsContext';
import { formatCurrency, getPnLColor, getPnLBgColor } from '../lib/formatters';
import Card, { CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function CalendarPage() {
  const { trades } = useTrades();
  const { activePortfolio } = usePortfolios();
  const { settings } = useSettings();

  const [currentDate, setCurrentDate] = useState(new Date());

  const portfolioTrades = useMemo(() => {
    if (!activePortfolio) return [];
    return trades.filter((t) => t.portfolioId === activePortfolio.id && t.status === 'closed');
  }, [trades, activePortfolio]);

  // Group trades by date
  const tradesByDate = useMemo(() => {
    const grouped: Record<string, typeof portfolioTrades> = {};

    portfolioTrades.forEach((trade) => {
      if (trade.exitDate) {
        const dateKey = trade.exitDate.split('T')[0];
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(trade);
      }
    });

    return grouped;
  }, [portfolioTrades]);

  // Calculate daily P&L
  const dailyPnL = useMemo(() => {
    const pnlMap: Record<string, number> = {};

    Object.entries(tradesByDate).forEach(([date, trades]) => {
      pnlMap[date] = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    });

    return pnlMap;
  }, [tradesByDate]);

  // Calendar generation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        Trading Calendar
      </h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {monthNames[month]} {year}
            </CardTitle>
            <div className="flex space-x-2">
              <Button size="sm" variant="secondary" onClick={previousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button size="sm" variant="secondary" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Names */}
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 py-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTrades = tradesByDate[dateKey] || [];
            const dayPnL = dailyPnL[dateKey] || 0;
            const hasTrades = dayTrades.length > 0;

            const isToday =
              day === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();

            return (
              <div
                key={day}
                className={`aspect-square p-2 rounded-lg border transition-colors ${
                  isToday
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                } ${hasTrades ? getPnLBgColor(dayPnL) : 'bg-white dark:bg-gray-800'}`}
              >
                <div className="flex flex-col h-full">
                  <div
                    className={`text-sm font-medium mb-1 ${
                      isToday
                        ? 'text-primary-700 dark:text-primary-400'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {day}
                  </div>

                  {hasTrades && (
                    <div className="flex-1 flex flex-col justify-center">
                      <p className={`text-xs font-semibold ${getPnLColor(dayPnL)}`}>
                        {activePortfolio &&
                          formatCurrency(dayPnL, activePortfolio.currency, settings.hideAmounts)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {dayTrades.length} trade{dayTrades.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Legend</h4>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-profit-50 dark:bg-profit-900/20 border border-gray-200 dark:border-gray-700 mr-2" />
              <span className="text-gray-600 dark:text-gray-400">Profitable Day</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-loss-50 dark:bg-loss-900/20 border border-gray-200 dark:border-gray-700 mr-2" />
              <span className="text-gray-600 dark:text-gray-400">Loss Day</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-primary-50 dark:bg-primary-900/20 border border-primary-500 mr-2" />
              <span className="text-gray-600 dark:text-gray-400">Today</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Monthly Summary */}
      {Object.keys(tradesByDate).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <p className="text-sm text-gray-600 dark:text-gray-400">Monthly P&L</p>
            <p className={`text-2xl font-bold mt-2 ${getPnLColor(Object.values(dailyPnL).reduce((sum, pnl) => sum + pnl, 0))}`}>
              {activePortfolio &&
                formatCurrency(
                  Object.values(dailyPnL).reduce((sum, pnl) => sum + pnl, 0),
                  activePortfolio.currency,
                  settings.hideAmounts
                )}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-gray-600 dark:text-gray-400">Trading Days</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
              {Object.keys(tradesByDate).length}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Trades</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
              {Object.values(tradesByDate).flat().length}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
