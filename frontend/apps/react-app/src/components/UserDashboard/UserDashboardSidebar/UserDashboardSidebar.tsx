import { useLocation, useNavigate } from 'react-router-dom';
import { Input } from '@/shared-components/Input';
import { MainSidebarContentLayout, MainSidebarHeaderLayout } from '@/shared-components/Layouts';
import { ListItem } from '@/shared-components/ListItem';
import { useFilteredPrivateChannels } from './hooks/useFilteredPrivateChannels';
import { PrivateChannelListItem } from './PrivateChannelListItem';
import { Prohibit, Users } from '@phosphor-icons/react';
import { useI18nContext } from '../../../i18n/i18n-react';

export const UserDashboardSidebar = () => {
    const { LL } = useI18nContext();

    const { activeChannelId, channels, filter, setFilter } = useFilteredPrivateChannels();
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <>
            <MainSidebarHeaderLayout className='p-2'>
                <Input
                    id='dm-filter'
                    placeholder='Find a Conversation'
                    onChange={(e) => setFilter(e.currentTarget.value)}
                    value={filter}
                />
            </MainSidebarHeaderLayout>
            <MainSidebarContentLayout>
                <ul className='mt-2 mb-6 space-y-1 px-2'>
                    <ListItem
                        isActive={location.pathname === '/app/@me/friends'}
                        onClick={() => navigate('/app/@me/friends')}
                        intent='secondary'
                        baseBg={false}
                        isActionable
                    >
                        <Users size={20} weight='fill' />
                        <span className='ml-2 text-sm'>{LL.General.Friends()}</span>
                    </ListItem>
                    <ListItem
                        isActive={location.pathname === '/app/@me/requests'}
                        onClick={() => navigate('/app/@me/requests')}
                        intent='secondary'
                        baseBg={false}
                        isActionable
                    >
                        <Users size={20} />
                        <span className='ml-2 text-sm'>{LL.General.Requests()}</span>
                    </ListItem>
                    <ListItem
                        isActive={location.pathname === '/app/@me/blocked'}
                        onClick={() => navigate('/app/@me/blocked')}
                        intent='secondary'
                        baseBg={false}
                        isActionable
                    >
                        <Prohibit size={20} />
                        <span className='ml-2 text-sm'>{LL.General.Blocked()}</span>
                    </ListItem>
                </ul>
                <div className='mb-2 flex items-center px-2 '>
                    <span className='select-none text-xs font-semibold text-gray-11'>
                        {LL.General.DirectMessages()}
                    </span>
                </div>
                <ul className='space-y-1 px-2'>
                    {channels.map((c) => (
                        <PrivateChannelListItem
                            key={c.id}
                            users={c.users}
                            channelType={c.channelType}
                            isActive={c.id === activeChannelId}
                            onClick={() => navigate(`/app/@me/channel/${c.id}`)}
                        />
                    ))}
                </ul>
            </MainSidebarContentLayout>
        </>
    );
};
