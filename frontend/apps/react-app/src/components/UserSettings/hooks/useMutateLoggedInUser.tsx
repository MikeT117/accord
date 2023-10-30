import { useState } from 'react';
import { useDeleteAccountMutation } from '../../../api/user/deleteAccount';
import { useUpdateUserMutation } from '../../../api/user/updateUser';
import { useCloudinary } from '../../../shared-hooks';
import { actionConfirmationStore } from '../../ActionConfirmation';
import { useCurrentUser } from '@/shared-stores/currentUserStore';

export const useMutateLoggedInUser = () => {
  const user = useCurrentUser();
  const [displayName, setDisplayName] = useState('');

  const { mutate: updateUserMutation } = useUpdateUserMutation();
  const { mutate: deleteAccountMutation } = useDeleteAccountMutation();
  const { UploadWrapper, attachments, deleteAttachments, onFileUploadClick } = useCloudinary();

  if (!user) {
    return null;
  }

  const isDisplayNameModified = displayName.length !== 0 && displayName !== user.displayName;
  const isAvatarModified = attachments.length !== 0;
  const areChangesValid = !!user.displayName.trim();
  const canSaveChanges = !!(areChangesValid && (isDisplayNameModified || isAvatarModified));

  const discardChanges = () => {
    setDisplayName('');
    deleteAttachments(true);
  };

  const saveChanges = () => {
    updateUserMutation({
      avatar: attachments[0],
      displayName: displayName.length !== 0 ? displayName : displayName,
    });
    deleteAttachments();
  };

  const deleteUserAccount = () => {
    actionConfirmationStore.setAccount(user, () => deleteAccountMutation(undefined));
  };

  return {
    discardChanges,
    saveChanges,
    deleteAttachments,
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
