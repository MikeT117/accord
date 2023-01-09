import type { ChannelMessage } from '@accord/common';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { forwardRef, useState } from 'react';
import { useUnpinChannelMessageMutation } from '@/api/message/unpinChannelMessage';
import { ListItem } from '@/shared-components/ListItem';
import { Message } from '@/shared-components/Message';
import { DefaultTooltip } from '../DefaultTooltip';
import { IconButton } from '@/shared-components/IconButton';

export const PinnedMessageListItem = forwardRef<
  HTMLLIElement,
  {
    message: ChannelMessage;
    permissions: { manageChannelMessages: boolean };
  }
>(({ message, permissions: { manageChannelMessages } }, ref) => {
  const [isMouseOver, setMouseOver] = useState(false);

  const { mutate: unpinMessage } = useUnpinChannelMessageMutation();

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
      {isMouseOver && manageChannelMessages && (
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
