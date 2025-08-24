import * as z from "zod/v4-mini";
import { attachmentSchema } from "../zod-validation/attachment-schema";
import {
    channelMessageDeletedSchema,
    channelMessageSchema,
    channelMessageUpdatedSchema,
} from "../zod-validation/channel-mesage-schema";
import {
    channelDeletedSchema,
    channelRoleAssociationChangeSchema,
    channelRoleAssociationsSetSchema,
    channelUpdatedSchema,
    guildChannelSchema,
    privateChannelSchema,
} from "../zod-validation/channel-schema";
import { guildInviteSchema } from "../zod-validation/guild-invite-schema";
import { guildMemberSchema } from "../zod-validation/guild-member-schema";
import { guildMemberUserSchema } from "../zod-validation/guild-member-user-schema";
import { guildRoleDeletedSchema, guildRoleSchema, guildRoleUpdatedSchema } from "../zod-validation/guild-role";
import { guildSchema, guildUpdatedSchema, guildDeletedSchema } from "../zod-validation/guild-schema";
import { initialisationSchema } from "../zod-validation/initialisation-schema";
import {
    relationshipSchema,
    relationshipUpdatedSchema,
    relationshipDeletedSchema,
} from "../zod-validation/relationship-schema";
import { sessionSchema } from "../zod-validation/session-schema";
import { userSchema, userRoleAssociationChangeSchema, userUpdatedSchema } from "../zod-validation/user-schema";
import type { envSchema } from "../zod-validation/env-schema";
import type { useSnapshot } from "valtio";

// Utility Types
export type Snapshot<T extends object> = ReturnType<typeof useSnapshot<T>>;
export type Dictionary<T> = {
    [key: string]: T | undefined;
};

export type ValueOf<T> = T[keyof T];

export type Normalize<T> = {
    keys: string[];
    values: Dictionary<T>;
};

export type OptionalReadonly<T> = Readonly<T> | T;

// Env Types
export type EnvironmentVarsType = z.infer<typeof envSchema>;

// Base API Types
export type APIErrorResponse = {
    code: number;
    detail: string;
    error: string;
};
export type APIAttachmentType = z.infer<typeof attachmentSchema>;
export type APIChannelMessageType = z.infer<typeof channelMessageSchema>;
export type APIGuildChannelType = z.infer<typeof guildChannelSchema>;
export type APIPrivateChannelType = z.infer<typeof privateChannelSchema>;
export type APIGuildInviteType = z.infer<typeof guildInviteSchema>;
export type APIGuildMemberType = z.infer<typeof guildMemberSchema>;
export type APIGuildMemberUserType = z.infer<typeof guildMemberUserSchema>;
export type APIGuildRoleType = z.infer<typeof guildRoleSchema>;
export type APIGuildType = z.infer<typeof guildSchema>;
export type APIRelationshipType = z.infer<typeof relationshipSchema>;
export type APISessionType = z.infer<typeof sessionSchema>;
export type APIUserType = z.infer<typeof userSchema>;

// Narrowed Base API Types
export type APIGuildTextChannelType = Extract<APIGuildChannelType, { channelType: 0 }>;
export type APIGuildVoiceChannelType = Extract<APIGuildChannelType, { channelType: 1 }>;
export type APIGuildCategoryChannelType = Extract<APIGuildChannelType, { channelType: 2 }>;
export type APIPrivateDirectChannelType = Extract<APIPrivateChannelType, { channelType: 3 }>;
export type APIPrivateGroupChannelType = Extract<APIPrivateChannelType, { channelType: 4 }>;

// Event Payload Types
export type APIInitialisationType = z.infer<typeof initialisationSchema>;
export type APIChannelMessageUpdatedType = z.infer<typeof channelMessageUpdatedSchema>;
export type APIChannelMessageDeletedType = z.infer<typeof channelMessageDeletedSchema>;
export type APIChannelUpdatedType = z.infer<typeof channelUpdatedSchema>;
export type APIChannelDeletedType = z.infer<typeof channelDeletedSchema>;
export type APIGuildRoleUpdatedType = z.infer<typeof guildRoleUpdatedSchema>;
export type APIGuildRoleDeletedType = z.infer<typeof guildRoleDeletedSchema>;
export type APIGuildUpdatedType = z.infer<typeof guildUpdatedSchema>;
export type APIGuildDeletedType = z.infer<typeof guildDeletedSchema>;
export type APIRelationshipUpdatedType = z.infer<typeof relationshipUpdatedSchema>;
export type APIRelationshipDeletedType = z.infer<typeof relationshipDeletedSchema>;
export type APIChannelRoleAssociationChangeType = z.infer<typeof channelRoleAssociationChangeSchema>;
export type APIUserRoleAssociationChangeType = z.infer<typeof userRoleAssociationChangeSchema>;
export type APIChannelRoleAssociationsSetType = z.infer<typeof channelRoleAssociationsSetSchema>;
export type APIUserUpdatedType = z.infer<typeof userUpdatedSchema>;

// Client Types
export type AttachmentType = APIAttachmentType;
export type ChannelMessageType = APIChannelMessageType;
export type GuildType = Omit<APIGuildType, "channels" | "roles"> & {
    channels: Normalize<GuildChannelType>;
    roles: Normalize<GuildRoleType>;
};
export type GuildInviteType = APIGuildMemberType;
export type GuildMemberType = APIGuildMemberType;
export type GuildMemberUserType = APIGuildMemberUserType;
export type GuildRoleType = APIGuildRoleType;
export type GuildChannelType =
    | (Omit<Extract<APIGuildChannelType, { channelType: 0 }>, "roleIds"> & { roleIds: Normalize<boolean> })
    | (Omit<Extract<APIGuildChannelType, { channelType: 1 }>, "roleIds"> & { roleIds: Normalize<boolean> })
    | (Omit<Extract<APIGuildChannelType, { channelType: 2 }>, "roleIds"> & { roleIds: Normalize<boolean> });

export type ChannelType = GuildChannelType | PrivateChannelType;
export type PrivateChannelType =
    | Extract<APIPrivateChannelType, { channelType: 3 }>
    | Extract<APIPrivateChannelType, { channelType: 4 }>;

export type RelationshipType = APIRelationshipType;
export type SessionType = APISessionType;
export type UserType = APIUserType;

// Narrowed Client Types
export type GuildTextChannelType = Extract<GuildChannelType, { channelType: 0 }>;
export type GuildVoiceChannelType = Extract<GuildChannelType, { channelType: 1 }>;
export type GuildCategoryChannelType = Extract<GuildChannelType, { channelType: 2 }>;
export type PrivateDirectChannelType = Extract<PrivateChannelType, { channelType: 3 }>;
export type PrivateGroupChannelType = Extract<PrivateChannelType, { channelType: 4 }>;

// User Role Permissions
export type GuildRolePermissionsType = {
    ViewGuildChannel: boolean;
    ManageGuildChannel: boolean;
    CreateChannelMessage: boolean;
    ManageChannelMessage: boolean;
    ManageGuild: boolean;
    GuildAdmin: boolean;
    GuildSuperAdmin: boolean;
    GuildOwner: boolean;
    ViewGuildMember: boolean;
    CreateChannelPin: boolean;
};
