import { IconButton } from '@/shared-components/IconButton';
import { DropdownMenu, DropdownMenuItem } from '@/shared-components/DropdownMenu';
import { guildChannelCreatorActions } from '@/components/GuildChannelCreator';
import { guildChannelCategoryCreatorActions } from '@/components/GuildChannelCategoryCreator';
import { guildSettingsActions } from '@/components/GuildSettings/stores/useGuildSettingsStore';
import { guildInviteCreatorActions } from '@/components/GuildInviteCreator/stores/useGuildInviteCreatorStore';
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
import { actionConfirmationActions, ConfirmationActionType } from '../ActionConfirmation';

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
    actionConfirmationActions.setGuild(
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
          <DropdownMenuItem fullWidth onClick={guildChannelCreatorActions.toggleOpen}>
            <span className='whitespace-nowrap'>Create Channel</span>
            <PlusCircleIcon className='h-5 w-5 shrink-0' />
          </DropdownMenuItem>
          <DropdownMenuItem fullWidth onClick={guildChannelCategoryCreatorActions.toggleOpen}>
            <span className='whitespace-nowrap'>Create Category</span>
            <FolderPlusIcon className='h-5 w-5 shrink-0' />
          </DropdownMenuItem>
        </>
      )}
      {guildAdmin && (
        <DropdownMenuItem fullWidth onClick={guildInviteCreatorActions.toggleOpen}>
          <span className='whitespace-nowrap'>Create Invite</span>
          <UserGroupIcon className='h-5 w-5 shrink-0' />
        </DropdownMenuItem>
      )}
      {manageGuild && (
        <DropdownMenuItem fullWidth onClick={guildSettingsActions.toggleOpen}>
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
