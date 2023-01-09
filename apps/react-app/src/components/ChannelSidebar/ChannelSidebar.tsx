import { useDrop } from 'react-dnd';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import type { Channel } from '@accord/common';
import { TextChannelListItem } from './TextChannelListItem';
import { CategoryChannelListItem } from './CategoryChannelListItem';
import { VoiceChannelListItem } from './VoiceChannelListItem';
import { MainSidebarContentLayout, MainSidebarHeaderLayout } from '@/shared-components/Layouts';
import { GuildOptionsDropdown } from './GuildOptionsDropdown';
import { actionConfirmationActions } from '@/components/ActionConfirmation';
import { channelSettingsActions } from '@/components/ChannelSettings/stores/useChannelSettingsStore';
import { useChannelSidebarState } from './hooks/useChannelSidebarState';
import { useDeleteChannelMutation } from '@/api/channel/deleteChannel';
import { useUpdateChannelMutation } from '@/api/channel/updateChannel';

const { setChannelId } = channelSettingsActions;

export const ChannelSidebar = () => {
  const channelsidebarState = useChannelSidebarState();
  const navigate = useNavigate();
  const { mutate: updateChannel } = useUpdateChannelMutation();
  const { mutate: deleteChannel } = useDeleteChannelMutation();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'GUILD_CHANNEL',
    drop: ({ id, guildId, type, parentId }: Channel) => {
      if (parentId) {
        updateChannel({ id, guildId, type, parentId: null });
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

  const handleGuildChannelDelete = (channel: Pick<Channel, 'id' | 'type' | 'guildId' | 'name'>) => {
    actionConfirmationActions.setChannel(channel, () => deleteChannel(channel));
  };

  const handleGuildChannelSettings = (channelId: string) => {
    setChannelId(channelId);
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
          {channels?.map(
            (c) =>
              c.type === 1 && (
                <CategoryChannelListItem
                  key={c.id}
                  id={c.id}
                  type={c.type}
                  name={c.name}
                  isActive={c.id === channelId}
                  onSettings={() => handleGuildChannelSettings(c.id)}
                  onDelete={() =>
                    handleGuildChannelDelete({
                      id: c.id,
                      name: c.name,
                      type: c.type,
                      guildId: c.guildId,
                    })
                  }
                >
                  {channels.map((cc) => {
                    if (cc.parentId === c.id && cc.type === 0) {
                      return (
                        <TextChannelListItem
                          key={cc.id}
                          id={cc.id}
                          name={cc.name}
                          type={cc.type}
                          parentId={cc.parentId}
                          guildId={cc.guildId}
                          isActive={cc.id === channelId}
                          onClick={() => navigate(`/app/server/${cc.guildId}/channel/${cc.id}`)}
                          onSettings={() => handleGuildChannelSettings(cc.id)}
                          onDelete={() =>
                            handleGuildChannelDelete({
                              id: cc.id,
                              name: cc.name,
                              type: cc.type,
                              guildId: cc.guildId,
                            })
                          }
                        />
                      );
                    } else if (cc.parentId === c.id && cc.type === 4) {
                      return (
                        <VoiceChannelListItem
                          key={cc.id}
                          id={cc.id}
                          guildId={cc.guildId}
                          type={cc.type}
                          name={cc.name}
                          onSettings={() => handleGuildChannelSettings(cc.id)}
                          onDelete={() =>
                            handleGuildChannelDelete({
                              id: cc.id,
                              name: cc.name,
                              type: cc.type,
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
          {channels?.map((c) => {
            if (!c.parentId && c.type === 0) {
              return (
                <TextChannelListItem
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  type={c.type}
                  parentId={c.parentId}
                  guildId={c.guildId}
                  isActive={c.id === channelId}
                  onClick={() => navigate(`/app/server/${c.guildId}/channel/${c.id}`)}
                  onSettings={() => handleGuildChannelSettings(c.id)}
                  onDelete={() =>
                    handleGuildChannelDelete({
                      id: c.id,
                      name: c.name,
                      type: c.type,
                      guildId: c.guildId,
                    })
                  }
                />
              );
            } else if (!c.parentId && c.type === 4) {
              return (
                <VoiceChannelListItem
                  key={c.id}
                  id={c.id}
                  guildId={c.guildId}
                  type={c.type}
                  name={c.name}
                  onSettings={() => handleGuildChannelSettings(c.id)}
                  onDelete={() =>
                    handleGuildChannelDelete({
                      id: c.id,
                      name: c.name,
                      type: c.type,
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
