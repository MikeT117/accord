import { create } from 'zustand';
import { combine } from 'zustand/middleware';

export type Toast = {
    id: number;
    type: 'ERROR' | 'SUCCESS' | 'WARNING' | 'INFO';
    title: string;
    description?: string;
    duration?: number;
};

export const useToastStore = create(
    combine({ toasts: [] as Toast[] }, (set) => ({
        create: (toast: Omit<Toast, 'id'>) =>
            set((s) => ({ toasts: [...s.toasts, { duration: 5000, ...toast, id: Date.now() }] })),
        dismiss: (id: number) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
        clear: () => set({ toasts: [] }),
    })),
);

export const toastStore = useToastStore.getState();
