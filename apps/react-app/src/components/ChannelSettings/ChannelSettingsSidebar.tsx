import type { GuildChannel } from '@accord/common';
import { HashtagIcon } from '@heroicons/react/24/outline';
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

export const ChannelSettingsSidebar = ({
  name,
  type,
  onDelete,
  settingsSection,
}: Pick<GuildChannel, 'name' | 'type'> & {
  settingsSection: ChannelSettingsSection;
  onDelete: () => void;
}) => {
  return (
    <FullscreenSettingsSidebarLayout>
      <FullscreenSettingsSidebarList>
        <div className='mb-3 flex items-center text-gray-12'>
          {type === 0 && <HashtagIcon className='h-5 w-5 stroke-2' />}
          <h1 className='font-semibold'>{name}</h1>
        </div>
        <ListItem
          intent='secondary'
          baseBg={false}
          isActive={settingsSection === CHANNEL_OVERVIEW}
          onClick={() => channelSettingsStore.setActiveSection(CHANNEL_OVERVIEW)}
          isActionable
        >
          Overview
        </ListItem>
        <ListItem
          intent='secondary'
          baseBg={false}
          isActive={settingsSection === CHANNEL_ROLES}
          onClick={() => channelSettingsStore.setActiveSection(CHANNEL_ROLES)}
          isActionable
        >
          Permissions
        </ListItem>
      </FullscreenSettingsSidebarList>
      <Divider className='mx-2.5 my-2.5' />
      <FullscreenSettingsSidebarList>
        <span className='mb-1 ml-2.5 block text-xs font-semibold text-gray-11'>Danger Zone</span>
        <ListItem intent='danger' baseBg={false} onClick={onDelete} isActionable>
          Delete {type !== 1 ? 'Channel' : 'Category'}
        </ListItem>
      </FullscreenSettingsSidebarList>
    </FullscreenSettingsSidebarLayout>
  );
};
