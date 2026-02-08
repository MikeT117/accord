import emojiRegex from "emoji-regex-xs";
import { envSchema } from "./zod-validation/env-schema";

export const env = (() => {
    return envSchema.parse((window as any).__ENV__);
})();

export const GUILD_PERMISSION = {
    VIEW_GUILD_CHANNEL: 0,
    MANAGE_GUILD_CHANNELS: 1,
    CREATE_CHANNEL_MESSAGE: 2,
    MANAGE_CHANNEL_MESSAGES: 3,
    MANAGE_GUILD: 4,
    GUILD_ADMIN: 5,
    GUILD_SUPER_ADMIN: 6,
    GUILD_OWNER: 7,
    VIEW_GUILD_MEMBERS: 8,
    CREATE_CHANNEL_PIN: 9,
} as const;

export const USER_FLAG = {
    ALLOW_FRIEND_REQUESTS: 0,
    ALLOW_GUILD_MEMBER_DMS: 1,
} as const;

export const WEBRTC_SDP_TYPE = {
    OFFER: "offer",
    ANSWER: "answer",
} as const;

export const emojiRegExp = emojiRegex();

export const OAUTH_PROVIDER = {
    GITHUB: "GITHUB",
    GITLAB: "GITLAB",
} as const;
