import { NoSymbolIcon } from '@heroicons/react/24/outline';
import { useDeleteRelationshipMutation } from '@/api/relationships/deleteRelationship';
import { Input } from '@/shared-components/Input';
import { MainContentHeaderLayout, MainContentBodyLayout } from '@/shared-components/Layouts';
import { RelationshipListItem } from '../RelationshipListItem';
import { useFilteredRelationships } from '../../../../shared-hooks/useFilteredRelationships';

export const UserDashboardBlockedRelationships = () => {
  const { relationships, displayNameFilter, setDisplayNameFilter } = useFilteredRelationships({
    status: 2,
  });
  const deleteRelationship = useDeleteRelationshipMutation();

  const handleDelete = (relationshipId: string, status: number) => {
    deleteRelationship.mutate({ id: relationshipId, status });
  };

  return (
    <>
      <MainContentHeaderLayout>
        <div className='mr-6 flex items-center space-x-2'>
          <NoSymbolIcon className='h-5 w-5' />
          <span className='text-lg font-medium'>Blocked</span>
        </div>
      </MainContentHeaderLayout>
      <MainContentBodyLayout>
        <div className='my-3 flex items-center px-4'>
          <Input
            id='relationship-filter'
            placeholder='Filter blocked'
            onChange={(e) => setDisplayNameFilter(e.currentTarget.value)}
            value={displayNameFilter}
          />
        </div>
        <ul className='px-4'>
          {relationships.map((r) => (
            <RelationshipListItem
              key={r.id}
              relationship={r}
              onDelete={() => handleDelete(r.id, r.status)}
            />
          ))}
        </ul>
      </MainContentBodyLayout>
    </>
  );
};
