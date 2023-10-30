import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, TrashIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import { DefaultTooltip } from '@/shared-components/DefaultTooltip';
import { IconButton } from '@/shared-components/IconButton';

export const MessageActions = ({
  onDeleteMessage,
  onEditMessage,
  onPinMessage,
  onUnpinMessage,
}: {
  onEditMessage?: () => void;
  onDeleteMessage?: () => void;
  onPinMessage?: () => void;
  onUnpinMessage?: () => void;
}) => {
  if (!onEditMessage && !onDeleteMessage && !onPinMessage && !onUnpinMessage) {
    return null;
  }
  return (
    <div className='absolute right-[20px] top-[-20px] z-10 flex divide-x divide-gray-1 overflow-hidden rounded-md border border-gray-1 bg-gray-3'>
      {onEditMessage && (
        <DefaultTooltip tootipText='Edit'>
          <IconButton intent='secondary' shape='unstyled' padding='m' onClick={onEditMessage}>
            <PencilSquareIcon className='h-5 w-5' />
          </IconButton>
        </DefaultTooltip>
      )}
      {(onUnpinMessage || onPinMessage) && (
        <DefaultTooltip tootipText={onPinMessage ? 'Pin' : 'Unpin'} delayDuration={0}>
          <IconButton
            shape='unstyled'
            padding='m'
            intent='secondary'
            onClick={onPinMessage ?? onUnpinMessage}
          >
            {onPinMessage ? (
              <StarIconOutline className='h-5 w-5 shrink-0' />
            ) : (
              <StarIconSolid className='h-5 w-5 shrink-0' />
            )}
          </IconButton>
        </DefaultTooltip>
      )}
      {onDeleteMessage && (
        <DefaultTooltip tootipText='Delete'>
          <IconButton intent='danger' shape='unstyled' padding='m' onClick={onDeleteMessage}>
            <TrashIcon className='h-5 w-5' />
          </IconButton>
        </DefaultTooltip>
      )}
    </div>
  );
};
