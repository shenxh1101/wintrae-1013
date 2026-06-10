import React from 'react';
import { cn } from '@/lib/utils';

type InputVariant = 'default' | 'error';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  variant = 'default',
  label,
  helperText,
  errorMessage,
  prefixIcon,
  suffixIcon,
  className,
  id,
  disabled,
  ...props
}) => {
  const inputId = id || props.name;
  const hasError = variant === 'error' || !!errorMessage;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-navy-800"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          'relative flex items-center rounded-lg border bg-white transition-all duration-300',
          'focus-within:shadow-sm',
          hasError
            ? 'border-danger-400 focus-within:border-danger-500 focus-within:ring-2 focus-within:ring-danger-200'
            : 'border-slate-200 hover:border-navy-300 focus-within:border-navy-500 focus-within:ring-2 focus-within:ring-navy-200',
          disabled && 'bg-slatebg-50 cursor-not-allowed opacity-60',
          className
        )}
      >
        {prefixIcon && (
          <span className={cn('pl-3 text-navy-500', disabled && 'text-navy-300')}>
            {prefixIcon}
          </span>
        )}
        <input
          id={inputId}
          disabled={disabled}
          className={cn(
            'w-full py-2.5 px-3 bg-transparent text-navy-900 placeholder:text-navy-300',
            'focus:outline-none text-sm transition-colors',
            disabled && 'cursor-not-allowed'
          )}
          {...props}
        />
        {suffixIcon && (
          <span className={cn('pr-3 text-navy-500', disabled && 'text-navy-300')}>
            {suffixIcon}
          </span>
        )}
      </div>
      {(helperText || errorMessage) && (
        <p
          className={cn(
            'text-xs',
            errorMessage ? 'text-danger-500' : 'text-navy-500'
          )}
        >
          {errorMessage || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
