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
import { handleUserStoreInitialisation } from "../valtio/mutations/user-store-mutations";
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
import { userRoleAssociationChangeSchema } from "../zod-validation/user-schema";

const MAX_RETRY_INTERVAL = 30000;
const CONNECTION_TIMEOUT = 5000;

const WEBSOCKET_CLOSE_CODE = {
    UNKNOWN: 4000,
    AUTHENTICATION_TIMEOUT: 4001,
    AUTHENTICATION_FAILED: 4002,
    SESSION_EXPIRED: 4003,
} as const;

export const eventWebsocket = (() => {
    let conn: WebSocket;
    let retryInterval = 5 * 1000;
    let retryAttempts = 1;
    let token = () => tokenStore.refreshtoken;
    let log = true;
    let initialised: (() => void) | null = null;

    async function connect() {
        return new Promise<void>((resolve) => {
            logEvents("Event", "Connecting", `Attempts: ${retryAttempts}`);

            initialised = () => resolve();
            conn = new WebSocket("wss://accord.razor116.com/ws");
            conn.binaryType = "arraybuffer";

            setTimeout(() => {
                if (conn.readyState === WebSocket.CONNECTING) {
                    logEvents("Event", "Connecting", "Timeout", `Attempts: ${retryAttempts}`);
                    shutdown();
                }
            }, CONNECTION_TIMEOUT);

            addEventListeners();
        });
    }

    function addEventListeners() {
        logEvents("Event", "Listeners", "Create");
        conn.addEventListener("open", handleOpenEvent);
        conn.addEventListener("message", handleMsgEvent);
        conn.addEventListener("close", reconnect);
        window.addEventListener("beforeunload", shutdown);
    }

    function removeEventListeners() {
        logEvents("Event", "Listeners", "Remove");
        conn.removeEventListener("open", handleOpenEvent);
        conn.removeEventListener("message", handleMsgEvent);
        conn.removeEventListener("close", reconnect);
        window.removeEventListener("beforeunload", shutdown);
    }

    function reconnect(ev: CloseEvent) {
        logEvents("Event", "Close", `Code: ${ev.code}`, `Clean: ${ev.wasClean}`, `Reason: ${ev.reason}`);

        if (ev.code === 1000) {
            console.warn("websocket connection closed normally, not retrying!");
            return;
        }

        if (retryAttempts > 10) {
            console.error("websocket connection failed, max attempts (10) reached!");
            return;
        }

        if (
            ev.code === WEBSOCKET_CLOSE_CODE.AUTHENTICATION_FAILED ||
            ev.code === WEBSOCKET_CLOSE_CODE.SESSION_EXPIRED
        ) {
            handleResetTokenStore();
        }

        setTimeout(
            () => {
                shutdown();

                logEvents("Event", "Reconnecting", `Attempts: ${retryAttempts}`);
                conn = new WebSocket("wss://accord.razor116.com/ws");
                conn.binaryType = "arraybuffer";

                setTimeout(() => {
                    if (conn.readyState !== WebSocket.OPEN) {
                        logEvents("Event", "Reconnection", "Timeout", `Attempts: ${retryAttempts}`);
                        shutdown();
                    }
                }, CONNECTION_TIMEOUT);

                addEventListeners();
            },
            Math.min(retryInterval, MAX_RETRY_INTERVAL)
        );

        retryInterval *= 2;
        retryAttempts += 1;
    }

    function shutdown() {
        logEvents("Event", "Shutdown");
        removeEventListeners();
        conn.close(1000);
    }

    function handleOpenEvent() {
        logEvents("Event", "Open");

        const clientEvent = root.pb.ClientEvent;
        const identifyPayload = root.pb.Identify;

        conn.send(
            clientEvent
                .encode(
                    clientEvent.create({
                        op: root.pb.OpCode.IDENTIFY,
                        ver: 0,
                        identify: identifyPayload.create({
                            refreshtoken: token(),
                            ver: 0,
                        }),
                    })
                )
                .finish()
        );
    }

    function logEvents(...data: unknown[]) {
        if (log) {
            console.log(data);
        }
    }

    function handleMsgEvent(ev: MessageEvent<ArrayBuffer>) {
        const eventPayload = root.pb.EventPayload;
        const payload = eventPayload.decode(new Uint8Array(ev.data));
        logEvents("Event", "Message", `op: ${payload.op}`);

        switch (payload.op) {
            case root.pb.OpCode.INIT:
                const initialisation = initialisationSchema.parse(payload.initialisation);
                handleGuildStoreInitialisation(initialisation.guilds);
                handlePrivateChannelStoreInitialisation(initialisation.privateChannels);
                handleUserRoleStoreInitialisation(initialisation.roleIds);
                handleUserStoreInitialisation(initialisation.user);
                if (retryAttempts === 1 && initialised) {
                    initialised();
                    initialised = null;
                }
                break;
            case root.pb.OpCode.GUILD_CREATE_EVENT:
                const guildCreated = guildSchema.parse(payload.guildCreated);
                handleGuildCreated(guildCreated);
                break;
            case root.pb.OpCode.GUILD_UPDATE_EVENT:
                const guildUpdated = guildUpdatedSchema.parse(payload.guildUpdated);
                handleGuildUpdated(guildUpdated);
                break;
            case root.pb.OpCode.GUILD_DELETE_EVENT:
                const guildDeleted = guildDeletedSchema.parse(payload.guildDeleted);
                handleGuildDeleted(guildDeleted);
                break;
            case root.pb.OpCode.GUILD_ROLE_CREATE_EVENT:
                const guildRoleCreated = guildRoleSchema.parse(payload.guildRoleCreated);
                handleGuildRoleCreated(guildRoleCreated);
                break;
            case root.pb.OpCode.GUILD_ROLE_UPDATE_EVENT:
                const guildRoleUpdated = guildRoleUpdatedSchema.parse(payload.guildRoleUpdated);
                handleGuildRoleUpdated(guildRoleUpdated);
                break;
            case root.pb.OpCode.GUILD_ROLE_DELETE_EVENT:
                const guildRoleDeleted = guildRoleDeletedSchema.parse(payload.guildRoleDeleted);
                handleGuildRoleDeleted(guildRoleDeleted);
                break;
            case root.pb.OpCode.CHANNEL_CREATE_EVENT:
                const channelCreated = channelSchema.parse(payload.channelCreated);
                if (isAPIGuildChannel(channelCreated)) {
                    handleGuildChannelCreated(channelCreated);
                } else {
                    handlePrivateChannelCreated(channelCreated);
                }
                break;
            case root.pb.OpCode.CHANNEL_UPDATE_EVENT:
                const channelUpdated = channelUpdatedSchema.parse(payload.channelUpdated);
                handleGuildChannelUpdated(channelUpdated);
                break;
            case root.pb.OpCode.CHANNEL_DELETE_EVENT:
                const channelDeleted = channelDeletedSchema.parse(payload.channelDeleted);
                handleGuildChannelDeleted(channelDeleted);
                break;
            case root.pb.OpCode.CHANNEL_MESSAGE_CREATE_EVENT:
                const channelMessageCreated = channelMessageSchema.parse(payload.channelMessageCreated);
                handleChannelMessageCreated(channelMessageCreated);
                break;
            case root.pb.OpCode.CHANNEL_MESSAGE_UPDATE_EVENT:
                const channelMessageUpdated = channelMessageUpdatedSchema.parse(payload.channelMessageUpdated);
                handleChannelMessageUpdated(channelMessageUpdated);
                break;
            case root.pb.OpCode.CHANNEL_MESSAGE_DELETE_EVENT:
                const channelMessageDeleted = channelMessageDeletedSchema.parse(payload.channelMessageDeleted);
                handleChannelMessageDeleted(channelMessageDeleted);
                break;

            case root.pb.OpCode.RELATIONSHIP_CREATE_EVENT:
                const relationshipCreated = relationshipSchema.parse(payload.relationshipCreated);
                handleRelationshipCreated(relationshipCreated);
                break;
            case root.pb.OpCode.RELATIONSHIP_UPDATE_EVENT:
                const relationshipUpdated = relationshipUpdatedSchema.parse(payload.relationshipUpdated);
                handleRelationshipUpdated(relationshipUpdated);
                break;
            case root.pb.OpCode.RELATIONSHIP_DELETE_EVENT:
                const relationshipDeleted = relationshipDeletedSchema.parse(payload.relationshipDeleted);
                handleRelationshipDeleted(relationshipDeleted);
                break;
            case root.pb.OpCode.CHANNEL_ROLE_ASSOCIATE:
                const channelRoleAssociated = channelRoleAssociationChangeSchema.parse(payload.channelRoleAssociated);
                handleChannelRoleAdded(channelRoleAssociated);
                break;
            case root.pb.OpCode.CHANNEL_ROLE_DISASSOCIATE:
                const channelRoleDisassociated = channelRoleAssociationChangeSchema.parse(
                    payload.channelRoleDisassociated
                );
                handleChannelRoleRemoved(channelRoleDisassociated);
                break;
            case root.pb.OpCode.USER_ROLE_ASSOCIATE:
                const userRoleAssociated = userRoleAssociationChangeSchema.parse(payload.userRoleAssociated);
                handleUserRoleAdded(userRoleAssociated);
                break;
            case root.pb.OpCode.USER_ROLE_DISASSOCIATE:
                const userRoleDisassociated = userRoleAssociationChangeSchema.parse(payload.userRoleDisassociated);
                handleUserRoleRemoved(userRoleDisassociated);
                break;
            case root.pb.OpCode.CHANNEL_ROLES_SET:
                const channelRolesSet = channelRoleAssociationsSetSchema.parse(payload.channelRolesSet);
                handleChannelRolesSet(channelRolesSet);
                break;
            default:
                console.error("unknown op code, ignoring");
        }
    }

    return { connect, shutdown };
})();

export type EventWebsocketType = typeof eventWebsocket;
