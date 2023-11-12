import { lazy } from 'react';
import { ArrowUpOnSquareIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import { MainContentFooterLayout } from '@/shared-components/Layouts';
import { IconButton } from '@/shared-components/IconButton';
import { TrashIcon } from '@heroicons/react/24/solid';
import { Input } from '@/shared-components/Input';
import { Image } from '@/shared-components/Image';
import { DefaultTooltip } from '@/shared-components/DefaultTooltip';
import { Popover } from '@/shared-components/Popover';
import { useMessageCreator } from './hooks/useMessageCreator';
import { CREATE_CHANNEL_MESSAGE } from '../../constants';
import { Emoji } from '../../types';

const EmojiPicker = lazy(() => import('@/shared-components/EmojiPicker/Picker'));

export const MessageCreator = ({ permissions }: { permissions: number }) => {
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
    if ((permissions & (1 << CREATE_CHANNEL_MESSAGE)) !== 0) {
      onFileUploadClick();
    }
  };

  const handleEmojiSelect = (emoji: Emoji) => {
    if ((permissions & (1 << CREATE_CHANNEL_MESSAGE)) !== 0) {
      updateContent(`${content ?? ''}${emoji.native}`);
    }
  };

  const canCreateChannelMessages = (permissions & (1 << CREATE_CHANNEL_MESSAGE)) !== 0;

  return (
    <MainContentFooterLayout>
      {attachments?.length !== 0 && (
        <div className='mb-2 flex space-x-2 overflow-x-auto'>
          {attachments.map((a) => (
            <div key={a.id} className='relative flex items-center rounded bg-gray-3 p-3'>
              <IconButton
                className='absolute right-1.5 top-1.5 z-10 rounded'
                intent='dangerSolid'
                shape='sqircle'
                padding='s'
                onClick={() => deleteAttachment(a.id)}
              >
                <TrashIcon className='h-4 w-4' />
              </IconButton>

              <Image src={a.preview} h='200px' w='200px' />
            </div>
          ))}
        </div>
      )}
      <Input
        type='text'
        onKeyUp={handleInputKeyUp}
        onChange={handleInputChange}
        placeholder={
          canCreateChannelMessages
            ? 'Write a message...'
            : 'You are not permitted to post in this channel'
        }
        value={content}
        disabled={!canCreateChannelMessages}
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
