import { useDrop } from 'react-dnd';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { CategoryChannelListItem } from './CategoryChannelListItem';
import { GuildVoiceChannelListItem } from './GuildVoiceChannelListItem';
import { MainSidebarContentLayout, MainSidebarHeaderLayout } from '@/shared-components/Layouts';
import { GuildOptionsDropdown } from './GuildOptionsDropdown';
import { actionConfirmationStore } from '@/components/ActionConfirmation';
import { channelSettingsStore } from '@/components/ChannelSettings/stores/useChannelSettingsStore';
import { useChannelSidebarState } from './hooks/useChannelSidebarState';
import { useDeleteGuildChannelMutation } from '@/api/channels/deleteGuildChannel';
import { useUpdateGuildChannelMutation } from '@/api/channels/updateGuildChannel';
import { GuildTextChannelListItem } from './TextChannelListItem';
import { GuildChannel } from '../../types';

export const ChannelSidebar = () => {
  const channelsidebarState = useChannelSidebarState();
  const { mutate: updateGuildChannel } = useUpdateGuildChannelMutation();
  const { mutate: deleteGuildChannel } = useDeleteGuildChannelMutation();

  const navigate = useNavigate();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'GUILD_CHANNEL',
    drop: ({ id, guildId, parentId }: GuildChannel) => {
      if (parentId) {
        updateGuildChannel({ channelId: id, guildId, parentId: null, sync: false });
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  if (!channelsidebarState) {
    return <Navigate to='/app' replace={true} />;
  }

  const { channelId, channels, guildId, name, ownerUserAccountId } = channelsidebarState;

  const handleGuildChannelDelete = (
    channel: Pick<GuildChannel, 'id' | 'channelType' | 'guildId' | 'name'>,
  ) => {
    actionConfirmationStore.setChannel(channel, () => deleteGuildChannel(channel));
  };

  const handleGuildChannelSettings = (channelId: string) => {
    channelSettingsStore.setChannelId(channelId);
  };

  return (
    <>
      <MainSidebarHeaderLayout className='justify-between p-4'>
        <h1 className='font-medium text-gray-12'>{name}</h1>
        <GuildOptionsDropdown
          guildId={guildId}
          guildName={name}
          ownerUserAccountId={ownerUserAccountId}
        />
      </MainSidebarHeaderLayout>
      <MainSidebarContentLayout>
        <ul className='flex flex-col space-y-3 overflow-y-auto rounded-md px-2 py-2'>
          {channels.map(
            (c) =>
              c.channelType === 1 && (
                <CategoryChannelListItem
                  key={c.id}
                  categoryChannel={c}
                  isActive={c.id === channelId}
                  onSettings={() => handleGuildChannelSettings(c.id)}
                  onDelete={() =>
                    handleGuildChannelDelete({
                      id: c.id,
                      name: c.name,
                      channelType: c.channelType,
                      guildId: c.guildId,
                    })
                  }
                >
                  {channels.map((cc) => {
                    if (cc.parentId === c.id && cc.channelType === 0) {
                      return (
                        <GuildTextChannelListItem
                          channel={cc}
                          key={cc.id}
                          isActive={cc.id === channelId}
                          onClick={() => navigate(`/app/server/${cc.guildId}/channel/${cc.id}`)}
                          onSettings={() => handleGuildChannelSettings(cc.id)}
                          onDelete={() =>
                            handleGuildChannelDelete({
                              id: cc.id,
                              name: cc.name,
                              channelType: cc.channelType,
                              guildId: cc.guildId,
                            })
                          }
                        />
                      );
                    } else if (cc.parentId === c.id && cc.channelType === 4) {
                      return (
                        <GuildVoiceChannelListItem
                          key={cc.id}
                          voiceChannel={cc}
                          onSettings={() => handleGuildChannelSettings(cc.id)}
                          onDelete={() =>
                            handleGuildChannelDelete({
                              id: cc.id,
                              name: cc.name,
                              channelType: cc.channelType,
                              guildId: cc.guildId,
                            })
                          }
                        />
                      );
                    }
                  })}
                </CategoryChannelListItem>
              ),
          )}
        </ul>
        <ul
          className={`m-2 flex grow flex-col space-y-1 rounded ${isOver ? 'bg-grayA-3' : ''}`}
          ref={drop}
        >
          {channels.map((c) => {
            if (!c.parentId && c.channelType === 0) {
              return (
                <GuildTextChannelListItem
                  key={c.id}
                  channel={c}
                  isActive={c.id === channelId}
                  onClick={() => navigate(`/app/server/${c.guildId}/channel/${c.id}`)}
                  onSettings={() => handleGuildChannelSettings(c.id)}
                  onDelete={() =>
                    handleGuildChannelDelete({
                      id: c.id,
                      name: c.name,
                      channelType: c.channelType,
                      guildId: c.guildId,
                    })
                  }
                />
              );
            } else if (!c.parentId && c.channelType === 4) {
              return (
                <GuildVoiceChannelListItem
                  key={c.id}
                  voiceChannel={c}
                  onSettings={() => handleGuildChannelSettings(c.id)}
                  onDelete={() =>
                    handleGuildChannelDelete({
                      id: c.id,
                      name: c.name,
                      channelType: c.channelType,
                      guildId: c.guildId,
                    })
                  }
                />
              );
            }
          })}
        </ul>
      </MainSidebarContentLayout>
      <Outlet />
    </>
  );
};
