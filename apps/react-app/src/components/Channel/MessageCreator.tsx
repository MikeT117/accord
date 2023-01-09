import { lazy } from 'react';
import { ArrowUpOnSquareIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import { MainContentFooterLayout } from '@/shared-components/Layouts';
import type { GuildRole, Emoji } from '@accord/common';
import { IconButton } from '@/shared-components/IconButton';
import { TrashIcon } from '@heroicons/react/24/solid';
import { Input } from '@/shared-components/Input';
import { Image } from '@/shared-components/Image';
import { DefaultTooltip } from '@/shared-components/DefaultTooltip';
import { Popover } from '@/shared-components/Popover';
import { useMessageCreator } from './hooks/useMessageCreator';

const EmojiPicker = lazy(() => import('@/shared-components/EmojiPicker/Picker'));

export const MessageCreator = ({
  permissions,
}: {
  permissions: Omit<GuildRole, 'id' | 'guildId' | 'name'>;
}) => {
  const {
    content,
    attachments,
    UploadWrapper,
    updateContent,
    createMessage,
    deleteAttachment,
    onFileUploadClick,
  } = useMessageCreator();

  const handleInputKeyUp = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!e.shiftKey && e.key === 'Enter') {
      createMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateContent(e.currentTarget.value);
  };

  const handleAttachButtonClick = () => {
    if (permissions.createChannelMessage) {
      onFileUploadClick();
    }
  };

  const handleEmojiSelect = (emoji: Emoji) => {
    if (permissions.createChannelMessage) {
      updateContent(`${content ?? ''}${emoji.native}`);
    }
  };

  return (
    <MainContentFooterLayout>
      {attachments?.length !== 0 && (
        <div className='mb-2 flex space-x-2 overflow-x-auto'>
          {attachments.map((a) => (
            <div key={a.signature} className='relative flex items-center rounded bg-gray-3 p-3'>
              <IconButton
                className='absolute right-1.5 top-1.5 z-10 rounded'
                intent='dangerSolid'
                shape='sqircle'
                padding='s'
                onClick={() => deleteAttachment(a)}
              >
                <TrashIcon className='h-4 w-4' />
              </IconButton>

              <Image src={a.src} h='200px' w='200px' />
            </div>
          ))}
        </div>
      )}
      <Input
        type='text'
        onKeyUp={handleInputKeyUp}
        onChange={handleInputChange}
        placeholder={
          permissions.createChannelMessage
            ? 'Write a message...'
            : 'You are not permitted to post in this channel'
        }
        value={content}
        disabled={!permissions.createChannelMessage}
        leftInputElement={
          <DefaultTooltip tootipText='Attach File'>
            <IconButton intent='unstyled' onClick={handleAttachButtonClick} padding='xs'>
              <ArrowUpOnSquareIcon className='h-6 w-6' />
            </IconButton>
          </DefaultTooltip>
        }
        rightInputElement={
          <Popover
            id='emoji-picker'
            side='top'
            align='end'
            sideOffset={16}
            alignOffset={-10}
            tooltipText='Emoji Picker'
            triggerElem={
              <IconButton padding='xs' intent='unstyled'>
                <FaceSmileIcon className='h-6 w-6' />
              </IconButton>
            }
          >
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          </Popover>
        }
      />
      <UploadWrapper id='message-attachment' />
    </MainContentFooterLayout>
  );
};
