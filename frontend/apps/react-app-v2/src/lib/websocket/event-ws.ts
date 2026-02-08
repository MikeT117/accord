import { initialisationSchema } from "@/lib/zod-validation/initialisation-schema";
import * as root from "../protobuf/gen/proto-bundle";
import { guildDeletedSchema, guildSchema, guildUpdatedSchema } from "@/lib/zod-validation/guild-schema";
import { guildRoleDeletedSchema, guildRoleSchema, guildRoleUpdatedSchema } from "@/lib/zod-validation/guild-role";
import {
    channelDeletedSchema,
    channelRoleAssociationChangeSchema,
    channelRoleAssociationsSetSchema,
    channelSchema,
    channelUpdatedSchema,
} from "@/lib/zod-validation/channel-schema";
import {
    channelMessageDeletedSchema,
    channelMessageSchema,
    channelMessageUpdatedSchema,
} from "@/lib/zod-validation/channel-mesage-schema";
import {
    relationshipDeletedSchema,
    relationshipSchema,
    relationshipUpdatedSchema,
} from "@/lib/zod-validation/relationship-schema";
import { tokenStore } from "../valtio/stores/token-store";
import {
    handleChannelRoleAdded,
    handleChannelRoleRemoved,
    handleChannelRolesSet,
    handleGuildChannelCreated,
    handleGuildChannelDeleted,
    handleGuildChannelUpdated,
    handleGuildCreated,
    handleGuildDeleted,
    handleGuildRoleCreated,
    handleGuildRoleDeleted,
    handleGuildRoleUpdated,
    handleGuildStoreInitialisation,
    handleGuildUpdated,
    handleVoiceStateCreated,
    handleVoiceStateDeleted,
    handleVoiceStateUpdated,
} from "../valtio/mutations/guild-store-mutations";
import {
    handlePrivateChannelCreated,
    handlePrivateChannelStoreInitialisation,
} from "../valtio/mutations/private-channel-mutations";
import {
    handleUserRoleAdded,
    handleUserRoleRemoved,
    handleUserRoleStoreInitialisation,
} from "../valtio/mutations/user-roles-store-mutations";
import { handleUserStoreInitialisation, handleUserUpdated } from "../valtio/mutations/user-store-mutations";
import {
    handleChannelMessageCreated,
    handleChannelMessageUpdated,
    handleChannelMessageDeleted,
} from "../react-query/query-cache-mutations/channel-message-cache-mutations";
import {
    handleRelationshipCreated,
    handleRelationshipUpdated,
    handleRelationshipDeleted,
} from "../react-query/query-cache-mutations/relationship-cache-mutations";
import { isAPIGuildChannel } from "../types/guards";
import { handleResetTokenStore } from "../valtio/mutations/token-store-mutations";
import { userRoleAssociationChangeSchema, userUpdatedSchema } from "../zod-validation/user-schema";
import { handleRelationshipStoreInitialisation } from "../valtio/mutations/relationship-store-mutations";
import { websocket, type WebSocketConfig } from "./websocket";
import {
    voiceStateDeletedSchema,
    voiceStateSchema,
    voiceStateUpdatedSchema,
} from "../zod-validation/voice-state-schema";

