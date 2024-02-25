import { MainContentFooterLayout } from '@/shared-components/Layouts';
import { IconButton } from '@/shared-components/IconButton';
import { Input } from '@/shared-components/Input';
import { Image } from '@/shared-components/Image';
import { Popover } from '@/shared-components/Popover';
import { useMessageCreator } from './hooks/useMessageCreator';
import { CREATE_CHANNEL_MESSAGE } from '../../constants';
import { Emoji } from '../../types';
import { Smiley, Trash, UploadSimple } from '@phosphor-icons/react';
import { EmojiPicker } from '../../shared-components/EmojiPicker/EmojiPicker';
import { useI18nContext } from '../../i18n/i18n-react';

export const MessageCreator = ({
    channelId,
    permissions,
}: {
    channelId: string;
    permissions: number;
}) => {
    const { LL } = useI18nContext();

    const {
        content,
        attachments,
        UploadWrapper,
        updateContent,
        createMessage,
        deleteAttachment,
        onFileUploadClick,
    } = useMessageCreator(channelId);

    const handleInputKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
                        <div
                            key={a.id}
                            className='relative flex items-center rounded-md bg-gray-1 p-3'
                        >
                            <IconButton
                                className='absolute right-1.5 top-1.5 z-10 rounded-md'
                                intent='dangerSolid'
                                shape='squircle'
                                padding='s'
                                onClick={() => deleteAttachment(a.id)}
                            >
                                <Trash size={16} />
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
                        ? LL.Inputs.Placeholders.GrantedWriteMessage()
                        : LL.Inputs.Placeholders.DeniedWriteMessage()
                }
                value={content}
                disabled={!canCreateChannelMessages}
                leftInputElement={
                    <IconButton
                        intent='unstyled'
                        onClick={handleAttachButtonClick}
                        padding='xs'
                        tooltipText={LL.Actions.AttachFile()}
                    >
                        <UploadSimple size={24} />
                    </IconButton>
                }
                rightInputElement={
                    <Popover
                        id='emoji-picker'
                        side='top'
                        align='end'
                        sideOffset={16}
                        alignOffset={-10}
                        tooltipText={LL.Actions.OpenEmojiSelector()}
                        triggerElem={
                            <IconButton padding='xs' intent='unstyled'>
                                <Smiley size={24} />
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
