import { useState } from 'react';
import { useDeleteAccountMutation } from '../../../api/users/deleteAccount';
import { useUpdateUserMutation } from '../../../api/users/updateUser';
import { useCloudinary } from '../../../shared-hooks';
import { actionConfirmationStore } from '../../ActionConfirmation';
import { useCurrentUser } from '@/shared-stores/currentUserStore';

// TODO: UI for updating public flags

export const useMutateLoggedInUser = () => {
  const user = useCurrentUser();
  const [displayName, setDisplayName] = useState('');

  const { mutate: updateUserMutation } = useUpdateUserMutation();
  const { mutate: deleteAccountMutation } = useDeleteAccountMutation();
  const { UploadWrapper, attachments, clearAttachments, onFileUploadClick } = useCloudinary();

  if (!user) {
    return null;
  }

  const isDisplayNameModified = displayName.length !== 0 && displayName !== user.displayName;
  const isAvatarModified = attachments.length !== 0;
  const areChangesValid = !!user.displayName.trim();
  const canSaveChanges = !!(areChangesValid && (isDisplayNameModified || isAvatarModified));

  const discardChanges = () => {
    setDisplayName('');
    clearAttachments();
  };

  const saveChanges = () => {
    updateUserMutation({
      avatar: attachments[0]?.id,
      displayName: displayName.length < 6 ? user.displayName : displayName,
      publicFlags: user.publicFlags,
    });
    clearAttachments();
  };

  const deleteUserAccount = () => {
    actionConfirmationStore.setAccount(user, () => deleteAccountMutation(undefined));
  };

  return {
    discardChanges,
    saveChanges,
    clearAttachments,
    deleteUserAccount,
    onFileUploadClick,
    setDisplayName,
    displayName,
    attachments,
    user,
    canSaveChanges,
    isAvatarModified,
    UploadWrapper,
  };
};
