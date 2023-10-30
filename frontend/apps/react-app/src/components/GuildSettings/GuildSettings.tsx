import { XMarkIcon } from '@heroicons/react/24/solid';
import { useCallback } from 'react';
import { IconButton } from '@/shared-components/IconButton';
import { Dialog } from '@/shared-components/Dialog';
import { FullscreenSettingsContentLayout } from '@/shared-components/FullscreenSettings';
import { GuildSettingsOverview } from './Guild/GuildSettingsOverview';
import { GuildBans } from './GuildBans/GuildBans';
import { GuildSettingsSidebar } from './GuildSettingsSidebar';
import { GuildInvites } from './GuildInvites/GuildInvites';
import { GuildMembers } from './GuildMembers/GuildMembers';
import { GuildRoleEditor } from './GuildRoles/GuildRoleEditor/GuildRoleEditor';
import { GuildRoleEditorSidebar } from './GuildRoles/GuildRoleEditor/GuildRoleEditorSidebar';
import { GuildSettingsRolesOverview } from './GuildRoles/GuildRolesOverview';
import {
  guildSettingsStore,
  GUILD_BANS,
  GUILD_INVITES,
  GUILD_MEMBERS,
  GUILD_OVERVIEW,
  GUILD_ROLES,
  GUILD_ROLE_EDITOR,
  useGuildSettingsStore,
} from './stores/useGuildSettingsStore';
import { useGuildSettings } from './hooks/useGuildSettings';
import { AccordError } from '../../shared-components/AccordError';

const { toggleOpen } = guildSettingsStore;

export const GuildSettingsContent = () => {
  const guildSettingsState = useGuildSettings();

  if (!guildSettingsState) {
    return <AccordError />;
  }

  const {
    id,
    name,
    description,
    isDiscoverable,
    guildCategoryId,
    icon,
    banner,
    section,
    memberUserAccountId,
    memberCount,
    creatorId,
    customRoles,
    defaultRole,
    editingRole,
    editableRoles,
  } = guildSettingsState;

  return (
    <>
      <GuildSettingsSidebar guildId={id} name={name} section={section} />
      <FullscreenSettingsContentLayout>
        {section === GUILD_ROLES && (
          <GuildSettingsRolesOverview
            customRoles={customRoles}
            defaultRole={defaultRole}
            guildId={id}
          />
        )}
        {section === GUILD_ROLE_EDITOR && (
          <div className='flex h-full'>
            <GuildRoleEditorSidebar
              guildId={id}
              editableRoles={editableRoles}
              currentRoleId={editingRole?.id}
            />
            {editingRole && <GuildRoleEditor editingRole={editingRole} />}
          </div>
        )}
        {section === GUILD_OVERVIEW && (
          <GuildSettingsOverview
            guildCategoryId={guildCategoryId}
            guildId={id}
            isDiscoverable={isDiscoverable}
            name={name}
            banner={banner}
            description={description}
            icon={icon}
          />
        )}
        {section === GUILD_INVITES && <GuildInvites guildId={id} />}
        {section === GUILD_BANS && <GuildBans guildId={id} />}
        {section === GUILD_MEMBERS && (
          <GuildMembers
            guildId={id}
            memberCount={memberCount}
            userId={memberUserAccountId}
            creatorId={creatorId}
          />
        )}
        <IconButton className='absolute right-0 top-12' intent='secondary' onClick={toggleOpen}>
          <XMarkIcon className='h-5 w-5' />
        </IconButton>
      </FullscreenSettingsContentLayout>
    </>
  );
};

export const GuildSettings = () => {
  const isOpen = useGuildSettingsStore(useCallback((s) => s.isOpen, []));
  return (
    <Dialog size='screen' isOpen={isOpen} onClose={toggleOpen} className='flex'>
      <GuildSettingsContent />
    </Dialog>
  );
};
