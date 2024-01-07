import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { Dictionary, Guild, GuildChannel, GuildMember, GuildRole } from '../types';

export const useGuildStore = create(
    combine(
        {
            ids: [] as string[],
            guilds: {} as Dictionary<Guild>,
        },
        (set, get) => ({
            initialise: (guilds: Guild[]) => {
                let _guilds: Dictionary<Guild> = {};
                let _ids: string[] = [];

                for (const guild of guilds) {
                    _ids.push(guild.id);
                    _guilds[guild.id] = guild;
                }

                set({ guilds: _guilds, ids: _ids });
            },
            createGuild: (guild: Guild) => {
                set((s) => {
                    if (guild.id in get().guilds) {
                        return s;
                    }

                    return {
                        guilds: { ...s.guilds, [guild.id]: guild },
                        ids: [...s.ids, guild.id],
                    };
                });
            },
            updateGuild: (
                guild: Pick<
                    Guild,
                    | 'id'
                    | 'name'
                    | 'description'
                    | 'isDiscoverable'
                    | 'icon'
                    | 'banner'
                    | 'guildCategoryId'
                >,
            ) => {
                set((s) => {
                    const prev = s.guilds[guild.id];

                    if (!prev) {
                        return s;
                    }

                    return { guilds: { ...s.guilds, [prev.id]: { ...prev, ...guild } } };
                });
            },
            deleteGuild: (id: string) => {
                set((s) => {
                    const guilds = s.guilds;

                    if (!(id in s.guilds)) {
                        return s;
                    }

                    delete guilds[id];
                    return { guilds, ids: s.ids.filter((i) => i !== id) };
                });
            },
            createRole: (role: GuildRole) => {
                set((s) => {
                    const prev = s.guilds[role.guildId];

                    if (!prev) {
                        return s;
                    }

                    return {
                        guilds: {
                            ...s.guilds,
                            [prev.id]: { ...prev, roles: [...prev.roles, role] },
                        },
                    };
                });
            },
            updateRole: (role: GuildRole) => {
                set((s) => {
                    const prev = s.guilds[role.guildId];

                    if (!prev) {
                        return s;
                    }

                    return {
                        guilds: {
                            ...s.guilds,
                            [prev.id]: {
                                ...prev,
                                roles: prev.roles.map((r) => (r.id === role.id ? role : r)),
                            },
                        },
                    };
                });
            },
            deleteRole: (id: string, guildId: string) => {
                set((s) => {
                    const prev = s.guilds[guildId];

                    if (!prev) {
                        return s;
                    }

                    return {
                        guilds: {
                            ...s.guilds,
                            [prev.id]: {
                                ...prev,
                                roles: prev.roles.filter((r) => r.id !== id),
                            },
                        },
                    };
                });
            },
            updateMember: (member: Pick<GuildMember, 'guildId' | 'nickname'>) => {
                set((s) => {
                    const prev = s.guilds[member.guildId];

                    if (!prev) {
                        return s;
                    }

                    return {
                        guilds: {
                            ...s.guilds,
                            [prev.id]: {
                                ...prev,
                                member: { ...prev.member, ...member },
                            },
                        },
                    };
                });
            },
            addGuildRoleMember: (guildId: string, roleId: string) => {
                set((s) => {
                    const prev = s.guilds[guildId];

                    if (!prev) {
                        return s;
                    }

                    return {
                        guilds: {
                            ...s.guilds,
                            [prev.id]: {
                                ...prev,
                                member: {
                                    ...prev.member,
                                    roles: [...prev.member.roles, roleId],
                                },
                            },
                        },
                    };
                });
            },
            delGuildRoleMember: (guildId: string, roleId: string) => {
                set((s) => {
                    const prev = s.guilds[guildId];

                    if (!prev) {
                        return s;
                    }

                    return {
                        guilds: {
                            ...s.guilds,
                            [prev.id]: {
                                ...prev,
                                member: {
                                    ...prev.member,
                                    roles: prev.member.roles.filter((r) => r != roleId),
                                },
                            },
                        },
                    };
                });
            },
            createChannel: (channel: GuildChannel) => {
                set((s) => {
                    const prev = s.guilds[channel.guildId];

                    if (!prev) {
                        return s;
                    }

                    return {
                        guilds: {
                            ...s.guilds,
                            [prev.id]: { ...prev, channels: [...prev.channels, channel] },
                        },
                    };
                });
            },
            updateChannel: (
                channel: Pick<GuildChannel, 'id' | 'guildId'> & Partial<Omit<GuildChannel, 'id'>>,
            ) => {
                set((s) => {
                    const prev = s.guilds[channel.guildId];

                    if (!prev) {
                        return s;
                    }

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
                });
            },
            deleteChannel: (id: string, guildId: string) => {
                set((s) => {
                    const prev = s.guilds[guildId];

                    if (!prev) {
                        return s;
                    }

                    return {
                        guilds: {
                            ...s.guilds,
                            [prev.id]: {
                                ...prev,
                                channels: prev.channels.filter((c) => c.id !== id),
                            },
                        },
                    };
                });
            },
        }),
    ),
);

export const guildStore = useGuildStore.getState();
