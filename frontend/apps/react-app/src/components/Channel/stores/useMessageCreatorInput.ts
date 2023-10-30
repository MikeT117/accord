import { create } from 'zustand';
import { combine, persist } from 'zustand/middleware';

type Dictionary<T> = {
  [key: string]: T | undefined;
};

export const useMessageCreatorInput = create(
  persist(
    combine({ inputs: {} as Dictionary<string> }, (set) => ({
      initialise: (id: string) =>
        set((s) => ({
          inputs: { ...s.inputs, [id]: '' },
        })),
      update: (id: string, content: string) =>
        set((s) => ({
          inputs: { ...s.inputs, [id]: content },
        })),
      reset: (id: string) =>
        set((s) => ({
          inputs: { ...s.inputs, [id]: '' },
        })),
    })),
    { name: 'drafts' },
  ),
);

export const messageCreatorInputStore = useMessageCreatorInput.getState();
