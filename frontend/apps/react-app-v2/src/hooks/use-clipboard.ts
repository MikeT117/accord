import { useState } from "react";

const CLIPBOARD_STATUS = {
    FAILURE: -1,
    IDLE: 0,
    SUCCESS: 2,
} as const;

export function useClipboard() {
    const [state, set] = useState(0);

    function onCopy(input: string) {
        if (!input) return;

        set(CLIPBOARD_STATUS.IDLE);
        navigator.clipboard.writeText(input).then(
            () => set(CLIPBOARD_STATUS.SUCCESS),
            () => set(CLIPBOARD_STATUS.FAILURE)
        );
    }

    return {
        onCopy,
        isError: state === CLIPBOARD_STATUS.FAILURE,
        isSuccess: state === CLIPBOARD_STATUS.SUCCESS,
        isIdle: state === CLIPBOARD_STATUS.IDLE,
    };
}
