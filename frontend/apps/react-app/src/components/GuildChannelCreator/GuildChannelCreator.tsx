import * as RadioGroup from '@radix-ui/react-radio-group';
import { Button } from '@/shared-components/Button';
import { SettingToggle } from '@/shared-components/Settings';
import { Dialog } from '@/shared-components/Dialog';
import { Input } from '@/shared-components/Input';
import { TextArea } from '@/shared-components/TextArea';
import { useCreateGuildChannelMutation } from '@/api/channels/createGuildChannel';
import { GuildRoleListSelector } from '@/shared-components/GuildRoleListSelector/GuildRoleListSelector';
import { useState } from 'react';
import { z } from 'zod';
import { useParams } from 'react-router-dom';
import { guildChannelCreatorStore, useGuildChannelCreatorStore } from '.';
import { Hash, SpeakerSimpleHigh } from '@phosphor-icons/react';
import { RadioGroupItem } from '../../shared-components/RadioGroupItem';
import { useI18nContext } from '../../i18n/i18n-react';

const channelNameSchema = z
    .string()
    .min(3)
    .max(100)
    .refine((s) => !s.includes(' '));
const channelTopicSchema = z.string().min(0).max(512);

export const GuildChannelCreatorContent = ({ isCategory }: { isCategory: boolean }) => {
    const { LL } = useI18nContext();
    const [name, setName] = useState('');
    const [topic, setTopic] = useState('');
    const [stage, setStage] = useState(0);
    const [isPrivate, setIsPrivate] = useState(false);
    const [roles, setRoles] = useState<string[]>([]);
    const [channelType, setChannelType] = useState<'TEXT' | 'VOICE' | 'CATEGORY'>(
        isCategory ? 'CATEGORY' : 'TEXT',
    );

    const { success: isNameValid } = channelNameSchema.safeParse(name);
    const { success: isTopicValid } = channelTopicSchema.safeParse(topic);

    const { guildId = '' } = useParams();

    const togglePrivate = () => setIsPrivate((s) => !s);
    const updateRoles = (roleId: string) =>
        setRoles((s) =>
            s.some((r) => r === roleId) ? s.filter((r) => r !== roleId) : [...s, roleId],
        );
    const nextStage = () => setStage((s) => (s < 1 ? s + 1 : s));
    const prevStage = () => setStage((s) => (s > 0 ? s - 1 : s));

    const getChannelTypeNumber = () => {
        switch (channelType) {
            case 'CATEGORY':
                return 1;
            case 'TEXT':
                return 0;
            case 'VOICE':
                return 4;
        }
    };

    const { mutate: createChannel } = useCreateGuildChannelMutation();

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.currentTarget.value);
    };

    const handleTopicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTopic(e.currentTarget.value);
    };

    const handleChannelTypeChange = (value: string) => {
        setChannelType(value as 'TEXT' | 'VOICE' | 'CATEGORY');
    };

    const handleBackButtonClick = () =>
        stage !== 0 ? prevStage() : guildChannelCreatorStore.close();

    const handleNextButtonClick = () => {
        if (!stage && isPrivate && isNameValid && isTopicValid) {
            nextStage();
        }

        if (
            (!stage && !isPrivate && isNameValid && isTopicValid) ||
            (stage && isNameValid && isTopicValid && isPrivate)
        ) {
            createChannel(
                {
                    name,
                    topic,
                    roles,
                    isPrivate,
                    guildId,
                    channelType: getChannelTypeNumber(),
                },
                {
                    onSuccess: guildChannelCreatorStore.close,
                },
            );
        }
    };

    return (
        <div className='flex w-full flex-col bg-grayA-4'>
            <h1 className='p-4 py-5 text-xl font-semibold text-gray-12'>
                {channelType === 'CATEGORY'
                    ? LL.Actions.CreateCategory()
                    : LL.Actions.CreateChannel()}
            </h1>
            {stage === 0 && !isCategory && (
                <>
                    <div className='mb-6 flex flex-col px-4'>
                        <span className='mb-1.5 text-xs text-gray-11'>
                            {LL.General.ChannelType()}
                        </span>
                        <RadioGroup.Root
                            value={channelType}
                            defaultValue='TEXT'
                            onValueChange={handleChannelTypeChange}
                            className='flex w-full flex-col space-y-2'
                        >
                            <RadioGroupItem
                                name={LL.RadioGroups.Names.Text()}
                                description={LL.RadioGroups.Descriptions.Text()}
                                value='TEXT'
                                isSelected={channelType === 'TEXT'}
                                icon={<Hash size={24} className='shrink-0 text-grayA-11' />}
                            />
                            <RadioGroupItem
                                name={LL.RadioGroups.Names.Voice()}
                                description={LL.RadioGroups.Descriptions.Voice()}
                                value='VOICE'
                                isSelected={channelType === 'VOICE'}
                                icon={
                                    <SpeakerSimpleHigh
                                        size={24}
                                        weight='duotone'
                                        className='shrink-0 text-grayA-11'
                                    />
                                }
                            />
                        </RadioGroup.Root>
                    </div>
                    <div className='mb-6 flex flex-col space-y-3 px-4'>
                        <label className='flex flex-col' htmlFor='channel-name'>
                            <span className='mb-1.5 text-xs text-gray-11'>
                                {LL.Inputs.Labels.ChannelName()}
                            </span>
                            <Input
                                id='channel-name'
                                placeholder={LL.Inputs.Placeholders.ChannelName()}
                                onChange={handleNameChange}
                                value={name}
                                isError={name.trim().length !== 0 && !isNameValid}
                            />
                        </label>
                        <label className='flex flex-col' htmlFor='channel-topic'>
                            <span className='mb-1.5 text-xs text-gray-11'>
                                {LL.Inputs.Labels.ChannelTopic()}
                            </span>
                            <TextArea
                                id='channel-topic'
                                placeholder={LL.Inputs.Placeholders.ChannelTopic()}
                                onChange={handleTopicChange}
                                isError={!isTopicValid}
                                value={topic}
                            />
                        </label>
                    </div>
                    <div className='mb-6 flex flex-col space-y-2 px-4'>
                        <SettingToggle
                            isChecked={isPrivate}
                            label={LL.Toggles.Labels.PrivateChannel()}
                            helperText={LL.Toggles.HelperText.RestrictChannel()}
                            onChange={togglePrivate}
                        />
                    </div>
                </>
            )}
            {stage === 0 && channelType === 'CATEGORY' && (
                <>
                    <div className='mb-6 px-4'>
                        <label className='flex w-full flex-col' htmlFor='category-name'>
                            <span className='mb-1.5 text-xs text-gray-11'>
                                {LL.Inputs.Labels.CategoryName()}
                            </span>
                            <Input
                                id='category-name'
                                onChange={handleNameChange}
                                placeholder={LL.Inputs.Placeholders.CategoryName()}
                                value={name}
                                isError={name.trim().length !== 0 && !isNameValid}
                            />
                        </label>
                    </div>
                    <div className='mb-6 px-4'>
                        <SettingToggle
                            isChecked={isPrivate}
                            label={LL.Toggles.Labels.PrivateCategory()}
                            helperText={LL.Toggles.HelperText.RestrictCategory()}
                            onChange={togglePrivate}
                        />
                    </div>
                </>
            )}
            {stage === 1 && (
                <GuildRoleListSelector checkedRoles={roles} onRoleToggle={updateRoles} />
            )}
            <div className='drop flex justify-between bg-grayA-3 px-4 py-3'>
                <Button intent='link' padding='s' onClick={handleBackButtonClick}>
                    {!stage ? LL.Actions.Cancel() : LL.Actions.Back()}
                </Button>
                <Button onClick={handleNextButtonClick} disabled={!isNameValid || !isTopicValid}>
                    {(!stage && !isPrivate) || !!stage ? LL.Actions.Create() : LL.Actions.Next()}
                </Button>
            </div>
        </div>
    );
};

export const GuildChannelCreator = () => {
    const isOpen = useGuildChannelCreatorStore((s) => s.isOpen);
    const isCategory = useGuildChannelCreatorStore((s) => s.isCategory);

    return (
        <Dialog isOpen={isOpen} onClose={guildChannelCreatorStore.close}>
            <GuildChannelCreatorContent isCategory={isCategory} />
        </Dialog>
    );
};
