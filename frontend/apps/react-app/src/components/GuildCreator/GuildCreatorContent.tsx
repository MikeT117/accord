import { Avatar } from '@/shared-components/Avatar';
import { IconButton } from '@/shared-components/IconButton';
import { Button } from '@/shared-components/Button';
import { Input } from '@/shared-components/Input';
import { useCloudinary } from '@/shared-hooks';
import { SettingToggle } from '@/shared-components/Settings';
import { guildCreatorStore } from './stores/guildCreatorStore';
import { useCreateGuildMutation } from '@/api/guilds/createGuild';
import { GuildCategorySelect } from '@/shared-components/GuildCategorySelect';
import { z } from 'zod';
import { useState } from 'react';
import { Trash } from '@phosphor-icons/react';
import { useI18nContext } from '../../i18n/i18n-react';

const guildNameSchema = z
    .string()
    .trim()
    .min(3)
    .max(100)
    .regex(/^[a-zA-Z\s]*$/);

export const GuildCreatorContent = () => {
    const { LL } = useI18nContext();
    const [name, setName] = useState({ value: '', isValid: false });
    const [isDiscoverable, setIsDiscoverable] = useState(false);
    const [guildCategoryId, setGuildCategoryId] = useState<string | undefined>(undefined);

    const { attachments, UploadWrapper, clearAttachments, onFileUploadClick } = useCloudinary();
    const { mutate: createGuild } = useCreateGuildMutation();

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        const { success } = guildNameSchema.safeParse(value);
        setName({ value, isValid: success });
    };

    const handleIsDiscoverableChange = () => {
        setIsDiscoverable((s) => !s);
    };

    const handleCreateButtonClick = () => {
        createGuild(
            {
                name: name.value,
                isDiscoverable,
                guildCategoryId,
                icon: attachments[0]?.id,
            },
            {
                onSuccess() {
                    guildCreatorStore.close();
                },
            },
        );
    };

    return (
        <div className='flex w-full flex-col bg-grayA-4'>
            <h1 className='p-4 py-5 text-xl font-semibold text-gray-12'>
                {LL.General.CreateServer()}
            </h1>
            <div className='relative flex w-min justify-center self-center'>
                {attachments.length !== 0 && (
                    <IconButton
                        className='absolute right-0 top-0'
                        intent='dangerSolid'
                        onClick={clearAttachments}
                    >
                        <Trash size={16} />
                    </IconButton>
                )}
                <Avatar
                    size='4xl'
                    uri={attachments[0]?.preview}
                    fallback='Icon'
                    onClick={onFileUploadClick}
                />
            </div>
            <label className='mb-6 flex w-full flex-col space-y-2 px-4' htmlFor='guild-name'>
                <span className='text-xs text-gray-11'>{LL.Inputs.Labels.ServerName()}</span>
                <Input
                    id='guild-name'
                    placeholder={LL.Inputs.Placeholders.ServerName()}
                    onChange={handleNameChange}
                    value={name.value}
                    isError={!name.isValid}
                />
            </label>
            <div className='mb-6 px-4'>
                <SettingToggle
                    isChecked={isDiscoverable}
                    label={LL.Toggles.Labels.Discoverable()}
                    helperText={LL.Toggles.HelperText.Discoverable()}
                    onChange={handleIsDiscoverableChange}
                />
            </div>
            <div className='mb-6 flex w-full flex-col space-y-2 px-4'>
                <span className='text-xs text-gray-11'>{LL.General.ServerCategory()}</span>
                <GuildCategorySelect onSelect={setGuildCategoryId} value={guildCategoryId} />
            </div>
            <div className='flex justify-between bg-grayA-3 px-4 py-3'>
                <Button onClick={guildCreatorStore.close} intent='link'>
                    {LL.Actions.Cancel()}
                </Button>
                <Button onClick={handleCreateButtonClick} disabled={!name.isValid}>
                    {LL.Actions.Create()}
                </Button>
            </div>
            <UploadWrapper id='guild-creator-guild-icon' />
        </div>
    );
};
