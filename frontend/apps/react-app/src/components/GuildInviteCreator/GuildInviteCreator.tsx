import { Dialog } from '@/shared-components/Dialog';
import {
    guildInviteCreatorStore,
    useGuildInviteCreatorStore,
} from './stores/useGuildInviteCreatorStore';
import { Input } from '@/shared-components/Input';
import { IconButton } from '@/shared-components/IconButton';
import { Button } from '@/shared-components/Button';
import { ListItem } from '@/shared-components/ListItem';
import { Avatar } from '@/shared-components/Avatar';
import { useSendInviteToUser } from './hooks/useSendInviteToFriend';
import { useIsGuildInviteCreatorOpen } from './hooks/useIsGuildInviteCreatorOpen';
import { useFilteredRelationships } from '../UserDashboard/Relationships/hooks/useFilteredRelationships';
import { useInviteLinkCopy } from '../../shared-hooks/useInviteLinkCopy';
import { env } from '../../env';
import { CopySimple } from '@phosphor-icons/react';
import { useI18nContext } from '../../i18n/i18n-react';

export const GuildInviteCreatorContent = () => {
    const { LL } = useI18nContext();
    const inviteId = useGuildInviteCreatorStore((s) => s.inviteId);
    const { data, filter, setFilter } = useFilteredRelationships(0);
    const { sendInviteToUser, status, recipientUserId } = useSendInviteToUser();
    const onCopy = useInviteLinkCopy();

    if (!inviteId) {
        return null;
    }

    const handleListFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(e.currentTarget.value);
    };

    const inviteLink = `https://${env.apiUrl}/v1/invites/${inviteId}`;

    const inviteSendStatus = (isRecipient: boolean) => {
        if (!isRecipient) {
            return LL.Actions.SendInvite();
        }

        switch (status) {
            case 'idle':
                return LL.Actions.SendInvite();
            case 'pending':
                return LL.Hints.InviteSending();
            case 'success':
                return LL.Hints.InviteSent();
            case 'error':
                return LL.Hints.InviteFailed();
        }
    };

    return (
        <div className='px-4 py-5 bg-grayA-4'>
            <h1 className='mb-6 text-xl font-semibold text-gray-12'>
                {LL.General.SendInviteToFriends()}
            </h1>
            <Input
                id='friend-search'
                placeholder={LL.Inputs.Placeholders.SearchFriends()}
                onChange={handleListFilterChange}
                value={filter}
            />
            <div className='mb-6 mt-3 flex min-h-[200px] flex-col'>
                <span className='mb-1.5 text-sm text-gray-11'>
                    {LL.General.FriendCount({ count: data?.length ?? 0 })}
                </span>
                <ul className='space-y-1'>
                    {data?.map((relationship) => (
                        <ListItem key={relationship.id} intent='secondary'>
                            <Avatar
                                src={relationship.user.avatar}
                                fallback={relationship.user.displayName}
                            />
                            <span className='ml-1 mr-auto select-none'>
                                {relationship.user.displayName}
                            </span>
                            <Button
                                padding='s'
                                onClick={() => sendInviteToUser(inviteLink, relationship.user.id)}
                                disabled={
                                    relationship.user.id === recipientUserId && status !== 'idle'
                                }
                            >
                                {inviteSendStatus(relationship.user.id === recipientUserId)}
                            </Button>
                        </ListItem>
                    ))}
                </ul>
            </div>
            <label className='flex w-full flex-col space-y-1' htmlFor='invite-link'>
                <span className='mb-1 text-sm text-gray-11'>{LL.General.CopyInviteLink()}</span>
                <div className='flex overflow-hidden rounded-md'>
                    <Input
                        id='invite-link'
                        placeholder={inviteLink}
                        readOnly={true}
                        className='pr-1'
                        rightInputElement={
                            <IconButton
                                intent='secondary'
                                shape='squircle'
                                onClick={() => onCopy(inviteLink)}
                                tooltipText={LL.Actions.CopyInvite()}
                            >
                                <CopySimple size={20} />
                            </IconButton>
                        }
                    />
                </div>
            </label>
        </div>
    );
};

export const GuildInviteCreator = () => {
    const isOpen = useIsGuildInviteCreatorOpen();
    return (
        <Dialog isOpen={isOpen} onClose={guildInviteCreatorStore.close}>
            <GuildInviteCreatorContent />
        </Dialog>
    );
};
