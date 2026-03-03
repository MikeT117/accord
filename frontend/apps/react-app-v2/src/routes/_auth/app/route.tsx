import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar/app-sidebar";
import { AppInitialisingLoader } from "@/components/app-initialising-loader";
import { Toaster } from "@/components/ui/sonner";
import { WebSocketConfig } from "@/lib/websocket/websocket";
import { queryCacheActions } from "@/lib/react-query/query-cache-actions/channel-message-cache-mutations";
import { isAPIGuildChannel } from "@/lib/types/guards";
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
import { guildStoreActions } from "@/lib/zustand/stores/guild-store";
import { userStoreActions } from "@/lib/zustand/stores/user-store";
import { userRoleStoreActions } from "@/lib/zustand/stores/user-role-store";
import { privateChannelStoreActions } from "@/lib/zustand/stores/private-channel-store";
import { relationshipStoreActions } from "@/lib/zustand/stores/relationship-store";
import { tokenStoreActions, tokenStoreState } from "@/lib/zustand/stores/token-store";
import { DialogManager } from "@/components/dialog-manager/dialog-manager";

export const Route = createFileRoute("/_auth/app")({
    beforeLoad: async ({ context, cause }) => {
        const { success } = tokensSchema.safeParse(tokenStoreState());
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
                    onInvalidSession: tokenStoreActions.reset,
                    identify: () => {
                        return root.pb.ClientEvent.encode(
                            root.pb.ClientEvent.create({
                                op: root.pb.OpCode.IDENTIFY,
                                ver: 0,
                                identify: root.pb.Identify.create({
                                    refreshtoken: tokenStoreState().refreshtoken,
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

                                guildStoreActions.initialise(initialisation.guilds);
                                userStoreActions.initialise(initialisation.user);
                                userRoleStoreActions.initialise(initialisation.roleIds);
                                privateChannelStoreActions.initialise(initialisation.privateChannels);
                                relationshipStoreActions.initialise(initialisation.relationships);

                                res();
                                break;
                            }
                            case root.pb.OpCode.GUILD_CREATE_EVENT:
                                guildStoreActions.createGuild(guildSchema.parse(payload.guildCreated));
                                break;
                            case root.pb.OpCode.GUILD_UPDATE_EVENT:
                                guildStoreActions.updateGuild(guildUpdatedSchema.parse(payload.guildUpdated));
                                break;
                            case root.pb.OpCode.GUILD_DELETE_EVENT:
                                guildStoreActions.deleteGuild(guildDeletedSchema.parse(payload.guildDeleted));
                                break;
                            case root.pb.OpCode.GUILD_ROLE_CREATE_EVENT:
                                guildStoreActions.createRole(guildRoleSchema.parse(payload.guildRoleCreated));
                                break;
                            case root.pb.OpCode.GUILD_ROLE_UPDATE_EVENT:
                                guildStoreActions.updateRole(guildRoleUpdatedSchema.parse(payload.guildRoleUpdated));
                                break;
                            case root.pb.OpCode.GUILD_ROLE_DELETE_EVENT:
                                guildStoreActions.deleteRole(guildRoleDeletedSchema.parse(payload.guildRoleDeleted));
                                break;
                            case root.pb.OpCode.CHANNEL_CREATE_EVENT: {
                                const channelCreated = channelSchema.parse(payload.channelCreated);
                                if (isAPIGuildChannel(channelCreated)) {
                                    guildStoreActions.createChannel(channelCreated);
                                } else {
                                    privateChannelStoreActions.createChannel(channelCreated);
                                }
                                break;
                            }
                            case root.pb.OpCode.CHANNEL_UPDATE_EVENT:
                                guildStoreActions.updateChannel(channelUpdatedSchema.parse(payload.channelUpdated));
                                break;
                            case root.pb.OpCode.CHANNEL_DELETE_EVENT:
                                guildStoreActions.deleteChannel(channelDeletedSchema.parse(payload.channelDeleted));
                                break;
                            case root.pb.OpCode.CHANNEL_MESSAGE_CREATE_EVENT:
                                queryCacheActions.createChannelMessage(
                                    channelMessageSchema.parse(payload.channelMessageCreated),
                                );
                                break;
                            case root.pb.OpCode.CHANNEL_MESSAGE_UPDATE_EVENT:
                                queryCacheActions.updateChannelMessage(
                                    channelMessageUpdatedSchema.parse(payload.channelMessageUpdated),
                                );
                                break;
                            case root.pb.OpCode.CHANNEL_MESSAGE_DELETE_EVENT:
                                queryCacheActions.deleteChannelMessage(
                                    channelMessageDeletedSchema.parse(payload.channelMessageDeleted),
                                );
                                break;
                            case root.pb.OpCode.RELATIONSHIP_CREATE_EVENT:
                                relationshipStoreActions.createRelationship(
                                    relationshipSchema.parse(payload.relationshipCreated),
                                );
                                break;
                            case root.pb.OpCode.RELATIONSHIP_UPDATE_EVENT:
                                relationshipStoreActions.updateRelationship(
                                    relationshipUpdatedSchema.parse(payload.relationshipUpdated),
                                );
                                break;
                            case root.pb.OpCode.RELATIONSHIP_DELETE_EVENT:
                                relationshipStoreActions.deleteRelationship(
                                    relationshipDeletedSchema.parse(payload.relationshipDeleted),
                                );
                                break;
                            case root.pb.OpCode.CHANNEL_ROLE_ASSOCIATE:
                                guildStoreActions.associateChannelRole(
                                    channelRoleAssociationChangeSchema.parse(payload.channelRoleAssociated),
                                );
                                break;
                            case root.pb.OpCode.CHANNEL_ROLE_DISASSOCIATE:
                                guildStoreActions.disassociateChannelRole(
                                    channelRoleAssociationChangeSchema.parse(payload.channelRoleDisassociated),
                                );
                                break;
                            case root.pb.OpCode.USER_ROLE_ASSOCIATE:
                                userRoleStoreActions.associateUserRole(
                                    userRoleAssociationChangeSchema.parse(payload.userRoleAssociated),
                                );
                                break;
                            case root.pb.OpCode.USER_ROLE_DISASSOCIATE:
                                userRoleStoreActions.disassociateUserRole(
                                    userRoleAssociationChangeSchema.parse(payload.userRoleDisassociated),
                                );
                                break;
                            case root.pb.OpCode.CHANNEL_ROLES_SET:
                                guildStoreActions.setChannelRoles(
                                    channelRoleAssociationsSetSchema.parse(payload.channelRolesSet),
                                );
                                break;
                            case root.pb.OpCode.USER_UPDATED:
                                userStoreActions.updateUser(userUpdatedSchema.parse(payload.userUpdated));
                                break;
                            case root.pb.OpCode.VOICE_STATE_CREATE_EVENT:
                                guildStoreActions.createVoiceState(voiceStateSchema.parse(payload.voiceStateCreated));
                                break;
                            case root.pb.OpCode.VOICE_STATE_UPDATE_EVENT:
                                guildStoreActions.updateVoiceState(
                                    voiceStateUpdatedSchema.parse(payload.voiceStateUpdated),
                                );
                                break;
                            case root.pb.OpCode.VOICE_STATE_DELETE_EVENT:
                                guildStoreActions.deleteVoiceState(
                                    voiceStateDeletedSchema.parse(payload.voiceStateDeleted),
                                );
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
            <DialogManager />
            <Toaster />
        </div>
    );
}
