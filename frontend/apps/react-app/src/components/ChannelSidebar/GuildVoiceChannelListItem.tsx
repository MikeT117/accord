import { ListItem } from '@/shared-components/ListItem';
import { GuildChannelContextMenu } from './GuildChannelContextMenu';
import { Avatar } from '@/shared-components/Avatar';
import { VoiceChannelMemberContextMenu } from './VoiceChannelMemberContextMenu';
import { useVoiceChannelStates } from './hooks/useVoiceChannelStates';
import { useDrag } from 'react-dnd';
import { useAccordVoice } from '../AccordVoice';
import { GuildChannel } from '../../types';
import { useCurrentUserId } from '../../shared-stores/currentUserStore';
import { MicrophoneSlash, SpeakerSimpleHigh, SpeakerSimpleSlash } from '@phosphor-icons/react';

export const GuildVoiceChannelListItem = ({
    channel,
    onDelete,
    onSettings,
}: {
    channel: GuildChannel;
    onDelete: () => void;
    onSettings: () => void;
}) => {
    const userId = useCurrentUserId();
    const { AccordAudio, joinVoiceChannel, mute, selfMute } = useAccordVoice(userId);
    const voiceChannelStates = useVoiceChannelStates(channel.id);

    const [_, dragRef] = useDrag(
        () => ({
            type: 'GUILD_CHANNEL',
            item: channel,
        }),
        [],
    );

    const handleVoiceChannelClick = () => {
        joinVoiceChannel(channel.id, channel.guildId);
    };

    const handleMute = (id: string) => {
        userId === id ? selfMute() : mute(id);
    };

    return (
        <GuildChannelContextMenu
            id={channel.id}
            channelType={channel.channelType}
            onDelete={onDelete}
            onSettings={onSettings}
        >
            <ListItem
                ref={dragRef}
                onClick={handleVoiceChannelClick}
                intent='secondary'
                className='space-x-1.5'
                baseBg={false}
                isActionable
            >
                <SpeakerSimpleHigh size={20} />
                <span className='ml-1 text-sm'>{channel.name}</span>
            </ListItem>
            <ul className='mt-0.5 flex flex-col space-y-1 pl-8'>
                {voiceChannelStates?.map((vcs) => (
                    <VoiceChannelMemberContextMenu
                        key={vcs.user.id}
                        voiceChannelState={vcs}
                        onMute={() => handleMute(vcs.user.id)}
                    >
                        <ListItem intent={vcs.mute || vcs.selfMute ? 'danger' : 'secondary'}>
                            <Avatar
                                size='xs'
                                src={vcs.user.avatar}
                                fallback={vcs.user.displayName}
                            />
                            <span className='ml-2 mr-auto select-none text-sm font-medium'>
                                {vcs.user.displayName}
                            </span>
                            {vcs.mute && <SpeakerSimpleSlash size={20} className='text-red-11' />}
                            {vcs.selfMute && <MicrophoneSlash size={20} className='text-red-11' />}
                        </ListItem>
                    </VoiceChannelMemberContextMenu>
                ))}
                <AccordAudio />
            </ul>
        </GuildChannelContextMenu>
    );
};
