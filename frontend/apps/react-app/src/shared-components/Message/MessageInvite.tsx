import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useInView } from 'react-intersection-observer';
import { useAcceptGuildInviteMutation } from '@/api/invite/acceptGuildInvite';
import { useGetGuildInviteQuery } from '@/api/invite/getGuildInvite';
import { Avatar } from '@/shared-components/Avatar';
import { Button } from '@/shared-components/Button';

export const MessageInvite = ({ inviteId }: { inviteId: string }) => {
  const { ref, inView } = useInView({
    threshold: 0,
  });
  const { data, isError } = useGetGuildInviteQuery({
    inviteId,
    enabled: inView,
  });

  const { mutate: acceptInvite } = useAcceptGuildInviteMutation();

  return (
    <div ref={ref} className='mt-2 flex w-full max-w-[400px] flex-col rounded-md bg-grayA-3 p-3'>
      <div className='mb-3'>
        <span className='text-sm font-medium text-gray-11'>
          {!data || isError
            ? 'You received an invite, but...'
            : 'You have been invited to join a server!'}
        </span>
      </div>
      <div className='flex items-center'>
        {data && !isError ? (
          <>
            <Avatar size='xl' src={data.guild.icon} fallback={data.guild.name} />
            <div className='ml-3 mr-auto flex flex-col justify-center space-y-1'>
              <span className='text-sm font-semibold text-gray-12'>{data.guild.name}</span>
              <span className='text-xs text-gray-11'>{data.guild.memberCount} Members</span>
            </div>
            <Button onClick={() => acceptInvite({ id: data.id })} disabled={data.isJoined}>
              {data.isJoined ? 'Joined' : 'Join'}
            </Button>
          </>
        ) : (
          <>
            <ExclamationCircleIcon className='h-8 w-8 text-red-11' />
            <div className='ml-3 mr-auto flex flex-col justify-center space-y-2'>
              <span className='font-medium text-red-11'>Invite Expired</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
