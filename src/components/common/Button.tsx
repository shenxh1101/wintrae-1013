import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-navy-700 to-navy-800 text-white hover:from-navy-600 hover:to-navy-700 shadow-md hover:shadow-lg border border-navy-600/50',
  secondary:
    'bg-slatebg-100 text-navy-800 hover:bg-slatebg-200 border border-slate-200',
  danger:
    'bg-danger-500 text-white hover:bg-danger-600 shadow-md hover:shadow-lg border border-danger-600/50',
  ghost:
    'bg-transparent text-navy-700 border border-navy-300 hover:bg-navy-50 hover:border-navy-400',
  success:
    'bg-success-500 text-white hover:bg-success-600 shadow-md hover:shadow-lg border border-success-600/50',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2 text-base rounded-lg gap-2',
  lg: 'px-6 py-3 text-lg rounded-xl gap-2.5',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-navy-400/50 focus:ring-offset-2',
        'hover:-translate-y-0.5 active:translate-y-0 active:shadow-md',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className="animate-spin shrink-0" size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
      )}
      {!loading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children && <span className="whitespace-nowrap">{children}</span>}
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;
