import { useState, useRef, useLayoutEffect } from 'react';

export const useOverflowedGuildRoles = () => {
    const [overflowed, set] = useState(0);
    const ref = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        if (!ref.current) {
            return;
        }

        if (ref.current.scrollWidth > ref.current.clientWidth) {
            set((s) => (s += 1));
        }
    }, []);

    return { overflowed, ref };
};
