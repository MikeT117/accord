import type { RolePermission } from '@accord/common';
import { env } from '../env';

export const REST_API_ENDPOINT = `https://${env.apiUrl}`;
export const WEBSOCKET_ENDPOINT = `wss://${env.wsUrl}`;
export const RTC_WEBSOCKET_ENDPOINT = `wss://${env.rtcUrl}`;

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

export const ROLE_INFO: Record<RolePermission, { friendlyName: string; description: string }> = {
  viewGuildChannel: {
    friendlyName: 'View channel',
    description: 'Allows users to view channels.',
  },
  manageGuildChannels: {
    friendlyName: 'Manage channels',
    description: 'Allows users to create, delete and modify channels.',
  },
  createChannelMessage: {
    friendlyName: 'Send channel messages',
    description: 'Allows users to send messages in channels.',
  },
  manageChannelMessages: {
    friendlyName: 'Manage channel messages',
    description: 'Allows users to modify and delete all messages within a channel.',
  },
  manageGuild: {
    friendlyName: 'Manage Guild',
    description: 'Allows users to manage the server.',
  },
  guildAdmin: {
    friendlyName: 'Guild Admin',
    description: 'Allows the user to perform admin actions e.g. ban users.',
  },
};
