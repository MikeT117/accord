import { useState } from 'react';
import { UnsavedSettingsPrompt } from '@/shared-components/Settings/UnsavedSettingsPrompt';
import { Input } from '@/shared-components/Input';
import { TextArea } from '@/shared-components/TextArea';
import { GuildChannel } from '../../types';

export const ChannelOverview = ({
  name,
  channelType,
  topic,
  onChannelUpdate,
}: Pick<GuildChannel, 'name' | 'channelType' | 'topic'> & {
  onChannelUpdate: (name: string, topic: string) => void;
}) => {
  const [modifiedName, setName] = useState<string>(name);
  const [modifiedTopic, setTopic] = useState<string>(topic);

  const isNameModified = modifiedName !== name;
  const isTopicModified = modifiedTopic !== topic;
  const changesCanBeApplied = isNameModified || isTopicModified;

  const handleDiscardClick = () => {
    setName(name);
    setTopic(topic);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.currentTarget.value);
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTopic(e.currentTarget.value);
  };

  return (
    <div className='pl-8 pt-12'>
      <h1 className='mb-6 text-3xl font-semibold text-gray-12'>Overview</h1>
      <div className='mb-8 flex flex-col space-y-4'>
        <label className='flex flex-col' htmlFor='channel-name'>
          <span className='mb-1.5 text-sm text-gray-11'>
            {channelType !== 1 ? 'Channel' : 'Category'} Name
          </span>
          <Input
            id='channel-name'
            placeholder='Enter a displayname'
            onChange={handleNameChange}
            value={modifiedName ?? name ?? ''}
          />
        </label>
        {channelType === 0 && (
          <label htmlFor='channel-topic' className='flex flex-col'>
            <span className='mb-1.5 text-sm text-gray-11'>Channel Topic</span>
            <TextArea
              id='channel-topic'
              placeholder='Channel topic'
              onChange={handleTopicChange}
              value={modifiedTopic ?? topic}
            />
          </label>
        )}
      </div>
      <UnsavedSettingsPrompt
        isVisible={changesCanBeApplied}
        onDiscard={handleDiscardClick}
        onSave={() => onChannelUpdate(modifiedName, modifiedTopic)}
      />
    </div>
  );
};
