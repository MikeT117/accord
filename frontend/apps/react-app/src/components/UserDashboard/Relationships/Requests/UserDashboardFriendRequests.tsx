import { UserGroupIcon } from '@heroicons/react/24/outline';
import { MainContentBodyLayout, MainContentHeaderLayout } from '@/shared-components/Layouts';
import { RelationshipListItem } from '../RelationshipListItem';
import { Button } from '@/shared-components/Button';
import { Input } from '@/shared-components/Input';
import { useRelationshipCreatorStore } from '../../RelationshipCreator/useRelationshipCreatorstore';
import { useCurrentUserId } from '@/shared-stores/currentUserStore';
import { useAcceptRelationshipMutation } from '@/api/userRelationships/acceptRelationship';
import { useDeleteRelationshipMutation } from '@/api/userRelationships/deleteRelationship';
import { useFilteredRelationships } from '../../../../shared-hooks/useFilteredRelationships';

export const UserDashboardFriendRequests = () => {
  const userId = useCurrentUserId();
  const { relationships, displayNameFilter, setDisplayNameFilter } = useFilteredRelationships(1);
  const { mutate: acceptRelationship } = useAcceptRelationshipMutation();
  const { mutate: deleteRelationship } = useDeleteRelationshipMutation();

  return (
    <>
      <MainContentHeaderLayout>
        <div className='mr-6 flex items-center space-x-2'>
          <UserGroupIcon className='h-5 w-5' />
          <span className='text-lg font-medium'>Requests</span>
        </div>
      </MainContentHeaderLayout>
      <MainContentBodyLayout>
        <div className='my-3 flex items-center space-x-3 px-4'>
          <Input
            id='relationship-filter'
            placeholder='Filter requests'
            onChange={(e) => setDisplayNameFilter(e.currentTarget.value)}
            value={displayNameFilter}
          />
          <Button onClick={useRelationshipCreatorStore.getState().toggleOpen}>Send Request</Button>
        </div>
        <ul className='px-4'>
          {relationships?.map((r) => (
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
