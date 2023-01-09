import { useNavigate } from 'react-router-dom';
import { UserGroupIcon } from '@heroicons/react/24/solid';
import { MainContentBodyLayout, MainContentHeaderLayout } from '@/shared-components/Layouts';
import { RelationshipListItem } from '../RelationshipListItem';
import { Input } from '@/shared-components/Input';
import { useLoggedInUserId } from '@/shared-stores/loggedInUserStore';
import { privateChannelActions } from '@/shared-stores/privateChannelStore';
import { useCreatePrivateChannelMutation } from '@/api/channel/createPrivateChannel';
import { useDeleteRelationshipMutation } from '@/api/relationships/deleteRelationship';
import { useFilteredRelationships } from '../../../../shared-hooks/useFilteredRelationships';
import { actionConfirmationActions } from '../../../ActionConfirmation';
import { UserRelationship } from '@accord/common';

export const UserDashboardRelationships = () => {
  const { relationships, displayNameFilter, setDisplayNameFilter } = useFilteredRelationships({
    status: 0,
  });
  const { mutate: deleteRelationship } = useDeleteRelationshipMutation();
  const navigate = useNavigate();
  const { mutateAsync: createPrivateChannel } = useCreatePrivateChannelMutation();

  const handleDelete = (relationship: UserRelationship) => {
    actionConfirmationActions.setRelationship(relationship, () =>
      deleteRelationship({ id: relationship.id, status: relationship.status }),
    );
  };

  const handleChat = async (friendUserId: string) => {
    const existingChannel = privateChannelActions.getPrivateChannelByMembers(friendUserId);
    if (!existingChannel) {
      const channel = await createPrivateChannel({ users: [friendUserId] });
      navigate(`/app/@me/channel/${channel.id}`);
    } else {
      navigate(`/app/@me/channel/${existingChannel.id}`);
    }
  };

  return (
    <>
      <MainContentHeaderLayout>
        <div className='mr-6 flex items-center space-x-2'>
          <UserGroupIcon className='h-5 w-5' />
          <span className='text-lg font-medium'>Friends</span>
        </div>
      </MainContentHeaderLayout>
      <MainContentBodyLayout>
        <div className='my-3 flex items-center space-x-3 px-4'>
          <Input
            id='relationship-displayname-filter'
            placeholder='Filter friends'
            onChange={(e) => setDisplayNameFilter(e.currentTarget.value)}
            value={displayNameFilter}
          />
        </div>
        <ul className='px-4'>
          {relationships.map((r) => (
            <RelationshipListItem
              key={r.id}
              relationship={r}
              onDelete={() => handleDelete(r)}
              onChat={() => handleChat(r.user.id)}
            />
          ))}
        </ul>
      </MainContentBodyLayout>
    </>
  );
};
