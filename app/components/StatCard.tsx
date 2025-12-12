import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card from './Card';
import { cn } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
  highlight?: 'profit' | 'loss' | 'neutral';
}

export default function StatCard({ title, value, icon: Icon, trend, className, highlight }: StatCardProps) {
  const getValueColor = () => {
    if (highlight === 'profit') return 'text-profit-500';
    if (highlight === 'loss') return 'text-loss-500';
    return 'text-gray-100';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.isPositive) return TrendingUp;
    return TrendingDown;
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card className={cn('p-0', className)} padding={false}>
      {/* Header */}
      <div className="px-4 py-2 border-b border-terminal-border bg-terminal-panel/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">{title}</span>
          {Icon && (
            <Icon className={cn(
              'w-4 h-4',
              highlight === 'profit' ? 'text-profit-500' :
              highlight === 'loss' ? 'text-loss-500' :
              'text-bloomberg-500'
            )} />
          )}
        </div>
      </div>

      {/* Value */}
      <div className="px-4 py-3">
        <div className="flex items-end justify-between">
          <p className={cn(
            'text-2xl font-mono font-semibold tracking-tight',
            getValueColor()
          )}>
            {value}
          </p>
          {trend && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-mono',
              trend.isPositive ? 'text-profit-400' : 'text-loss-400'
            )}>
              {TrendIcon && <TrendIcon className="w-3 h-3" />}
              <span>{trend.isPositive ? '+' : ''}{trend.value}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom indicator bar */}
      <div className={cn(
        'h-0.5',
        highlight === 'profit' ? 'bg-profit-500' :
        highlight === 'loss' ? 'bg-loss-500' :
        'bg-bloomberg-500/50'
      )} />
    </Card>
  );
}
