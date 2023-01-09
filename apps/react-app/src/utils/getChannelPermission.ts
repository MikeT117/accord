import type { GuildRole } from '@accord/common';

export const defaultRestrictivePermission = () => ({
  viewGuildChannel: false,
  manageGuildChannels: false,
  createChannelMessage: false,
  manageChannelMessages: false,
  manageGuild: false,
  guildAdmin: false,
});

export const defaultPermissivePermission = () => ({
  viewGuildChannel: true,
  manageGuildChannels: true,
  createChannelMessage: true,
  manageChannelMessages: true,
  manageGuild: true,
  guildAdmin: true,
});

export const getChannelPermissions = (matchedRoles?: GuildRole[]) => {
  const permissions = defaultRestrictivePermission();
  if (!matchedRoles || matchedRoles.length === 0) {
    return permissions;
  }

  for (const role of matchedRoles) {
    Object.entries(role).map((a) => {
      if (typeof a[1] === 'boolean' && a[1]) {
        permissions[a[0] as keyof typeof permissions] = true;
      }
    });
  }

  return permissions;
};
