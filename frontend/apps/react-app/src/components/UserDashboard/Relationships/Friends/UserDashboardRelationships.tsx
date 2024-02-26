import { useNavigate } from 'react-router-dom';
import { MainContentBodyLayout, MainContentHeaderLayout } from '@/shared-components/Layouts';
import { RelationshipListItem } from '../RelationshipListItem';
import { Input } from '@/shared-components/Input';
import { privateChannelStore } from '@/shared-stores/privateChannelStore';
import { useCreatePrivateChannelMutation } from '@/api/channels/createPrivateChannel';
import { useDeleteRelationshipMutation } from '@/api/userRelationships/deleteRelationship';
import { useFilteredRelationships } from '../hooks/useFilteredRelationships';
import { actionConfirmationStore } from '../../../ActionConfirmation';
import { UserRelationship } from '../../../../types';
import { Users } from '@phosphor-icons/react';
import { useI18nContext } from '../../../../i18n/i18n-react';

export const UserDashboardRelationships = () => {
    const { LL } = useI18nContext();

    const { data, filter, setFilter } = useFilteredRelationships(0);
    const { mutate: deleteRelationship } = useDeleteRelationshipMutation();
    const navigate = useNavigate();
    const { mutate: createPrivateChannel } = useCreatePrivateChannelMutation();

    const handleDelete = (relationship: UserRelationship) => {
        actionConfirmationStore.deleteRelationship(relationship, () =>
            deleteRelationship(relationship.id),
        );
    };

    const handleChatClick = (friendUserId: string) => {
        const existingChannel = privateChannelStore.selectByMemberIds(friendUserId);

        if (!existingChannel) {
            createPrivateChannel([friendUserId], {
                onSuccess(channel) {
                    navigate(`/app/@me/channel/${channel.id}`);
                },
            });
        } else {
            navigate(`/app/@me/channel/${existingChannel.id}`);
        }
    };

    return (
        <>
            <MainContentHeaderLayout>
                <div className='mr-6 flex items-center space-x-2'>
                    <Users size={26} weight='fill' />
                    <span className='text-lg font-medium'>{LL.General.Friends()}</span>
                </div>
            </MainContentHeaderLayout>
            <MainContentBodyLayout>
                <div className='my-3 flex items-center space-x-3 px-4'>
                    <Input
                        id='relationship-displayname-filter'
                        placeholder={LL.Inputs.Placeholders.FilterFriends()}
                        onChange={(e) => setFilter(e.currentTarget.value)}
                        value={filter}
                    />
                </div>
                <ul className='px-4 space-y-1'>
                    {data?.map((r) => (
                        <RelationshipListItem
                            key={r.id}
                            relationship={r}
                            onDelete={() => handleDelete(r)}
                            onChat={() => handleChatClick(r.user.id)}
                        />
                    ))}
                </ul>
            </MainContentBodyLayout>
        </>
    );
};
