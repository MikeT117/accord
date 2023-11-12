import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useInView } from 'react-intersection-observer';
import { useGetGuildInviteQuery } from '@/api/guildInvites/getGuildInvite';
import { Avatar } from '@/shared-components/Avatar';
import { Button } from '@/shared-components/Button';
import { useCreateGuildMemberMutation } from '../../api/guildMembers/createGuildMember';

export const MessageInvite = ({ inviteId }: { inviteId: string }) => {
  const { ref, inView } = useInView({ threshold: 0 });
  const { data, isError } = useGetGuildInviteQuery(inviteId, inView);
  const { mutate: createGuildMember } = useCreateGuildMemberMutation();

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
            <Avatar size='xl' src={data.icon} fallback={data.name} />
            <div className='ml-3 mr-auto flex flex-col justify-center space-y-1'>
              <span className='text-sm font-semibold text-gray-12'>{data.name}</span>
              <span className='text-xs text-gray-11'>{data.memberCount} Members</span>
            </div>
            <Button
              onClick={() => createGuildMember({ guildId: data.guildId, inviteId })}
              disabled={true}
            >
              {true ? 'Joined' : 'Join'}
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
