import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-mono font-medium text-gray-500 uppercase tracking-wider mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2 border font-mono text-sm',
            'bg-terminal-bg',
            'border-terminal-border',
            'text-gray-100',
            'placeholder-gray-600',
            'focus:outline-none focus:ring-1 focus:ring-matrix-500/50 focus:border-matrix-500/50',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'transition-all duration-150',
            error && 'border-loss-500/50 focus:ring-loss-500/50 focus:border-loss-500/50',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs font-mono text-loss-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
