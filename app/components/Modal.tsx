'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={cn(
            'relative w-full bg-terminal-card border border-terminal-border shadow-2xl animate-fadeIn',
            sizes[size]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-terminal-border bg-terminal-panel">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-600">▸</span>
                <h2 className="text-sm font-mono font-semibold text-bloomberg-500 uppercase tracking-wider">
                  {title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-loss-400 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="p-4">{children}</div>

          {/* Bottom glow line */}
          <div className="h-px bg-gradient-to-r from-transparent via-bloomberg-500/30 to-transparent" />
        </div>
      </div>
    </div>
  );
}
