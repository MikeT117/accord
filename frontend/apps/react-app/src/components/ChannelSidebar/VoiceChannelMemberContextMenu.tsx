import { ReactNode } from 'react';
import type { VoiceChannelState } from '@accord/common';
import { SpeakerXMarkIcon, SpeakerWaveIcon } from '@heroicons/react/20/solid';
import { ContextMenu, ContextMenuItem } from '@/shared-components/ContextMenu';

export const VoiceChannelMemberContextMenu = ({
  voiceChannelState,
  children,
  onMute,
}: {
  onMute: () => void;
  children: ReactNode;
  voiceChannelState: VoiceChannelState;
}) => {
  const isMuted = voiceChannelState.mute || voiceChannelState.selfMute;
  return (
    <>
      <ContextMenu tiggerElem={children} className='min-w-[190px]'>
        <ContextMenuItem onClick={onMute} fullWidth intent={isMuted ? 'primary' : 'danger'}>
          <span className='mr-2 text-sm'>{isMuted ? 'Unmute' : 'Mute'}</span>
          {isMuted ? (
            <SpeakerWaveIcon className='ml-auto h-5 w-5' />
          ) : (
            <SpeakerXMarkIcon className='ml-auto h-5 w-5' />
          )}
        </ContextMenuItem>
      </ContextMenu>
    </>
  );
};
