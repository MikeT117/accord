import { forwardRef, useState } from 'react';
import { actionConfirmationStore } from '@/components/ActionConfirmation';
import { ListItem } from '@/shared-components/ListItem';
import { Message } from '@/shared-components/Message';
import { MessageEditor } from './MessageEditor';
import { MANAGE_CHANNEL_MESSAGES } from '../../constants';
import { ChannelMessage } from '../../types';
import { IconButton } from '../IconButton';
import { PencilSimple, Star, Trash } from '@phosphor-icons/react';

export const MessageListItem = forwardRef<
    HTMLLIElement,
    {
        message: ChannelMessage;
        permissions: number;
        isAuthorCurrentUser: boolean;
        onUpdateMessage: (args: { id: string; channelId: string; content: string }) => void;
        onDeleteMessage: (args: { id: string; channelId: string }) => void;
        onPinMessage: (message: ChannelMessage) => void;
        onUnpinMessage: (message: ChannelMessage) => void;
    }
>(
    (
        {
            message,
            isAuthorCurrentUser,
            permissions,
            onUpdateMessage,
            onDeleteMessage,
            onPinMessage,
            onUnpinMessage,
        },
        ref,
    ) => {
        const [isMessageEditorOpen, setMessageEditorOpen] = useState(false);

        const manageChannelMessages = (permissions & (1 << MANAGE_CHANNEL_MESSAGES)) !== 0;

        const toggleMessageEditor = () => {
            if (!isAuthorCurrentUser) {
                return;
            }

            setMessageEditorOpen((s) => !s);
        };

        const handleDeleteMessage = () => {
            if (!isAuthorCurrentUser && !manageChannelMessages) {
                return;
            }

            actionConfirmationStore.deleteMessage(message, () =>
                onDeleteMessage({
                    id: message.id,
                    channelId: message.channelId,
                }),
            );
        };

        const handlePinUnpinMessage = () => {
            if (!manageChannelMessages) {
                return;
            }

            if (message.isPinned) {
                onUnpinMessage(message);
            } else {
                onPinMessage(message);
            }
        };

        const handleSaveChanges = (content: string) => {
            onUpdateMessage({
                channelId: message.channelId,
                content,
                id: message.id,
            });
        };

        return (
            <ListItem
                ref={ref}
                intent='secondary'
                baseBg={false}
                isRounded={false}
                padding='lg'
                className='relative group'
            >
                <Message
                    attachments={message.attachments}
                    author={message.author}
                    content={message.content}
                    createdAt={message.createdAt}
                    isMessageEditorOpen={isMessageEditorOpen}
                    messageEditor={
                        <MessageEditor
                            content={message.content}
                            onCloseEditor={toggleMessageEditor}
                            onSaveChanges={handleSaveChanges}
                        />
                    }
                />
                <div className='absolute right-4 -top-4 z-10 group-hover:flex hidden divide-x divide-gray-1 overflow-hidden rounded-md bg-gray-1 ring-1 ring-gray-1 shadow'>
                    {isAuthorCurrentUser && (
                        <IconButton
                            intent='secondary'
                            shape='unstyled'
                            padding='s'
                            onClick={toggleMessageEditor}
                            tooltipText='Edit'
                            tooltipDelay={0}
                        >
                            <PencilSimple size={20} />
                        </IconButton>
                    )}
                    {manageChannelMessages && (
                        <IconButton
                            shape='unstyled'
                            padding='s'
                            intent='secondary'
                            onClick={handlePinUnpinMessage}
                            tooltipText={!message.isPinned ? 'Pin' : 'Unpin'}
                            tooltipDelay={0}
                        >
                            <Star size={20} weight={message.isPinned ? 'fill' : 'regular'} />
                        </IconButton>
                    )}
                    {(isAuthorCurrentUser || manageChannelMessages) && (
                        <IconButton
                            intent='danger'
                            shape='unstyled'
                            padding='s'
                            onClick={handleDeleteMessage}
                            tooltipText='Delete'
                            tooltipDelay={0}
                        >
                            <Trash size={20} />
                        </IconButton>
                    )}
                </div>
            </ListItem>
        );
    },
);

MessageListItem.displayName = 'MessageListItem';
