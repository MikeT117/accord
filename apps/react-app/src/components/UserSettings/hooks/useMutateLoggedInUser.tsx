import { useState } from 'react';
import { useDeleteAccountMutation } from '../../../api/user/deleteAccount';
import { useUpdateUserMutation } from '../../../api/user/updateUser';
import { useCloudinary } from '../../../shared-hooks';
import { actionConfirmationActions } from '../../ActionConfirmation';
import { useLoggedInUser } from './useLoggedInUser';

export const useMutateLoggedInUser = () => {
  const user = useLoggedInUser();
  const [displayName, setDisplayName] = useState('');

  const { mutate: updateUserMutation } = useUpdateUserMutation();
  const { mutate: deleteAccountMutation } = useDeleteAccountMutation();
  const { UploadWrapper, attachments, deleteAttachments, onFileUploadClick } = useCloudinary();

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
    actionConfirmationActions.setAccount(user, () => deleteAccountMutation(undefined));
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
