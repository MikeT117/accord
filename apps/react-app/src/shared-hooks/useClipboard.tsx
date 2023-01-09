import { useCallback, useState } from 'react';

const IDLE = 'IDLE';
const ERROR = 'ERROR';
const SUCCESS = 'SUCCESS';

type UseClipboardState = typeof IDLE | typeof ERROR | typeof SUCCESS;

export const useClipboard = () => {
  const [state, set] = useState<UseClipboardState>(IDLE);
  const isError = state === ERROR;
  const isSuccess = state === SUCCESS;
  const isIdle = state === IDLE;

  const onCopy = useCallback((input: string) => {
    if (input) {
      set(IDLE);
      navigator.clipboard.writeText(input).then(
        () => {
          set(SUCCESS);
        },
        () => {
          set(ERROR);
        },
      );
    }
  }, []);

  return { onCopy, state, isError, isSuccess, isIdle };
};
