import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  label?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = '请选择',
  disabled = false,
  searchable = false,
  label,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optValue: string) => {
    onChange?.(optValue);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-navy-800 mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border bg-white text-left transition-all duration-200',
          isOpen
            ? 'border-navy-500 ring-2 ring-navy-200 shadow-sm'
            : 'border-slate-200 hover:border-navy-300',
          disabled && 'bg-slatebg-50 cursor-not-allowed opacity-60'
        )}
      >
        <span
          className={cn(
            'text-sm truncate',
            selectedOption ? 'text-navy-900' : 'text-navy-300'
          )}
        >
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            'shrink-0 text-navy-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden animate-slide-in">
          {searchable && (
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索..."
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-slatebg-50 border border-transparent focus:border-navy-300 focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}
          <div className={cn('max-h-60 overflow-y-auto py-1', searchable ? '' : 'py-1')}>
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-navy-400">
                无匹配选项
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    'w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors',
                    opt.value === value
                      ? 'bg-navy-50 text-navy-800'
                      : 'text-navy-700 hover:bg-slatebg-50',
                    opt.disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent'
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {opt.value === value && (
                    <Check size={16} className="shrink-0 text-navy-600" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
