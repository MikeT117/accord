import { useState } from 'react';
import { UnsavedSettingsPrompt } from '@/shared-components/Settings/UnsavedSettingsPrompt';
import { Input } from '@/shared-components/Input';
import { TextArea } from '@/shared-components/TextArea';
import { GuildChannel } from '../../types';
import { z } from 'zod';
import { useI18nContext } from '../../i18n/i18n-react';

const channelNameSchema = z.string().min(3).max(100);
const channelTopicSchema = z.string().min(0).max(512);

export const ChannelOverview = ({
    name,
    channelType,
    topic,
    onChannelUpdate,
}: Pick<GuildChannel, 'name' | 'topic' | 'channelType'> & {
    onChannelUpdate: (name: string, topic: string) => void;
}) => {
    const { LL } = useI18nContext();
    const [modifiedName, setName] = useState(name);
    const [modifiedTopic, setTopic] = useState(topic);

    const { success: isModifiedNameValid } = channelNameSchema.safeParse(modifiedName);
    const { success: isModifiedTopicValid } = channelTopicSchema.safeParse(modifiedTopic);

    const isNameModified = modifiedName.trim().length !== 0 && modifiedName.trim() !== name;
    const isTopicModified = modifiedTopic.trim().length !== 0 && modifiedTopic.trim() !== topic;

    const isValid = isModifiedNameValid && isModifiedTopicValid;
    const isModified = isNameModified || isTopicModified;

    const handleDiscardClick = () => {
        setName('');
        setTopic('');
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.currentTarget.value);
    };

    const handleTopicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTopic(e.currentTarget.value);
    };

    const handleChannelUpdate = () => {
        onChannelUpdate(
            isNameModified && isModifiedNameValid ? modifiedName : name,
            isTopicModified && isModifiedTopicValid ? modifiedTopic : topic,
        );
    };

    return (
        <div className='pl-8 pt-12'>
            <h1 className='mb-6 text-3xl font-semibold text-gray-12'>{LL.General.Overview()}</h1>
            <div className='mb-8 flex flex-col space-y-4'>
                <label className='flex flex-col' htmlFor='channel-name'>
                    <span className='mb-1.5 text-sm text-gray-11'>
                        {channelType !== 1
                            ? LL.Inputs.Labels.ChannelName()
                            : LL.Inputs.Labels.CategoryName()}
                    </span>
                    <Input
                        id='channel-name'
                        placeholder={LL.Inputs.Placeholders.EnterName()}
                        onChange={handleNameChange}
                        isError={isNameModified && !isModifiedNameValid}
                        value={modifiedName}
                    />
                </label>
                {channelType === 0 && (
                    <label htmlFor='channel-topic' className='flex flex-col'>
                        <span className='mb-1.5 text-sm text-gray-11'>Channel Topic</span>
                        <TextArea
                            id='channel-topic'
                            placeholder={LL.Inputs.Placeholders.EnterTopic()}
                            onChange={handleTopicChange}
                            isError={isTopicModified && !isModifiedTopicValid}
                            value={modifiedTopic}
                        />
                    </label>
                )}
            </div>
            <UnsavedSettingsPrompt
                isModified={isModified}
                isValid={isValid}
                onDiscard={handleDiscardClick}
                onSave={handleChannelUpdate}
            />
        </div>
    );
};
