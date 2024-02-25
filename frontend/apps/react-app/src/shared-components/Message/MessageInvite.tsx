import { useInView } from 'react-intersection-observer';
import { useGetGuildInviteQuery } from '@/api/guildInvites/getGuildInvite';
import { Avatar } from '@/shared-components/Avatar';
import { Button } from '@/shared-components/Button';
import { useCreateGuildMemberMutation } from '../../api/guildMembers/createGuildMember';
import { useIsGuildMember } from '../../shared-hooks/useIsMember';
import { Warning } from '@phosphor-icons/react';

export const MessageInvite = ({ inviteId }: { inviteId: string }) => {
    const { ref, inView } = useInView({ threshold: 0 });
    const { data, isError } = useGetGuildInviteQuery(inviteId, inView);
    const { mutate: createGuildMember } = useCreateGuildMemberMutation();
    const isGuildMember = useIsGuildMember(data?.guildId);

    if (isError) {
        return null;
    }

    return (
        <div
            ref={ref}
            className='mt-2 flex w-full max-w-[400px] flex-col rounded-md bg-grayA-3 p-3'
        >
            <div className='mb-3'>
                <span className='text-sm font-medium text-gray-11'>
                    {data?.flags === 1
                        ? 'You have been invited to join a server!'
                        : 'You received an invite, but...'}
                </span>
            </div>
            <div className='flex items-center'>
                {data?.flags === 1 ? (
                    <>
                        <Avatar size='xl' src={data.icon} fallback={data.name} />
                        <div className='ml-3 mr-auto flex flex-col justify-center space-y-1'>
                            <span className='text-sm font-semibold text-gray-12'>{data.name}</span>
                            <span className='text-xs text-gray-11'>{data.memberCount} Members</span>
                        </div>
                        <Button onClick={() => createGuildMember(data)} disabled={isGuildMember}>
                            {isGuildMember ? 'Joined' : 'Join'}
                        </Button>
                    </>
                ) : (
                    <>
                        <Warning size={32} className='text-red-11' />
                        <div className='ml-3 mr-auto flex flex-col justify-center space-y-2'>
                            <span className='font-medium text-red-11'>Invite Expired</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
