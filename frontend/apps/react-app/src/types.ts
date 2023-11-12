// Utility Types
export type ObjectValues<T> = T[keyof T];

// App Types
export type UserLimited = {
  id: string;
  avatar: string | null;
  displayName: string;
  username: string;
  publicFlags: number;
};

export type Guild = {
  id: string;
  name: string;
  description: string;
  isDiscoverable: boolean;
  creatorId: string;
  guildCategoryId: string | null;
  channelCount: number;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
  icon: string | null;
  banner: string | null;
  channels: GuildChannel[];
  member: GuildMember;
  roles: GuildRole[];
};

export type GuildInvite = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  guildId: string;
  icon: string | null;
  banner: string | null;
};

export type GuildCategory = {
  id: string;
  name: string;
  craetedAt: Date;
};

export type DiscoverableGuild = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  guildCategoryId: string | null;
  createdAt: Date;
  icon: string | null;
  banner: string | null;
};

export type GuildMember = {
  nickname: string | null;
  guildId: string;
  joinedAt: Date;
  updatedAt: Date;
  user: UserLimited;
  roles: string[];
};

export type GuildMemberLimited = {
  joinedAt: Date;
  user: UserLimited;
  roles: string[];
};

export type GuildRole = {
  id: string;
  name: string;
  permissions: number;
  guildId: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ChannelMessage = {
  id: string;
  channelId: string;
  content?: string | null;
  isPinned: boolean;
  flags: number;
  createdAt: Date;
  updatedAt: Date | null;
  author: UserLimited;
  attachments: string[];
};

export type GuildBan = {
  reason: string;
  bannedAt: Date;
  user: UserLimited;
};

export type Channel = {
  id: string;
  name: string;
  topic: string;
  channelType: 0 | 1 | 2 | 4;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GuildChannel = Channel & {
  guildId: string;
  parentId?: string | null;
  roles: string[];
};

export type PrivateChannel = Channel & {
  users: UserLimited[];
};

export type UserSessionLimited = {
  id: string;
  isCurrentSession: boolean;
  createdAt: Date;
  expiresAt: Date;
};

export type User = {
  id: string;
  avatar?: string | null;
  displayName: string;
  publicFlags: number;
  relationshipCount: number;
  oauthAccountId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UserRelationship = {
  id: string;
  creatorId: string;
  status: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    avatar: string | null;
    displayName: string;
    username: string;
    publicFlags: number;
  };
};

export type VoiceChannelState = {
  mute: boolean;
  selfMute: boolean;
  selfDeaf: boolean;
  channelId: string;
  guildId: string;
  member: GuildMemberLimited;
};

export type Emoji = {
  id: string;
  name: string;
  native: string;
  unified: string;
  keywords: string[];
  shortcodes: string;
  aliases: string[];
  emoticons: string[];
};

// Websocket Payload Types
export type ClientReadyEventPayload = {
  user: User;
  guilds: Guild[];
  voiceChannelStates: VoiceChannelState[];
  privateChannels: PrivateChannel[];
};

export type GuildCreateEventPayload = {
  guild: Guild;
};

export type GuildUpdateEventPayload = {
  guild: Pick<
    Guild,
    'id' | 'name' | 'description' | 'isDiscoverable' | 'icon' | 'banner' | 'guildCategoryId'
  >;
};

export type GuildDeleteEventPayload = {
  guild: Pick<Guild, 'id'>;
};

export type GuildRoleCreateEventPayload = {
  role: GuildRole;
};

export type GuildRoleUpdateEventPayload = {
  role: GuildRole;
};

export type GuildRoleDeleteEventPayload = {
  role: Pick<GuildRole, 'id' | 'guildId'>;
};

export type ChannelCreateEventPayload = {
  channel: GuildChannel | PrivateChannel;
};

export type ChannelUpdateEventPayload = {
  channel:
    | Pick<GuildChannel, 'id' | 'name' | 'topic' | 'guildId'>
    | Pick<PrivateChannel, 'id' | 'name' | 'topic'>;
};

export type GuildChannelDeleteEventPayload = {
  id: string;
  guildId: string;
};

export type ChannelMessageCreateEventPayload = {
  message: ChannelMessage;
};

export type ChannelMessageUpdateEventPayload = {
  message: Pick<ChannelMessage, 'id' | 'channelId' | 'content' | 'isPinned' | 'updatedAt'>;
};

export type ChannelMessageDeleteEventPayload = {
  id: string;
  channelId: string;
};

export type ChannelPinCreateEventPayload = {
  message: ChannelMessage;
};

export type ChannelPinDeleteEventPayload = {
  id: string;
  channelId: string;
};

export type UserRelationshipCreateEventPayload = {
  relationship: UserRelationship;
};

export type UserRelationshipUpdateEventPayload = {
  relationship: Pick<UserRelationship, 'id' | 'status'>;
};

export type UserRelationshipDeleteEventPayload = {
  id: string;
};
