import { useState } from 'react';
import { Avatar } from '@/shared-components/Avatar';
import { UnsavedSettingsPrompt } from '@/shared-components/Settings/UnsavedSettingsPrompt';
import { SettingToggle } from '@/shared-components/Settings';
import { useCloudinary } from '@/shared-hooks';
import { Input } from '@/shared-components/Input';
import { TextArea } from '@/shared-components/TextArea';
import { Button } from '@/shared-components/Button';
import { Divider } from '@/shared-components/Divider';
import { Image } from '@/shared-components/Image';
import { IconButton } from '@/shared-components/IconButton';
import { useUpdateGuildMutation } from '@/api/guilds/updateGuild';
import { GuildCategorySelect } from '@/shared-components/GuildCategorySelect';
import { Guild } from '../../../types';
import { env } from '../../../env';
import { z } from 'zod';
import { Trash } from '@phosphor-icons/react';
import { useI18nContext } from '../../../i18n/i18n-react';

const guildNameSchema = z.string().min(3).max(100);
const guildDescriptionSchema = z.string().min(0).max(500);

export const GuildSettingsOverview = ({
    id,
    isDiscoverable,
    name,
    guildCategoryId,
    banner,
    description,
    icon,
}: Pick<
    Guild,
    'id' | 'isDiscoverable' | 'name' | 'guildCategoryId' | 'banner' | 'description' | 'icon'
>) => {
    const { LL } = useI18nContext();
    const [modifiedName, setModifiedName] = useState(name);
    const [modifiedDescription, setModifiedDescription] = useState(description);
    const [modifiedIsDiscoverable, setIsDiscoverable] = useState(isDiscoverable);
    const [modifiedGuildCategoryId, setGuildCategoryId] = useState(guildCategoryId);

    const modifiedIcon = useCloudinary();
    const modifiedBanner = useCloudinary();
    const { mutate: updateGuild } = useUpdateGuildMutation();

    const isModified =
        modifiedName.trim() !== name ||
        modifiedDescription.trim() !== description ||
        modifiedIsDiscoverable !== isDiscoverable ||
        modifiedGuildCategoryId !== guildCategoryId ||
        modifiedBanner.attachments.length !== 0 ||
        modifiedIcon.attachments.length !== 0;

    const { success: isModifiedNameValid } = guildNameSchema.safeParse(modifiedName);
    const { success: isModifiedDescriptionValid } =
        guildDescriptionSchema.safeParse(modifiedDescription);

    const isValid = isModifiedNameValid && isModifiedDescriptionValid;

    const saveChanges = () => {
        updateGuild({
            id,
            name: modifiedName,
            description: modifiedDescription,
            isDiscoverable: modifiedIsDiscoverable,
            icon: modifiedIcon.attachments[0]?.id,
            banner: modifiedBanner.attachments[0]?.id,
            categoryId: modifiedGuildCategoryId,
        });
        modifiedIcon.clearAttachments();
        modifiedBanner.clearAttachments();
    };

    const discardChanges = () => {
        setModifiedName(name);
        setModifiedDescription(description);
        setIsDiscoverable(isDiscoverable);
        modifiedIcon.clearAttachments();
        modifiedBanner.clearAttachments();
    };

    const handleSetModifiedName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setModifiedName(e.currentTarget.value);
    };

    const handleSetModifiedDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setModifiedDescription(e.currentTarget.value);
    };

    const handleGuildIconChange = () => {
        if (modifiedIcon.attachments.length !== 0) {
            return;
        }
        modifiedIcon.onFileUploadClick();
    };

    const handleGuildBannerDelete = () => {
        modifiedBanner.deleteAttachment(modifiedBanner.attachments[0].id);
    };

    return (
        <>
            <div className='pl-8 pt-12'>
                <h1 className='mb-6 text-3xl font-semibold text-gray-12'>
                    {LL.General.Overview()}
                </h1>
                <div className='mb-8 flex'>
                    <div className='relative flex'>
                        {modifiedIcon.attachments[0]?.preview && (
                            <IconButton
                                intent='danger'
                                className='absolute top-0 right-0'
                                onClick={modifiedIcon.clearAttachments}
                            >
                                <Trash size={16} />
                            </IconButton>
                        )}
                        <modifiedIcon.UploadWrapper id='server-editor-icon-update' multiple={false}>
                            <Avatar
                                uri={modifiedIcon.attachments[0]?.preview}
                                src={icon}
                                size='6xl'
                                onClick={handleGuildIconChange}
                                fallback={name[0] + 'S'}
                            />
                        </modifiedIcon.UploadWrapper>
                    </div>
                    <div className='ml-8 flex w-full flex-col space-y-4'>
                        <label className='flex w-full flex-col' htmlFor='guild-name'>
                            <span className='mb-1.5 text-sm text-gray-11'>
                                {LL.Inputs.Labels.ServerName()}
                            </span>
                            <Input
                                id='guild-name'
                                placeholder={LL.Inputs.Placeholders.ServerName()}
                                onChange={handleSetModifiedName}
                                isError={modifiedName !== name && !isModifiedNameValid}
                                value={modifiedName}
                            />
                        </label>
                        <label className='flex w-full flex-col' htmlFor='guild-description'>
                            <span className='mb-1.5 text-sm text-gray-11'>
                                {LL.Inputs.Labels.ServerDescription()}
                            </span>
                            <TextArea
                                id='guild-description'
                                placeholder={LL.Inputs.Placeholders.ServerDescription()}
                                onChange={handleSetModifiedDescription}
                                value={modifiedDescription}
                            />
                        </label>
                    </div>
                </div>
                <Divider className='my-6' />
                <h1 className='mb-4 text-lg font-semibold text-gray-12'>
                    {LL.General.Discovery()}
                </h1>
                <ul className='space-y-6'>
                    <SettingToggle
                        isChecked={modifiedIsDiscoverable}
                        label={LL.Toggles.Labels.Discoverable()}
                        helperText={LL.Toggles.HelperText.Discoverable()}
                        onChange={() => setIsDiscoverable((s) => !s)}
                    />
                    <div className='flex flex-col'>
                        <span className='mb-1.5 text-sm text-gray-11'>
                            {LL.General.ServerCategory()}
                        </span>
                        <GuildCategorySelect
                            onSelect={setGuildCategoryId}
                            value={modifiedGuildCategoryId ?? guildCategoryId ?? ''}
                        />
                    </div>
                </ul>
                <Divider className='my-6' />
                <h1 className='mb-4 text-lg font-semibold text-gray-12'>{LL.General.Display()}</h1>
                <div className='mb-6 flex justify-between'>
                    <div className='flex flex-col'>
                        <h2 className='text-sm font-medium text-gray-12'>
                            {LL.General.ServerBanner()}
                        </h2>
                        <span className='mb-auto text-sm text-gray-11'>
                            {LL.General.ImageDisplay()}
                        </span>
                        <Button
                            id='server-editor-banner-update-btn'
                            onClick={modifiedBanner.onFileUploadClick}
                        >
                            {LL.Actions.ChangeBanner()}
                        </Button>
                    </div>
                    <div className='relative flex w-min rounded-md'>
                        {modifiedBanner.attachments.length !== 0 && (
                            <div className='absolute right-1.5 top-1.5 z-10 rounded-md'>
                                <IconButton
                                    intent='dangerSolid'
                                    shape='squircle'
                                    padding='s'
                                    onClick={handleGuildBannerDelete}
                                >
                                    <Trash size={16} />
                                </IconButton>
                            </div>
                        )}
                        <div className='flex overflow-hidden rounded-md'>
                            <Image
                                src={
                                    modifiedBanner.attachments[0]?.preview ??
                                    env.cloudinaryResUrl + banner
                                }
                            />
                        </div>
                    </div>
                </div>
                <Divider className='my-6' />
                <UnsavedSettingsPrompt
                    isModified={isModified}
                    isValid={isValid}
                    onDiscard={discardChanges}
                    onSave={saveChanges}
                />
            </div>
            <modifiedBanner.UploadWrapper id='server-editor-banner-update' multiple={false} />
        </>
    );
};
