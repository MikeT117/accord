import { Avatar } from '@/shared-components/Avatar';
import { Checkbox } from '@/shared-components/Checkbox';
import { ListItem } from '@/shared-components/ListItem';
import { IconButton } from '@/shared-components/IconButton';
import { User } from '../../types';
import { Trash } from '@phosphor-icons/react';
import { useI18nContext } from '../../i18n/i18n-react';

export const GuildMemberListItem = ({
    user,
    selected,
    isEditable,
    onToggleSelect,
    onDeleteClick,
}: {
    user: Pick<User, 'id' | 'displayName' | 'avatar'>;
    selected?: boolean;
    isEditable?: boolean;
    onToggleSelect?: () => void;
    onDeleteClick?: () => void;
}) => {
    const { LL } = useI18nContext();

    return (
        <ListItem onClick={onToggleSelect} intent='secondary' isHoverable={false}>
            <Avatar src={user.avatar} className='h-[32px] w-[32px]' />
            <span className='mx-3 mr-auto select-none text-sm'>{user.displayName}</span>
            {typeof onToggleSelect === 'function' && <Checkbox isChecked={selected ?? false} />}
            {isEditable && typeof onDeleteClick === 'function' && (
                <IconButton
                    intent='danger'
                    padding='m'
                    onClick={onDeleteClick}
                    tooltipText={LL.Tooltips.UnassignFromRole()}
                    tooltipPosition='top'
                >
                    <Trash size={16} />
                </IconButton>
            )}
        </ListItem>
    );
};
