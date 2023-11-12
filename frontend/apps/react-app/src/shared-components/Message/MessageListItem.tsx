import { forwardRef, useState } from 'react';
import { actionConfirmationStore } from '@/components/ActionConfirmation';
import { ListItem } from '@/shared-components/ListItem';
import { Message } from '@/shared-components/Message';
import { InlineMessageEditor } from './InlineMessageEditor';
import { MessageActions } from './MessageActions';
import { MANAGE_CHANNEL_MESSAGES } from '../../constants';
import { ChannelMessage } from '../../types';

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
    const [isMouseOver, setMouseOver] = useState(false);
    const [isEditorOpen, setEditorOpen] = useState(false);

    const manageChannelMessages = (permissions & (1 << MANAGE_CHANNEL_MESSAGES)) !== 0;

    const toggleEditor = () => {
      if (isAuthorCurrentUser) {
        setEditorOpen((s) => !s);
      }
    };

    const handleDeleteMessage = () => {
      if (isAuthorCurrentUser) {
        actionConfirmationStore.setChannelMessage(message, () =>
          onDeleteMessage({
            id: message.id,
            channelId: message.channelId,
          }),
        );
      }
    };

    const handlePinMessage = () => {
      if (manageChannelMessages) {
        onPinMessage(message);
      }
    };

    const handleUnpinMessage = () => {
      if (manageChannelMessages) {
        onUnpinMessage(message);
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
        className='relative'
        onMouseEnter={() => setMouseOver(true)}
        onMouseLeave={() => setMouseOver(false)}
      >
        <Message
          message={message}
          editor={
            isEditorOpen && (
              <InlineMessageEditor
                content={message.content ?? ''}
                onCloseEditor={toggleEditor}
                onSaveChanges={handleSaveChanges}
              />
            )
          }
        />
        {isMouseOver && (
          <MessageActions
            onEditMessage={isAuthorCurrentUser ? toggleEditor : undefined}
            onDeleteMessage={
              manageChannelMessages || isAuthorCurrentUser ? handleDeleteMessage : undefined
            }
            onPinMessage={manageChannelMessages && !message.isPinned ? handlePinMessage : undefined}
            onUnpinMessage={
              manageChannelMessages && message.isPinned ? handleUnpinMessage : undefined
            }
          />
        )}
      </ListItem>
    );
  },
);

MessageListItem.displayName = 'MessageListItem';
