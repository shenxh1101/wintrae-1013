import React from 'react';
import { cn } from '@/lib/utils';

type ProgressVariant = 'default' | 'slim' | 'segmented';

export interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  showPercentage?: boolean;
  animated?: boolean;
  segments?: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'default',
  showPercentage = false,
  animated = false,
  segments = 5,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  if (variant === 'segmented') {
    const filledSegments = Math.round((percentage / 100) * segments);
    return (
      <div className={cn('w-full', className)}>
        {showPercentage && (
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-navy-700">进度</span>
            <span className="text-sm font-semibold text-navy-800">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        <div className="flex gap-1.5 h-3">
          {Array.from({ length: segments }).map((_, i) => {
            const segmentFilled = i < filledSegments;
            const isLastFilled = i === filledSegments - 1;
            return (
              <div
                key={i}
                className={cn(
                  'flex-1 rounded-md overflow-hidden transition-all duration-500',
                  segmentFilled
                    ? isLastFilled && animated
                      ? 'bg-gradient-to-r from-navy-500 via-navy-600 to-copper-500'
                      : 'bg-gradient-to-r from-navy-600 to-navy-700'
                    : 'bg-slatebg-200'
                )}
              />
            );
          })}
        </div>
      </div>
    );
  }

  const heights = {
    default: 'h-3',
    slim: 'h-1.5',
  };

  return (
    <div className={cn('w-full', className)}>
      {showPercentage && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-navy-700">进度</span>
          <span className="text-sm font-semibold text-navy-800">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden bg-slatebg-200',
          heights[variant as keyof typeof heights] || heights.default
        )}
      >
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r from-navy-600 via-navy-500 to-copper-500 transition-all duration-700 ease-out',
            animated && 'animate-pulse-glow'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
