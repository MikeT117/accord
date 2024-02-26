import * as Tabs from '@radix-ui/react-tabs';
import { GuildRoleEditorAssignedMembers } from './GuildRoleEditorAssignedMembers';
import { GuildRoleEditorDisplay } from './GuildRoleEditorDisplay';
import { GuildRoleEditorPermissions } from './GuildRoleEditorPermissions';
import { GuildRole } from '../../../../types';
import { useI18nContext } from '../../../../i18n/i18n-react';
import { GuildRoleEditorAssignMembersDialog } from './GuildRoleEditorAssignMembersDialog';
import { GuildRoleEditorAssignMembersContent } from './GuildRoleEditorAssignMembersDialogContent';

export const GuildRoleEditor = ({
    role,
    isNameMutable = true,
    isPermisssionsMutable = true,
    isMembersMutable = true,
}: {
    role: GuildRole;
    isNameMutable: boolean;
    isPermisssionsMutable: boolean;
    isMembersMutable: boolean;
}) => {
    const { LL } = useI18nContext();
    return (
        <div className='flex w-full flex-col pt-12 pl-4'>
            <h1 className='text-1xl mb-4 font-semibold text-gray-12'>
                {LL.General.EditRole({ roleName: role.name })}
            </h1>
            <Tabs.Root defaultValue='DISPLAY' className='mb-2'>
                <Tabs.List className='flex mb-6 bg-grayA-3 rounded-md p-1 justify-evenly'>
                    <Tabs.Trigger
                        value='DISPLAY'
                        className='items-center px-4 py-2 text-sm font-medium text-gray-12 [&[data-state="active"]]:bg-gray-4 rounded-md grow'
                    >
                        {LL.General.Display()}
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value='PERMISSIONS'
                        className='items-center px-4 py-1 text-sm font-medium text-gray-12 [&[data-state="active"]]:bg-gray-4 rounded-md grow'
                    >
                        {LL.General.Permissions()}
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value='MEMBERS'
                        className='items-center px-4 py-1 text-sm font-medium text-gray-12 [&[data-state="active"]]:bg-gray-4 rounded-md grow'
                    >
                        {LL.General.Members()}
                    </Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value='DISPLAY'>
                    <GuildRoleEditorDisplay role={role} isEditable={isNameMutable} />
                </Tabs.Content>
                <Tabs.Content value='PERMISSIONS'>
                    <GuildRoleEditorPermissions
                        guildId={role.guildId}
                        id={role.id}
                        name={role.name}
                        permissions={role.permissions}
                        isEditable={isPermisssionsMutable}
                    />
                </Tabs.Content>
                <Tabs.Content value='MEMBERS'>
                    <GuildRoleEditorAssignedMembers role={role} isEditable={isMembersMutable} />
                    <GuildRoleEditorAssignMembersDialog>
                        <GuildRoleEditorAssignMembersContent role={role} />
                    </GuildRoleEditorAssignMembersDialog>
                </Tabs.Content>
            </Tabs.Root>
        </div>
    );
};
