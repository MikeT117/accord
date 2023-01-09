import { UserGroupIcon } from '@heroicons/react/24/outline';
import { MainContentBodyLayout, MainContentHeaderLayout } from '@/shared-components/Layouts';
import { RelationshipListItem } from '../RelationshipListItem';
import { Button } from '@/shared-components/Button';
import { Input } from '@/shared-components/Input';
import { useRelationshipCreatorStore } from '../../RelationshipCreator/useRelationshipCreatorstore';
import type { UserRelationship } from '@accord/common';
import { useLoggedInUserId } from '@/shared-stores/loggedInUserStore';
import { useAcceptRelationshipMutation } from '@/api/relationships/acceptRelationship';
import { useDeleteRelationshipMutation } from '@/api/relationships/deleteRelationship';
import { useFilteredRelationships } from '../../../../shared-hooks/useFilteredRelationships';

export const UserDashboardFriendRequests = () => {
  const userId = useLoggedInUserId();
  const { relationships, displayNameFilter, setDisplayNameFilter } = useFilteredRelationships({
    status: 1,
  });
  const { mutate: acceptRelationship } = useAcceptRelationshipMutation();
  const { mutate: deleteRelationship } = useDeleteRelationshipMutation();

  const handleAccepRelationshipClick = (relationship: Pick<UserRelationship, 'id' | 'status'>) => {
    acceptRelationship(relationship);
  };

  const handleDelete = (relationshipId: string, status: number) => {
    deleteRelationship({ id: relationshipId, status });
  };

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
              isIncomingRequest={r.initiatorUserAccountId !== userId}
              relationship={r}
              onDelete={() => handleDelete(r.id, r.status)}
              onAccept={() => handleAccepRelationshipClick({ id: r.id, status: r.status })}
            />
          ))}
        </ul>
      </MainContentBodyLayout>
    </>
  );
};
