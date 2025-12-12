import { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  glow?: boolean;
  title?: string;
}

export default function Card({ children, className, padding = true, glow = false, title }: CardProps) {
  return (
    <div
      className={cn(
        'bg-terminal-card border border-terminal-border',
        glow && 'glow-border',
        className
      )}
    >
      {title && (
        <div className="panel-header">
          <span className="panel-title">{title}</span>
          <span className="text-xs font-mono text-gray-600">●</span>
        </div>
      )}
      <div className={cn(padding && 'p-4')}>
        {children}
      </div>
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('border-b border-terminal-border pb-3 mb-3', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-sm font-semibold text-bloomberg-500 uppercase tracking-wider font-mono', className)}>
      {children}
    </h3>
  );
}
