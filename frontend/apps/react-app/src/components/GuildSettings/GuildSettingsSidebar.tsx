import { useDeleteGuildMutation } from '@/api/guilds/deleteGuild';
import { Divider } from '@/shared-components/Divider';
import { ListItem } from '@/shared-components/ListItem';
import { actionConfirmationStore } from '@/components/ActionConfirmation';
import {
    FullscreenSettingsSidebarLayout,
    FullscreenSettingsSidebarTitle,
    FullscreenSettingsSidebarList,
} from '@/shared-components/FullscreenSettings';
import {
    guildSettingsStore,
    GuildSettingsSection,
    GUILD_BANS,
    GUILD_INVITES,
    GUILD_MEMBERS,
    GUILD_OVERVIEW,
    GUILD_ROLES,
    GUILD_ROLE_EDITOR,
} from './stores/useGuildSettingsStore';
import { useI18nContext } from '../../i18n/i18n-react';

export const GuildSettingsSidebar = ({
    guildId,
    name,
    section,
}: {
    guildId: string;
    name: string;
    section: GuildSettingsSection;
}) => {
    const { LL } = useI18nContext();

    const { mutate: deleteGuild } = useDeleteGuildMutation();

    const handleGuildDelete = () => {
        actionConfirmationStore.deleteGuild({ id: guildId, name }, () => {
            guildSettingsStore.close();
            deleteGuild(guildId);
        });
    };

    return (
        <FullscreenSettingsSidebarLayout>
            <FullscreenSettingsSidebarList>
                <FullscreenSettingsSidebarTitle>{name}</FullscreenSettingsSidebarTitle>
                <ListItem
                    intent='secondary'
                    baseBg={false}
                    isActive={section === GUILD_OVERVIEW}
                    onClick={() => guildSettingsStore.setSection(GUILD_OVERVIEW)}
                    isActionable
                >
                    {LL.General.Overview()}
                </ListItem>
                <ListItem
                    intent='secondary'
                    baseBg={false}
                    isActive={section === GUILD_ROLES || section === GUILD_ROLE_EDITOR}
                    onClick={() => guildSettingsStore.setSection(GUILD_ROLES)}
                    isActionable
                >
                    {LL.General.Roles()}
                </ListItem>
            </FullscreenSettingsSidebarList>
            <Divider className='mx-2.5 my-2.5' />
            <FullscreenSettingsSidebarList>
                <span className='mb-1 ml-2.5 block text-xs font-semibold text-gray-11'>
                    {LL.General.UserManagement()}
                </span>
                <ListItem
                    intent='secondary'
                    baseBg={false}
                    isActive={section === GUILD_MEMBERS}
                    onClick={() => guildSettingsStore.setSection(GUILD_MEMBERS)}
                    isActionable
                >
                    {LL.General.Members()}
                </ListItem>
                <ListItem
                    intent='secondary'
                    baseBg={false}
                    isActive={section === GUILD_INVITES}
                    onClick={() => guildSettingsStore.setSection(GUILD_INVITES)}
                    isActionable
                >
                    {LL.General.Invites()}
                </ListItem>
                <ListItem
                    intent='secondary'
                    baseBg={false}
                    isActive={section === GUILD_BANS}
                    onClick={() => guildSettingsStore.setSection(GUILD_BANS)}
                    isActionable
                >
                    {LL.General.ServerBans()}
                </ListItem>
            </FullscreenSettingsSidebarList>
            <Divider className='mx-2.5 my-2.5' />
            <FullscreenSettingsSidebarList>
                <span className='mb-1 ml-2.5 block text-xs font-semibold text-gray-11'>
                    {LL.General.DangerZone()}
                </span>
                <ListItem intent='danger' baseBg={false} onClick={handleGuildDelete} isActionable>
                    {LL.Actions.DeleteServer()}
                </ListItem>
            </FullscreenSettingsSidebarList>
        </FullscreenSettingsSidebarLayout>
    );
};
