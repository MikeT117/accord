import { At, Hash } from '@phosphor-icons/react';
import { MainContentHeaderLayout } from '../../shared-components/Layouts';
import { GuildChannel, PrivateChannel } from '../../types';
import { MessageCreator } from './MessageCreator';
import { MessagesList } from './MessagesList';
import { PinnedMessagesPopover, PinnedMessagesPopoverContent } from './PinnedMessages';

export const TextChannel = ({
    channel,
    permissions,
}: {
    channel: GuildChannel | PrivateChannel;
    permissions: number;
}) => {
    return (
        <>
            <MainContentHeaderLayout>
                <div className='flex items-center space-x-1 text-gray-12'>
                    {channel.channelType !== 0 ? <At size={26} /> : <Hash size={26} />}
                    <span className='text-lg font-medium'>{channel.name}</span>
                </div>
                <div className='ml-auto flex items-center space-x-2'>
                    <PinnedMessagesPopover align='end' side='bottom' sideOffset={6}>
                        <PinnedMessagesPopoverContent
                            channelId={channel.id}
                            permissions={permissions}
                        />
                    </PinnedMessagesPopover>
                </div>
            </MainContentHeaderLayout>
            <MessagesList channelId={channel.id} permissions={permissions} />
            <MessageCreator channelId={channel.id} permissions={permissions} />
        </>
    );
};
