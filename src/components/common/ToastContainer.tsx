import React from 'react';
import { Toast } from './Toast';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

export interface ToastContainerProps {
  className?: string;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ className }) => {
  const { toasts, removeToast } = useUIStore();

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-[100] flex flex-col gap-3',
        className
      )}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
