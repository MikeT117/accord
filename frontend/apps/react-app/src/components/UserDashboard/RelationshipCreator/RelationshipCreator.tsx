import { useCallback } from 'react';
import { useRelationshipCreateMutation } from '@/api/userRelationships/createRelationship';
import { Button } from '@/shared-components/Button';
import { Dialog } from '@/shared-components/Dialog';
import { Input } from '@/shared-components/Input';
import { useRelationshipCreatorStore } from './useRelationshipCreatorstore';

const toggleOpen = useRelationshipCreatorStore.getState().toggleOpen;
const setDisplayName = useRelationshipCreatorStore.getState().setDisplayName;

export const RelationshipCreatorContent = () => {
  const username = useRelationshipCreatorStore(useCallback((s) => s.username, []));

  const isDisplayNameValid = useRelationshipCreatorStore(
    useCallback((s) => s.isDisplayNameValid(), []),
  );

  const createRelationship = useRelationshipCreateMutation();
  const handleCreateRelationship = async () => {
    createRelationship.mutate({ status: 1, username });
  };

  return (
    <>
      <h1 className='p-4 text-lg font-medium text-gray-12'>Add Friend</h1>
      <label className='flex w-full flex-col px-4' id='friend-request-username'>
        <span className='mb-1.5 text-xs text-gray-11'>Username</span>
        <Input
          id='friend-request-username'
          value={username}
          onChange={(e) => setDisplayName(e.currentTarget.value)}
          placeholder='Enter username'
        />
      </label>
      <div className='flex justify-between bg-grayA-3 px-4 py-3'>
        <Button intent='link' padding='s' onClick={toggleOpen}>
          Cancel
        </Button>
        <Button intent='primary' onClick={handleCreateRelationship} disabled={!isDisplayNameValid}>
          Send Request
        </Button>
      </div>
    </>
  );
};

export const RelationshipCreator = () => {
  const isOpen = useRelationshipCreatorStore(useCallback((s) => s.isOpen, []));
  return (
    <Dialog isOpen={isOpen} onClose={toggleOpen} className='flex-col space-y-3'>
      <RelationshipCreatorContent />
    </Dialog>
  );
};
