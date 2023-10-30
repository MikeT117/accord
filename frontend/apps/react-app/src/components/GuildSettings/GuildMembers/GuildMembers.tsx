import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useBanGuildMemberMutation } from '@/api/bans/banGuildMember';
import { useInfiniteGuildMembersQuery } from '@/api/member/getGuildMembers';
import { useKickGuildMemberMutation } from '@/api/member/kickGuildMember';
import { Input } from '@/shared-components/Input';
import { LoadingSpinner } from '@/shared-components/LoadingSpinner';
import { InfiniteLoad } from '@/shared-components/InfiniteLoad';
import { GuildMemberListItem } from './GuildMemberListItem';

export const GuildMembers = ({
  guildId,
  memberCount,
  userId,
  creatorId,
}: {
  guildId: string;
  memberCount: number;
  userId: string;
  creatorId: string;
}) => {
  const { data, isLoading, fetchNextPage } = useInfiniteGuildMembersQuery(guildId);
  const { mutate: banMember } = useBanGuildMemberMutation();
  const { mutate: kickMember } = useKickGuildMemberMutation();
  const [filter, setFilter] = useState('');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const filteredData = filter
    ? data?.pages.map((p) =>
        p.filter((gm) =>
          (gm.nickname ?? gm.user.displayName).toLowerCase().includes(filter.toLowerCase()),
        ),
      )
    : data?.pages;

  return (
    <div className='pl-8 pt-12'>
      <h1 className='mb-6 text-3xl font-semibold text-gray-12'>Server Members</h1>
      <Input
        className='mb-4'
        value={filter}
        onChange={(e) => setFilter(e.currentTarget.value)}
        placeholder='Search'
        rightInputElement={<MagnifyingGlassIcon className='h-5 w-5 text-gray-11' />}
      />
      <span className='mb-2 block whitespace-nowrap text-sm text-gray-11'>
        {memberCount} Members
      </span>
      <ul className='flex max-h-[85vh] flex-col space-y-2 overflow-y-auto'>
        {filteredData?.map((page) =>
          page.map((m) => (
            <GuildMemberListItem
              guildId={guildId}
              roles={m.roles}
              isOwner={m.userId === creatorId}
              isCurrentUser={m.userId === creatorId}
              key={m.id}
              avatar={m.user.avatar}
              name={m.nickname ?? m.user.displayName}
              onBanMember={() => banMember({ id: m.id, guildId })}
              onKickMember={() => kickMember({ id: m.id, guildId })}
            />
          )),
        )}
        <InfiniteLoad onInView={fetchNextPage} />
      </ul>
    </div>
  );
};
