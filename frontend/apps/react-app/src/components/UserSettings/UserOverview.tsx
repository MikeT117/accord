import { Avatar } from '@/shared-components/Avatar';
import { UnsavedSettingsPrompt } from '@/shared-components/Settings/UnsavedSettingsPrompt';
import { Button } from '@/shared-components/Button';
import { IconButton } from '@/shared-components/IconButton';
import { Input } from '@/shared-components/Input';
import { Divider } from '@/shared-components/Divider';
import { useState } from 'react';
import { useDeleteAccountMutation } from '../../api/users/deleteAccount';
import { useUpdateUserMutation } from '../../api/users/updateUser';
import { useCloudinary } from '../../shared-hooks';
import { actionConfirmationStore } from '../ActionConfirmation';
import { z } from 'zod';
import { Trash } from '@phosphor-icons/react';
import { SettingToggle } from '../../shared-components/Settings';
import {
    ALLOW_FRIEND_REQUESTS,
    ALLOW_GUILD_MEMBER_DMS,
    MAX_USER_PUBLIC_FLAGS,
} from '../../constants';
import { User } from '../../types';
import { useI18nContext } from '../../i18n/i18n-react';

const displayNameSchema = z.string().trim().min(3).max(32);
const publicFlagsSchema = z.number().min(0).max(MAX_USER_PUBLIC_FLAGS);

export const UserOverview = ({
    avatar,
    displayName,
    publicFlags,
}: Pick<User, 'avatar' | 'displayName' | 'publicFlags'>) => {
    const { LL } = useI18nContext();

    const [modifiedDisplayName, setModifiedDisplayName] = useState(displayName);
    const [modifiedPublicFlags, setModifiedPublicFlags] = useState(publicFlags);

    const { mutate: updateUserMutation } = useUpdateUserMutation();
    const { mutate: deleteAccountMutation } = useDeleteAccountMutation();
    const { UploadWrapper, attachments, clearAttachments, onFileUploadClick } = useCloudinary();

    const { success: isModifiedDisplayNameValid } =
        displayNameSchema.safeParse(modifiedDisplayName);
    const { success: isModifiedPublicFlagsValid } =
        publicFlagsSchema.safeParse(modifiedPublicFlags);

    const isDisplayNameModified = modifiedDisplayName.trim() !== displayName;
    const isPublicFlagsModified = modifiedPublicFlags !== publicFlags;

    const isModified = isDisplayNameModified || isPublicFlagsModified || attachments.length !== 0;
    const isValid = isModifiedDisplayNameValid && isModifiedPublicFlagsValid;

    const discardChanges = () => {
        setModifiedDisplayName(displayName);
        setModifiedPublicFlags(publicFlags);
        clearAttachments();
    };

    const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setModifiedDisplayName(e.currentTarget.value);
    };

    const handlePublicFlagChange = (offset: number) => {
        setModifiedPublicFlags((s) => s ^ (1 << offset));
    };

    const handleUserUpdate = () => {
        updateUserMutation(
            {
                avatar: attachments[0]?.id,
                displayName: modifiedDisplayName,
                publicFlags: modifiedPublicFlags,
            },
            {
                onSuccess() {
                    clearAttachments();
                },
            },
        );
    };

    const deleteUserAccount = () => {
        actionConfirmationStore.deleteUser(displayName, () => deleteAccountMutation());
    };

    return (
        <div className='pl-8 pt-12'>
            <h1 className='mb-6 text-3xl font-semibold'>{LL.General.MyAccount()}</h1>
            <div className='flex mb-4'>
                <div className='relative mr-8 flex'>
                    {attachments.length !== 0 && (
                        <IconButton
                            intent='danger'
                            className='absolute top-0 right-0'
                            onClick={() => clearAttachments()}
                        >
                            <Trash size={16} />
                        </IconButton>
                    )}
                    <Avatar
                        size='6xl'
                        uri={attachments[0]?.preview}
                        src={avatar}
                        onClick={onFileUploadClick}
                        className='shrink-0 cursor-pointer'
                    />
                </div>
                <label className='flex w-full flex-col' htmlFor='display-name'>
                    <span className='mb-1 text-sm font-medium text-gray-11'>
                        {LL.Inputs.Labels.DisplayName()}
                    </span>
                    <span className='mb-2 text-xs text-gray-11'>{LL.Hints.DisplayName()}</span>
                    <Input
                        id='display-name'
                        placeholder={displayName}
                        onChange={handleDisplayNameChange}
                        isError={isDisplayNameModified && !isModifiedDisplayNameValid}
                        value={modifiedDisplayName}
                    />
                </label>
            </div>
            <div className='flex flex-col'>
                <h1 className='mb-4 text-lg font-semibold text-gray-12'>
                    {LL.General.FriendRequests()}
                </h1>
                <SettingToggle
                    isChecked={(modifiedPublicFlags & (1 << ALLOW_FRIEND_REQUESTS)) !== 0}
                    label={LL.Toggles.Labels.AllowFriendRequests()}
                    helperText={LL.Toggles.HelperText.AllowFriendRequests()}
                    onChange={() => handlePublicFlagChange(ALLOW_FRIEND_REQUESTS)}
                />
                <Divider className='my-6' />
                <h1 className='mb-4 text-lg font-semibold text-gray-12'>
                    {LL.General.ServerPrivacy()}
                </h1>
                <SettingToggle
                    isChecked={(modifiedPublicFlags & (1 << ALLOW_GUILD_MEMBER_DMS)) !== 0}
                    label={LL.Toggles.Labels.AllowServerMemberDMs()}
                    helperText={LL.Toggles.HelperText.AllowServerMemberDMs()}
                    onChange={() => handlePublicFlagChange(ALLOW_GUILD_MEMBER_DMS)}
                />
            </div>
            <Divider className='my-6' />
            <div className='mb-6'>
                <h1 className='mb-2 text-lg font-medium leading-none text-gray-12'>
                    {LL.General.AccountDeletion()}
                </h1>
                <span className='mb-4 block text-xs text-gray-11'>
                    {LL.Hints.AccountDeletion()}
                </span>
                <Button intent='danger' onClick={deleteUserAccount}>
                    {LL.Actions.DeleteAccount()}
                </Button>
            </div>
            <UnsavedSettingsPrompt
                isModified={isModified}
                isValid={isValid}
                onDiscard={discardChanges}
                onSave={handleUserUpdate}
            />
            <UploadWrapper id='user-editor-avatar-update' multiple={false} />
        </div>
    );
};
