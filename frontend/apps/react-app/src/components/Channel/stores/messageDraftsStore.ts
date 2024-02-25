import { create } from 'zustand';
import { combine, persist } from 'zustand/middleware';
import { Dictionary } from '../../../types';

export const useMessageDraftsStore = create(
    persist(
        combine({ drafts: {} as Dictionary<string> }, (set) => ({
            create: (id: string) =>
                set((s) => ({
                    drafts: { ...s.drafts, [id]: '' },
                })),
            update: (id: string, content: string) =>
                set((s) => ({
                    drafts: { ...s.drafts, [id]: content },
                })),
            reset: (id: string) =>
                set((s) => ({
                    drafts: { ...s.drafts, [id]: '' },
                })),
        })),
        { name: 'drafts-store' },
    ),
);

export const messageDraftsStore = useMessageDraftsStore.getState();
