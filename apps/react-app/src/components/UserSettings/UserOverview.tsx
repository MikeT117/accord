import { Avatar } from '@/shared-components/Avatar';
import { UnsavedSettingsPrompt } from '@/shared-components/Settings/UnsavedSettingsPrompt';
import { Button } from '@/shared-components/Button';
import { IconButton } from '@/shared-components/IconButton';
import { TrashIcon } from '@heroicons/react/24/solid';
import { Input } from '@/shared-components/Input';
import { Divider } from '@/shared-components/Divider';
import { useMutateLoggedInUser } from './hooks/useMutateLoggedInUser';

export const UserOverview = () => {
  const {
    user,
    attachments,
    UploadWrapper,
    canSaveChanges,
    isAvatarModified,
    displayName,
    setDisplayName,
    deleteAttachments,
    deleteUserAccount,
    onFileUploadClick,
    discardChanges,
    saveChanges,
  } = useMutateLoggedInUser();

  return (
    <div className='pl-8 pt-12'>
      <h1 className='mb-6 text-3xl font-semibold'>My Account</h1>
      <div className='flex'>
        <div className='relative mr-8 flex'>
          {isAvatarModified && (
            <IconButton
              intent='danger'
              className='absolute top-0 right-0'
              onClick={() => deleteAttachments(true)}
            >
              <TrashIcon className='h-4 w-4' />
            </IconButton>
          )}
          <Avatar
            size='6xl'
            src={attachments[0]?.src ?? user.avatar}
            onClick={isAvatarModified ? void 0 : onFileUploadClick}
            className='shrink-0 cursor-pointer'
          />
        </div>
        <label className='flex w-full flex-col' htmlFor='display-name'>
          <span className='mb-1 text-sm font-medium text-gray-11'>Display Name</span>
          <span className='mb-2 text-xs text-gray-11'>
            Your display name is visible to everyone.
          </span>
          <Input
            id='display-name'
            placeholder={user.displayName}
            onChange={(e) => setDisplayName(e.currentTarget.value)}
            value={displayName}
          />
        </label>
      </div>
      <Divider className='my-6' />
      <div className='mb-6'>
        <h1 className='mb-2 text-lg font-medium leading-none text-gray-12'>Account Deletion</h1>
        <span className='mb-4 block text-xs text-gray-11'>
          Deleting your account cannot be undone.
        </span>
        <Button intent='danger' onClick={deleteUserAccount}>
          Delete Account
        </Button>
      </div>
      <UnsavedSettingsPrompt
        isVisible={canSaveChanges}
        onDiscard={discardChanges}
        onSave={saveChanges}
      />
      <UploadWrapper id='user-editor-avatar-update' multiple={false} />
    </div>
  );
};
