import type { VoiceChannelState } from '@accord/common';
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

export const useVoiceStateStore = create(
  combine(
    {
      voiceStates: [] as VoiceChannelState[],
    },
    (set) => ({
      initialise: (voiceStates: VoiceChannelState[]) => set({ voiceStates }),
      addVoiceState: (voiceState: VoiceChannelState) =>
        set((s) => ({
          voiceStates: [
            ...s.voiceStates.filter((vs) => vs.userAccountId !== voiceState.userAccountId),
            voiceState,
          ],
        })),
      updateVoiceState: ({
        channelId,
        userAccountId,
        ...rest
      }: Pick<VoiceChannelState, 'channelId' | 'userAccountId'> &
        Partial<Omit<VoiceChannelState, 'channelId' | 'userAccountId'>>) => {
        return set((s) => ({
          voiceStates: s.voiceStates.map((vs) =>
            vs.channelId === channelId && vs.userAccountId === userAccountId
              ? { ...vs, ...rest }
              : vs,
          ),
        }));
      },
      delVoiceState: (channelId: string, userAccountId: string) =>
        set((s) => ({
          voiceStates: s.voiceStates.filter(
            (vs) => vs.channelId === channelId && vs.userAccountId !== userAccountId,
          ),
        })),
      setSelfMute: (channelId: string, userAccountId: string, selfMute: boolean) => {
        return set((s) => ({
          voiceStates: s.voiceStates.map((vs) =>
            vs.channelId === channelId && vs.userAccountId === userAccountId
              ? { ...vs, selfMute }
              : vs,
          ),
        }));
      },
      setSelfDeaf: (channelId: string, userAccountId: string, selfDeaf: boolean) =>
        set((s) => ({
          voiceStates: s.voiceStates.map((vs) =>
            vs.channelId === channelId && vs.userAccountId === userAccountId
              ? { ...vs, selfDeaf }
              : vs,
          ),
        })),
      setMute: (channelId: string, userAccountId: string, mute: boolean) => {
        return set((s) => ({
          voiceStates: s.voiceStates.map((vs) =>
            vs.channelId === channelId && vs.userAccountId === userAccountId ? { ...vs, mute } : vs,
          ),
        }));
      },
    }),
  ),
);

export const voiceStateStore = useVoiceStateStore.getState();
