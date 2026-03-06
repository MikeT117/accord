import { APP_MODE, env } from "@/lib/constants";
import { UserType, AttachmentType } from "@/lib/types/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export const Dialogs = {
    AttachmentGallery: "AttachmentGallery",
    CreateGuild: "CreateGuild",
    CreateGuildInvite: "CreateGuildInvite",
    CreateGuildChannel: "CreateGuildChannel",
    CreateGuildCategory: "CreateGuildCategory",
    CreateRelationship: "CreateRelationship",
    GuildSettings: "GuildSettings",
    ChannelSettings: "ChannelSettings",
    GuildRoleMembers: "GuildRoleMembers",
    UserSettings: "UserSettings",
    ConfirmDeleteAction: "ConfirmDeleteAction",
} as const;

export type DialogName = (typeof Dialogs)[keyof typeof Dialogs];

type DialogPropsMap = {
    [Dialogs.AttachmentGallery]: { initialIndex: number; author: UserType; attachments: AttachmentType[] };
    [Dialogs.CreateGuild]: Record<string, never>;
    [Dialogs.CreateGuildInvite]: Record<string, never>;
    [Dialogs.CreateGuildChannel]: Record<string, never>;
    [Dialogs.CreateGuildCategory]: Record<string, never>;
    [Dialogs.CreateRelationship]: Record<string, never>;
    [Dialogs.GuildSettings]: Record<string, never>;
    [Dialogs.ChannelSettings]: { guildId: string; channelId: string };
    [Dialogs.GuildRoleMembers]: { guildId: string; roleId: string };
    [Dialogs.UserSettings]: Record<string, never>;
    [Dialogs.ConfirmDeleteAction]: { actionFn: () => void };
};

type DialogWithoutProp = {
    [K in keyof DialogPropsMap]: DialogPropsMap[K] extends Record<string, never> ? K : never;
}[keyof DialogPropsMap];

type DialogWithProps = Exclude<keyof DialogPropsMap, DialogWithoutProp>;

type OpenDialog = ((dialog: DialogWithoutProp) => void) &
    (<K extends DialogWithProps>(dialog: K, props: DialogPropsMap[K]) => void);

type CloseDialog = (dialog: DialogName) => void;

type DialogEntry = {
    [K in keyof DialogPropsMap]: { dialog: K; props: DialogPropsMap[K] };
}[keyof DialogPropsMap];

type DialogUIStateType = {
    openDialogs: DialogEntry[];
};

type dialogUIStoreActionsType = {
    openDialog: OpenDialog;
    closeDialog: CloseDialog;
};

type DialogUIStore = DialogUIStateType & dialogUIStoreActionsType;

export const useDialogUIStore = create<DialogUIStore>()(
    devtools(
        immer((set) => ({
            openDialogs: [],
            openDialog: (dialog: DialogName, props: Record<string, unknown> = {}) => {
                return set((state) => {
                    if (state.openDialogs.findIndex((s) => s.dialog === dialog) === -1) {
                        state.openDialogs.push({ dialog, props } as DialogEntry);
                    }
                });
            },
            closeDialog: (dialog) => {
                return set((state) => {
                    const index = state.openDialogs.findIndex((s) => s.dialog === dialog);
                    if (index !== -1) {
                        state.openDialogs.splice(index, 1);
                    }
                });
            },
        })),
        { name: "dialogUIStore", enabled: env.APP_MODE === APP_MODE.DEVELOPMENT },
    ),
);

export const dialogUIStoreActions = {
    openDialog: useDialogUIStore.getState().openDialog,
    closeDialog: useDialogUIStore.getState().closeDialog,
};
