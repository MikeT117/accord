import { GuildRole } from '../../../../types';
import { useEditingRole } from '../../hooks/useEditingRole';
import { useFilterableEditableRoles } from '../../hooks/useFilterableEditableRoles';
import { GuildRoleEditor } from './GuildRoleEditor';
import { GuildRoleEditorSidebar } from './GuildRoleEditorSidebar';

export const GuildSettingsRoleEditor = ({
    guildId,
    roles,
}: {
    guildId: string;
    roles: GuildRole[];
}) => {
    const editableRoles = useFilterableEditableRoles(roles);
    const role = useEditingRole(roles);

    if (!role) {
        return null;
    }

    return (
        <div className='flex h-full'>
            <GuildRoleEditorSidebar
                guildId={guildId}
                roles={editableRoles}
                currentRoleId={role.id}
            />
            <GuildRoleEditor
                role={role}
                isPermisssionsMutable={role.name !== '@owner'}
                isMembersMutable={role.name !== '@default' && role.name !== '@owner'}
                isNameMutable={role.name !== '@default' && role.name !== '@owner'}
            />
        </div>
    );
};
