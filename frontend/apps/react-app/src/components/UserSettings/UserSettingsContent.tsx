import { IconButton } from '@/shared-components/IconButton';
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
    currentUserSettingsStore,
    USER_GUILDS,
    USER_OVERVIEW,
    USER_SESSIONS,
    useCurrentUserSettingsStore,
} from './stores/useCurrentUserSettingsStore';
import { UserSessions } from './UserSessions';
import { X } from '@phosphor-icons/react';
import { useCurrentUserStore } from '../../shared-stores/currentUserStore';
import { useI18nContext } from '../../i18n/i18n-react';

const { setSection, close } = currentUserSettingsStore;

export const UserSettingsContent = () => {
    const { LL } = useI18nContext();

    const section = useCurrentUserSettingsStore((s) => s.section);
    const user = useCurrentUserStore((s) => s.user);

    if (!user) {
        return null;
    }

    return (
        <>
            <FullscreenSettingsSidebarLayout>
                <FullscreenSettingsSidebarTitle>
                    {LL.General.UserSettings()}
                </FullscreenSettingsSidebarTitle>
                <FullscreenSettingsSidebarList>
                    <ListItem
                        intent='secondary'
                        baseBg={false}
                        isActive={section === USER_OVERVIEW}
                        onClick={() => setSection(USER_OVERVIEW)}
                        isActionable
                    >
                        {LL.General.MyAccount()}
                    </ListItem>
                    <ListItem
                        intent='secondary'
                        baseBg={false}
                        isActive={section === USER_GUILDS}
                        onClick={() => setSection(USER_GUILDS)}
                        isActionable
                    >
                        {LL.General.Servers()}
                    </ListItem>
                    <ListItem
                        intent='secondary'
                        baseBg={false}
                        isActive={section === USER_SESSIONS}
                        onClick={() => setSection(USER_SESSIONS)}
                        isActionable
                    >
                        {LL.General.Sessions()}
                    </ListItem>
                    <ListItem
                        intent='danger'
                        baseBg={false}
                        onClick={sessionStore.clearSession}
                        isActionable
                    >
                        {LL.Actions.LogOut()}
                    </ListItem>
                </FullscreenSettingsSidebarList>
            </FullscreenSettingsSidebarLayout>
            <FullscreenSettingsContentLayout>
                <IconButton
                    className='fixed right-[108px] top-12'
                    intent='secondary'
                    onClick={close}
                >
                    <X size={20} />
                </IconButton>
                {section === USER_OVERVIEW && (
                    <UserOverview
                        displayName={user.displayName}
                        publicFlags={user.publicFlags}
                        avatar={user.avatar}
                    />
                )}
                {section === USER_GUILDS && <UserGuilds />}
                {section === USER_SESSIONS && <UserSessions />}
            </FullscreenSettingsContentLayout>
        </>
    );
};
