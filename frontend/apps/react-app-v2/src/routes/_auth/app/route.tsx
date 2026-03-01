import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar/app-sidebar";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";
import { GuildCreator } from "@/components/guild-creator/create-guild-dialog";
import { AppInitialisingLoader } from "@/components/app-initialising-loader";
import { UserSettings } from "@/components/user-settings/user-settings-dialog";
import { Toaster } from "@/components/ui/sonner";
import { tokenStore } from "@/lib/valtio/stores/token-store";
import { GuildInviteCreator } from "@/components/guild-invite-creator/create-guild-invite-dialog";
import { WebSocketConfig } from "@/lib/websocket/websocket";
import {
    handleChannelMessageCreated,
    handleChannelMessageUpdated,
    handleChannelMessageDeleted,
} from "@/lib/react-query/query-cache-mutations/channel-message-cache-mutations";
import { isAPIGuildChannel } from "@/lib/types/guards";
import {
    handleGuildStoreInitialisation,
    handleGuildCreated,
    handleGuildUpdated,
    handleGuildDeleted,
    handleGuildRoleCreated,
    handleGuildRoleUpdated,
    handleGuildRoleDeleted,
    handleGuildChannelCreated,
    handleGuildChannelUpdated,
    handleGuildChannelDeleted,
    handleChannelRoleAdded,
    handleChannelRoleRemoved,
    handleChannelRolesSet,
    handleVoiceStateCreated,
    handleVoiceStateUpdated,
    handleVoiceStateDeleted,
} from "@/lib/valtio/mutations/guild-store-mutations";
import {
    handlePrivateChannelStoreInitialisation,
    handlePrivateChannelCreated,
} from "@/lib/valtio/mutations/private-channel-mutations";
import {
    handleRelationshipCreated,
    handleRelationshipDeleted,
    handleRelationshipStoreInitialisation,
    handleRelationshipUpdated,
} from "@/lib/valtio/mutations/relationship-store-mutations";
import { handleResetTokenStore } from "@/lib/valtio/mutations/token-store-mutations";
import {
    handleUserRoleStoreInitialisation,
    handleUserRoleAdded,
    handleUserRoleRemoved,
} from "@/lib/valtio/mutations/user-roles-store-mutations";
import { handleUserStoreInitialisation, handleUserUpdated } from "@/lib/valtio/mutations/user-store-mutations";
import {
    channelMessageSchema,
    channelMessageUpdatedSchema,
    channelMessageDeletedSchema,
} from "@/lib/zod-validation/channel-mesage-schema";
import {
    channelSchema,
    channelUpdatedSchema,
    channelDeletedSchema,
    channelRoleAssociationChangeSchema,
    channelRoleAssociationsSetSchema,
} from "@/lib/zod-validation/channel-schema";
import { guildRoleSchema, guildRoleUpdatedSchema, guildRoleDeletedSchema } from "@/lib/zod-validation/guild-role";
import { guildSchema, guildUpdatedSchema, guildDeletedSchema } from "@/lib/zod-validation/guild-schema";
import { initialisationSchema } from "@/lib/zod-validation/initialisation-schema";
import {
    relationshipSchema,
    relationshipUpdatedSchema,
    relationshipDeletedSchema,
} from "@/lib/zod-validation/relationship-schema";
import { userRoleAssociationChangeSchema, userUpdatedSchema } from "@/lib/zod-validation/user-schema";
import {
    voiceStateSchema,
    voiceStateUpdatedSchema,
    voiceStateDeletedSchema,
} from "@/lib/zod-validation/voice-state-schema";
import * as root from "../../../lib/protobuf/gen/proto-bundle";
import { tokensSchema } from "@/lib/zod-validation/localstorage-schema";

export const Route = createFileRoute("/_auth/app")({
    beforeLoad: async ({ context, cause }) => {
        const { success } = tokensSchema.safeParse(tokenStore);
        if (!success) {
            throw redirect({ to: "/" });
        }
        if (cause === "enter") {
            return new Promise<void>((res, rej) => {
                const config: WebSocketConfig = {
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
                                res();
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
                                handleChannelMessageUpdated(
                                    channelMessageUpdatedSchema.parse(payload.channelMessageUpdated),
                                );
                                break;
                            case root.pb.OpCode.CHANNEL_MESSAGE_DELETE_EVENT:
                                handleChannelMessageDeleted(
                                    channelMessageDeletedSchema.parse(payload.channelMessageDeleted),
                                );
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
                                handleChannelRoleAdded(
                                    channelRoleAssociationChangeSchema.parse(payload.channelRoleAssociated),
                                );
                                break;
                            case root.pb.OpCode.CHANNEL_ROLE_DISASSOCIATE:
                                handleChannelRoleRemoved(
                                    channelRoleAssociationChangeSchema.parse(payload.channelRoleDisassociated),
                                );
                                break;
                            case root.pb.OpCode.USER_ROLE_ASSOCIATE:
                                handleUserRoleAdded(userRoleAssociationChangeSchema.parse(payload.userRoleAssociated));
                                break;
                            case root.pb.OpCode.USER_ROLE_DISASSOCIATE:
                                handleUserRoleRemoved(
                                    userRoleAssociationChangeSchema.parse(payload.userRoleDisassociated),
                                );
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

                context.eventWebsocket.loadConfig(config);
                context.eventWebsocket.connect();
            });
        }
    },
    onLeave: ({ context }) => context.eventWebsocket.shutdown(),
    pendingComponent: () => <AppInitialisingLoader />,
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="grid h-screen w-screen grid-cols-[min-content_250px_1fr] grid-rows-[100%]">
            <AppSidebar />
            <Outlet />
            <ConfirmActionDialog />
            <GuildCreator />
            <GuildInviteCreator />
            <UserSettings />
            <Toaster />
        </div>
    );
}
