import create from 'zustand';
import { combine } from 'zustand/middleware';

export type ToastType = {
  id: number;
  type: 'ERROR' | 'SUCCESS' | 'WARNING' | 'INFO';
  title: string;
  description?: string;
  duration?: number;
};

export const useToastsStore = create(
  combine({ toasts: [] as ToastType[] }, (set) => ({
    actions: {
      addToast: (toast: Omit<ToastType, 'id'>) =>
        set((s) => ({ toasts: [...s.toasts, { ...toast, id: Date.now(), duration: 5000 }] })),
      dismissToast: (id: number) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      clearAllToasts: () => set({ toasts: [] }),
    },
  })),
);

export const toastActions = useToastsStore.getState().actions;
