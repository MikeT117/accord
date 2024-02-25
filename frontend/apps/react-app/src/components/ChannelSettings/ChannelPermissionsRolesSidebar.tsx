import { ListItem } from '@/shared-components/ListItem';
import { GuildRole } from '../../types';
import { PlusCircle } from '@phosphor-icons/react';
import { useI18nContext } from '../../i18n/i18n-react';

export const ChannelPermissionsRolesSidebar = ({
    onAssignChannelRole,
    roles,
}: {
    onAssignChannelRole: (guildRoleId: string) => void;
    roles: GuildRole[];
}) => {
    const { LL } = useI18nContext();
    return (
        <div className='flex h-full basis-[260px] flex-col px-4 pt-12 border-r-[0.125rem] border-r-gray-2'>
            <h1 className='mb-4 font-semibold text-gray-12'>{LL.General.ServerRoles()}</h1>
            <ul className='space-y-1 overflow-y-scroll'>
                {roles.map((r) => (
                    <ListItem
                        key={r.id}
                        intent='secondary'
                        className='transition-colors hover:text-gray-12'
                        onClick={() => onAssignChannelRole(r.id)}
                        isActionable
                    >
                        <span className='w-0 min-w-[90%] truncate'>{r.name}</span>
                        <PlusCircle size={20} className='shrink-0' weight='duotone' />
                    </ListItem>
                ))}
            </ul>
        </div>
    );
};
