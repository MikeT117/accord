import { PencilSimple, ShieldWarning, Trash } from '@phosphor-icons/react';
import { forwardRef } from 'react';
import { IconButton } from '@/shared-components/IconButton';
import { ListItem } from '@/shared-components/ListItem';
import { useI18nContext } from '../../../../i18n/i18n-react';

export const GuildRoleListItem = forwardRef<
    HTMLLIElement,
    {
        name: string;
        roleDescription?: string;
        onClick?: () => void;
        onDeleteRole?: () => void;
        onEditRole?: () => void;
    }
>(({ name, roleDescription, onDeleteRole, onEditRole }, ref) => {
    const { LL } = useI18nContext();

    return (
        <ListItem className='py-2.5' ref={ref} intent='secondary' isHoverable={false}>
            <ShieldWarning size={24} weight='duotone' className='fill-amber-500' />
            <div className='mx-3 flex flex-col space-y-1'>
                <span className='text-sm font-medium text-gray-12'>{name}</span>
                {roleDescription && <span className='text-xs text-gray-11'>{roleDescription}</span>}
            </div>
            <div className='ml-auto flex space-x-2'>
                {typeof onDeleteRole === 'function' && (
                    <IconButton
                        intent='danger'
                        padding='s'
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteRole();
                        }}
                        tooltipText={LL.Tooltips.DeleteRole()}
                        tooltipPosition='top'
                    >
                        <Trash size={18} weight='duotone' />
                    </IconButton>
                )}
                {typeof onEditRole === 'function' && (
                    <IconButton
                        intent='secondary'
                        padding='s'
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditRole();
                        }}
                        tooltipText={LL.Tooltips.EditRole()}
                        tooltipPosition='top'
                    >
                        <PencilSimple size={18} weight='duotone' />
                    </IconButton>
                )}
            </div>
        </ListItem>
    );
});

GuildRoleListItem.displayName = 'GuildRoleListItem';
