import {
    FullscreenSettingsSidebarLayout,
    FullscreenSettingsSidebarList,
} from '@/shared-components/FullscreenSettings';
import {
    channelSettingsStore,
    ChannelSettingsSection,
    CHANNEL_OVERVIEW,
    CHANNEL_ROLES,
} from './stores/useChannelSettingsStore';
import { ListItem } from '@/shared-components/ListItem';
import { Divider } from '@/shared-components/Divider';
import { GuildChannel } from '../../types';
import { Hash } from '@phosphor-icons/react';
import { useI18nContext } from '../../i18n/i18n-react';

export const ChannelSettingsSidebar = ({
    name,
    channelType,
    section,
    onChannelDelete,
}: Pick<GuildChannel, 'name' | 'channelType'> & {
    section: ChannelSettingsSection;
    onChannelDelete: () => void;
}) => {
    const { LL } = useI18nContext();
    return (
        <FullscreenSettingsSidebarLayout>
            <FullscreenSettingsSidebarList>
                <div className='flex space-x-0.5 mb-3 items-center text-gray-12'>
                    {channelType === 0 && <Hash size={22} />}
                    <h1 className='font-semibold'>{name}</h1>
                </div>
                <ListItem
                    intent='secondary'
                    baseBg={false}
                    isActive={section === CHANNEL_OVERVIEW}
                    onClick={() => channelSettingsStore.setActiveSection(CHANNEL_OVERVIEW)}
                    isActionable
                >
                    {LL.General.Overview()}
                </ListItem>
                <ListItem
                    intent='secondary'
                    baseBg={false}
                    isActive={section === CHANNEL_ROLES}
                    onClick={() => channelSettingsStore.setActiveSection(CHANNEL_ROLES)}
                    isActionable
                >
                    {LL.General.Permissions()}
                </ListItem>
            </FullscreenSettingsSidebarList>
            <Divider className='mx-2.5 my-2.5' />
            <FullscreenSettingsSidebarList>
                <span className='mb-1 ml-2.5 block text-xs font-semibold text-gray-11'>
                    {LL.General.DangerZone()}
                </span>
                <ListItem intent='danger' baseBg={false} onClick={onChannelDelete} isActionable>
                    {channelType !== 1 ? LL.Actions.DeleteChannel() : LL.Actions.DeleteCategory()}
                </ListItem>
            </FullscreenSettingsSidebarList>
        </FullscreenSettingsSidebarLayout>
    );
};
