import { IconButton } from '@/shared-components/IconButton';
import { useCurrentUserVoiceState } from './hooks/useCurrentUserVoiceState';
import { useAccordVoice } from './hooks/useAccordVoice';
import { useCurrentUserId } from '../../shared-stores/currentUserStore';
import { MicrophoneSlash, Microphone, PhoneDisconnect } from '@phosphor-icons/react';
import { useI18nContext } from '../../i18n/i18n-react';

export const ActiveVoiceChannel = () => {
    const { LL } = useI18nContext();
    const userId = useCurrentUserId();
    const currentUserVoiceState = useCurrentUserVoiceState(userId);
    const { leaveVoiceChannel, selfMute } = useAccordVoice(userId);

    if (!currentUserVoiceState) {
        return null;
    }

    const { guild, channel, voiceState } = currentUserVoiceState;

    return (
        <div className='mt-auto flex flex-col rounded-md bg-gray-3 px-3 py-2'>
            <span className='mb-1 text-center text-xs font-bold text-gray-12'>
                {LL.General.VoiceConnected()}
            </span>
            <div className='flex items-center justify-between'>
                <IconButton
                    padding='m'
                    intent='danger'
                    onClick={() => selfMute()}
                    tooltipText={voiceState.selfMute ? 'Unmute' : 'Mute'}
                >
                    {voiceState.selfMute ? <MicrophoneSlash size={16} /> : <Microphone size={16} />}
                </IconButton>

                <span className='mt-2 overflow-hidden text-ellipsis text-center text-xs font-medium text-gray-11'>{`${guild.name} / ${channel.name}`}</span>
                <IconButton
                    intent='danger'
                    padding='m'
                    onClick={leaveVoiceChannel}
                    tooltipText={LL.Actions.Disconnect()}
                >
                    <PhoneDisconnect size={16} />
                </IconButton>
            </div>
        </div>
    );
};
