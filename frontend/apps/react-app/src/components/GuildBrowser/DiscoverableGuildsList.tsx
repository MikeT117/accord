import { useCallback } from 'react';
import { LoadingSpinner } from '@/shared-components/LoadingSpinner';
import { GuildBrowserListItem } from './GuildBrowserListItem';
import { useFilterableDiscoverableGuilds } from './hooks/useDiscoverableGuilds';
import { useGuildCategoryFilter } from './stores/useGuildCategoryFilter';
import { useCreateGuildMemberMutation } from '../../api/guildMembers/createGuildMember';

export const DiscoverableGuildsList = () => {
  const { data, query, isLoading, fetchNextPage } = useFilterableDiscoverableGuilds();
  const guildCategoryId = useGuildCategoryFilter(useCallback((s) => s.guildCategoryId, []));
  const { mutate: joinGuild } = useCreateGuildMemberMutation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const guilds = guildCategoryId
    ? data?.pages.map((p) => p.filter((g) => g.guildCategoryId === guildCategoryId))
    : data?.pages;

  return (
    <div className='flex w-full max-w-[1064px] flex-col'>
      {query ? (
        <h1 className='mb-3 text-xl font-semibold'>Query: {query}</h1>
      ) : (
        <h1 className='mb-3 text-xl font-semibold'>Popular Communities</h1>
      )}
      <ul className='mt-3 flex max-w-[1064px] flex-wrap space-x-4'>
        {guilds?.map((p) =>
          p.map((g) => (
            <GuildBrowserListItem
              key={g.id}
              guild={g}
              onJoinGuild={() => joinGuild({ guildId: g.id })}
            />
          )),
        )}
      </ul>
    </div>
  );
};
