import { MicrophoneIcon, PhoneXMarkIcon } from '@heroicons/react/24/solid';
import { DefaultTooltip } from '@/shared-components/DefaultTooltip';
import { IconButton } from '@/shared-components/IconButton';
import { useCurrentUserVoiceState } from './hooks/useCurrentUserVoiceState';
import { useAccordVoice } from './hooks/useAccordVoice';

export const ActiveVoiceChannel = () => {
  const currentUserVoiceState = useCurrentUserVoiceState();
  const { leaveVoiceChannel, pauseResumeProducer } = useAccordVoice();
  if (!currentUserVoiceState) {
    return null;
  }

  const {
    guild,
    channel,
    voiceState: { selfMute },
  } = currentUserVoiceState;

  return (
    <div className='mt-auto flex flex-col rounded bg-gray-3 px-3 py-2'>
      <span className='mb-1 text-center text-xs font-bold text-gray-12'>Voice Connected</span>
      <div className='flex items-center justify-between'>
        <DefaultTooltip tootipText={selfMute ? 'Unmute' : 'Mute'}>
          <IconButton padding='m' intent='dangerSolid' onClick={pauseResumeProducer}>
            <MicrophoneIcon className='h-4 w-4' />
          </IconButton>
        </DefaultTooltip>
        <span className='mt-2 overflow-hidden text-ellipsis text-center text-xs font-semibold text-gray-11'>{`${guild.name} / ${channel.name}`}</span>
        <DefaultTooltip tootipText='Disconnect'>
          <IconButton intent='dangerSolid' padding='m' onClick={leaveVoiceChannel}>
            <PhoneXMarkIcon className='h-4 w-4' />
          </IconButton>
        </DefaultTooltip>
      </div>
    </div>
  );
};
