import { ChatBubbleLeftEllipsisIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Avatar } from '@/shared-components/Avatar';
import { DefaultTooltip } from '@/shared-components/DefaultTooltip';
import { IconButton } from '@/shared-components/IconButton';
import { ListItem } from '@/shared-components/ListItem';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { UserRelationship } from '../../../types';

export const RelationshipListItem = ({
  relationship,
  isOutgoing,
  onDelete,
  onChat,
  onAccept,
}: {
  relationship: UserRelationship;
  isOutgoing?: boolean;
  onChat?: () => void;
  onDelete?: () => void;
  onAccept?: () => void;
}) => (
  <ListItem padding='lg' intent='secondary' isHoverable={false}>
    <div className='mr-auto flex items-center space-x-2'>
      <Avatar size='md' src={relationship.user.avatar} />
      <div className='flex flex-col space-y-0.5'>
        <span className='text-sm font-semibold text-gray-12'>{relationship.user.displayName}</span>
        {relationship.status !== 0 && (
          <span className='text-xs font-medium text-gray-11'>{`${
            isOutgoing ? 'Outgoing' : 'Incoming'
          } Request`}</span>
        )}
      </div>
    </div>
    <div className='flex items-center space-x-2'>
      {relationship.status === 0 && (
        <>
          <DefaultTooltip tootipText={`DM ${relationship.user.displayName}`} position='top'>
            <IconButton onClick={onChat} intent='secondary'>
              <ChatBubbleLeftEllipsisIcon className='h-5 w-5' />
            </IconButton>
          </DefaultTooltip>
          <DefaultTooltip tootipText={`Unfriend ${relationship.user.displayName}`} position='top'>
            <IconButton onClick={onDelete} intent='danger'>
              <XMarkIcon className='h-5 w-5' />
            </IconButton>
          </DefaultTooltip>
        </>
      )}
      {relationship.status === 2 && (
        <DefaultTooltip tootipText={`Unblock ${relationship.user.displayName}`} position='top'>
          <IconButton onClick={onDelete} intent='danger'>
            <XMarkIcon className='h-5 w-5' />
          </IconButton>
        </DefaultTooltip>
      )}
      {relationship.status === 1 && !isOutgoing && (
        <>
          <DefaultTooltip
            tootipText={`Accept ${relationship.user.displayName}'s request`}
            position='top'
          >
            <IconButton onClick={onAccept} intent='success'>
              <CheckIcon className='h-5 w-5' />
            </IconButton>
          </DefaultTooltip>
          <DefaultTooltip
            tootipText={`Decline ${relationship.user.displayName}'s request`}
            position='top'
          >
            <IconButton onClick={onDelete} intent='danger'>
              <XMarkIcon className='h-5 w-5' />
            </IconButton>
          </DefaultTooltip>
        </>
      )}
      {relationship.status === 1 && isOutgoing && (
        <DefaultTooltip
          tootipText={`Cancel request to ${relationship.user.displayName}`}
          position='top'
        >
          <IconButton onClick={onDelete} intent='danger'>
            <XMarkIcon className='h-5 w-5' />
          </IconButton>
        </DefaultTooltip>
      )}
    </div>
  </ListItem>
);
