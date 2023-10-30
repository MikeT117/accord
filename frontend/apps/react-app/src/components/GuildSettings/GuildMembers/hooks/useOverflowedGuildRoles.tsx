import { GuildRole } from '@accord/common';
import { useState, useRef, useLayoutEffect } from 'react';

export const useOverflowedGuildRoles = (guildRoles: GuildRole[]) => {
  const [overflowed, set] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const { current } = ref;
    if (!current) {
      return;
    }
    if (current.scrollWidth > current.clientWidth) {
      set((s) => [...s, guildRoles[overflowed.length].id]);
    }
  }, [guildRoles, overflowed]);

  return { overflowed, overflowedCount: overflowed.length, ref };
};
