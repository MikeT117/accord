import { useCallback } from 'react';
import { useJoinDiscoverableGuildMutation } from '@/api/member/joinDiscoverableGuild';
import { LoadingSpinner } from '@/shared-components/LoadingSpinner';
import { GuildBrowserListItem } from './GuildBrowserListItem';
import { useFilterableDiscoverableGuilds } from './hooks/useDiscoverableGuilds';
import { useGuildCategoryFilter } from './stores/useGuildCategoryFilter';

export const DiscoverableGuildsList = () => {
  const { query, isLoading, discoverableGuilds } = useFilterableDiscoverableGuilds();
  const guildCategoryIdFilter = useGuildCategoryFilter(useCallback((s) => s.guildCategoryId, []));
  const { mutate: joinGuild } = useJoinDiscoverableGuildMutation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const categoryFilteredGuilds = guildCategoryIdFilter
    ? discoverableGuilds.filter((g) => g.guildCategoryId === guildCategoryIdFilter)
    : discoverableGuilds;

  return (
    <div className='flex w-full max-w-[1064px] flex-col'>
      {query ? (
        <h1 className='mb-3 text-xl font-semibold'>Query: {query}</h1>
      ) : (
        <h1 className='mb-3 text-xl font-semibold'>Popular Communities</h1>
      )}
      <ul className='mt-3 flex max-w-[1064px] flex-wrap space-x-4'>
        {categoryFilteredGuilds.map((g) => (
          <GuildBrowserListItem key={g.id} guild={g} onJoinGuild={() => joinGuild({ id: g.id })} />
        ))}
      </ul>
    </div>
  );
};
