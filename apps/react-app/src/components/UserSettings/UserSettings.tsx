import { XMarkIcon } from '@heroicons/react/24/solid';
import { useCallback } from 'react';
import { IconButton } from '@/shared-components/IconButton';
import { Dialog } from '@/shared-components/Dialog';
import {
  FullscreenSettingsContentLayout,
  FullscreenSettingsSidebarLayout,
  FullscreenSettingsSidebarList,
  FullscreenSettingsSidebarTitle,
} from '@/shared-components/FullscreenSettings';
import { ListItem } from '@/shared-components/ListItem';
import { sessionStore } from '@/shared-stores/sessionStore';
import { UserGuilds } from './UserGuilds';
import { UserOverview } from './UserOverview';
import {
  userSettingsStore,
  USER_GUILDS,
  USER_OVERVIEW,
  USER_SESSIONS,
  useUserSettingsStore,
} from './stores/useUserSettingsStore';
import { UserSessions } from './UserSessions';

const { setSection, toggleOpen } = userSettingsStore;

export const UserSettingsContent = () => {
  const section = useUserSettingsStore(useCallback((s) => s.section, []));

  const handleLogout = () => {
    sessionStore.clearSession();
  };

  return (
    <>
      <FullscreenSettingsSidebarLayout>
        <FullscreenSettingsSidebarTitle>User Settings</FullscreenSettingsSidebarTitle>
        <FullscreenSettingsSidebarList>
          <ListItem
            intent='secondary'
            baseBg={false}
            isActive={section === USER_OVERVIEW}
            onClick={() => setSection(USER_OVERVIEW)}
            isActionable
          >
            My Account
          </ListItem>
          <ListItem
            intent='secondary'
            baseBg={false}
            isActive={section === USER_GUILDS}
            onClick={() => setSection(USER_GUILDS)}
            isActionable
          >
            Servers
          </ListItem>
          <ListItem
            intent='secondary'
            baseBg={false}
            isActive={section === USER_SESSIONS}
            onClick={() => setSection(USER_SESSIONS)}
            isActionable
          >
            Sessions
          </ListItem>
          <ListItem intent='danger' baseBg={false} onClick={handleLogout} isActionable>
            Log Out
          </ListItem>
        </FullscreenSettingsSidebarList>
      </FullscreenSettingsSidebarLayout>
      <FullscreenSettingsContentLayout>
        <IconButton className='absolute right-0 top-12' intent='secondary' onClick={toggleOpen}>
          <XMarkIcon className='h-5 w-5' />
        </IconButton>
        {section === USER_OVERVIEW && <UserOverview />}
        {section === USER_GUILDS && <UserGuilds />}
        {section === USER_SESSIONS && <UserSessions />}
      </FullscreenSettingsContentLayout>
    </>
  );
};

export const UserSettings = () => {
  const isOpen = useUserSettingsStore(useCallback((s) => s.isOpen, []));
  return (
    <Dialog size='screen' isOpen={isOpen} onClose={toggleOpen} className='flex h-full w-full'>
      <UserSettingsContent />
    </Dialog>
  );
};
