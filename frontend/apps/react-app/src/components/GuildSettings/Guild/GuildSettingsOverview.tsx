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
import { TrashIcon } from '@heroicons/react/24/solid';
import { useUpdateGuildMutation } from '@/api/guilds/updateGuild';
import { GuildCategorySelect } from '@/shared-components/GuildCategorySelect';
import { Guild } from '../../../types';
import { env } from '../../../env';

export const GuildSettingsOverview = ({
  guild: { id, isDiscoverable, name, guildCategoryId, banner, description, icon },
}: {
  guild: Guild;
}) => {
  const [modifiedName, setName] = useState(name);
  const [modifiedDescription, setDescription] = useState(description);
  const [modifiedIsDiscoverable, setIsDiscoverable] = useState(isDiscoverable);
  const [modifiedGuildCategoryId, setGuildCategoryId] = useState(guildCategoryId);

  const modifiedIcon = useCloudinary();
  const modifiedBanner = useCloudinary();

  const { mutate: updateGuild } = useUpdateGuildMutation();

  const isModified =
    name !== modifiedName ||
    description !== modifiedDescription ||
    isDiscoverable !== modifiedIsDiscoverable ||
    modifiedGuildCategoryId !== guildCategoryId ||
    modifiedBanner.attachments.length !== 0 ||
    modifiedIcon.attachments.length !== 0;

  const isValid = modifiedName.trim() !== '';
  const changesCanBeApplied =
    isValid &&
    (isModified ||
      modifiedIcon.attachments.length !== 0 ||
      modifiedBanner.attachments.length !== 0);

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
    setName(name);
    setDescription(description);
    setIsDiscoverable(isDiscoverable);
    modifiedIcon.clearAttachments();
    modifiedBanner.clearAttachments();
  };

  return (
    <>
      <div className='pl-8 pt-12'>
        <h1 className='mb-6 text-3xl font-semibold text-gray-12'>Overview</h1>
        <div className='mb-8 flex'>
          <div className='relative flex'>
            {modifiedIcon.attachments[0]?.preview && (
              <IconButton
                intent='danger'
                className='absolute top-0 right-0'
                onClick={() => modifiedIcon.clearAttachments()}
              >
                <TrashIcon className='h-4 w-4' />
              </IconButton>
            )}
            <Avatar
              uri={modifiedIcon.attachments[0]?.preview}
              src={icon}
              size='6xl'
              onClick={
                modifiedIcon.attachments[0]?.preview ? void 0 : modifiedIcon.onFileUploadClick
              }
              fallback={name[0] + 'S'}
            />
          </div>
          <div className='ml-8 flex w-full flex-col space-y-4'>
            <label className='flex w-full flex-col' htmlFor='guild-name'>
              <span className='mb-1.5 text-sm text-gray-11'>Server Name</span>
              <Input
                id='guild-name'
                placeholder='Give your server a name'
                onChange={(e) => setName(e.currentTarget.value)}
                value={modifiedName}
              />
            </label>
            <label className='flex w-full flex-col' htmlFor='guild-description'>
              <span className='mb-1.5 text-sm text-gray-11'>Server Description</span>
              <TextArea
                id='guild-description'
                placeholder="What's your server about"
                onChange={(e) => setDescription(e.currentTarget.value)}
                value={modifiedDescription ?? ''}
              />
            </label>
          </div>
        </div>
        <Divider className='my-6' />
        <h1 className='mb-4 text-lg font-semibold text-gray-12'>Discovery</h1>
        <ul className='space-y-6'>
          <SettingToggle
            isChecked={modifiedIsDiscoverable}
            label='Discoverable'
            helperText='Set server visibility in server browser.'
            onChange={() => setIsDiscoverable((s) => !s)}
          />
          <div className='flex flex-col'>
            <span className='mb-1.5 text-sm text-gray-11'>Server Category</span>
            <GuildCategorySelect
              onSelect={setGuildCategoryId}
              value={modifiedGuildCategoryId ?? ''}
            />
          </div>
        </ul>
        <Divider className='my-6' />
        <h1 className='mb-4 text-lg font-semibold text-gray-12'>Display</h1>
        <div className='mb-6 flex justify-between'>
          <div className='flex flex-col'>
            <h2 className='text-sm font-medium text-gray-12'>Server Banner</h2>
            <span className='mb-auto text-sm text-gray-11'>
              This image will display at the top of your channels list.
            </span>
            <Button id='guild-banner' onClick={modifiedBanner.onFileUploadClick}>
              Change Banner
            </Button>
          </div>
          <div className='relative flex w-min rounded'>
            {modifiedBanner.attachments.length !== 0 && (
              <div className='absolute right-1.5 top-1.5 z-10 rounded'>
                <IconButton
                  intent='danger'
                  shape='sqircle'
                  padding='s'
                  onClick={() => modifiedBanner.deleteAttachment(modifiedBanner.attachments[0].id)}
                >
                  <TrashIcon className='h-4 w-4' />
                </IconButton>
              </div>
            )}
            <div className='flex overflow-hidden rounded'>
              <Image
                src={modifiedBanner.attachments[0]?.preview ?? env.cloudinaryResUrl + banner}
              />
            </div>
          </div>
        </div>
        <Divider className='my-6' />
        <UnsavedSettingsPrompt
          isVisible={changesCanBeApplied}
          onDiscard={discardChanges}
          onSave={saveChanges}
        />
      </div>
      <modifiedIcon.UploadWrapper id='server-editor-icon-update' multiple={false} />
      <modifiedBanner.UploadWrapper id='server-editor-banner-update' multiple={false} />
    </>
  );
};
