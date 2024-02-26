import { IconButton } from '@/shared-components/IconButton';
import { DropdownMenu, DropdownMenuItem } from '@/shared-components/DropdownMenu';
import { guildChannelCreatorStore } from '@/components/GuildChannelCreator';
import { guildSettingsStore } from '@/components/GuildSettings/stores/useGuildSettingsStore';
import { guildInviteCreatorStore } from '@/components/GuildInviteCreator/stores/useGuildInviteCreatorStore';
import { useGuildPermission } from './hooks/useGuildPermissions';
import { useLeaveGuildMutation } from '@/api/me/leaveGuild';
import { actionConfirmationStore } from '../ActionConfirmation';
import { GUILD_ADMIN, MANAGE_GUILD, MANAGE_GUILD_CHANNELS } from '../../constants';
import { useCreateGuildInviteMutation } from '../../api/guildInvites/createGuildInvite';
import { useCurrentUserId } from '../../shared-stores/currentUserStore';
import {
    CaretDown,
    FolderSimplePlus,
    GearSix,
    PlusCircle,
    SignOut,
    UserPlus,
} from '@phosphor-icons/react';
import { useI18nContext } from '../../i18n/i18n-react';

export const GuildOptionsDropdown = ({
    guildId,
    guildName,
    guildCreatorId,
}: {
    guildId: string;
    guildName: string;
    guildCreatorId: string;
}) => {
    const { LL } = useI18nContext();
    const userId = useCurrentUserId();
    const permissions = useGuildPermission(guildId);

    const guildAdmin = (permissions & (1 << GUILD_ADMIN)) !== 0;
    const manageGuildChannels = (permissions & (1 << MANAGE_GUILD_CHANNELS)) !== 0;
    const manageGuild = (permissions & (1 << MANAGE_GUILD)) !== 0;

    const { mutate: leaveGuildMutation } = useLeaveGuildMutation();
    const { mutate: createInviteMutation } = useCreateGuildInviteMutation();

    const leaveGuild = () => {
        actionConfirmationStore.leaveGuild({ id: guildId, name: guildName }, () =>
            leaveGuildMutation(guildId),
        );
    };

    const createInvite = () => {
        createInviteMutation(guildId, {
            onSuccess(inviteId) {
                guildInviteCreatorStore.open(inviteId);
            },
        });
    };

    return (
        <DropdownMenu
            side='bottom'
            sideOffset={20}
            className='min-w-[208px]'
            align='end'
            tooltipText='Server Settings'
            triggerElem={
                <IconButton intent='secondary'>
                    <CaretDown size={16} weight='bold' />
                </IconButton>
            }
        >
            {manageGuildChannels && (
                <>
                    <DropdownMenuItem fullWidth onClick={() => guildChannelCreatorStore.open()}>
                        <span className='whitespace-nowrap'>{LL.Actions.CreateChannel()}</span>
                        <PlusCircle size={20} weight='duotone' className='shrink-0' />
                    </DropdownMenuItem>
                    <DropdownMenuItem fullWidth onClick={() => guildChannelCreatorStore.open(true)}>
                        <span className='whitespace-nowrap'>{LL.Actions.CreateCategory()}</span>
                        <FolderSimplePlus size={20} weight='duotone' className='h-5 w-5 shrink-0' />
                    </DropdownMenuItem>
                </>
            )}
            {guildAdmin && (
                <DropdownMenuItem fullWidth onClick={createInvite}>
                    <span className='whitespace-nowrap'>{LL.Actions.CreateInvite()}</span>
                    <UserPlus size={20} weight='duotone' className='shrink-0' />
                </DropdownMenuItem>
            )}
            {manageGuild && (
                <DropdownMenuItem fullWidth onClick={guildSettingsStore.open}>
                    <span className='whitespace-nowrap'>{LL.General.ServerSettings()}</span>
                    <GearSix size={20} weight='duotone' className='shrink-0' />
                </DropdownMenuItem>
            )}
            {userId !== guildCreatorId && (
                <DropdownMenuItem fullWidth intent='danger' onClick={leaveGuild}>
                    <span className='whitespace-nowrap'>{LL.Actions.LeaveServer()}</span>
                    <SignOut size={20} weight='duotone' className='shrink-0 ' />
                </DropdownMenuItem>
            )}
        </DropdownMenu>
    );
};
