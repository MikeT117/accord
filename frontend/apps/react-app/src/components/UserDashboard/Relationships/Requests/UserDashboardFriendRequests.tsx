import { MainContentBodyLayout, MainContentHeaderLayout } from '@/shared-components/Layouts';
import { RelationshipListItem } from '../RelationshipListItem';
import { Button } from '@/shared-components/Button';
import { Input } from '@/shared-components/Input';
import { useRelationshipCreatorStore } from '../../RelationshipCreator/useRelationshipCreatorstore';
import { useCurrentUserId } from '@/shared-stores/currentUserStore';
import { useAcceptRelationshipMutation } from '@/api/userRelationships/acceptRelationship';
import { useDeleteRelationshipMutation } from '@/api/userRelationships/deleteRelationship';
import { useFilteredRelationships } from '../hooks/useFilteredRelationships';
import { Users } from '@phosphor-icons/react';
import { useI18nContext } from '../../../../i18n/i18n-react';

export const UserDashboardFriendRequests = () => {
    const { LL } = useI18nContext();

    const userId = useCurrentUserId();
    const { data, filter, setFilter } = useFilteredRelationships(1);
    const { mutate: acceptRelationship } = useAcceptRelationshipMutation();
    const { mutate: deleteRelationship } = useDeleteRelationshipMutation();

    return (
        <>
            <MainContentHeaderLayout>
                <div className='mr-6 flex items-center space-x-2'>
                    <Users size={26} />
                    <span className='text-lg font-medium'>{LL.General.Requests()}</span>
                </div>
            </MainContentHeaderLayout>
            <MainContentBodyLayout>
                <div className='my-3 flex items-center space-x-3 px-4'>
                    <Input
                        id='relationship-filter'
                        placeholder={LL.Inputs.Placeholders.FilterRequests()}
                        onChange={(e) => setFilter(e.currentTarget.value)}
                        value={filter}
                    />
                    <Button onClick={useRelationshipCreatorStore.getState().toggleOpen}>
                        {LL.Actions.SendRequest()}
                    </Button>
                </div>
                <ul className='px-4 space-y-1'>
                    {data?.map((r) => (
                        <RelationshipListItem
                            key={r.id}
                            isOutgoing={r.creatorId === userId}
                            relationship={r}
                            onDelete={() => deleteRelationship(r.id)}
                            onAccept={() => acceptRelationship(r.id)}
                        />
                    ))}
                </ul>
            </MainContentBodyLayout>
        </>
    );
};
