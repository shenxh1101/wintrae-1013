import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Toast, ToastType } from '@/types';

interface UIStore {
  sidebarCollapsed: boolean;
  toasts: Toast[];
  loading: boolean;
  toggleSidebar: () => void;
  showToast: (message: string, type?: ToastType) => string;
  removeToast: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const useUIStore = create<UIStore>()(
  persist(
    immer((set, get) => ({
      sidebarCollapsed: false,
      toasts: [],
      loading: false,

      toggleSidebar: () => {
        set((state) => {
          state.sidebarCollapsed = !state.sidebarCollapsed;
        });
      },

      showToast: (message, type = 'info') => {
        const id = generateId();
        const toast: Toast = {
          id,
          type,
          message,
          timestamp: new Date().toISOString(),
        };

        set((state) => {
          state.toasts.push(toast);
        });

        setTimeout(() => {
          get().removeToast(id);
        }, 3000);

        return id;
      },

      removeToast: (id) => {
        set((state) => {
          const idx = state.toasts.findIndex(t => t.id === id);
          if (idx >= 0) {
            state.toasts.splice(idx, 1);
          }
        });
      },

      setLoading: (loading) => {
        set((state) => {
          state.loading = loading;
        });
      },
    })),
    {
      name: 'ui-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
