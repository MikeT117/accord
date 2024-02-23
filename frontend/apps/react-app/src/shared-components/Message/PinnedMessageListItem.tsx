import { forwardRef } from 'react';
import { ListItem } from '@/shared-components/ListItem';
import { Message } from '@/shared-components/Message';
import { IconButton } from '@/shared-components/IconButton';
import { MANAGE_CHANNEL_MESSAGES } from '../../constants';
import { useDeleteChannelPinMutation } from '../../api/channelPins/deleteChannelPin';
import { ChannelMessage } from '../../types';
import { X } from '@phosphor-icons/react';

export const PinnedMessageListItem = forwardRef<
    HTMLLIElement,
    {
        message: ChannelMessage;
        permissions: number;
    }
>(({ message, permissions }, ref) => {
    const { mutate: unpinMessage } = useDeleteChannelPinMutation();

    const manageChannelMessages = (permissions & (1 << MANAGE_CHANNEL_MESSAGES)) !== 0;

    const handleUnpinMessage = () => {
        unpinMessage(message);
    };

    return (
        <ListItem ref={ref} intent='secondary' baseBg={true} className='relative group'>
            <Message
                attachments={message.attachments}
                author={message.author}
                content={message.content}
                createdAt={message.createdAt}
            />
            {manageChannelMessages && (
                <div className='absolute top-2 right-2 hidden group-hover:flex'>
                    <IconButton
                        intent='danger'
                        padding='s'
                        onClick={handleUnpinMessage}
                        tooltipText='Unpin Message'
                    >
                        <X size={16} />
                    </IconButton>
                </div>
            )}
        </ListItem>
    );
});

PinnedMessageListItem.displayName = 'PinnedMessageListItem';
