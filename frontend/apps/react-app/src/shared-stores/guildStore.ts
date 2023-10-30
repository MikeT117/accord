import { Guild, GuildChannel, GuildMember, GuildRole } from '@accord/common';
import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

type Dictionary<T> = {
  [key: string]: T | undefined;
};

export const useGuildStore = create(
  devtools(
    combine(
      {
        ids: [] as string[],
        guilds: {} as Dictionary<Guild>,
      },
      (set, get) => ({
        initialise: (guilds: Guild[]) =>
          set(() => {
            let _guilds: Dictionary<Guild> = {};
            let _ids: string[] = [];
            for (const guild of guilds) {
              _ids.push(guild.id);
              _guilds[guild.id] = guild;
            }
            return { guilds: _guilds, ids: _ids };
          }),
        createGuild: (guild: Guild) => {
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
          if (id in guilds) {
            delete guilds[id];
            set((s) => ({ guilds, ids: s.ids.filter((i) => i !== id) }));
          }
        },
        createRole: (role: GuildRole) => {
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
        createChannel: (channel: GuildChannel) => {
          set((s) => {
            const prev = s.guilds[channel.guildId];
            if (prev) {
              return {
                guilds: {
                  ...s.guilds,
                  [prev.id]: { ...prev, channels: [...prev.channels, channel] },
                },
              };
            }
            return s;
          });
        },
        updateChannel: (
          channel: Pick<GuildChannel, 'id' | 'guildId'> & Partial<Omit<GuildChannel, 'id'>>,
        ) => {
          set((s) => {
            const prev = s.guilds[channel.guildId];
            if (prev) {
              return {
                guilds: {
                  ...s.guilds,
                  [prev.id]: {
                    ...prev,
                    channels: prev.channels.map((c) =>
                      c.id === channel.id ? { ...c, ...channel } : c,
                    ),
                  },
                },
              };
            }
            return s;
          });
        },
        deleteChannel: (id: string, guildId: string) => {
          set((s) => {
            const prev = s.guilds[guildId];
            if (prev) {
              return {
                guilds: {
                  ...s.guilds,
                  [prev.id]: {
                    ...prev,
                    channels: prev.channels.filter((c) => c.id !== id),
                  },
                },
              };
            }
            return s;
          });
        },
      }),
    ),
    { name: 'guildStore' },
  ),
);

export const guildStore = useGuildStore.getState();
