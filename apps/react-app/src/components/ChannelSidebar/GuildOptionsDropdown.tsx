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
import { useLoggedInUserId } from '@/shared-stores/loggedInUserStore';
import { useLeaveGuildMutation } from '@/api/member/leaveGuild';
import { actionConfirmationStore, ConfirmationActionType } from '../ActionConfirmation';

export const GuildOptionsDropdown = ({
  guildId,
  guildName,
  ownerUserAccountId,
}: {
  guildId: string;
  guildName: string;
  ownerUserAccountId: string;
}) => {
  const userId = useLoggedInUserId();
  const { guildAdmin, manageGuild, manageGuildChannels } = useGuildPermission(guildId);

  const { mutate } = useLeaveGuildMutation();

  const leaveGuildMutation = () => {
    actionConfirmationStore.setGuild(
      { id: guildId, name: guildName },
      ConfirmationActionType.LEAVE,
      () => mutate({ id: guildId }),
    );
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
        <DropdownMenuItem fullWidth onClick={guildInviteCreatorStore.toggleOpen}>
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
        <DropdownMenuItem fullWidth intent='danger' onClick={leaveGuildMutation}>
          <span className='whitespace-nowrap'>Leave Server</span>
          <ArrowLeftOnRectangleIcon className='h-5 w-5 shrink-0 rotate-180 ' />
        </DropdownMenuItem>
      )}
    </DropdownMenu>
  );
};
