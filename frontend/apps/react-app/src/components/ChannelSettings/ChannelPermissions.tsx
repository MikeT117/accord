import { useState } from 'react';
import { UnsavedSettingsPrompt } from '@/shared-components/Settings/UnsavedSettingsPrompt';
import { SettingToggle } from '@/shared-components/Settings';
import { GuildRoleListItem } from '@/components/GuildSettings/GuildRoles/GuildRoleEditor/GuildRoleListItem';
import { Input } from '@/shared-components/Input';
import { Button } from '@/shared-components/Button';
import { ListItem } from '@/shared-components/ListItem';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { GuildChannel, GuildRole } from '../../types';

export const ChannelPermissions = ({
  assignedRoles,
  defaultRole,
  isPrivate,
  parentId,
  channelType,
  onAssignGuildChannelRole,
  onSyncGuildChannelRoles,
  onUnassignGuildChannelRole,
}: Pick<GuildChannel, 'parentId' | 'channelType'> & {
  onAssignGuildChannelRole: (roleId: string) => void;
  onUnassignGuildChannelRole: (roleId: string) => void;
  onSyncGuildChannelRoles: () => void;
  isPrivate: boolean;
  defaultRole: GuildRole;
  assignedRoles: GuildRole[];
}) => {
  const [modifiedIsPrivate, setModifiedPrivate] = useState(isPrivate);
  const [roleFilter, setRoleFilter] = useState('');

  const filteredRoles = roleFilter
    ? assignedRoles.filter((r) => r.name.toLowerCase().includes(roleFilter.toLowerCase()))
    : assignedRoles;

  const handleDiscardChanges = () => {
    setModifiedPrivate(isPrivate);
  };

  const handleSaveChanges = () => {
    if (typeof modifiedIsPrivate === 'boolean' && modifiedIsPrivate === true) {
      onUnassignGuildChannelRole(defaultRole.id);
    } else if (typeof modifiedIsPrivate === 'boolean' && modifiedIsPrivate === false) {
      onAssignGuildChannelRole(defaultRole.id);
    }
  };

  return (
    <div className='w-full pl-8 pt-12'>
      <h1 className='mb-6 text-3xl font-semibold text-gray-12'>Permissions</h1>
      {
        /*parentRoleSync */ true && (
          <span className='mb-3 block text-sm text-gray-11'>
            Permissions for this channel are synced with the parent category.
          </span>
        )
      }
      {parentId && !true /*parentRoleSync*/ && (
        <ListItem intent='secondary' className='mb-3' isHoverable={false}>
          <ArrowPathIcon className='h-5 w-5' />
          <span className='ml-3 mr-auto text-sm'>Permissions are not synced with Category</span>
          <Button padding='s' onClick={onSyncGuildChannelRoles}>
            Sync Now
          </Button>
        </ListItem>
      )}
      <div className='mb-6 flex'>
        <SettingToggle
          isChecked={modifiedIsPrivate ?? isPrivate}
          label={`Private ${channelType !== 1 ? 'Channel' : 'Category'}`}
          helperText={`Restrict ${channelType !== 1 ? 'channel' : 'category'} to specific roles`}
          onChange={() => setModifiedPrivate(!modifiedIsPrivate)}
        />
      </div>
      <div className='mb-6'>
        <Input
          placeholder='Filter Roles'
          onChange={(e) => setRoleFilter(e.currentTarget.value)}
          value={roleFilter}
        />
      </div>
      <div className='mb-6 flex flex-col space-y-2'>
        <span className='text-sm text-gray-11'>
          Assigned Roles - {filteredRoles ? filteredRoles.length : 0}
        </span>
        {filteredRoles && (
          <ul className='space-y-2'>
            {filteredRoles.map((r) => (
              <GuildRoleListItem
                key={r.id}
                name={r.name}
                onDeleteRole={() => onUnassignGuildChannelRole(r.id)}
              />
            ))}
          </ul>
        )}
      </div>
      <UnsavedSettingsPrompt
        isVisible={modifiedIsPrivate !== isPrivate}
        onDiscard={handleDiscardChanges}
        onSave={handleSaveChanges}
      />
    </div>
  );
};
