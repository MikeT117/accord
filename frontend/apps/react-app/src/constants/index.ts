import { env } from '../env';

export const REST_API_ENDPOINT = `https://${env.apiUrl}`;
export const WEBSOCKET_ENDPOINT = `wss://${env.wsUrl}`;
export const RTC_WEBSOCKET_ENDPOINT = `wss://${env.rtcUrl}`;

export const QUERY_LIMIT = 50;

// Role max value
export const MAX_ROLE_PERMS = 2147483647;

// Role permissions offsets
export const VIEW_GUILD_CHANNEL = 0;
export const MANAGE_GUILD_CHANNELS = 1;
export const CREATE_CHANNEL_MESSAGE = 2;
export const MANAGE_CHANNEL_MESSAGES = 3;
export const MANAGE_GUILD = 4;
export const GUILD_ADMIN = 5;
export const GUILD_SUPER_ADMIN = 6;
export const GUILD_OWNER = 7;
export const VIEW_GUILD_MEMBERS = 8;

// User public flags offsets
export const MAX_USER_PUBLIC_FLAGS = 2147483647;
export const ALLOW_FRIEND_REQUESTS = 0;
export const ALLOW_GUILD_MEMBER_DMS = 1;

export const AccordOperation = {
    AUTHENTICATE_OP: 'AUTHENTICATE',
    CLIENT_READY_OP: 'CLIENT_READY',
    GUILD_CREATE_OP: 'GUILD_CREATE',
    GUILD_UPDATE_OP: 'GUILD_UPDATE',
    GUILD_DELETE_OP: 'GUILD_DELETE',
    GUILD_ROLE_CREATE_OP: 'ROLE_CREATE',
    GUILD_ROLE_UPDATE_OP: 'ROLE_UPDATE',
    GUILD_ROLE_DELETE_OP: 'ROLE_DELETE',
    GUILD_MEMBER_UPDATE_OP: 'MEMBER_UPDATE',
    GUILD_ROLE_CHANNEL_CREATE_OP: 'ROLE_CHANNEL_CREATE',
    GUILD_ROLE_CHANNEL_DELETE_OP: 'ROLE_CHANNEL_DELETE',
    GUILD_ROLE_MEMBER_CREATE_OP: 'ROLE_MEMBER_CREATE',
    GUILD_ROLE_MEMBER_DELETE_OP: 'ROLE_MEMBER_DELETE',
    CHANNEL_CREATE_OP: 'CHANNEL_CREATE',
    CHANNEL_UPDATE_OP: 'CHANNEL_UPDATE',
    CHANNEL_DELETE_OP: 'CHANNEL_DELETE',
    CHANNEL_PINS_UPDATE_OP: 'CHANNEL_PINS_UPDATE',
    CHANNEL_MEMBER_CREATE_OP: 'CHANNEL_MEMBER_CREATE',
    CHANNEL_MEMBER_DELETE_OP: 'CHANNEL_MEMBER_DELETE',
    CHANNEL_MESSAGE_CREATE_OP: 'MESSAGE_CREATE',
    CHANNEL_MESSAGE_UPDATE_OP: 'MESSAGE_UPDATE',
    CHANNEL_MESSAGE_DELETE_OP: 'MESSAGE_DELETE',
    USER_RELATIONSHIP_CREATE_OP: 'RELATIONSHIP_CREATE',
    USER_RELATIONSHIP_UPDATE_OP: 'RELATIONSHIP_UPDATE',
    USER_RELATIONSHIP_DELETE_OP: 'RELATIONSHIP_DELETE',
    VOICE_CHANNEL_STATE_CREATE: 'VOICE_CHANNEL_STATE_CREATE',
    VOICE_CHANNEL_STATE_UPDATE: 'VOICE_CHANNEL_STATE_UPDATE',
    VOICE_CHANNEL_STATE_DELETE: 'VOICE_CHANNEL_STATE_DELETE',
} as const;
