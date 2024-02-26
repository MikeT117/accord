import { ReactNode } from 'react';
import { Popover } from '../Popover';
import { TimeAgo } from '../TimeAgo';
import { Avatar } from '../Avatar';
import { GuildMemberRolesList } from '../GuildMemberRolesList';
import { userUserProfile } from './hooks/useUserProfile';
import { Input } from '../Input';
import { ALLOW_GUILD_MEMBER_DMS } from '../../constants';
import { Button } from '../Button';
import { guildBanCreatorStore } from '../../components/GuildBanCreator/stores/guildBanCreatorStore';
import { getTimestampFromUUID } from '../../utils/timestampFromUUID';
import { useCreateAdhocPrivateMessage } from '../../shared-hooks/useCreateAdhocPrivateMessage';
import { publicFlagsCheck } from '../../utils/publicFlagsCheck';
import { useCurrentUserId } from '../../shared-stores/currentUserStore';
import { useI18nContext } from '../../i18n/i18n-react';

const UserProfileDialogContent = ({ userId }: { userId: string }) => {
    const { LL } = useI18nContext();

    const currentUserId = useCurrentUserId();
    const { profile, guildId } = userUserProfile(userId);
    const { content, setContent, createMessage } = useCreateAdhocPrivateMessage();

    if (!profile) {
        return null;
    }

    const serverDMsAllowed = publicFlagsCheck(profile.publicFlags, ALLOW_GUILD_MEMBER_DMS);

    const handleInputKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        e.preventDefault();

        if (e.shiftKey || e.key !== 'Enter') {
            return;
        }

        createMessage([profile.id]);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContent(e.currentTarget.value);
    };

    return (
        <div className='flex flex-col w-[300px] max-h-[90vh]'>
            <div className='bg-emerald-500 min-h-[60px] mb-8' />
            <Avatar
                src={profile.avatar}
                size='3xl'
                className='absolute top-[10%] left-[20px] ring-8 ring-gray-1'
            />
            <div className='flex flex-col space-y-4 px-4 py-4'>
                <div className='flex flex-col space-y-0 border-b border-grayA-6 py-2'>
                    <span className='font-semibold text-lg'>{profile.displayName}</span>
                    <span className='text-xs'>{profile.username}</span>
                </div>
                {profile.guildMember && (
                    <div className='flex flex-col space-y-1'>
                        <span className='font-bold text-sm'>{LL.General.Roles()}</span>
                        <GuildMemberRolesList
                            guildId={guildId}
                            roleIds={profile.guildMember.roles}
                        />
                    </div>
                )}
                {profile.guildMember && profile.id !== currentUserId ? (
                    <>
                        <div className='flex flex-col'>
                            <span className='font-bold text-sm'>{LL.General.MemberSince()}</span>
                            <TimeAgo className='text-xs' date={profile.guildMember.joinedAt} />
                        </div>
                        {serverDMsAllowed && (
                            <Input
                                className='bg-grayA-3'
                                placeholder='Send message...'
                                value={content}
                                onChange={handleInputChange}
                                onKeyUp={handleInputKeyUp}
                            />
                        )}
                        <Button
                            intent='danger'
                            padding='s'
                            fullWidth
                            onClick={() => guildBanCreatorStore.open(guildId, profile)}
                        >
                            {LL.Actions.Ban()}
                        </Button>
                    </>
                ) : (
                    <div className='flex flex-col'>
                        <span className='font-bold text-sm'>{LL.General.AccordMemberSince()}</span>
                        <TimeAgo className='text-xs' date={getTimestampFromUUID(profile.id)} />
                    </div>
                )}
            </div>
        </div>
    );
};

export const UserProfileDialog = ({
    userId,
    children,
}: {
    userId: string;
    children: ReactNode;
}) => {
    return (
        <Popover
            side='right'
            align='center'
            sideOffset={8}
            triggerElem={children}
            className='shadow-md'
            triggerClassName='first:hover:underline first:hover:cursor-pointer'
        >
            <UserProfileDialogContent userId={userId} />
        </Popover>
    );
};
