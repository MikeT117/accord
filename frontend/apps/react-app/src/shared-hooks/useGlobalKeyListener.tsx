import { useEffect } from 'react';

export type GlobalKeyListenerParams = {
  key: KeyboardEvent['key'];
  isDisabled?: boolean;
  onKeyPress: () => void;
};

export const useGlobalKeyListener = ({
  key,
  isDisabled = false,
  onKeyPress,
}: GlobalKeyListenerParams) => {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === key) onKeyPress();
    };
    if (!isDisabled) {
      document.addEventListener('keyup', listener);
    }
    return () => document.removeEventListener('keyup', listener);
  }, [isDisabled, onKeyPress, key]);
};
