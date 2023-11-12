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
            ...s.voiceStates.filter((vs) => vs.member.user.id !== voiceState.member.user.id),
            voiceState,
          ],
        })),
      delete: (channelId: string, userId: string) =>
        set((s) => ({
          voiceStates: s.voiceStates.filter(
            (vs) => vs.channelId === channelId && vs.member.user.id !== userId,
          ),
        })),
      selfMute: (channelId: string, userId: string, selfMute: boolean) => {
        return set((s) => ({
          voiceStates: s.voiceStates.map((vs) =>
            vs.channelId === channelId && vs.member.user.id === userId ? { ...vs, selfMute } : vs,
          ),
        }));
      },
      selfDeaf: (channelId: string, userId: string, selfDeaf: boolean) =>
        set((s) => ({
          voiceStates: s.voiceStates.map((vs) =>
            vs.channelId === channelId && vs.member.user.id === userId ? { ...vs, selfDeaf } : vs,
          ),
        })),
      mute: (channelId: string, userId: string, mute: boolean) => {
        return set((s) => ({
          voiceStates: s.voiceStates.map((vs) =>
            vs.channelId === channelId && vs.member.user.id === userId ? { ...vs, mute } : vs,
          ),
        }));
      },
    }),
  ),
);

export const voiceStateStore = useVoiceStateStore.getState();
