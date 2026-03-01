import { useState } from "react";
import { toast } from "sonner";

const CLIPBOARD_STATUS = {
    FAILURE: -1,
    IDLE: 0,
    SUCCESS: 2,
} as const;

export function useClipboard() {
    const [status, setStatus] = useState(0);

    async function onCopy(input: string) {
        if (!input) {
            return;
        }

        setStatus(CLIPBOARD_STATUS.IDLE);

        try {
            await navigator.clipboard.writeText(input);
            setStatus(CLIPBOARD_STATUS.SUCCESS);
            toast.success("Text copied to clipboard.");
        } catch (e) {
            setStatus(CLIPBOARD_STATUS.FAILURE);
            if (e instanceof DOMException && e.name === "NotAllowedError") {
                toast.error("You must allow clipboard access to do that.");
                return;
            }
            toast.error("Unable to copy text to clipboard.");
        } finally {
            setTimeout(() => {
                setStatus(CLIPBOARD_STATUS.IDLE);
            }, 2000);
        }
    }

    return {
        onCopy,
        isError: status === CLIPBOARD_STATUS.FAILURE,
        isSuccess: status === CLIPBOARD_STATUS.SUCCESS,
        isIdle: status === CLIPBOARD_STATUS.IDLE,
    };
}
