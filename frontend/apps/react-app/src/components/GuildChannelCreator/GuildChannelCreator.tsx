import * as RadioGroup from '@radix-ui/react-radio-group';
import { HashtagIcon, SpeakerWaveIcon } from '@heroicons/react/20/solid';
import { Button } from '@/shared-components/Button';
import { SettingToggle } from '@/shared-components/Settings';
import { Dialog } from '@/shared-components/Dialog';
import { Input } from '@/shared-components/Input';
import { TextArea } from '@/shared-components/TextArea';
import { RadioGroupItem } from './RadioGroupItem';
import { useGuildChannelCreator } from './hooks/useGuildChannelCreator';
import { useCreateGuildChannelMutation } from '@/api/channels/createGuildChannel';
import { useIsGuildChannelCreatorOpen } from './hooks/useIsGuildChannelCreatorOpen';
import { guildChannelCreatorStore } from './stores/useGuildChannelCreatorStore';
import { GuildRoleListSelector } from '@/shared-components/GuildRoleListSelector/GuildRoleListSelector';

const { nextStage, prevStage, setName, setTopic, setType, toggleOpen, togglePrivate, updateRoles } =
  guildChannelCreatorStore;

export const GuildChannelCreatorContent = () => {
  const guildChannelCreatorState = useGuildChannelCreator();
  const { mutateAsync: createChannel } = useCreateGuildChannelMutation();

  if (!guildChannelCreatorState) {
    return null;
  }

  const { guildId, isNameValid, isPrivate, name, roles, topic, type, stage } =
    guildChannelCreatorState;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.currentTarget.value);
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTopic(e.currentTarget.value);
  };

  const handleBackButtonClick = () => (stage !== 0 ? prevStage() : toggleOpen());

  const handleNextButtonClick = async () => {
    if (stage === 0) {
      if (!isPrivate && isNameValid) {
        await createChannel({
          topic,
          name,
          roles,
          isPrivate,
          guildId,
          channelType: type === 'TEXT' ? 0 : 4,
        }).then(() => {
          toggleOpen();
        });
      } else if (isPrivate && isNameValid) {
        nextStage();
      }
    } else if (isNameValid && isPrivate) {
      await createChannel({
        topic,
        name,
        roles,
        isPrivate,
        guildId,
        channelType: type === 'TEXT' ? 0 : 4,
      }).then(() => {
        toggleOpen();
      });
    }
  };

  return (
    <>
      <h1 className='p-4 py-5 text-xl font-semibold text-gray-12'>Create Channel</h1>
      {stage === 0 ? (
        <>
          <div className='mb-6 flex flex-col px-4'>
            <span className='mb-1.5 text-xs text-gray-11'>Channel Type</span>
            <RadioGroup.Root
              value={type}
              defaultValue='TEXT'
              onValueChange={setType}
              className='flex w-full flex-col space-y-2'
            >
              <RadioGroupItem
                name='Text'
                description='A text channel'
                value='TEXT'
                isSelected={type === 'TEXT'}
                icon={<HashtagIcon className='h-6 w-6 shrink-0 text-gray-11' />}
              />

              <RadioGroupItem
                name='Voice'
                description='A voice channel'
                value='VOICE'
                isSelected={type === 'VOICE'}
                icon={<SpeakerWaveIcon className='h-6 w-6 shrink-0 text-gray-11' />}
              />
            </RadioGroup.Root>
          </div>
          <div className='mb-6 flex flex-col space-y-3 px-4'>
            <label className='flex flex-col' htmlFor='channel-name'>
              <span className='mb-1.5 text-xs text-gray-11'>Channel Name</span>
              <Input
                id='channel-name'
                placeholder='Channel name'
                onChange={handleNameChange}
                value={name}
              />
            </label>
            <label className='flex flex-col' htmlFor='channel-topic'>
              <span className='mb-1.5 text-xs text-gray-11'>Channel Topic</span>
              <TextArea
                id='channel-topic'
                placeholder='Channel topic'
                onChange={handleTopicChange}
                value={topic}
              />
            </label>
          </div>
          <div className='mb-6 flex flex-col space-y-2 px-4'>
            <SettingToggle
              isChecked={isPrivate}
              label='Private Channel'
              helperText='Private channels are only accessible to specific roles.'
              onChange={togglePrivate}
            />
          </div>
        </>
      ) : (
        <GuildRoleListSelector checkedRoles={roles} onRoleToggle={updateRoles} />
      )}
      <div className='drop flex justify-between bg-grayA-3 px-4 py-3'>
        <Button intent='link' padding='s' onClick={handleBackButtonClick}>
          {!stage ? 'Cancel' : 'Back'}
        </Button>
        <Button onClick={handleNextButtonClick} disabled={!isNameValid}>
          {(!stage && !isPrivate) || !!stage ? 'Create' : 'Next'}
        </Button>
      </div>
    </>
  );
};

export const GuildChannelCreator = () => {
  const isOpen = useIsGuildChannelCreatorOpen();
  return (
    <Dialog isOpen={isOpen} onClose={toggleOpen} className='flex w-full flex-col'>
      <GuildChannelCreatorContent />
    </Dialog>
  );
};
