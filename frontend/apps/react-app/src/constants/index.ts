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

export const ROLE_INFO = [
  {
    offset: 0,
    descriptor: 'viewGuildChannel',
    friendlyName: 'View channel',
    description: 'Allows users to view channels.',
  },
  {
    offset: 1,
    descriptor: 'manageGuildChannels',
    friendlyName: 'Manage channels',
    description: 'Allows users to create, delete and modify channels.',
  },
  {
    offset: 2,
    descriptor: 'createChannelMessage',
    friendlyName: 'Send channel messages',
    description: 'Allows users to send messages in channels.',
  },
  {
    offset: 3,
    descriptor: 'manageChannelMessages',
    friendlyName: 'Manage channel messages',
    description: 'Allows users to modify and delete all messages within a channel.',
  },
  {
    offset: 4,
    descriptor: 'manageGuild',
    friendlyName: 'Manage Guild',
    description: 'Allows users to manage the server.',
  },
  {
    offset: 5,
    descriptor: 'guildAdmin',
    friendlyName: 'Guild Admin',
    description: 'Allows the user to perform admin actions e.g. ban users.',
  },
];

export const VIEW_GUILD_CHANNEL = 0;
export const MANAGE_GUILD_CHANNELS = 1;
export const CREATE_CHANNEL_MESSAGE = 2;
export const MANAGE_CHANNEL_MESSAGES = 3;
export const MANAGE_GUILD = 4;
export const GUILD_ADMIN = 5;
export const GUILD_SUPER_ADMIN = 6;
export const GUILD_OWNER = 7;
export const VIEW_GUILD_MEMBERS = 8;
