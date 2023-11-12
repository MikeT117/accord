import { useDeleteGuildInviteMutation } from '@/api/guildInvites/deleteGuildInvite';
import { useGetGuildInvitesQuery } from '@/api/guildInvites/getGuildInvites';
import { env } from '@/env';
import { InfiniteLoad } from '@/shared-components/InfiniteLoad';
import { useInviteLinkCopy } from '@/shared-hooks/useInviteLinkCopy';
import { GuildInviteListItem } from './GuildInviteListItem';

export const GuildInvites = ({ guildId }: { guildId: string }) => {
  const { data, isError, fetchNextPage } = useGetGuildInvitesQuery(guildId);
  const { mutate: deleteGuildInvite } = useDeleteGuildInviteMutation();
  const onCopy = useInviteLinkCopy();
  return (
    <div className='pl-8 pt-12'>
      <h1 className='mb-6 text-3xl font-semibold text-gray-12'>Invites</h1>
      <div className='flex h-full flex-col'>
        <div className='flex rounded bg-grayA-3 p-3 text-xs font-bold uppercase text-gray-11'>
          <span className='w-[170px]'>Inviter</span>
          <span className='w-[370px]'>Invite Code</span>
          <span className='w-[75px]'>Uses</span>
          <span className='flex w-[80px] justify-center'>Actions</span>
        </div>
        <ul className='flex max-h-[85vh] flex-col space-y-2 overflow-y-auto py-2'>
          {!isError &&
            data?.pages.map((page) =>
              page.map((i) => (
                <GuildInviteListItem
                  key={i.id}
                  id={i.id}
                  creatorAvatar={i.creator.avatar}
                  creatorName={i.creator.displayName}
                  usedCount={i.usedCount}
                  onCopy={() => onCopy(`https://${env.apiUrl}/invite/${i.id}`)}
                  onDelete={() => deleteGuildInvite({ guildId, inviteId: i.id })}
                />
              )),
            )}
          <InfiniteLoad onInView={fetchNextPage} />
        </ul>
      </div>
    </div>
  );
};
