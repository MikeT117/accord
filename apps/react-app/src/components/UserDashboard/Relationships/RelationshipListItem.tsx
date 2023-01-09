import { ChatBubbleLeftEllipsisIcon, CheckIcon } from '@heroicons/react/24/outline';
import type { UserRelationship } from '@accord/common';
import { Avatar } from '@/shared-components/Avatar';
import { DefaultTooltip } from '@/shared-components/DefaultTooltip';
import { IconButton } from '@/shared-components/IconButton';
import { ListItem } from '@/shared-components/ListItem';
import { XMarkIcon } from '@heroicons/react/24/solid';

export const RelationshipListItem = ({
  relationship: { status, user },
  isIncomingRequest,
  onDelete,
  onChat,
  onAccept,
}: {
  relationship: UserRelationship;
  isIncomingRequest?: boolean;
  onChat?: () => void;
  onDelete?: () => void;
  onAccept?: () => void;
}) => (
  <ListItem padding='lg' intent='secondary' isHoverable={false}>
    <div className='mr-auto flex items-center space-x-2'>
      <Avatar size='md' src={user.avatar} />
      <div className='flex flex-col space-y-0.5'>
        <span className='text-sm font-semibold text-gray-12'>{user.displayName}</span>
        {status !== 0 && (
          <span className='text-xs font-medium text-gray-11'>{`${
            isIncomingRequest ? 'Incoming' : 'Outgoing'
          } Friend Request`}</span>
        )}
      </div>
    </div>
    <div className='flex items-center space-x-2'>
      {status === 0 && (
        <>
          <DefaultTooltip tootipText={`DM ${user.displayName}`} position='top'>
            <IconButton onClick={onChat} intent='secondary'>
              <ChatBubbleLeftEllipsisIcon className='h-5 w-5' />
            </IconButton>
          </DefaultTooltip>
          <DefaultTooltip tootipText={`Unfriend ${user.displayName}`} position='top'>
            <IconButton onClick={onDelete} intent='danger'>
              <XMarkIcon className='h-5 w-5' />
            </IconButton>
          </DefaultTooltip>
        </>
      )}
      {status === 2 && (
        <DefaultTooltip tootipText={`Unblock ${user.displayName}`} position='top'>
          <IconButton onClick={onDelete} intent='danger'>
            <XMarkIcon className='h-5 w-5' />
          </IconButton>
        </DefaultTooltip>
      )}
      {status === 1 && isIncomingRequest && (
        <>
          <DefaultTooltip tootipText={`Accept ${user.displayName}'s request`} position='top'>
            <IconButton onClick={onAccept} intent='success'>
              <CheckIcon className='h-5 w-5' />
            </IconButton>
          </DefaultTooltip>
          <DefaultTooltip tootipText={`Decline ${user.displayName}'s request`} position='top'>
            <IconButton onClick={onDelete} intent='danger'>
              <XMarkIcon className='h-5 w-5' />
            </IconButton>
          </DefaultTooltip>
        </>
      )}
      {status === 1 && !isIncomingRequest && (
        <DefaultTooltip tootipText={`Cancel request to ${user.displayName}`} position='top'>
          <IconButton onClick={onDelete} intent='danger'>
            <XMarkIcon className='h-5 w-5' />
          </IconButton>
        </DefaultTooltip>
      )}
    </div>
  </ListItem>
);
