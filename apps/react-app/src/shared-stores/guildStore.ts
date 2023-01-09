import { Guild, GuildMember, GuildRole } from '@accord/common';
import create from 'zustand';
import { combine } from 'zustand/middleware';

type Dictionary<T> = {
  [key: string]: T | undefined;
};

export const useGuildStore = create(
  combine(
    {
      ids: [] as string[],
      guilds: {} as Dictionary<Guild>,
    },
    (set, get) => ({
      actions: {
        initialise: (guilds: Guild[]) =>
          set(() => {
            const _ids: string[] = [];
            const _guilds: Dictionary<Guild> = {};
            for (const guild of guilds) {
              _ids.push(guild.id);
              _guilds[guild.id] = guild;
            }
            return { ids: _ids, guilds: _guilds };
          }),
        addGuild: (guild: Guild) => {
          if (!(guild.id in get().guilds)) {
            return set((s) => ({
              guilds: { ...s.guilds, [guild.id]: guild },
              ids: [...s.ids, guild.id],
            }));
          }
        },
        updateGuild: (guild: Pick<Guild, 'id'> & Partial<Omit<Guild, 'id'>>) => {
          set((s) => {
            const prev = s.guilds[guild.id];
            if (prev) {
              return { guilds: { ...s.guilds, [prev.id]: { ...prev, ...guild } } };
            }
            return s;
          });
        },
        deleteGuild: (id: string) => {
          const guilds = get().guilds;
          const ids = get().ids;
          if (id in guilds) {
            delete guilds[id];
            set({ guilds, ids: ids.filter((i) => i !== id) });
          }
        },
        addRole: (role: GuildRole) => {
          set((s) => {
            const prev = s.guilds[role.guildId];
            if (prev) {
              return {
                guilds: {
                  ...s.guilds,
                  [prev.id]: { ...prev, roles: [...prev.roles, role] },
                },
              };
            }
            return s;
          });
        },
        updateRole: (role: GuildRole) => {
          set((s) => {
            const prev = s.guilds[role.guildId];
            if (prev) {
              return {
                guilds: {
                  ...s.guilds,
                  [prev.id]: {
                    ...prev,
                    roles: prev.roles.map((r) => (r.id === role.id ? role : r)),
                  },
                },
              };
            }
            return s;
          });
        },
        deleteRole: (id: string, guildId: string) => {
          set((s) => {
            const prev = s.guilds[guildId];
            if (prev) {
              return {
                guilds: {
                  ...s.guilds,
                  [prev.id]: {
                    ...prev,
                    roles: prev.roles.filter((r) => r.id !== id),
                  },
                },
              };
            }
            return s;
          });
        },
        updateMember: (
          member: Pick<GuildMember, 'id' | 'guildId'> & Partial<Omit<GuildMember, 'id'>>,
        ) => {
          set((s) => {
            const prev = s.guilds[member.guildId];
            if (prev) {
              return {
                guilds: {
                  ...s.guilds,
                  [prev.id]: {
                    ...prev,
                    member: { ...prev.member, ...member },
                  },
                },
              };
            }
            return s;
          });
        },
      },
    }),
  ),
);

export const guildActions = useGuildStore.getState().actions;