const websocketConfig: WebSocketConfig = {
    endpoint: "wss://accord.razor116.com/ws",
    log: true,
    retries: 5,
    retry: true,
    onInvalidSession: handleResetTokenStore,
    identify: () => {
        return root.pb.ClientEvent.encode(
            root.pb.ClientEvent.create({
                op: root.pb.OpCode.IDENTIFY,
                ver: 0,
                identify: root.pb.Identify.create({
                    refreshtoken: tokenStore.refreshtoken,
                    ver: 0,
                }),
            }),
        ).finish();
    },
    onMessage: (data: ArrayBuffer) => {
        const eventPayload = root.pb.EventPayload;
        const payload = eventPayload.decode(new Uint8Array(data));

        switch (payload.op) {
            case root.pb.OpCode.INIT: {
                const initialisation = initialisationSchema.parse(payload.initialisation);
                handleGuildStoreInitialisation(initialisation.guilds);
                handlePrivateChannelStoreInitialisation(initialisation.privateChannels);
                handleUserRoleStoreInitialisation(initialisation.roleIds);
                handleUserStoreInitialisation(initialisation.user);
                handleRelationshipStoreInitialisation(initialisation.relationships);
                break;
            }
            case root.pb.OpCode.GUILD_CREATE_EVENT:
                handleGuildCreated(guildSchema.parse(payload.guildCreated));
                break;
            case root.pb.OpCode.GUILD_UPDATE_EVENT:
                handleGuildUpdated(guildUpdatedSchema.parse(payload.guildUpdated));
                break;
            case root.pb.OpCode.GUILD_DELETE_EVENT:
                handleGuildDeleted(guildDeletedSchema.parse(payload.guildDeleted));
                break;
            case root.pb.OpCode.GUILD_ROLE_CREATE_EVENT:
                handleGuildRoleCreated(guildRoleSchema.parse(payload.guildRoleCreated));
                break;
            case root.pb.OpCode.GUILD_ROLE_UPDATE_EVENT:
                handleGuildRoleUpdated(guildRoleUpdatedSchema.parse(payload.guildRoleUpdated));
                break;
            case root.pb.OpCode.GUILD_ROLE_DELETE_EVENT:
                handleGuildRoleDeleted(guildRoleDeletedSchema.parse(payload.guildRoleDeleted));
                break;
            case root.pb.OpCode.CHANNEL_CREATE_EVENT: {
                const channelCreated = channelSchema.parse(payload.channelCreated);
                if (isAPIGuildChannel(channelCreated)) {
                    handleGuildChannelCreated(channelCreated);
                } else {
                    handlePrivateChannelCreated(channelCreated);
                }
                break;
            }
            case root.pb.OpCode.CHANNEL_UPDATE_EVENT:
                handleGuildChannelUpdated(channelUpdatedSchema.parse(payload.channelUpdated));
                break;
            case root.pb.OpCode.CHANNEL_DELETE_EVENT:
                handleGuildChannelDeleted(channelDeletedSchema.parse(payload.channelDeleted));
                break;
            case root.pb.OpCode.CHANNEL_MESSAGE_CREATE_EVENT:
                handleChannelMessageCreated(channelMessageSchema.parse(payload.channelMessageCreated));
                break;
            case root.pb.OpCode.CHANNEL_MESSAGE_UPDATE_EVENT:
                handleChannelMessageUpdated(channelMessageUpdatedSchema.parse(payload.channelMessageUpdated));
                break;
            case root.pb.OpCode.CHANNEL_MESSAGE_DELETE_EVENT:
                handleChannelMessageDeleted(channelMessageDeletedSchema.parse(payload.channelMessageDeleted));
                break;
            case root.pb.OpCode.RELATIONSHIP_CREATE_EVENT:
                handleRelationshipCreated(relationshipSchema.parse(payload.relationshipCreated));
                break;
            case root.pb.OpCode.RELATIONSHIP_UPDATE_EVENT:
                handleRelationshipUpdated(relationshipUpdatedSchema.parse(payload.relationshipUpdated));
                break;
            case root.pb.OpCode.RELATIONSHIP_DELETE_EVENT:
                handleRelationshipDeleted(relationshipDeletedSchema.parse(payload.relationshipDeleted));
                break;
            case root.pb.OpCode.CHANNEL_ROLE_ASSOCIATE:
                handleChannelRoleAdded(channelRoleAssociationChangeSchema.parse(payload.channelRoleAssociated));
                break;
            case root.pb.OpCode.CHANNEL_ROLE_DISASSOCIATE:
                handleChannelRoleRemoved(channelRoleAssociationChangeSchema.parse(payload.channelRoleDisassociated));
                break;
            case root.pb.OpCode.USER_ROLE_ASSOCIATE:
                handleUserRoleAdded(userRoleAssociationChangeSchema.parse(payload.userRoleAssociated));
                break;
            case root.pb.OpCode.USER_ROLE_DISASSOCIATE:
                handleUserRoleRemoved(userRoleAssociationChangeSchema.parse(payload.userRoleDisassociated));
                break;
            case root.pb.OpCode.CHANNEL_ROLES_SET:
                handleChannelRolesSet(channelRoleAssociationsSetSchema.parse(payload.channelRolesSet));
                break;
            case root.pb.OpCode.USER_UPDATED:
                handleUserUpdated(userUpdatedSchema.parse(payload.userUpdated));
                break;
            case root.pb.OpCode.VOICE_STATE_CREATE_EVENT:
                handleVoiceStateCreated(voiceStateSchema.parse(payload.voiceStateCreated));
                break;
            case root.pb.OpCode.VOICE_STATE_UPDATE_EVENT:
                handleVoiceStateUpdated(voiceStateUpdatedSchema.parse(payload.voiceStateUpdated));
                break;
            case root.pb.OpCode.VOICE_STATE_DELETE_EVENT:
                handleVoiceStateDeleted(voiceStateDeletedSchema.parse(payload.voiceStateDeleted));
                break;
            default:
                console.error(`unknown op code ${payload.op}, ignoring`);
        }
    },
};

export type EventWebsocketType = typeof eventWebsocket;
export const eventWebsocket = websocket(websocketConfig);
