import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      {Icon && (
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-terminal-panel border border-terminal-border">
            <Icon className="w-10 h-10 text-gray-600" />
          </div>
        </div>
      )}
      <h3 className="text-sm font-mono font-medium text-gray-300 uppercase tracking-wider mb-2">{title}</h3>
      {description && (
        <p className="text-sm font-mono text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
