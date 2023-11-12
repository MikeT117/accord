import { Avatar } from '@/shared-components/Avatar';
import { IconButton } from '@/shared-components/IconButton';
import { Button } from '@/shared-components/Button';
import { Input } from '@/shared-components/Input';
import { useCloudinary } from '@/shared-hooks';
import { TrashIcon } from '@heroicons/react/24/solid';
import { Dialog } from '@/shared-components/Dialog';
import { SettingToggle } from '@/shared-components/Settings';
import { guildCreatorStore } from './stores/useGuildCreatorStore';
import { useGuildCreator } from './hooks/useGuildCreator';
import { useCreateGuildMutation } from '@/api/guilds/createGuild';
import { useIsGuildCreatorOpen } from './hooks/useIsGuildCreatorOpen';
import { GuildCategorySelect } from '@/shared-components/GuildCategorySelect';

const { setName, toggleDiscoverable, toggleOpen, setGuildCategoryId } = guildCreatorStore;

export const GuildCreatorContent = () => {
  const guildCreatorState = useGuildCreator();
  const { attachments, UploadWrapper, clearAttachments, onFileUploadClick } = useCloudinary();
  const { mutate: createGuild } = useCreateGuildMutation();

  if (!guildCreatorState) {
    return null;
  }

  const { isDiscoverable, isNameValid, name, guildCategoryId, isGuildCategoryValid } =
    guildCreatorState;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.currentTarget.value);
  };

  const handleClearAttachments = () => {
    clearAttachments();
  };

  const handleCreateButtonClick = async () => {
    await createGuild({
      name,
      isDiscoverable,
      icon: attachments[0]?.id,
      guildCategoryId: guildCategoryId,
    });
    toggleOpen();
  };

  return (
    <>
      <h1 className='p-4 py-5 text-xl font-semibold text-gray-12'>Create Server</h1>
      <div className='relative flex w-min justify-center self-center'>
        {attachments.length !== 0 && (
          <IconButton
            className='absolute right-0 top-0'
            intent='dangerSolid'
            onClick={handleClearAttachments}
          >
            <TrashIcon className='h-4 w-4' />
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
        <span className='text-xs text-gray-11'>Server Name</span>
        <Input id='guild-name' placeholder='Server Name' onChange={handleNameChange} value={name} />
      </label>
      <div className='mb-6 px-4'>
        <SettingToggle
          isChecked={isDiscoverable}
          label='Discoverable'
          helperText='Set server visibility in server browser.'
          onChange={toggleDiscoverable}
        />
      </div>

      <div className='mb-6 flex w-full flex-col space-y-2 px-4'>
        <span className='text-xs text-gray-11'>Server Category</span>
        <GuildCategorySelect onSelect={setGuildCategoryId} value={guildCategoryId} />
      </div>
      <div className='flex justify-between bg-grayA-3 px-4 py-3'>
        <Button onClick={toggleOpen} intent='link'>
          Cancel
        </Button>
        <Button onClick={handleCreateButtonClick} disabled={!isNameValid && !isGuildCategoryValid}>
          Create
        </Button>
      </div>
      <UploadWrapper id='guild-creator-guild-icon' />
    </>
  );
};

export const GuildCreator = () => {
  const isOpen = useIsGuildCreatorOpen();
  return (
    <Dialog onClose={toggleOpen} isOpen={isOpen} className='flex w-full flex-col'>
      <GuildCreatorContent />
    </Dialog>
  );
};
