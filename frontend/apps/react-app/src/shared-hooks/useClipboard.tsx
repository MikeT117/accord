import { useState } from 'react';

const FAILURE = -1;
const IDLE = 0;
const SUCCESS = 1;

export const useClipboard = () => {
    const [state, set] = useState(0);

    const onCopy = (input: string) => {
        if (!input) {
            return;
        }

        set(IDLE);

        navigator.clipboard.writeText(input).then(
            () => set(SUCCESS),
            () => set(FAILURE),
        );
    };

    return {
        onCopy,
        isError: state === FAILURE,
        isSuccess: state === SUCCESS,
        isIdle: state === IDLE,
    };
};
