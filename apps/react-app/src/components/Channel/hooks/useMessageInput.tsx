import { useCallback, useEffect } from 'react';
import {
  messageCreatorInputActions,
  useMessageCreatorInput,
} from '../stores/useMessageCreatorInput';

export const useMessageInput = (channelId: string) => {
  const input = useMessageCreatorInput(useCallback((s) => s.inputs[channelId], [channelId]));

  useEffect(() => {
    if (!input) {
      messageCreatorInputActions.initialise(channelId);
    }
  }, [input, channelId]);

  return input;
};
