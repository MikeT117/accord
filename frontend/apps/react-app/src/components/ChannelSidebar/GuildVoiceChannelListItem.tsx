import { ListItem } from '@/shared-components/ListItem';
import { GuildChannelContextMenu } from './GuildChannelContextMenu';
import { Avatar } from '@/shared-components/Avatar';
import { MicrophoneIcon, SpeakerXMarkIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { VoiceChannelMemberContextMenu } from './VoiceChannelMemberContextMenu';
import { useVoiceChannelStates } from './hooks/useVoiceChannelStates';
import { useDrag } from 'react-dnd';
import { useAccordVoice } from '../AccordVoice';

export const GuildVoiceChannelListItem = ({
  voiceChannel,
  onDelete,
  onSettings,
}: {
  voiceChannel: GuildVoiceChannel;
  onDelete: () => void;
  onSettings: () => void;
}) => {
  const { currentUserId, AccordAudio, joinVoiceChannel, pauseResumeConsumer, pauseResumeProducer } =
    useAccordVoice();
  const voiceChannelStates = useVoiceChannelStates(voiceChannel.id);

  const [_, dragRef] = useDrag(
    () => ({
      type: 'GUILD_CHANNEL',
      item: voiceChannel,
    }),
    [],
  );

  const handleVoiceChannelClick = () => {
    joinVoiceChannel(voiceChannel.guildId, voiceChannel.id);
  };

  const handleMute = (id: string) => {
    currentUserId === id ? pauseResumeProducer() : pauseResumeConsumer(id);
  };

  return (
    <GuildChannelContextMenu
      id={voiceChannel.id}
      type={voiceChannel.channelType}
      onDelete={onDelete}
      onSettings={onSettings}
    >
      <ListItem
        ref={dragRef}
        onClick={handleVoiceChannelClick}
        intent='secondary'
        baseBg={false}
        isActionable
      >
        <SpeakerWaveIcon className='h-5 w-5 stroke-2' />
        <span className='ml-1 text-sm'>{voiceChannel.name}</span>
      </ListItem>
      <ul className='mt-0.5 flex flex-col space-y-1 pl-8'>
        {voiceChannelStates?.map((vcs) => (
          <VoiceChannelMemberContextMenu
            key={vcs.userAccountId}
            voiceChannelState={vcs}
            onMute={() => handleMute(vcs.userAccountId)}
          >
            <ListItem intent={vcs.mute || vcs.selfMute ? 'danger' : 'secondary'}>
              <Avatar
                size='xs'
                src={vcs.member.user.avatar}
                fallback={vcs.member.nickname ?? vcs.member.user.displayName}
              />
              <span className='ml-2 mr-auto select-none text-sm font-medium'>
                {vcs.member.nickname ?? vcs.member.user.displayName}
              </span>
              {vcs.mute && <SpeakerXMarkIcon className='h-5 w-5 stroke-2 text-red-11' />}
              {vcs.selfMute && <MicrophoneIcon className='h-5 w-5 stroke-2 text-red-11' />}
            </ListItem>
          </VoiceChannelMemberContextMenu>
        ))}
        <AccordAudio />
      </ul>
    </GuildChannelContextMenu>
  );
};
