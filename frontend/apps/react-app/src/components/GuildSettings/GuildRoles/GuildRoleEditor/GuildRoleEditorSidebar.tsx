import { Button } from '@/shared-components/Button';
import { IconButton } from '@/shared-components/IconButton';
import { ListItem } from '@/shared-components/ListItem';
import { guildSettingsStore, GUILD_ROLES } from '../../stores/useGuildSettingsStore';
import { useCreateRoleMutation } from '../../../../api/guildRoles/createGuildRole';
import { GuildRole } from '../../../../types';
import { ArrowLeft, PlusCircle } from '@phosphor-icons/react';
import { useI18nContext } from '../../../../i18n/i18n-react';

const { setSection, setRole } = guildSettingsStore;

export const GuildRoleEditorSidebar = ({
    guildId,
    currentRoleId,
    roles,
}: {
    guildId: string;
    roles: GuildRole[];
    currentRoleId?: string;
}) => {
    const { LL } = useI18nContext();

    const { mutate: createRole } = useCreateRoleMutation();

    return (
        <div className='flex h-full basis-[260px] flex-col border-r-[0.125rem] border-r-gray-2 px-4 pt-12'>
            <div className='mb-4 flex items-center justify-between'>
                <Button
                    intent='link'
                    className='space-x-2'
                    onClick={() => setSection(GUILD_ROLES)}
                    padding='none'
                    tooltipText={LL.Tooltips.BackToOverview()}
                    tooltipDelay={100}
                >
                    <ArrowLeft size={20} />
                    <span className='font-semibold'>{LL.Actions.Back()}</span>
                </Button>
                <IconButton
                    intent='unstyled'
                    padding='xs'
                    onClick={() => createRole(guildId)}
                    tooltipText={LL.Tooltips.CreateRole()}
                    tooltipDelay={100}
                >
                    <PlusCircle size={20} />
                </IconButton>
            </div>
            <ul className='space-y-1 overflow-y-scroll'>
                {roles.map((r) => (
                    <ListItem
                        key={r.id}
                        intent='secondary'
                        baseBg={false}
                        isActive={r.id === currentRoleId}
                        onClick={() => setRole(r.id)}
                        isActionable
                    >
                        <span className='w-0 min-w-[100%] truncate'>{r.name}</span>
                    </ListItem>
                ))}
            </ul>
        </div>
    );
};
