import { create } from 'zustand';
import { combine } from 'zustand/middleware';

export const useGuildChannelCreatorStore = create(
  combine(
    {
      isOpen: false,
      stage: 0,
      name: '',
      topic: '',
      isPrivate: false,
      roles: [] as string[],
      type: 'TEXT' as 'TEXT' | 'VOICE',
    },
    (set) => ({
      toggleOpen: () =>
        set((s) => {
          if (s.isOpen) {
            return {
              isOpen: false,
              stage: 0,
              name: '',
              topic: '',
              isPrivate: false,
              roles: [],
              type: 'TEXT',
            };
          }
          return { isOpen: true };
        }),
      setName: (name: string) => (name.includes(' ') ? void 0 : set({ name })),
      setTopic: (topic: string) => set({ topic }),
      setType: (type: 'TEXT' | 'VOICE') => set({ type }),
      togglePrivate: () => set((s) => ({ isPrivate: !s.isPrivate })),
      updateRoles: (roleId: string) =>
        set((s) =>
          s.roles.some((r) => r === roleId)
            ? { roles: s.roles.filter((r) => r !== roleId) }
            : { roles: [...s.roles, roleId] },
        ),
      nextStage: () => set((s) => ({ stage: s.stage < 1 ? s.stage + 1 : s.stage })),
      prevStage: () => set((s) => ({ stage: s.stage > 0 ? s.stage - 1 : s.stage })),
    }),
  ),
);

export const guildChannelCreatorStore = useGuildChannelCreatorStore.getState();
