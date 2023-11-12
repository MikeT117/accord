import { env } from '../env';

export const REST_API_ENDPOINT = `https://${env.apiUrl}`;
export const WEBSOCKET_ENDPOINT = `wss://${env.wsUrl}`;
export const RTC_WEBSOCKET_ENDPOINT = `wss://${env.rtcUrl}`;

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
    description: 'Allows members to create, modify or delete channels.',
  },
  {
    offset: 2,
    descriptor: 'createChannelMessage',
    friendlyName: 'Send channel messages',
    description: 'Allows users to send messages.',
  },
  {
    offset: 3,
    descriptor: 'manageChannelMessages',
    friendlyName: 'Manage channel messages',
    description: 'Allows users to delete other users messages.',
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

export const AccordRTCOperation = {
  GET_RTP_CAPABILITIES: 'GET_RTP_CAPABILITIES',
  CREATE_TRANSPORT: 'CREATE_TRANSPORT',
  CONNECT_TRANSPORT: 'CONNECT_TRANSPORT',
  PRODUCE: 'PRODUCE',
  CONSUME: 'CONSUME',

  CONSUMER_RESUME: 'CONSUMER_RESUME',
  CONSUMER_PAUSE: 'CONSUMER_PAUSE',
  PRODUCER_PAUSE: 'PRODUCER_PAUSE',
  PRODUCER_RESUME: 'PRODUCER_RESUME',

  GET_PRODUCERS: 'GET_PRODUCERS',
  PRODUCER_JOINED: 'PRODUCER_JOINED',
  CONSUMER_JOINED: 'CONSUMER_JOINED',
  CONSUMER_CLOSED: 'CONSUMER_CLOSED',
  PRODUCER_CLOSED: 'PRODUCER_CLOSED',
  DISCONNECT: 'DISCONNECT',
} as const;

export const AccordOperation = {
  AUTHENTICATE_OP: 'AUTHENTICATE_OP',
  CLIENT_READY_OP: 'CLIENT_READY_OP',
  GUILD_CREATE_OP: 'GUILD_CREATE_OP',
  GUILD_UPDATE_OP: 'GUILD_UPDATE_OP',
  GUILD_DELETE_OP: 'GUILD_DELETE_OP',
  GUILD_ROLE_CREATE_OP: 'GUILD_ROLE_CREATE_OP',
  GUILD_ROLE_UPDATE_OP: 'GUILD_ROLE_UPDATE_OP',
  GUILD_ROLE_DELETE_OP: 'GUILD_ROLE_DELETE_OP',
  GUILD_MEMBER_CREATE_OP: 'GUILD_MEMBER_CREATE_OP',
  GUILD_MEMBER_UPDATE_OP: 'GUILD_MEMBER_UPDATE_OP',
  GUILD_MEMBER_DELETE_OP: 'GUILD_MEMBER_DELETE_OP',
  CHANNEL_CREATE_OP: 'CHANNEL_CREATE_OP',
  CHANNEL_UPDATE_OP: 'CHANNEL_UPDATE_OP',
  CHANNEL_UPDATE_SYNC_ROLE_OP: 'CHANNEL_UPDATE_SYNC_ROLE_OP',
  CHANNEL_DELETE_OP: 'CHANNEL_DELETE_OP',
  CHANNEL_PIN_CREATE_OP: 'CHANNEL_PIN_CREATE_OP',
  CHANNEL_PIN_DELETE_OP: 'CHANNEL_PIN_DELETE_OP',
  CHANNEL_MEMBER_CREATE_OP: 'CHANNEL_MEMBER_CREATE_OP',
  CHANNEL_MEMBER_DELETE_OP: 'CHANNEL_MEMBER_DELETE_OP',
  CHANNEL_MESSAGE_CREATE_OP: 'CHANNEL_MESSAGE_CREATE_OP',
  CHANNEL_MESSAGE_UPDATE_OP: 'CHANNEL_MESSAGE_UPDATE_OP',
  CHANNEL_MESSAGE_DELETE_OP: 'CHANNEL_MESSAGE_DELETE_OP',
  USER_RELATIONSHIP_CREATE_OP: 'USER_RELATIONSHIP_CREATE_OP',
  USER_RELATIONSHIP_UPDATE_OP: 'USER_RELATIONSHIP_UPDATE_OP',
  USER_RELATIONSHIP_DELETE_OP: 'USER_RELATIONSHIP_DELETE_OP',
  USER_UPDATE: 'USER_UPDATE',
  USER_GUILD_SETTINGS_UPDATE: 'USER_GUILD_SETTINGS_UPDATE',
  VOICE_CHANNEL_STATE_CREATE: 'VOICE_CHANNEL_STATE_CREATE',
  VOICE_CHANNEL_STATE_UPDATE: 'VOICE_CHANNEL_STATE_UPDATE',
  VOICE_CHANNEL_STATE_DELETE: 'VOICE_CHANNEL_STATE_DELETE',
  SESSION_CLOSE_OP: 'SESSION_CLOSE_OP',
  SOCKET_SUBSCRIPTION_ADD: 'SOCKET_SUBSCRIPTION_ADD',
  SOCKET_SUBSCRIPTION_REMOVE: 'SOCKET_SUBSCRIPTION_REMOVE',
} as const;
