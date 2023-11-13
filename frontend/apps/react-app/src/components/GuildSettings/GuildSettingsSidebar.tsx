import { useDeleteGuildMutation } from '@/api/guilds/deleteGuild';
import { Divider } from '@/shared-components/Divider';
import {
  FullscreenSettingsSidebarLayout,
  FullscreenSettingsSidebarTitle,
  FullscreenSettingsSidebarList,
} from '@/shared-components/FullscreenSettings';
import { ListItem } from '@/shared-components/ListItem';
import { actionConfirmationStore, ConfirmationActionType } from '@/components/ActionConfirmation';
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

const { setSection } = guildSettingsStore;
const { setGuild } = actionConfirmationStore;

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
      guildSettingsStore.toggleOpen();
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
      <Divider className='mx-2.5 my-2.5' />
      <FullscreenSettingsSidebarList>
        <span className='mb-1 ml-2.5 block text-xs font-semibold text-gray-11'>
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
      <Divider className='mx-2.5 my-2.5' />
      <FullscreenSettingsSidebarList>
        <span className='mb-1 ml-2.5 block text-xs font-semibold text-gray-11'>Danger Zone</span>
        <ListItem intent='danger' baseBg={false} onClick={handleGuildDelete} isActionable>
          Delete Server
        </ListItem>
      </FullscreenSettingsSidebarList>
    </FullscreenSettingsSidebarLayout>
  );
};
