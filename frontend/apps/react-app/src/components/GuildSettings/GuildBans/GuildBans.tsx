import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Input } from '@/shared-components/Input';
import { LoadingSpinner } from '@/shared-components/LoadingSpinner';
import { GuildBanListItem } from './GuildBanListItem';
import { useDeleteGuildBanMutation } from '../../../api/guildBans/deleteGuildBan';
import { useGetGuildBansQuery } from '../../../api/guildBans/getGuildBans';

export const GuildBans = ({ guildId }: { guildId: string }) => {
  const [filter, setFilter] = useState('');
  const { data, isLoading } = useGetGuildBansQuery(guildId);
  const { mutate: unbanMember } = useDeleteGuildBanMutation();
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className='pl-8 pt-12'>
      <h1 className='mb-6 text-3xl font-semibold text-gray-12'>Server Bans</h1>
      <Input
        className='mb-4'
        value={filter}
        onChange={(e) => setFilter(e.currentTarget.value)}
        placeholder='Search'
        rightInputElement={<MagnifyingGlassIcon className='h-5 w-5 text-gray-11' />}
      />
      <ul className='w-full space-y-2'>
        {data?.pages.map((page) =>
          page.map((gb) => (
            <GuildBanListItem
              key={gb.user.id}
              guildBan={gb}
              onUnbanMember={() => unbanMember({ guildId, userId: gb.user.id })}
            />
          )),
        )}
      </ul>
    </div>
  );
};
