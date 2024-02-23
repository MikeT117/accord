import { useNavigate } from 'react-router-dom';
import { IconButton } from '@/shared-components/IconButton';
import { guildCreatorStore } from '@/components/GuildCreator';
import { useAppsidebarState } from './hooks/useAppsidebarState';
import { currentUserSettingsStore } from '@/components/UserSettings';
import { Avatar } from '@/shared-components/Avatar';
import { AccordLogo } from '../../assets/AccordLogo';
import { GearSix, Plus, Stack } from '@phosphor-icons/react';
import { useI18nContext } from '../../i18n/i18n-react';

export const AppSidebar = () => {
    const { LL } = useI18nContext();
    const appSidebarState = useAppsidebarState();
    const navigate = useNavigate();

    if (!appSidebarState) {
        return null;
    }

    const { activeGuildId, guilds, user } = appSidebarState;

    return (
        <div className='col-span-1 row-span-full flex mr-0.5 flex-col items-center overflow-y-auto bg-grayA-2 p-3'>
            <ul className='flex flex-col items-center space-y-3'>
                <IconButton
                    padding='l'
                    onClick={() => navigate('/app/@me')}
                    intent='logo'
                    tooltipText={LL.Tooltips.UserDashboard()}
                    tooltipPosition='right'
                    tooltipDelay={100}
                >
                    <AccordLogo className='h-5 w-5' />
                </IconButton>

                <IconButton
                    padding='l'
                    onClick={guildCreatorStore.open}
                    intent='secondary'
                    tooltipText={LL.Tooltips.CreateServer()}
                    tooltipPosition='right'
                    tooltipDelay={100}
                >
                    <Plus size={20} weight='bold' />
                </IconButton>

                <IconButton
                    padding='l'
                    onClick={() => navigate('/app/public-servers')}
                    intent='secondary'
                    tooltipText={LL.Tooltips.PublicServers()}
                    tooltipPosition='right'
                    tooltipDelay={100}
                >
                    <Stack size={20} weight='bold' />
                </IconButton>
            </ul>
            <ul className='my-6 flex flex-col items-center space-y-3'>
                {guilds.map(({ id, name, icon }) => (
                    <div key={id} className='group relative flex items-center'>
                        {id === activeGuildId ? (
                            <div className='absolute left-[-10px] h-[70%] w-[3px] bg-grayA-10' />
                        ) : (
                            <div className='absolute left-[-10px] h-[0] w-[3px] bg-grayA-10 group-hover:h-[40%]' />
                        )}
                        <IconButton
                            padding='xxs'
                            onClick={() => navigate(`/app/server/${id}`)}
                            tooltipText={name}
                            tooltipPosition='left'
                            tooltipDelay={0}
                        >
                            <Avatar src={icon} fallback={name[0] + 'S'} size='xl' />
                        </IconButton>
                    </div>
                ))}
            </ul>
            <div className='mt-auto flex flex-col items-center'>
                <IconButton
                    onClick={currentUserSettingsStore.open}
                    intent='secondary'
                    tooltipText={LL.Tooltips.UserSettings()}
                    tooltipPosition='right'
                >
                    <GearSix size={20} />
                </IconButton>
                <Avatar size='xl' className='mt-3' src={user.avatar} fallback={user.displayName} />
            </div>
        </div>
    );
};
