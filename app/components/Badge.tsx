import { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  className?: string;
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-terminal-card text-gray-300 border-terminal-border',
    success: 'bg-profit-500/10 text-profit-400 border-profit-500/30',
    danger: 'bg-loss-500/10 text-loss-400 border-loss-500/30',
    warning: 'bg-bloomberg-500/10 text-bloomberg-400 border-bloomberg-500/30',
    info: 'bg-info-500/10 text-info-400 border-info-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-mono font-medium uppercase tracking-wide border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
