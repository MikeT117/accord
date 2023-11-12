import * as Tabs from '@radix-ui/react-tabs';
import { GuildRoleEditorAssignedMembers } from './GuildRoleEditorAssignedMembers';
import {
  GuildRoleEditorAssignMembersDialogContent,
  GuildRoleEditorAssignMembersDialog,
} from './GuildRoleEditorAssignMembersDialog';
import { GuildRoleEditorDisplay } from './GuildRoleEditorDisplay';
import { GuildRoleEditorPermissions } from './GuildRoleEditorPermissions';
import { GuildRole } from '../../../../types';

export const GuildRoleEditor = ({ editingRole }: { editingRole: GuildRole }) => {
  return (
    <div className='flex w-full flex-col pt-12 pl-4'>
      <h1 className='text-1xl mb-6 font-semibold text-gray-12'>Edit Role - {editingRole.name}</h1>
      <Tabs.Root defaultValue='DISPLAY' className='mb-2'>
        <Tabs.List className='mb-6'>
          <Tabs.Trigger
            value='DISPLAY'
            className='py-2 pr-12 text-sm font-semibold text-gray-12 [&[data-state="active"]]:border-b [&[data-state="active"]]:border-gray-8'
          >
            Display
          </Tabs.Trigger>
          <Tabs.Trigger
            value='PERMISSIONS'
            className='py-2 pr-12 text-sm font-semibold text-gray-12 [&[data-state="active"]]:border-b [&[data-state="active"]]:border-gray-8'
          >
            Permissions
          </Tabs.Trigger>
          <Tabs.Trigger
            value='MEMBERS'
            className='py-2 pr-12 text-sm font-semibold text-gray-12 [&[data-state="active"]]:border-b [&[data-state="active"]]:border-gray-8'
          >
            Members
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value='DISPLAY'>
          <GuildRoleEditorDisplay role={editingRole} isEditable={editingRole.name !== '@default'} />
        </Tabs.Content>
        <Tabs.Content value='PERMISSIONS'>
          <GuildRoleEditorPermissions role={editingRole} />
        </Tabs.Content>
        <Tabs.Content value='MEMBERS'>
          <GuildRoleEditorAssignedMembers
            role={editingRole}
            isEditable={editingRole.name !== '@default'}
          />
          <GuildRoleEditorAssignMembersDialog>
            <GuildRoleEditorAssignMembersDialogContent guildRole={editingRole} />
          </GuildRoleEditorAssignMembersDialog>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};
