import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  hoverable?: boolean;
  className?: string;
  contentClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  header,
  footer,
  hoverable = false,
  className,
  contentClassName,
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-slate-100 shadow-sm',
        'transition-all duration-300',
        hoverable && [
          'hover:shadow-lg hover:border-navy-100',
          'hover:-translate-y-0.5',
          'cursor-pointer',
        ],
        className
      )}
    >
      {header && (
        <div className="px-5 py-4 border-b border-slate-100 rounded-t-lg">
          {header}
        </div>
      )}
      <div className={cn('p-5', contentClassName)}>
        {children}
      </div>
      {footer && (
        <div className="px-5 py-4 border-t border-slate-100 rounded-b-lg bg-slatebg-50/50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
