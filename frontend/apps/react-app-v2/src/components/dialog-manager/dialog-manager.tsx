import { type DialogName, Dialogs, useDialogUIStore } from "@/lib/zustand/stores/dialog-ui-store";
import { AttachmentGalleryDialog } from "../attachment-gallery-dialog";
import { CreateGuildDialog } from "../create-guild-dialog/create-guild-dialog";
import { CreateGuildInviteDialog } from "../create-guild-invite-dialog/create-guild-invite-dialog";
import { CreateGuildChannelDialog } from "../create-guild-channel-dialog/create-guild-channel-dialog";
import { CreateGuildCategoryDialog } from "../create-guild-category-dialog/create-guild-category-dialog";
import { CreateRelationRequestDialog } from "../create-relationship-dialog/create-relationship-dialog";
import { GuildSettingsDialog } from "../guild-settings-dialog/guild-settings-dialog";
import { GuildChannelSettingsDialog } from "../guild-channel-settings-dialog/guild-channel-settings-dialog";
import { GuildRoleMembersDialog } from "../guild-settings-dialog/guild-settings-role-editor-members-dialog";
import { UserSettingsDialog } from "../user-settings-dialog/user-settings-dialog";
import { ConfirmDeleteActionDialog } from "../confirm-delete-action-dialog";

const dialogComponents: Record<DialogName, React.FC<any>> = {
    [Dialogs.AttachmentGallery]: AttachmentGalleryDialog,
    [Dialogs.CreateGuild]: CreateGuildDialog,
    [Dialogs.CreateGuildInvite]: CreateGuildInviteDialog,
    [Dialogs.CreateGuildChannel]: CreateGuildChannelDialog,
    [Dialogs.CreateGuildCategory]: CreateGuildCategoryDialog,
    [Dialogs.CreateRelationship]: CreateRelationRequestDialog,
    [Dialogs.GuildSettings]: GuildSettingsDialog,
    [Dialogs.ChannelSettings]: GuildChannelSettingsDialog,
    [Dialogs.GuildRoleMembers]: GuildRoleMembersDialog,
    [Dialogs.UserSettings]: UserSettingsDialog,
    [Dialogs.ConfirmDeleteAction]: ConfirmDeleteActionDialog,
};

export function DialogManager() {
    const { closeDialog, openDialogs } = useDialogUIStore();

    if (!openDialogs.length) {
        return null;
    }

    return openDialogs.map(({ dialog, props }) => {
        const Dialog = dialogComponents[dialog];
        if (!Dialog) {
            return null;
        }

        return <Dialog key={dialog} {...props} onClose={() => closeDialog(dialog)} />;
    });
}
