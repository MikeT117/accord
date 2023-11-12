import { useParams } from 'react-router-dom';
import { useCreateChannelMessageMutation } from '@/api/channelMessages/createChannelMessage';
import { useCloudinary } from '@/shared-hooks';
import { toastStore } from '@/shared-components/Toast';
import { useMessageInput } from './useMessageInput';
import { messageCreatorInputStore } from '../stores/useMessageCreatorInput';

const { reset, update } = messageCreatorInputStore;

export const useMessageCreator = () => {
  const { channelId = '' } = useParams();
  const content = useMessageInput(channelId);

  const { UploadWrapper, attachments, clearAttachments, deleteAttachment, onFileUploadClick } =
    useCloudinary();

  const { mutate } = useCreateChannelMessageMutation();

  const updateContent = (val: string) => {
    update(channelId, val);
  };

  const createMessage = () => {
    mutate(
      { channelId, content, attachments: attachments.map((a) => a.id) },
      {
        onSuccess() {
          reset(channelId);
          clearAttachments();
        },
        onError(error, variables, context) {
          console.log({ error, variables, context });
          toastStore.addToast({
            title: 'Could not send message',
            description: 'Message could not be sent, please try again later.',
            type: 'ERROR',
            duration: Infinity,
          });
        },
      },
    );
  };

  return {
    content: content ?? '',
    attachments,
    UploadWrapper,
    createMessage,
    updateContent,
    clearAttachments,
    deleteAttachment,
    onFileUploadClick,
  };
};
