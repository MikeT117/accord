import { useDrag } from 'react-dnd';
import { ListItem } from '@/shared-components/ListItem';
import { GuildChannelContextMenu } from './GuildChannelContextMenu';
import { GuildChannel } from '../../types';
import { Hash } from '@phosphor-icons/react';

export const GuildTextChannelListItem = ({
    channel,
    isActive,
    onClick,
    onDelete,
    onSettings,
}: {
    channel: GuildChannel;
    isActive: boolean;
    onClick: () => void;
    onDelete: () => void;
    onSettings: () => void;
}) => {
    const [_, dragRef] = useDrag(
        () => ({
            type: 'GUILD_CHANNEL',
            item: channel,
        }),
        [],
    );

    return (
        <GuildChannelContextMenu
            id={channel.id}
            channelType={channel.channelType}
            onDelete={onDelete}
            onSettings={onSettings}
        >
            <ListItem
                ref={dragRef}
                isActive={isActive}
                onClick={onClick}
                intent='secondary'
                className='space-x-1.5'
                baseBg={false}
                isActionable
            >
                <Hash size={20} />
                <span>{channel.name}</span>
            </ListItem>
        </GuildChannelContextMenu>
    );
};
