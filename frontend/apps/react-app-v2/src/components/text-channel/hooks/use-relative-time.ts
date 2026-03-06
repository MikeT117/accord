import { formatDistanceToNow } from "date-fns";
import { useEffect, useRef, useState } from "react";

const MINUTE = 60000;

export function useRelativeTime(timestamp: Date) {
    const [lastComputedValue, setLastComputedValue] = useState(() =>
        formatDistanceToNow(timestamp, { addSuffix: true }),
    );
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            const newComputedValue = formatDistanceToNow(timestamp, { addSuffix: true });
            setLastComputedValue(newComputedValue);
        }, MINUTE);

        return () => {
            if (!intervalRef.current) {
                return;
            }

            clearInterval(intervalRef.current);
        };
    }, [timestamp]);

    return lastComputedValue;
}
