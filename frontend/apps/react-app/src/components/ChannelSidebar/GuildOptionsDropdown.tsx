import { IconButton } from '@/shared-components/IconButton';
import { DropdownMenu, DropdownMenuItem } from '@/shared-components/DropdownMenu';
import { guildChannelCreatorStore } from '@/components/GuildChannelCreator';
import { guildChannelCategoryCreatorStore } from '@/components/GuildChannelCategoryCreator';
import { guildSettingsStore } from '@/components/GuildSettings/stores/useGuildSettingsStore';
import { guildInviteCreatorStore } from '@/components/GuildInviteCreator/stores/useGuildInviteCreatorStore';
import { useGuildPermission } from './hooks/useGuildPermissions';
import {
  FolderPlusIcon,
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  PlusCircleIcon,
} from '@heroicons/react/20/solid';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useCurrentUserId } from '@/shared-stores/currentUserStore';
import { useLeaveGuildMutation } from '@/api/me/leaveGuild';
import { actionConfirmationStore, ConfirmationActionType } from '../ActionConfirmation';
import { GUILD_ADMIN, MANAGE_GUILD, MANAGE_GUILD_CHANNELS } from '../../constants';
import { useCreateGuildInviteMutation } from '../../api/guildInvites/createGuildInvite';

export const GuildOptionsDropdown = ({
  guildId,
  guildName,
  ownerUserAccountId,
}: {
  guildId: string;
  guildName: string;
  ownerUserAccountId: string;
}) => {
  const userId = useCurrentUserId();
  const permissions = useGuildPermission(guildId);

  const guildAdmin = (permissions & (1 << GUILD_ADMIN)) !== 0;
  const manageGuildChannels = (permissions & (1 << MANAGE_GUILD_CHANNELS)) !== 0;
  const manageGuild = (permissions & (1 << MANAGE_GUILD)) !== 0;

  const { mutate: leaveGuildMutation } = useLeaveGuildMutation();
  const { mutate: createInviteMutation } = useCreateGuildInviteMutation();

  const leaveGuild = () => {
    actionConfirmationStore.setGuild(
      { id: guildId, name: guildName },
      ConfirmationActionType.LEAVE,
      () => leaveGuildMutation(guildId),
    );
  };

  const createInvite = () => {
    createInviteMutation(guildId, {
      onSuccess(inviteId) {
        guildInviteCreatorStore.open(inviteId);
      },
      onError(error) {
        console.log({ error });
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
          <ChevronDownIcon className='h-4 w-4 stroke-2' />
        </IconButton>
      }
    >
      {manageGuildChannels && (
        <>
          <DropdownMenuItem fullWidth onClick={guildChannelCreatorStore.toggleOpen}>
            <span className='whitespace-nowrap'>Create Channel</span>
            <PlusCircleIcon className='h-5 w-5 shrink-0' />
          </DropdownMenuItem>
          <DropdownMenuItem fullWidth onClick={guildChannelCategoryCreatorStore.toggleOpen}>
            <span className='whitespace-nowrap'>Create Category</span>
            <FolderPlusIcon className='h-5 w-5 shrink-0' />
          </DropdownMenuItem>
        </>
      )}
      {guildAdmin && (
        <DropdownMenuItem fullWidth onClick={createInvite}>
          <span className='whitespace-nowrap'>Create Invite</span>
          <UserGroupIcon className='h-5 w-5 shrink-0' />
        </DropdownMenuItem>
      )}
      {manageGuild && (
        <DropdownMenuItem fullWidth onClick={guildSettingsStore.toggleOpen}>
          <span className='whitespace-nowrap'>Server Settings</span>
          <Cog6ToothIcon className='h-5 w-5 shrink-0' />
        </DropdownMenuItem>
      )}
      {userId !== ownerUserAccountId && (
        <DropdownMenuItem fullWidth intent='danger' onClick={leaveGuild}>
          <span className='whitespace-nowrap'>Leave Server</span>
          <ArrowLeftOnRectangleIcon className='h-5 w-5 shrink-0 rotate-180 ' />
        </DropdownMenuItem>
      )}
    </DropdownMenu>
  );
};
