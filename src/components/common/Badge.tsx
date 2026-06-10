import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  success: {
    bg: 'bg-success-50 border-success-200',
    text: 'text-success-700',
    dot: 'bg-success-500',
  },
  warning: {
    bg: 'bg-warning-50 border-warning-200',
    text: 'text-warning-700',
    dot: 'bg-warning-500',
  },
  danger: {
    bg: 'bg-danger-50 border-danger-200',
    text: 'text-danger-700',
    dot: 'bg-danger-500',
  },
  info: {
    bg: 'bg-info-50 border-info-200',
    text: 'text-info-700',
    dot: 'bg-info-500',
  },
  neutral: {
    bg: 'bg-slatebg-100 border-slate-200',
    text: 'text-navy-700',
    dot: 'bg-navy-400',
  },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs gap-1 rounded-md',
  md: 'px-2.5 py-1 text-sm gap-1.5 rounded-lg',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  className,
}) => {
  const styles = variantStyles[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border',
        styles.bg,
        styles.text,
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'shrink-0 rounded-full',
            size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
            styles.dot
          )}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
