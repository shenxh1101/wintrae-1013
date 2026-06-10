import React from 'react';
import { cn } from '@/lib/utils';

type SkeletonVariant = 'text' | 'circle' | 'card' | 'table';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  rounded?: string | number;
  count?: number;
  className?: string;
}

const baseShimmer =
  'bg-gradient-to-r from-slatebg-100 via-slatebg-200 to-slatebg-100 bg-[length:1000px_100%] animate-shimmer';

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  rounded,
  count = 1,
  className,
}) => {
  const getDefaultStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'circle':
        return {
          width: width || 48,
          height: height || 48,
          borderRadius: rounded || '50%',
        };
      case 'card':
        return {
          width: width || '100%',
          height: height || 160,
          borderRadius: rounded || 12,
        };
      case 'table':
        return {
          width: width || '100%',
          height: height || 16,
          borderRadius: rounded || 6,
        };
      case 'text':
      default:
        return {
          width: width || '100%',
          height: height || 16,
          borderRadius: rounded || 6,
        };
    }
  };

  const renderSkeleton = (index: number) => {
    const style = getDefaultStyles();
    const textWidths = ['100%', '85%', '92%', '70%'];
    if (variant === 'text' && count > 1 && index > 0 && !width) {
      style.width = textWidths[index % textWidths.length];
    }
    return (
      <div
        key={index}
        style={style}
        className={cn(baseShimmer, className)}
      />
    );
  };

  if (count <= 1) {
    return renderSkeleton(0);
  }

  return (
    <div className={cn('flex flex-col', variant === 'text' ? 'gap-2' : 'gap-3')}>
      {Array.from({ length: count }).map((_, i) => renderSkeleton(i))}
    </div>
  );
};

export default Skeleton;
