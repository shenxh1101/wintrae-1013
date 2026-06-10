import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';
import type { ButtonProps } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: ButtonProps['variant'];
    icon?: React.ReactNode;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
    >
      <div className="w-20 h-20 mb-5 rounded-2xl bg-copper-50 flex items-center justify-center">
        <span className="text-copper-500">
          {icon || <Inbox size={36} strokeWidth={1.5} />}
        </span>
      </div>
      <h4 className="text-lg font-semibold text-navy-800 mb-2 font-serif">
        {title}
      </h4>
      {description && (
        <p className="text-sm text-navy-500 max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
          leftIcon={action.icon}
          size="md"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
