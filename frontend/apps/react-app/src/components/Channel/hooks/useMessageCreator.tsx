import { useCreateChannelMessageMutation } from '@/api/channelMessages/createChannelMessage';
import { useCloudinary } from '@/shared-hooks';
import { useMessageDrafts } from './useMessageDrafts';
import { messageDraftsStore } from '../stores/messageDraftsStore';

const { reset, update } = messageDraftsStore;

export const useMessageCreator = (channelId: string) => {
    const content = useMessageDrafts(channelId);

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
            },
        );
    };

    return {
        content,
        attachments,
        UploadWrapper,
        createMessage,
        updateContent,
        clearAttachments,
        deleteAttachment,
        onFileUploadClick,
    };
};
