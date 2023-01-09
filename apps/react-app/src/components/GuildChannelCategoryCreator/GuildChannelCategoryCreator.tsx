import { Button } from '@/shared-components/Button';
import { Dialog } from '@/shared-components/Dialog';
import { Input } from '@/shared-components/Input';
import { SettingToggle } from '@/shared-components/Settings';
import { useCreateGuildChannelMutation } from '@/api/channel/createGuildChannel';
import { useGuildChannelCategoryCreator } from './hooks/useGuildChannelCategoryCreator';
import { useIsGuildChannelCreatorOpen } from './hooks/useIsGuildChannelCategoryCreatorOpen';
import { guildChannelCategoryCreatorActions } from './stores/useGuildChannelCategoryCreatorStore';
import { GuildRoleListSelector } from '@/shared-components/GuildRoleListSelector/GuildRoleListSelector';

const { nextStage, prevStage, setName, toggleOpen, togglePrivate, updateRoles } =
  guildChannelCategoryCreatorActions;

export const GuildChannelCategoryCreatorContent = () => {
  const guildChannelCategoryCreatorState = useGuildChannelCategoryCreator();
  const { mutateAsync: createChannel } = useCreateGuildChannelMutation();

  if (!guildChannelCategoryCreatorState) {
    return null;
  }

  const { guildId, isNameValid, isPrivate, name, roles, stage } = guildChannelCategoryCreatorState;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.currentTarget.value);
  };

  const handleBackButtonClick = () => (stage !== 0 ? prevStage() : toggleOpen());

  const handleNextButtonClick = async () => {
    if (stage === 0) {
      if (!isPrivate && isNameValid) {
        await createChannel({
          guildId,
          isPrivate,
          name,
          roles,
          type: 1,
        }).then(() => {
          toggleOpen();
        });
      } else if (isPrivate && isNameValid) {
        nextStage();
      }
    } else if (isNameValid && isPrivate) {
      await createChannel({
        guildId,
        isPrivate,
        name,
        roles,
        type: 1,
      }).then(() => {
        toggleOpen();
      });
    }
  };

  return (
    <>
      <h1 className='p-4 py-5 text-xl font-semibold text-gray-12'>Create Category</h1>
      <div className='flex flex-col'>
        {stage === 0 ? (
          <>
            <div className='mb-6 px-4'>
              <label className='flex w-full flex-col' htmlFor='category-name'>
                <span className='mb-1.5 text-xs text-gray-11'>Category Name</span>
                <Input
                  id='category-name'
                  onChange={handleNameChange}
                  placeholder='Category Name'
                  value={name}
                />
              </label>
            </div>
            <div className='mb-6 px-4'>
              <SettingToggle
                isChecked={isPrivate}
                label='Private Category'
                helperText='Private categories are only accessible to specific roles.'
                onChange={togglePrivate}
              />
            </div>
          </>
        ) : (
          <GuildRoleListSelector checkedRoles={roles} onRoleToggle={updateRoles} />
        )}
      </div>
      <div className='flex justify-between bg-grayA-3 px-4 py-3'>
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

export const GuildChannelCategoryCreator = () => {
  const isOpen = useIsGuildChannelCreatorOpen();

  return (
    <Dialog isOpen={isOpen} onClose={toggleOpen}>
      <GuildChannelCategoryCreatorContent />
    </Dialog>
  );
};
