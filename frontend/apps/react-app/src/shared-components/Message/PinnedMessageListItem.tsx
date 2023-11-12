import { XMarkIcon } from '@heroicons/react/24/outline';
import { forwardRef, useState } from 'react';
import { ListItem } from '@/shared-components/ListItem';
import { Message } from '@/shared-components/Message';
import { DefaultTooltip } from '../DefaultTooltip';
import { IconButton } from '@/shared-components/IconButton';
import { MANAGE_CHANNEL_MESSAGES } from '../../constants';
import { useDeleteChannelPinMutation } from '../../api/channelPins/deleteChannelPin';
import { ChannelMessage } from '../../types';

export const PinnedMessageListItem = forwardRef<
  HTMLLIElement,
  {
    message: ChannelMessage;
    permissions: number;
  }
>(({ message, permissions }, ref) => {
  const [isMouseOver, setMouseOver] = useState(false);

  const { mutate: unpinMessage } = useDeleteChannelPinMutation();

  const handleUnpinMessage = () => {
    unpinMessage(message);
  };

  return (
    <ListItem
      ref={ref}
      intent='secondary'
      baseBg={true}
      className='relative'
      onMouseEnter={() => setMouseOver(true)}
      onMouseLeave={() => setMouseOver(false)}
    >
      <Message message={message} />
      {isMouseOver && (permissions & (1 << MANAGE_CHANNEL_MESSAGES)) != 0 && (
        <div className='absolute top-2 right-2 flex'>
          <DefaultTooltip tootipText='Unpin Message'>
            <IconButton intent='danger' padding='s' onClick={handleUnpinMessage}>
              <XMarkIcon className='h-4 w-4 stroke-2' />
            </IconButton>
          </DefaultTooltip>
        </div>
      )}
    </ListItem>
  );
});

PinnedMessageListItem.displayName = 'PinnedMessageListItem';
