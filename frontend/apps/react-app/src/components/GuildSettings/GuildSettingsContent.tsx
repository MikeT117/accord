import { IconButton } from '@/shared-components/IconButton';
import { FullscreenSettingsContentLayout } from '@/shared-components/FullscreenSettings';
import { GuildSettingsOverview } from './Guild/GuildSettingsOverview';
import { GuildSettingsBans } from './GuildBans/GuildSettingsBans';
import { GuildSettingsSidebar } from './GuildSettingsSidebar';
import { GuildSettingsInvites } from './GuildInvites/GuildSettingsInvites';
import { GuildSettingsMembers } from './GuildMembers/GuildSettingsMembers';
import { GuildSettingsRolesOverview } from './GuildRoles/GuildRolesOverview';
import { AccordError } from '../../shared-components/AccordError';
import {
    guildSettingsStore,
    GUILD_BANS,
    GUILD_INVITES,
    GUILD_MEMBERS,
    GUILD_OVERVIEW,
    GUILD_ROLES,
    GUILD_ROLE_EDITOR,
} from './stores/useGuildSettingsStore';
import { useGuildSettingsState } from './hooks/useGuildSettingsState';
import { GuildSettingsRoleEditor } from './GuildRoles/GuildRoleEditor/GuildSettingsRoleEditor';
import { X } from '@phosphor-icons/react';

export const GuildSettingsContent = () => {
    const guildSettingsState = useGuildSettingsState();

    if (!guildSettingsState) {
        return <AccordError />;
    }

    const {
        id,
        name,
        creatorId,
        isDiscoverable,
        guildCategoryId,
        banner,
        description,
        icon,
        roles,
        section,
    } = guildSettingsState;

    return (
        <>
            <GuildSettingsSidebar guildId={id} name={name} section={section} />
            <FullscreenSettingsContentLayout>
                {section === GUILD_OVERVIEW && (
                    <GuildSettingsOverview
                        id={id}
                        isDiscoverable={isDiscoverable}
                        name={name}
                        guildCategoryId={guildCategoryId}
                        banner={banner}
                        description={description}
                        icon={icon}
                    />
                )}
                {section === GUILD_ROLES && (
                    <GuildSettingsRolesOverview roles={roles} guildId={id} />
                )}
                {section === GUILD_ROLE_EDITOR && (
                    <GuildSettingsRoleEditor guildId={id} roles={roles} />
                )}
                {section === GUILD_INVITES && <GuildSettingsInvites guildId={id} />}
                {section === GUILD_BANS && <GuildSettingsBans guildId={id} />}
                {section === GUILD_MEMBERS && (
                    <GuildSettingsMembers guildId={id} creatorId={creatorId} />
                )}
                <IconButton
                    className='fixed right-[108px] top-12'
                    intent='secondary'
                    onClick={guildSettingsStore.close}
                >
                    <X size={20} />
                </IconButton>
            </FullscreenSettingsContentLayout>
        </>
    );
};
