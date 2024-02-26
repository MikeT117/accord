import { ReactNode } from 'react';
import { ContextMenu, ContextMenuItem } from '@/shared-components/ContextMenu';
import { VoiceChannelState } from '../../types';
import { SpeakerSimpleHigh } from '@phosphor-icons/react';
import { useI18nContext } from '../../i18n/i18n-react';

export const VoiceChannelMemberContextMenu = ({
    voiceChannelState,
    children,
    onMute,
}: {
    onMute: () => void;
    children: ReactNode;
    voiceChannelState: VoiceChannelState;
}) => {
    const { LL } = useI18nContext();
    const isMuted = voiceChannelState.mute || voiceChannelState.selfMute;
    return (
        <>
            <ContextMenu tiggerElem={children} className='min-w-[190px]'>
                <ContextMenuItem onClick={onMute} fullWidth intent={isMuted ? 'primary' : 'danger'}>
                    <span className='mr-2 text-sm'>
                        {isMuted ? LL.Actions.Unmute() : LL.Actions.Mute()}
                    </span>
                    {isMuted ? (
                        <SpeakerSimpleHigh size={20} className='ml-auto' />
                    ) : (
                        <SpeakerSimpleHigh size={20} className='ml-auto' />
                    )}
                </ContextMenuItem>
            </ContextMenu>
        </>
    );
};
