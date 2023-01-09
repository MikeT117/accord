import { ReactNode } from 'react';
import type { ChannelMessage } from '@accord/common';
import { Avatar } from '@/shared-components/Avatar';
import { MessageInvite } from './MessageInvite';
import { Image } from '@/shared-components/Image';
import { MessageContent } from './MessageContent';
import { useExtractInvite } from './hooks/useExtractInvite';
import { TimeAgo } from '@/shared-components/TimeAgo';

export const Message = ({ message, editor }: { message: ChannelMessage; editor?: ReactNode }) => {
  const { attachments, content, author, createdAt, member } = message;
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
        <span className='mr-2 whitespace-nowrap text-sm font-semibold text-gray-12 '>
          {member?.nickname ?? author.displayName}
        </span>
        <TimeAgo
          className='whitespace-nowrap align-bottom text-xs font-medium text-gray-11'
          date={createdAt}
        />
      </div>
      <div className='[grid-area:message-content]'>
        {editor ? editor : <MessageContent content={content} />}
        {inviteId && <MessageInvite inviteId={inviteId} />}
        {Array.isArray(attachments) && attachments.length !== 0 && (
          <div className='mt-2 flex flex-wrap space-x-2'>
            {attachments.map((a) => (
              <Image key={a} src={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
