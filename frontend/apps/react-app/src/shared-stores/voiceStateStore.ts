import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { VoiceChannelState } from '../types';

export const useVoiceStateStore = create(
    combine(
        {
            voiceStates: [] as VoiceChannelState[],
        },
        (set) => ({
            initialise: (voiceStates: VoiceChannelState[]) => set({ voiceStates }),
            create: (voiceState: VoiceChannelState) =>
                set((s) => ({
                    voiceStates: [
                        ...s.voiceStates.filter((vs) => vs.user.id !== voiceState.user.id),
                        voiceState,
                    ],
                })),
            delete: (channelId: string, userId: string) =>
                set((s) => ({
                    voiceStates: s.voiceStates.filter(
                        (vs) => vs.channelId === channelId && vs.user.id !== userId,
                    ),
                })),
            update: (
                voiceState: Pick<
                    VoiceChannelState,
                    'channelId' | 'guildId' | 'mute' | 'selfDeaf' | 'selfMute'
                > & { userId: string },
            ) =>
                set((s) => ({
                    voiceStates: s.voiceStates.map((vc) => {
                        if (
                            vc.channelId !== voiceState.channelId ||
                            vc.user.id !== voiceState.userId
                        ) {
                            return vc;
                        }

                        return { ...vc, ...voiceState };
                    }),
                })),
        }),
    ),
);

export const voiceStateStore = useVoiceStateStore.getState();
