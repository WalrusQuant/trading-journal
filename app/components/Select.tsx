import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '../lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-mono font-medium text-gray-500 uppercase tracking-wider mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full px-3 py-2 border font-mono text-sm',
            'bg-terminal-bg',
            'border-terminal-border',
            'text-gray-100',
            'focus:outline-none focus:ring-1 focus:ring-matrix-500/50 focus:border-matrix-500/50',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'transition-all duration-150',
            'cursor-pointer',
            error && 'border-loss-500/50 focus:ring-loss-500/50 focus:border-loss-500/50',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-terminal-bg">
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-xs font-mono text-loss-400">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
