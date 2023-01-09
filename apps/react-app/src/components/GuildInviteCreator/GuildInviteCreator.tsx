import { ClipboardIcon } from '@heroicons/react/24/outline';
import { Dialog } from '@/shared-components/Dialog';
import { guildInviteCreatorActions } from './stores/useGuildInviteCreatorStore';
import { Input } from '@/shared-components/Input';
import { IconButton } from '@/shared-components/IconButton';
import { Button } from '@/shared-components/Button';
import { ListItem } from '@/shared-components/ListItem';
import { Avatar } from '@/shared-components/Avatar';
import { useNewGuildInvite } from './hooks/useNewGuildInvite';
import { useSendInviteToUser } from './hooks/useSendInviteToFriend';
import { useIsGuildInviteCreatorOpen } from './hooks/useIsGuildInviteCreatorOpen';
import { DefaultTooltip } from '@/shared-components/DefaultTooltip';
import { useInviteLinkCopy } from '@/shared-hooks/useInviteLinkCopy';
import { useFilteredRelationships } from '../../shared-hooks/useFilteredRelationships';

const { toggleOpen } = guildInviteCreatorActions;

export const GuildInviteCreatorContent = () => {
  const inviteLink = useNewGuildInvite();

  const { displayNameFilter, relationships, setDisplayNameFilter } = useFilteredRelationships({
    status: 0,
  });
  const { sendInviteToUser, status } = useSendInviteToUser();
  const onCopy = useInviteLinkCopy();

  if (!inviteLink) {
    return null;
  }

  const handleListFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayNameFilter(e.currentTarget.value);
  };

  return (
    <div className='px-4 py-5'>
      <h1 className='mb-6 text-xl font-semibold text-gray-12'>Send invite to friends</h1>
      <Input
        id='friend-search'
        placeholder='Search For Friends'
        onChange={handleListFilterChange}
        value={displayNameFilter}
      />
      <div className='mt-3 mb-6 flex min-h-[200px] flex-col'>
        <span className='mb-1.5 text-sm text-gray-11'>Friends - {relationships.length}</span>
        <ul>
          {relationships.map((relationship) => (
            <ListItem key={relationship.id} intent='secondary'>
              <Avatar src={relationship.user.avatar} fallback={relationship.user.displayName} />
              <span className='ml-1 mr-auto select-none'>{relationship.user.displayName}</span>
              <Button
                onClick={() => sendInviteToUser(inviteLink, relationship.user.id)}
                disabled={status !== 'idle'}
              >
                {status === 'success' && 'Invite Sent'}
                {status === 'error' && 'Invite Failed'}
                {status === 'loading' && 'Sending...'}
                {status === 'idle' && 'Send Invite'}
              </Button>
            </ListItem>
          ))}
        </ul>
      </div>
      <label className='flex w-full flex-col space-y-1' htmlFor='invite-link'>
        <span className='mb-1 text-sm text-gray-11'>Or send a server invite link to a friend</span>
        <div className='flex overflow-hidden rounded'>
          <Input
            id='invite-link'
            placeholder={inviteLink}
            readOnly={true}
            className='pr-1'
            rightInputElement={
              <DefaultTooltip tootipText='Copy Invite'>
                <IconButton intent='secondary' shape='sqircle' onClick={() => onCopy(inviteLink)}>
                  <ClipboardIcon className='h-5 w-5' />
                </IconButton>
              </DefaultTooltip>
            }
          />
        </div>
      </label>
    </div>
  );
};

export const GuildInviteCreator = () => {
  const isOpen = useIsGuildInviteCreatorOpen();
  return (
    <Dialog isOpen={isOpen} onClose={toggleOpen}>
      <GuildInviteCreatorContent />
    </Dialog>
  );
};
