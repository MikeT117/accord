import { Button } from '@/shared-components/Button';
import { Popover } from '@/shared-components/Popover';
import { Pip } from './Pip';
import { useGuildMemberRoles } from '../components/GuildSettings/hooks/useGuildMemberRoles';
import { useOverflowedGuildRoles } from '../shared-hooks/useOverflowedGuildRoles';
import { useI18nContext } from '../i18n/i18n-react';

export const GuildMemberRolesList = ({
    guildId,
    roleIds,
}: {
    guildId: string;
    roleIds: string[];
}) => {
    const { LL } = useI18nContext();

    const roles = useGuildMemberRoles(guildId, roleIds);
    const { ref, overflowed } = useOverflowedGuildRoles();

    if (!overflowed) {
        return (
            <div className='flex space-x-1' ref={ref}>
                {roles.map((gr) => (
                    <Pip key={gr.id}>{gr.name}</Pip>
                ))}
            </div>
        );
    }

    return (
        <div className='flex space-x-1' ref={ref}>
            {roles.map(
                (gr, idx) =>
                    idx !== roles.length - overflowed && (
                        <Pip truncated key={gr.id}>
                            {gr.name}
                        </Pip>
                    ),
            )}
            <Popover
                className='p-1.5'
                triggerElem={
                    <Button intent='unstyled' padding='none'>
                        <Pip>+{overflowed - 1}</Pip>
                    </Button>
                }
                tooltipText={LL.Tooltips.AllRoles()}
            >
                <h1 className='mb-3 text-xs font-semibold text-gray-12'>
                    {LL.General.AssignedRoles({ count: roles.length })}
                </h1>
                <ul className='flex-col flex space-y-1 rounded-md'>
                    {roles.map((gr) => (
                        <Pip truncated key={gr.id}>
                            {gr.name}
                        </Pip>
                    ))}
                </ul>
            </Popover>
        </div>
    );
};
