import { useCallback, useEffect, useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCreateChannelMessageMutation } from '@/api/message/createChannelMessage';
import { useCloudinary } from '@/shared-hooks';
import { toastStore } from '@/shared-components/Toast';
import { useMessageInput } from './useMessageInput';
import { messageCreatorInputStore } from '../stores/useMessageCreatorInput';

const { reset, update } = messageCreatorInputStore;

export const useMessageCreator = () => {
  const { channelId = '' } = useParams();
  const content = useMessageInput(channelId);

  const { UploadWrapper, attachments, deleteAttachments, deleteAttachment, onFileUploadClick } =
    useCloudinary();

  const { mutate, isSuccess, isError } = useCreateChannelMessageMutation();

  useLayoutEffect(() => {
    deleteAttachments(true);
  }, [channelId]);

  useEffect(() => {
    if (isSuccess) {
      reset(channelId);
      deleteAttachments();
    }
  }, [channelId, isSuccess, deleteAttachments]);

  useEffect(() => {
    if (isError) {
      toastStore.addToast({
        title: 'Could not send message',
        description: 'Message could not be sent, please try again later.',
        type: 'ERROR',
        duration: Infinity,
      });
    }
  }, [isError]);

  const updateContent = useCallback(
    (val: string) => {
      update(channelId, val);
    },
    [channelId],
  );

  const createMessage = useCallback(async () => {
    mutate({
      channelId,
      content,
      attachments,
    });
  }, [channelId, content, attachments, mutate]);

  return {
    content: content ?? '',
    attachments,
    UploadWrapper,
    createMessage,
    updateContent,
    deleteAttachments,
    deleteAttachment,
    onFileUploadClick,
  };
};
