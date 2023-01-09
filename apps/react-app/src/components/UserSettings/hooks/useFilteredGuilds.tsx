import { useCallback, useMemo, useState } from 'react';
import { useGuildStore } from '@/shared-stores/guildStore';

export const useFilteredGuilds = () => {
  const [guildNameFilter, setGuildNameFilter] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const guilds = useGuildStore(useCallback((s) => s.ids.map((i) => s.guilds[i]!), []));

  const filteredGuilds = useMemo(
    () =>
      guildNameFilter
        ? guilds.filter((g) =>
            g.name.toLocaleLowerCase().includes(guildNameFilter.toLocaleLowerCase()),
          )
        : guilds,
    [guildNameFilter, guilds],
  );

  return { guilds: filteredGuilds, guildNameFilter, setGuildNameFilter };
};
