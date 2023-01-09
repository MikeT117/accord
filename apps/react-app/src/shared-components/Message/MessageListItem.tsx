import type { ChannelMessage } from '@accord/common';
import { forwardRef, useState } from 'react';
import { actionConfirmationActions } from '@/components/ActionConfirmation';
import { ListItem } from '@/shared-components/ListItem';
import { Message } from '@/shared-components/Message';
import { InlineMessageEditor } from './InlineMessageEditor';
import { MessageActions } from './MessageActions';

export const MessageListItem = forwardRef<
  HTMLLIElement,
  {
    message: ChannelMessage;
    permissions: {
      viewGuildChannel: boolean;
      manageGuildChannels: boolean;
      createChannelMessage: boolean;
      manageChannelMessages: boolean;
      manageGuild: boolean;
      guildAdmin: boolean;
    };
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

    const toggleEditor = () => {
      if (isAuthorCurrentUser) {
        setEditorOpen((s) => !s);
      }
    };

    const handleDeleteMessage = () => {
      if (isAuthorCurrentUser) {
        actionConfirmationActions.setChannelMessage(message, () =>
          onDeleteMessage({
            id: message.id,
            channelId: message.channelId,
          }),
        );
      }
    };

    const handlePinMessage = () => {
      if (permissions.manageChannelMessages) {
        onPinMessage(message);
      }
    };

    const handleUnpinMessage = () => {
      if (permissions.manageChannelMessages) {
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
              permissions.manageChannelMessages || isAuthorCurrentUser
                ? handleDeleteMessage
                : undefined
            }
            onPinMessage={
              permissions.manageChannelMessages && !message.isPinned ? handlePinMessage : undefined
            }
            onUnpinMessage={
              permissions.manageChannelMessages && message.isPinned ? handleUnpinMessage : undefined
            }
          />
        )}
      </ListItem>
    );
  },
);

MessageListItem.displayName = 'MessageListItem';
