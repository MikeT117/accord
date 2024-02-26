import { useDrop } from 'react-dnd';
import { Navigate, useNavigate } from 'react-router-dom';
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
import { DefaultTooltip } from '../../shared-components/DefaultTooltip';

export const ChannelSidebar = () => {
    const channelsidebarState = useChannelSidebarState();

    const { mutate: updateGuildChannel } = useUpdateGuildChannelMutation();
    const { mutate: deleteGuildChannel } = useDeleteGuildChannelMutation();
    const navigate = useNavigate();

    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'GUILD_CHANNEL',
        drop: ({ id, guildId }: GuildChannel) => {
            updateGuildChannel({ channelId: id, guildId, parentId: null, lockPermissions: false });
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    if (!channelsidebarState) {
        return <Navigate to='/app' replace={true} />;
    }

    const { guildId, channelId, guildName, guildCreatorId, children, orphans, parents } =
        channelsidebarState;

    const handleGuildChannelDelete = (
        channel: Pick<GuildChannel, 'id' | 'channelType' | 'guildId' | 'name'>,
    ) => {
        actionConfirmationStore.deleteChannel(channel, () => deleteGuildChannel(channel));
    };

    const handleGuildChannelSettings = (channelId: string) => {
        channelSettingsStore.setChannelId(channelId);
    };

    return (
        <>
            <MainSidebarHeaderLayout className='justify-between p-4'>
                <DefaultTooltip text={guildName}>
                    <h1 className='font-medium text-gray-12 truncate mr-2'>{guildName}</h1>
                </DefaultTooltip>
                <GuildOptionsDropdown
                    guildId={guildId}
                    guildName={guildName}
                    guildCreatorId={guildCreatorId}
                />
            </MainSidebarHeaderLayout>
            <MainSidebarContentLayout>
                <ul className='flex flex-col space-y-3 overflow-y-auto rounded-md m-1 py-2'>
                    {parents.map(
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
                                    {children.map(
                                        (cc) =>
                                            cc.parentId === c.id &&
                                            (cc.channelType === 0 ? (
                                                <GuildTextChannelListItem
                                                    channel={cc}
                                                    key={cc.id}
                                                    isActive={cc.id === channelId}
                                                    onClick={() =>
                                                        navigate(
                                                            `/app/server/${cc.guildId}/channel/${cc.id}`,
                                                        )
                                                    }
                                                    onSettings={() =>
                                                        handleGuildChannelSettings(cc.id)
                                                    }
                                                    onDelete={() =>
                                                        handleGuildChannelDelete({
                                                            id: cc.id,
                                                            name: cc.name,
                                                            channelType: cc.channelType,
                                                            guildId: cc.guildId,
                                                        })
                                                    }
                                                />
                                            ) : (
                                                <GuildVoiceChannelListItem
                                                    key={cc.id}
                                                    channel={cc}
                                                    onSettings={() =>
                                                        handleGuildChannelSettings(cc.id)
                                                    }
                                                    onDelete={() =>
                                                        handleGuildChannelDelete({
                                                            id: cc.id,
                                                            name: cc.name,
                                                            channelType: cc.channelType,
                                                            guildId: cc.guildId,
                                                        })
                                                    }
                                                />
                                            )),
                                    )}
                                </CategoryChannelListItem>
                            ),
                    )}
                    <div
                        className={`m-1 flex grow flex-col space-y-1 rounded-md ${
                            isOver ? 'bg-grayA-3' : ''
                        }`}
                        ref={drop}
                    >
                        {orphans.map((cc) =>
                            cc.channelType === 0 ? (
                                <GuildTextChannelListItem
                                    key={cc.id}
                                    channel={cc}
                                    isActive={cc.id === channelId}
                                    onClick={() =>
                                        navigate(`/app/server/${cc.guildId}/channel/${cc.id}`)
                                    }
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
                            ) : (
                                cc.channelType === 4 && (
                                    <GuildVoiceChannelListItem
                                        key={cc.id}
                                        channel={cc}
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
                                )
                            ),
                        )}
                    </div>
                </ul>
            </MainSidebarContentLayout>
        </>
    );
};
