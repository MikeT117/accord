import { useDeleteGuildMutation } from '@/api/guild/deleteGuild';
import { Divider } from '@/shared-components/Divider';
import {
  FullscreenSettingsSidebarLayout,
  FullscreenSettingsSidebarTitle,
  FullscreenSettingsSidebarList,
} from '@/shared-components/FullscreenSettings';
import { ListItem } from '@/shared-components/ListItem';
import { actionConfirmationActions, ConfirmationActionType } from '@/components/ActionConfirmation';
import {
  guildSettingsActions,
  GuildSettingsSection,
  GUILD_BANS,
  GUILD_INVITES,
  GUILD_MEMBERS,
  GUILD_OVERVIEW,
  GUILD_ROLES,
  GUILD_ROLE_EDITOR,
} from './stores/useGuildSettingsStore';

const { setSection } = guildSettingsActions;
const { setGuild } = actionConfirmationActions;

export const GuildSettingsSidebar = ({
  guildId,
  name,
  section,
}: {
  guildId: string;
  name: string;
  section: GuildSettingsSection;
}) => {
  const { mutate: deleteGuild } = useDeleteGuildMutation();

  const handleGuildDelete = () => {
    setGuild({ id: guildId, name }, ConfirmationActionType.DELETE, () => {
      guildSettingsActions.toggleOpen();
      deleteGuild({ id: guildId });
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
          onClick={() => setSection(GUILD_OVERVIEW)}
          isActionable
        >
          Overview
        </ListItem>
        <ListItem
          intent='secondary'
          baseBg={false}
          isActive={section === GUILD_ROLES || section === GUILD_ROLE_EDITOR}
          onClick={() => setSection(GUILD_ROLES)}
          isActionable
        >
          Roles
        </ListItem>
      </FullscreenSettingsSidebarList>
      <Divider className='my-2.5 mx-2.5' />
      <FullscreenSettingsSidebarList>
        <span className='ml-2.5 mb-1 block text-xs font-semibold text-gray-11'>
          User Management
        </span>
        <ListItem
          intent='secondary'
          baseBg={false}
          isActive={section === GUILD_MEMBERS}
          onClick={() => setSection(GUILD_MEMBERS)}
          isActionable
        >
          Members
        </ListItem>
        <ListItem
          intent='secondary'
          baseBg={false}
          isActive={section === GUILD_INVITES}
          onClick={() => setSection(GUILD_INVITES)}
          isActionable
        >
          Invites
        </ListItem>
        <ListItem
          intent='secondary'
          baseBg={false}
          isActive={section === GUILD_BANS}
          onClick={() => setSection(GUILD_BANS)}
          isActionable
        >
          Bans
        </ListItem>
      </FullscreenSettingsSidebarList>
      <Divider className='my-2.5 mx-2.5' />
      <FullscreenSettingsSidebarList>
        <span className='ml-2.5 mb-1 block text-xs font-semibold text-gray-11'>Danger Zone</span>
        <ListItem intent='danger' baseBg={false} onClick={handleGuildDelete} isActionable>
          Delete Server
        </ListItem>
      </FullscreenSettingsSidebarList>
    </FullscreenSettingsSidebarLayout>
  );
};
