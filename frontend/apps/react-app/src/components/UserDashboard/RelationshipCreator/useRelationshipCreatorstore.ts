import { create } from 'zustand';
import { combine } from 'zustand/middleware';

const RelationshipCreatorStoreDefaultState = {
    isOpen: false as boolean,
    username: '',
};

export const useRelationshipCreatorStore = create(
    combine({ ...RelationshipCreatorStoreDefaultState }, (set) => ({
        open: () => set({ isOpen: true }),
        close: () => set({ ...RelationshipCreatorStoreDefaultState }),
        setDisplayName: (username: string) => set({ username }),
    })),
);

export const relationshipCreatorStore = useRelationshipCreatorStore.getState();
