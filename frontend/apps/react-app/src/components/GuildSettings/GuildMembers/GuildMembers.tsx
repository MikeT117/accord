import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useInfiniteGuildMembersQuery } from '@/api/guildMembers/getGuildMembers';
import { Input } from '@/shared-components/Input';
import { LoadingSpinner } from '@/shared-components/LoadingSpinner';
import { InfiniteLoad } from '@/shared-components/InfiniteLoad';
import { GuildMemberListItem } from './GuildMemberListItem';
import { useCreateGuildBanMutation } from '../../../api/guildBans/createGuildBan';
import { useDeleteGuildMemberMutation } from '../../../api/guildMembers/deleteGuildMember';

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
  const { mutate: createBan } = useCreateGuildBanMutation();
  const { mutate: deleteMember } = useDeleteGuildMemberMutation();
  const [filter, setFilter] = useState('');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const filteredData = filter
    ? data?.pages.map((p) =>
        p.filter((gm) => gm.user.displayName.toLowerCase().includes(filter.toLowerCase())),
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
              key={m.user.id}
              guildId={guildId}
              member={m}
              isOwner={m.user.id === creatorId}
              isCurrentUser={m.user.id === creatorId}
              onBanMember={() => createBan({ guildId, reason: '', userId: m.user.id })}
              onKickMember={() => deleteMember({ id: m.user.id, guildId })}
            />
          )),
        )}
        <InfiniteLoad onInView={fetchNextPage} />
      </ul>
    </div>
  );
};
