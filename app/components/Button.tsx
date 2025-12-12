import { ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  const baseStyles = cn(
    'font-mono font-medium tracking-wide uppercase transition-all duration-150',
    'focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-terminal-bg',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    'border'
  );

  const variants = {
    primary: cn(
      'bg-bloomberg-500/20 text-bloomberg-400 border-bloomberg-500/50',
      'hover:bg-bloomberg-500/30 hover:border-bloomberg-500 hover:text-bloomberg-300',
      'focus:ring-bloomberg-500/50',
      'active:bg-bloomberg-500/40'
    ),
    secondary: cn(
      'bg-terminal-card text-gray-300 border-terminal-border',
      'hover:bg-terminal-hover hover:text-gray-100 hover:border-gray-500',
      'focus:ring-gray-500/50',
      'active:bg-gray-700/50'
    ),
    danger: cn(
      'bg-loss-500/20 text-loss-400 border-loss-500/50',
      'hover:bg-loss-500/30 hover:border-loss-500 hover:text-loss-300',
      'focus:ring-loss-500/50',
      'active:bg-loss-500/40'
    ),
    success: cn(
      'bg-matrix-500/20 text-matrix-400 border-matrix-500/50',
      'hover:bg-matrix-500/30 hover:border-matrix-500 hover:text-matrix-300',
      'focus:ring-matrix-500/50',
      'active:bg-matrix-500/40'
    ),
    ghost: cn(
      'bg-transparent text-gray-400 border-transparent',
      'hover:bg-terminal-hover hover:text-matrix-400',
      'focus:ring-matrix-500/30',
      'active:bg-terminal-card'
    ),
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-sm',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
