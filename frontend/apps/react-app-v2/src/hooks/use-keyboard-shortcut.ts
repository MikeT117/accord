import { useEffect, useRef } from "react";

type KeyboardShortcutHookArgs = {
    key: string;
    handler: EventListener;
    enabled?: boolean;
    modifier?: keyof KeyboardEvent;
};

export function useKeyboardShortcut({ enabled = true, handler, key, modifier }: KeyboardShortcutHookArgs) {
    const handlerRef = useRef<EventListener>(null);

    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        function keyUpHandler(event: KeyboardEvent) {
            if (((modifier && event[modifier]) || !modifier) && event.key === key) {
                handlerRef.current?.(event);
            }
        }

        window.addEventListener("keyup", keyUpHandler);
        return () => window.removeEventListener("keyup", keyUpHandler);
    }, [key, modifier, enabled]);
}
