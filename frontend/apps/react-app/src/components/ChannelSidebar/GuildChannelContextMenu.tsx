import { ReactNode } from 'react';
import { ContextMenu, ContextMenuItem } from '@/shared-components/ContextMenu';
import { useChannelPermissions } from './hooks/useChannelPermissions';
import { GUILD_ADMIN, MANAGE_GUILD, MANAGE_GUILD_CHANNELS } from '../../constants';
import { GuildChannel } from '../../types';
import { GearSix, Trash } from '@phosphor-icons/react';
import { useI18nContext } from '../../i18n/i18n-react';

export const GuildChannelContextMenu = ({
    id,
    channelType,
    children,
    onSettings,
    onDelete,
}: Pick<GuildChannel, 'id' | 'channelType'> & {
    children: ReactNode;
    onSettings: () => void;
    onDelete: () => void;
}) => {
    const { LL } = useI18nContext();
    const permissions = useChannelPermissions(id);
    const manageGuild = (permissions & (1 << MANAGE_GUILD)) !== 0;
    const manageGuildChannels = (permissions & (1 << MANAGE_GUILD_CHANNELS)) !== 0;
    const guildAdmin = (permissions & (1 << GUILD_ADMIN)) !== 0;
    return (
        <ContextMenu tiggerElem={children} className='min-w-[180px]'>
            {(manageGuild || manageGuildChannels || guildAdmin) && (
                <ContextMenuItem onClick={onSettings} fullWidth>
                    <span className='mr-2 text-sm'>
                        {channelType === 1
                            ? LL.General.CategorySettings()
                            : LL.General.ChannelSettings()}
                    </span>
                    <GearSix size={18} weight='duotone' className='ml-auto' />
                </ContextMenuItem>
            )}
            {(manageGuild || manageGuildChannels || guildAdmin) && (
                <ContextMenuItem intent='danger' onClick={onDelete} fullWidth>
                    <span className='mr-2 text-sm'>
                        {channelType === 1
                            ? LL.Actions.DeleteCategory()
                            : LL.Actions.DeleteChannel()}
                    </span>
                    <Trash size={18} weight='duotone' className='ml-auto' />
                </ContextMenuItem>
            )}
        </ContextMenu>
    );
};
