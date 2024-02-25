import { LoadingSpinner } from '@/shared-components/LoadingSpinner';
import { GuildBrowserGuildsListItem } from './GuildBrowserGuildsListItem';
import { useFilterableDiscoverableGuilds } from './hooks/useDiscoverableGuilds';
import { useGuildCategoryFilter } from './stores/useGuildCategoryFilter';
import { useCreateGuildMemberMutation } from '../../api/guildMembers/createGuildMember';
import { InfiniteLoad } from '../../shared-components/InfiniteLoad';
import { useI18nContext } from '../../i18n/i18n-react';

export const GuildBrowserGuildsList = () => {
    const { LL } = useI18nContext();
    const guildCategoryId = useGuildCategoryFilter((s) => s.guildCategoryId);
    const { data, query, isLoading, fetchNextPage, hasNextPage } =
        useFilterableDiscoverableGuilds(guildCategoryId);
    const { mutate: joinGuild } = useCreateGuildMemberMutation();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    const guilds = guildCategoryId
        ? data?.pages.map((p) => p.filter((g) => g.guildCategoryId === guildCategoryId))
        : data?.pages;

    return (
        <div className='flex w-full max-w-[1064px] flex-col'>
            <h1 className='mb-3 text-xl font-semibold'>
                {query ? LL.General.Query({ query }) : LL.General.PopularCommunities()}
            </h1>
            <ul className='mt-3 flex max-w-[1064px] flex-wrap space-x-4'>
                {guilds?.map((p) =>
                    p.map((g) => (
                        <GuildBrowserGuildsListItem
                            key={g.id}
                            guild={g}
                            onJoinGuild={() => joinGuild({ guildId: g.id })}
                        />
                    )),
                )}
                <InfiniteLoad enabled={hasNextPage} onInView={fetchNextPage} />
            </ul>
        </div>
    );
};
