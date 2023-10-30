import {
  AccordOperation,
  AccordRTCOperation,
  AccordInternalOperation,
} from "./accordOperations";
import { WebsocketEvent } from "./websocketEvents";
import {
  AccordForwardingMessageQueue,
  AccordNonForwardingMessageQueue,
} from "./messageQueues";

import type { types } from "mediasoup-client";
import type ws from "ws";

export type ObjectValues<T> = T[keyof T];

export type AccordApiErrorResponse = {
  message: string;
};

export type WebsocketEvents = ObjectValues<typeof WebsocketEvent>;
export type AccordForwardingMessageQueues = ObjectValues<
  typeof AccordForwardingMessageQueue
>;

export type AccordNonForwardingMessageQueues = ObjectValues<
  typeof AccordNonForwardingMessageQueue
>;

export type AccordOperations = ObjectValues<typeof AccordOperation>;

export type AccordRTCOperations = ObjectValues<typeof AccordRTCOperation>;

export type AccordInternalOperations = ObjectValues<
  typeof AccordInternalOperation
>;

export type OauthAccount = {
  id: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refreshToken: string;
  accessToken: string;
  expiresAt: Date;
  tokenType: string;
  scope: string;
  idToken: string;
  sessionState: string;
  oauthTokenSecret: string;
  oauthToken: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UserAccount = {
  id: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
  oauthAccountId: string;
  flags: 0 | 1; // 0: Inactive/Disabled, 1:  Active
  relationshipCount: number;
  avatar?: string | null;
};

export type UserSession = {
  id: string;
  userAccountId: string;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  isCurrentSession?: boolean;
};

export type UserRelationship = {
  id: string;
  status: number;
  createdAt: Date;
  updatedAt: Date;
  initiatorUserAccountId: string;
  recipientUserAccountId: string;
  user: Pick<UserAccount, "id" | "displayName" | "avatar">;
};

export type GuildCategory = {
  id: string;
  name: string;
};

export type Guild = {
  id: string;
  name: string;
  description?: string | null;
  isDiscoverable: boolean;
  channelCount: number;
  memberCount: number;
  creatorId: string;
  guildCategoryId: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  icon: string | null;
  banner: string | null;
  channels: GuildChannel[];
  roles: GuildRole[];
  member: GuildMember;
};

export type GuildRole = {
  id: string;
  name: string;
  permissions: number;
  guildId: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date | null;
};

export type User = {
  id: string;
  displayName: string;
  avatar: string;
  flags: number;
  relationshipCount: number;
  oAuthAccountId: string;
  createdAt: Date;
  updatedAt: Date | null;
};

export type GuildMember = {
  id: string;
  nickname?: string | null;
  guildId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date | null;
  user: Pick<User, "id" | "displayName" | "avatar">;
  roles: string[];
};

export type GuildRoleGuildMember = {
  guildRoleId: string;
  guildMemberId: string;
};

export type VoiceChannelMember = {
  channelId: string;
  guildMemberId: string;
};

export type Channel = {
  id: string;
  name: string;
  topic?: string | null;
  channelType: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PrivateTextChannel = Channel & {
  channelType: 2 | 3;
  members: Pick<UserAccount, "id" | "displayName" | "avatar" | "flags">[];
};

export type PrivateChannel = PrivateTextChannel & {};

export type GuildChannel = Channel & {
  parentRoleSync: boolean;
  parentId?: string | null;
  guildId: string;
  channelType: 0 | 1 | 4;
  roles: string[];
};

export type GuildTextChannel = GuildChannel & {
  channelType: 0;
};

export type GuildCategoryChannel = GuildChannel & {
  channelType: 1;
};

export type GuildVoiceChannel = GuildChannel & {
  channelType: 4;
};

export type VoiceChannelState = {
  channelId: string;
  guildId: string;
  userAccountId: string;
  guildMemberId: string;
  mute: boolean;
  selfMute: boolean;
  selfDeaf: boolean;
  member: Pick<GuildMember, "id" | "nickname" | "user">;
};

export type ChannelMember = {
  userAccountId: string;
  channelId: string;
};

export type GuildRoleChannel = {
  guildRoleId: string;
  channelId: string;
};

export type ChannelMessage = {
  id: string;
  channelId: string;
  content?: string | null;
  isPinned: boolean;
  flags: number;
  authorUserAccountId: string;
  createdAt: Date;
  updatedAt: Date;
  attachments: string[];
  author: Pick<UserAccount, "id" | "avatar" | "displayName">;
  member?: Pick<GuildMember, "id" | "nickname">;
};

export type Attachment = {
  id: string;
  src: string;
  name?: string | null;
  height?: number | null;
  width?: number | null;
  size: number;
  resourceType: string;
  signature: string;
  timestamp: number;
  publicId: string;
};

export type ChannelMessageAttachments = {
  channelMessageId: string;
  attachmentId: string;
};

export type GuildAttachments = {
  guildId: string;
  attachmentId: string;
  type: 0 | 1;
};

export type UserAttachments = {
  userAccountId: string;
  attachmentId: string;
};

export type GuildInvite = {
  id: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  usedCount: number;
  guildMemberId: string;
  guildId: string;
  guild: Pick<Guild, "id" | "description" | "memberCount" | "name" | "icon">;
  creator: GuildMember;
  isJoined: boolean;
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

export type AuthenticationEventPayload = {
  d: {
    accesstoken: string;
    refreshtoken: string;
  };
};

export type AuthenticationEvent = AuthenticationEventPayload & {
  op: typeof AccordOperation.AUTHENTICATE_OP;
  id: string;
};

export type SessionCloseEvent = {
  op: typeof AccordOperation.SESSION_CLOSE_OP;
  id: string;
};

export type AuthenticationEventArgs = AuthenticationEventPayload & {
  op: typeof AccordOperation.AUTHENTICATE_OP;
  callback: (payload: { success: boolean }) => void;
};

export type JWTPayload = {
  id: string;
  iss: string;
  iat: number;
  exp: number;
};

export type RolePermission =
  | "viewGuildChannel"
  | "manageGuildChannels"
  | "createChannelMessage"
  | "manageChannelMessages"
  | "manageGuild"
  | "guildAdmin";

export type RolePermissionSnakeCase =
  | "view_guild_channel"
  | "manage_guild_channels"
  | "create_channel_message"
  | "manage_channel_messages"
  | "manage_guild"
  | "guild_admin";

//// ACCORD WEBSOCKET ////

// BASE WEBSOCKET //
export interface AccordWebsocket extends ws.WebSocket {
  isAlive: boolean;
  id: string;
  roles: Set<string>;
  refreshToken: string;
}

export interface AccordWebsocketServer extends ws.WebSocketServer {
  clients: Set<AccordWebsocket>;
}

// BASE WEBSOCKET PUBLISH //

export type BasePublishEvent = {
  op: AccordOperations;
};

export type BasePublishRoleEvent = {
  publishToRoleIds: string[];
  excludedUserIds?: string[];
};

export type BasePublishUserEvent = {
  publishToUserIds: string[];
};

// WEBSOCKET PUBLISH PAYLOADS //

type SocketSubscriptionAddEventPayload = {
  roleIds: string[];
  userIds: string[];
};

type SocketSubscriptionRemoveEventPayload = {
  roleIds: string[];
  userIds: string[];
};

export type ClientReadyEventPayload = {
  user: UserAccount;
  guilds: Guild[];
  voiceChannelStates: VoiceChannelState[];
  guildChannels: GuildChannel[];
  privateChannels: PrivateTextChannel[];
};

export type GuildCreateEventPayload = {
  guild: Guild;
  channels: GuildChannel[];
};

export type GuildUpdateEventPayload = {
  guild: Pick<Guild, "id"> & Partial<Omit<Guild, "id">>;
};

export type GuildDeleteEventPayload = {
  guild: Pick<Guild, "id">;
};

export type GuildRoleCreateEventPayload = {
  role: GuildRole;
};

export type GuildRoleUpdateEventPayload = {
  role: GuildRole;
};

export type GuildRoleDeleteEventPayload = {
  role: Pick<GuildRole, "id" | "guildId">;
};

export type GuildMemberCreateEventPayload = {
  member: GuildMember;
};

export type GuildMemberUpdateEventPayload = {
  member: Pick<GuildMember, "id" | "guildId"> &
    Partial<Omit<GuildMember, "id">>;
};

export type GuildMemberDeleteEventPayload = {
  member: Pick<GuildMember, "id">;
};

export type ChannelCreateEventPayload = {
  channel: GuildChannel;
};

export type ChannelUpdateEventPayload = {
  channel: Pick<GuildChannel, "id" | "guildId"> &
    Partial<Omit<GuildChannel, "id">>;
};

export type VoiceChannelStateCreateEventPayload = VoiceChannelState;

export type VoiceChannelStateUpdateEventPayload = Pick<
  VoiceChannelState,
  "channelId" | "userAccountId"
> &
  Partial<Omit<VoiceChannelState, "channelId" | "userAccountId">>;

export type VoiceChannelStateDeleteEventPayload = Pick<
  VoiceChannelState,
  "channelId" | "userAccountId"
>;

export type ChannelDeleteEventPayload = {
  channel: Pick<GuildChannel, "id" | "guildId">;
};

export type ChannelMessageCreateEventPayload = {
  message: ChannelMessage;
};

export type ChannelMessageUpdateEventPayload = {
  message: Pick<ChannelMessage, "id" | "channelId"> &
    Partial<Pick<ChannelMessage, "content">>;
};

export type ChannelMessageDeleteEventPayload = {
  message: Pick<ChannelMessage, "id" | "channelId" | "isPinned">;
};

export type ChannelPinCreateEventPayload = {
  message: ChannelMessage;
};

export type ChannelPinDeleteEventPayload = {
  message: Pick<ChannelMessage, "id" | "channelId">;
};

export type UserUpdateEventPayload = {
  user: Partial<UserAccount>;
};

export type UserRelationshipCreateEventPayload = {
  relationship: UserRelationship;
};

export type UserRelationshipUpdateEventPayload = {
  relationship: UserRelationship;
};

export type UserRelationshipDeleteEventPayload = {
  relationship: Pick<UserRelationship, "id">;
};

// WEBSOCKET PUBLISH EVENTS //

export type SocketSubscriptionAddEvent = {
  op: typeof AccordOperation.SOCKET_SUBSCRIPTION_ADD;
  d: SocketSubscriptionAddEventPayload;
};

export type SocketSubscriptionRemoveEvent = {
  op: typeof AccordOperation.SOCKET_SUBSCRIPTION_REMOVE;
  d: SocketSubscriptionRemoveEventPayload;
};

export type ClientReadyEvent = {
  op: typeof AccordOperation.CLIENT_READY_OP;
  d: ClientReadyEventPayload;
};

export type GuildCreateEvent = {
  op: typeof AccordOperation.GUILD_CREATE_OP;
  d: GuildCreateEventPayload;
};

export type GuildUpdateEvent = {
  op: typeof AccordOperation.GUILD_UPDATE_OP;
  d: GuildUpdateEventPayload;
};

export type GuildDeleteEvent = {
  op: typeof AccordOperation.GUILD_DELETE_OP;
  d: GuildDeleteEventPayload;
};

export type GuildRoleCreateEvent = {
  op: typeof AccordOperation.GUILD_ROLE_CREATE_OP;
  d: GuildRoleCreateEventPayload;
};

export type GuildRoleUpdateEvent = {
  op: typeof AccordOperation.GUILD_ROLE_UPDATE_OP;
  d: GuildRoleUpdateEventPayload;
};

export type GuildRoleDeleteEvent = {
  op: typeof AccordOperation.GUILD_ROLE_DELETE_OP;
  d: GuildRoleDeleteEventPayload;
};

export type GuildMemberCreateEvent = {
  op: typeof AccordOperation.GUILD_MEMBER_CREATE_OP;
  d: GuildMemberCreateEventPayload;
};

export type GuildMemberUpdateEvent = {
  op: typeof AccordOperation.GUILD_MEMBER_UPDATE_OP;
  d: GuildMemberUpdateEventPayload;
};

export type GuildMemberDeleteEvent = {
  op: typeof AccordOperation.GUILD_MEMBER_DELETE_OP;
  d: GuildMemberDeleteEventPayload;
};

export type ChannelCreateEvent = {
  op: typeof AccordOperation.CHANNEL_CREATE_OP;
  d: ChannelCreateEventPayload;
};

export type ChannelUpdateEvent = {
  op: typeof AccordOperation.CHANNEL_UPDATE_OP;
  d: ChannelUpdateEventPayload;
};

export type VoiceChannelStateCreateEvent = {
  op: typeof AccordOperation.VOICE_CHANNEL_STATE_CREATE;
  d: VoiceChannelStateCreateEventPayload;
};

export type VoiceChannelStateUpdateEvent = {
  op: typeof AccordOperation.VOICE_CHANNEL_STATE_UPDATE;
  d: VoiceChannelStateUpdateEventPayload;
};

export type VoiceChannelStateDeleteEvent = {
  op: typeof AccordOperation.VOICE_CHANNEL_STATE_DELETE;
  d: VoiceChannelStateDeleteEventPayload;
};

export type ChannelDeleteEvent = {
  op: typeof AccordOperation.CHANNEL_DELETE_OP;
  d: ChannelDeleteEventPayload;
};

export type UserUpdateEvent = {
  op: typeof AccordOperation.USER_UPDATE;
  d: UserUpdateEventPayload;
};

export type UserRelationshipCreateEvent = {
  op: typeof AccordOperation.USER_RELATIONSHIP_CREATE_OP;
  d: UserRelationshipCreateEventPayload;
};

export type UserRelationshipUpdateEvent = {
  op: typeof AccordOperation.USER_RELATIONSHIP_UPDATE_OP;
  d: UserRelationshipUpdateEventPayload;
};

export type UserRelationshipDeleteEvent = {
  op: typeof AccordOperation.USER_RELATIONSHIP_DELETE_OP;
  d: UserRelationshipDeleteEventPayload;
};

export type ChannelMessageCreateEvent = {
  op: typeof AccordOperation.CHANNEL_MESSAGE_CREATE_OP;
  d: ChannelMessageCreateEventPayload;
};

export type ChannelMessageUpdateEvent = {
  op: typeof AccordOperation.CHANNEL_MESSAGE_UPDATE_OP;
  d: ChannelMessageUpdateEventPayload;
};

export type ChannelMessageDeleteEvent = {
  op: typeof AccordOperation.CHANNEL_MESSAGE_DELETE_OP;
  d: ChannelMessageDeleteEventPayload;
};

export type ChannelPinCreateEvent = {
  op: typeof AccordOperation.CHANNEL_PIN_CREATE_OP;
  d: ChannelPinCreateEventPayload;
};

export type ChannelPinDeleteEvent = {
  op: typeof AccordOperation.CHANNEL_PIN_DELETE_OP;
  d: ChannelPinDeleteEventPayload;
};

export type UserPublishEvent = BasePublishEvent &
  BasePublishUserEvent &
  (
    | GuildCreateEvent
    | UserUpdateEvent
    | UserRelationshipCreateEvent
    | UserRelationshipUpdateEvent
    | UserRelationshipDeleteEvent
  );

export type RolePublishEvent = BasePublishEvent &
  BasePublishRoleEvent &
  (
    | GuildUpdateEvent
    | GuildRoleCreateEvent
    | GuildRoleUpdateEvent
    | GuildRoleDeleteEvent
    | GuildMemberCreateEvent
    | GuildMemberUpdateEvent
    | GuildMemberDeleteEvent
    | VoiceChannelStateCreateEvent
    | VoiceChannelStateDeleteEvent
    | VoiceChannelStateUpdateEvent
  );

export type CombinedPublishEvent = BasePublishEvent &
  (Partial<BasePublishRoleEvent> & Partial<BasePublishUserEvent>) &
  (
    | GuildDeleteEvent
    | ChannelCreateEvent
    | ChannelUpdateEvent
    | ChannelDeleteEvent
    | ChannelMessageCreateEvent
    | ChannelMessageUpdateEvent
    | ChannelMessageDeleteEvent
    | ChannelPinCreateEvent
    | ChannelPinDeleteEvent
  );

export type NonPublishedSocketEvents = BasePublishEvent &
  (SocketSubscriptionAddEvent | SocketSubscriptionRemoveEvent);

export type PublishedEvents =
  | SocketSubscriptionAddEvent
  | SocketSubscriptionRemoveEvent
  | ClientReadyEvent
  | GuildCreateEvent
  | UserUpdateEvent
  | UserRelationshipCreateEvent
  | UserRelationshipUpdateEvent
  | UserRelationshipDeleteEvent
  | GuildUpdateEvent
  | GuildRoleCreateEvent
  | GuildRoleUpdateEvent
  | GuildRoleDeleteEvent
  | GuildMemberCreateEvent
  | GuildMemberUpdateEvent
  | GuildMemberDeleteEvent
  | GuildDeleteEvent
  | ChannelCreateEvent
  | ChannelUpdateEvent
  | VoiceChannelStateCreateEvent
  | VoiceChannelStateUpdateEvent
  | VoiceChannelStateDeleteEvent
  | ChannelDeleteEvent
  | ChannelMessageCreateEvent
  | ChannelMessageUpdateEvent
  | ChannelMessageDeleteEvent
  | ChannelPinCreateEvent
  | ChannelPinDeleteEvent;

// WEBSOCKET PUBLISH EVENT/PAYLOAD MAP //
export interface AccordWebSocketEventMap {
  [AccordOperation.SOCKET_SUBSCRIPTION_ADD]: SocketSubscriptionAddEventPayload;
  [AccordOperation.SOCKET_SUBSCRIPTION_REMOVE]: SocketSubscriptionRemoveEventPayload;
  [AccordOperation.CLIENT_READY_OP]: ClientReadyEventPayload;
  [AccordOperation.USER_UPDATE]: UserUpdateEventPayload;
  [AccordOperation.GUILD_CREATE_OP]: GuildCreateEventPayload;
  [AccordOperation.GUILD_UPDATE_OP]: GuildUpdateEventPayload;
  [AccordOperation.GUILD_DELETE_OP]: GuildDeleteEventPayload;
  [AccordOperation.GUILD_ROLE_CREATE_OP]: GuildRoleCreateEventPayload;
  [AccordOperation.GUILD_ROLE_UPDATE_OP]: GuildRoleUpdateEventPayload;
  [AccordOperation.GUILD_ROLE_DELETE_OP]: GuildRoleDeleteEventPayload;
  [AccordOperation.GUILD_MEMBER_CREATE_OP]: GuildMemberCreateEventPayload;
  [AccordOperation.GUILD_MEMBER_UPDATE_OP]: GuildMemberUpdateEventPayload;
  [AccordOperation.GUILD_MEMBER_DELETE_OP]: GuildMemberDeleteEventPayload;
  [AccordOperation.CHANNEL_CREATE_OP]: ChannelCreateEventPayload;
  [AccordOperation.CHANNEL_UPDATE_OP]: ChannelUpdateEventPayload;
  [AccordOperation.CHANNEL_DELETE_OP]: ChannelDeleteEventPayload;
  [AccordOperation.CHANNEL_PIN_CREATE_OP]: ChannelPinCreateEventPayload;
  [AccordOperation.CHANNEL_PIN_DELETE_OP]: ChannelPinDeleteEventPayload;
  [AccordOperation.VOICE_CHANNEL_STATE_CREATE]: VoiceChannelStateCreateEventPayload;
  [AccordOperation.VOICE_CHANNEL_STATE_UPDATE]: VoiceChannelStateUpdateEventPayload;
  [AccordOperation.VOICE_CHANNEL_STATE_DELETE]: VoiceChannelStateDeleteEventPayload;
  [AccordOperation.CHANNEL_MESSAGE_CREATE_OP]: ChannelMessageCreateEventPayload;
  [AccordOperation.CHANNEL_MESSAGE_UPDATE_OP]: ChannelMessageUpdateEventPayload;
  [AccordOperation.CHANNEL_MESSAGE_DELETE_OP]: ChannelMessageDeleteEventPayload;
  [AccordOperation.USER_RELATIONSHIP_CREATE_OP]: UserRelationshipCreateEventPayload;
  [AccordOperation.USER_RELATIONSHIP_UPDATE_OP]: UserRelationshipUpdateEventPayload;
  [AccordOperation.USER_RELATIONSHIP_DELETE_OP]: UserRelationshipDeleteEventPayload;
}

//// ACCORD VOICE ////

// BASE ACCORD VOICE //
export interface AccordVoiceWebsocket extends ws.WebSocket {
  id: string;
  refreshToken: string;
  guildId: string | null;
  channelId: string | null;
  isAuthenticated: boolean;
  isAlive: boolean;
}

export interface AccordVoiceWebsocketServer extends ws.WebSocketServer {
  clients: Set<AccordVoiceWebsocket>;
}

// ACCORD VOICE PAYLOADS //

export type GetRouterRtpCapabilities = {
  op: typeof AccordRTCOperation.GET_RTP_CAPABILITIES;
  d: {
    guildId: string;
    channelId: string;
  };
  id: string;
};

export type CreateTransport = {
  op: typeof AccordRTCOperation.CREATE_TRANSPORT;
  id: string;
};

export type ConnectTransport = {
  op: typeof AccordRTCOperation.CONNECT_TRANSPORT;
  id: string;
  d: {
    dtlsParameters: types.DtlsParameters;
    transportId: string;
  };
};

export type GetProducers = {
  op: typeof AccordRTCOperation.GET_PRODUCERS;
  id: string;
};

export type Produce = {
  op: typeof AccordRTCOperation.PRODUCE;
  d: {
    kind: types.MediaKind;
    rtpParameters: types.RtpParameters;
    transportId: string;
  };
  id: string;
};

export type Consume = {
  op: typeof AccordRTCOperation.CONSUME;
  d: {
    rtpCapabilities: types.RtpCapabilities;
    producerIds: string[];
    transportId: string;
  };
  id: string;
};

export type ProducerPause = {
  op: typeof AccordRTCOperation.PRODUCER_PAUSE;
  d: { producerIds: string[] };
  id: string;
};

export type ProducerResume = {
  op: typeof AccordRTCOperation.PRODUCER_RESUME;
  d: { producerIds: string[] };
  id: string;
};

export type ConsumerResume = {
  op: typeof AccordRTCOperation.CONSUMER_RESUME;
  d: { consumerIds: string[] };
  id: string;
};

export type ConsumerPause = {
  op: typeof AccordRTCOperation.CONSUMER_PAUSE;
  d: { consumerIds: string[] };
  id: string;
};

export type Authenticate = {
  op: typeof AccordOperation.AUTHENTICATE_OP;
  d: {
    accessToken: string;
    refreshToken: string;
    sessionId: string;
  };
  id: string;
};

export type Disconnect = {
  op: typeof AccordRTCOperation.DISCONNECT;
  d: {};
  id: string;
};

export type AccordVoicePayloads =
  | Authenticate
  | GetRouterRtpCapabilities
  | CreateTransport
  | ConnectTransport
  | Produce
  | Consume
  | ConsumerPause
  | ConsumerResume
  | ProducerPause
  | ProducerResume
  | GetProducers
  | Disconnect;

//// ACCORD VOICE CLIENT ////

export type GetRtpCapabilitiesEventArgs = {
  op: typeof AccordRTCOperation.GET_RTP_CAPABILITIES;
  d: {
    guildId: string;
    channelId: string;
  };
  callback: (d: {
    rtpCapabilities: types.RtpCapabilities;
  }) => void | Promise<void>;
};

export type CreateTransportEventArgs = {
  op: typeof AccordRTCOperation.CREATE_TRANSPORT;
  callback: (d: {
    params: {
      id: string;
      iceParameters: types.IceParameters;
      iceCandidates: types.IceCandidate[];
      dtlsParameters: types.DtlsParameters;
      error?: never;
    };
  }) => void | Promise<void>;
};

export type ConnectTransportArgs = {
  op: typeof AccordRTCOperation.CONNECT_TRANSPORT;
  d: {
    dtlsParameters: types.DtlsParameters;
    transportId: string;
  };
  callback: () => void | Promise<void>;
};

export type ConsumeEventArgs = {
  op: typeof AccordRTCOperation.CONSUME;
  d: {
    producerIds: string[];
    rtpCapabilities: types.RtpCapabilities;
    transportId: string;
  };
  callback: (d: {
    paramsArray: {
      id: string;
      userId: string;
      producerId: string;
      kind: types.MediaKind;
      rtpParameters: types.RtpParameters;
    }[];
  }) => void | Promise<void>;
};

export type ProduceEventArgs = {
  op: typeof AccordRTCOperation.PRODUCE;
  d: {
    kind: types.MediaKind;
    rtpParameters: types.RtpParameters;
    transportId: string;
  };
  callback: (d: { id: string }) => void | Promise<void>;
};

export type ConsumerPauseEventArgs = {
  op: typeof AccordRTCOperation.CONSUMER_PAUSE;
  d: {
    consumerIds: string[];
  };
  callback?: (consumerIds: string[]) => void;
};

export type ConsumerResumeEventArgs = {
  op: typeof AccordRTCOperation.CONSUMER_RESUME;
  d: {
    consumerIds: string[];
  };
  callback?: (consumerIds: string[]) => void;
};

export type ProducerPauseEventArgs = {
  op: typeof AccordRTCOperation.PRODUCER_PAUSE;
  d: {
    producerIds: string[];
  };
  callback?: (producerIds: string[]) => void;
};
export type ProducerResumeEventArgs = {
  op: typeof AccordRTCOperation.PRODUCER_RESUME;
  d: {
    producerIds: string[];
  };
  callback?: (producerIds: string[]) => void;
};

export type GetProducersEventArgs = {
  op: typeof AccordRTCOperation.GET_PRODUCERS;
  callback: (d: { producerIds: string[] }) => void | Promise<void>;
};

export type ProducerJoinedEventPayload = {
  producerId: string;
};
export type ProducerPauseEventPayload = {
  userId: string;
  producerId: string;
};
export type ProducerResumeEventPayload = {
  userId: string;
  producerId: string;
};

export type ConsumerPauseEventPayload = {
  userId: string;
  consumerId: string;
};
export type ConsumerResumeEventPayload = {
  userId: string;
  consumer: string;
};
export interface AccordVoiceWebSocketEventMap {
  [AccordRTCOperation.PRODUCER_JOINED]: ProducerJoinedEventPayload;
  [AccordRTCOperation.PRODUCER_PAUSE]: ProducerPauseEventPayload;
  [AccordRTCOperation.PRODUCER_RESUME]: ProducerResumeEventPayload;
  [AccordRTCOperation.CONSUMER_PAUSE]: ConsumerPauseEventPayload;
  [AccordRTCOperation.CONSUMER_RESUME]: ConsumerResumeEventPayload;
}

export type DisconnectEventArgs = {
  op: typeof AccordRTCOperation.DISCONNECT;
  d: {};
  callback: () => void | Promise<void>;
};

export type AccordVoiceWebsocketEmitArgs =
  | AuthenticationEventArgs
  | GetRtpCapabilitiesEventArgs
  | CreateTransportEventArgs
  | ConnectTransportArgs
  | ProduceEventArgs
  | ConsumeEventArgs
  | ConsumerResumeEventArgs
  | GetProducersEventArgs
  | DisconnectEventArgs
  | ConsumerResumeEventArgs
  | ConsumerPauseEventArgs
  | ProducerPauseEventArgs
  | ProducerResumeEventArgs;
