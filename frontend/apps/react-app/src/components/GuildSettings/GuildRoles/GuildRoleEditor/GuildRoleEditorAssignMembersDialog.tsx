import { ReactNode } from 'react';
import { useGuildSettingsStore, guildSettingsStore } from '../../stores/useGuildSettingsStore';
import { Dialog } from '../../../../shared-components/Dialog';

export const GuildRoleEditorAssignMembersDialog = ({ children }: { children: ReactNode }) => {
    const isOpen = useGuildSettingsStore((s) => s.isRoleMemberAssignmentOpen);
    return (
        <Dialog isOpen={isOpen} onClose={guildSettingsStore.closeRoleMemberAssignment}>
            {children}
        </Dialog>
    );
};
