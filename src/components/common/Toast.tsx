import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToastType } from '@/types';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onClose: (id: string) => void;
}

const typeStyles: Record<ToastType, { bg: string; border: string; icon: string; iconComponent: React.ReactNode }> = {
  success: {
    bg: 'bg-success-50',
    border: 'border-success-200',
    icon: 'text-success-600',
    iconComponent: <CheckCircle size={20} />,
  },
  error: {
    bg: 'bg-danger-50',
    border: 'border-danger-200',
    icon: 'text-danger-600',
    iconComponent: <XCircle size={20} />,
  },
  warning: {
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    icon: 'text-warning-600',
    iconComponent: <AlertTriangle size={20} />,
  },
  info: {
    bg: 'bg-info-50',
    border: 'border-info-200',
    icon: 'text-info-600',
    iconComponent: <Info size={20} />,
  },
};

export const Toast: React.FC<ToastProps> = ({ id, type, message, onClose }) => {
  const styles = typeStyles[type];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl shadow-lg border',
        'min-w-[280px] max-w-md',
        'animate-slide-in',
        styles.bg,
        styles.border
      )}
    >
      <span className={cn('shrink-0 mt-0.5', styles.icon)}>
        {styles.iconComponent}
      </span>
      <p className="flex-1 text-sm text-navy-800 leading-relaxed">
        {message}
      </p>
      <button
        type="button"
        onClick={() => onClose(id)}
        className="shrink-0 p-1 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-white/60 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
