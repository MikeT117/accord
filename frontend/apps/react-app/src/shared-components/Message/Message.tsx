import { ReactNode } from 'react';
import { Avatar } from '@/shared-components/Avatar';
import { MessageInvite } from './MessageInvite';
import { MessageContent } from './MessageContent';
import { useExtractInvite } from './hooks/useExtractInvite';
import { TimeAgo } from '@/shared-components/TimeAgo';
import { ChannelMessage } from '../../types';
import { UserProfileDialog } from '../UserProfileDialog/UserProfileDialog';
import { MessageAttachments } from './MessageAttachments';

export const Message = ({
    attachments,
    content,
    author,
    createdAt,
    isMessageEditorOpen,
    messageEditor,
}: {
    messageEditor?: ReactNode;
    isMessageEditorOpen?: boolean;
} & Pick<ChannelMessage, 'attachments' | 'content' | 'author' | 'createdAt'>) => {
    const inviteId = useExtractInvite(content);
    return (
        <div
            className={String.raw`grid w-full grid-cols-[min-content_min-content_1fr] grid-rows-[min-content_min-content] items-center gap-y-2 [grid-template-areas:"message-user-avatar_message-username_message-timestamp""message-user-avatar_message-content_message-content""message-user-avatar_message-content_message-content"]`}
        >
            <Avatar
                size='lg'
                className='mr-4 self-start [grid-area:message-user-avatar]'
                src={author.avatar}
            />
            <div className='flex items-baseline [grid-area:message-username/message-timestamp]'>
                <UserProfileDialog userId={author.id}>
                    <span className='mr-2 whitespace-nowrap text-sm font-semibold text-gray-12 '>
                        {author.displayName}
                    </span>
                </UserProfileDialog>
                <TimeAgo
                    className='whitespace-nowrap align-bottom text-xs font-medium text-gray-11'
                    date={createdAt}
                />
            </div>
            <div className='[grid-area:message-content]'>
                {isMessageEditorOpen ? messageEditor : <MessageContent content={content} />}
                {inviteId && <MessageInvite inviteId={inviteId} />}
                {attachments.length !== 0 && <MessageAttachments attachmentIds={attachments} />}
            </div>
        </div>
    );
};
