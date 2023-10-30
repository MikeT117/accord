import { useCallback, useEffect } from 'react';
import { messageCreatorInputStore, useMessageCreatorInput } from '../stores/useMessageCreatorInput';

export const useMessageInput = (channelId: string) => {
  const input = useMessageCreatorInput(useCallback((s) => s.inputs[channelId], [channelId]));

  useEffect(() => {
    if (!input) {
      messageCreatorInputStore.initialise(channelId);
    }
  }, [input, channelId]);

  return input;
};
