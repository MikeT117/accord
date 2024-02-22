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
        if (isDisabled) {
            return;
        }

        const listener = (e: KeyboardEvent) => {
            if (e.key !== key) {
                return;
            }

            onKeyPress();
        };

        document.addEventListener('keyup', listener);

        return () => document.removeEventListener('keyup', listener);
    }, [isDisabled, key, onKeyPress]);
};
