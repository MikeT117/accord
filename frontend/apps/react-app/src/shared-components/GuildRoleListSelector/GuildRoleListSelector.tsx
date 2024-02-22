import { Checkbox } from '@/shared-components/Checkbox';
import { Input } from '@/shared-components/Input';
import { ListItem } from '@/shared-components/ListItem';
import { useCustomisableGuildRoles } from './hooks/useCustomisableGuildRoles';
import { useFilteredRoles } from '../../shared-hooks/useFilteredRoles';
import { useI18nContext } from '../../i18n/i18n-react';

export const GuildRoleListSelector = ({
    checkedRoles,
    onRoleToggle,
}: {
    checkedRoles: string[];
    onRoleToggle: (id: string) => void;
}) => {
    const { LL } = useI18nContext();

    const roles = useCustomisableGuildRoles();
    const { filter, filteredRoles, setFilter } = useFilteredRoles(roles);
    const handleRoleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(e.currentTarget.value);
    };

    return (
        <div className='flex flex-col space-y-4 px-4'>
            <Input
                id='role-filter'
                placeholder={LL.Inputs.Placeholders.FilterRoles()}
                onChange={handleRoleFilterChange}
                value={filter}
            />
            <div className='mb-6 flex h-[300px] flex-col'>
                <span className='mb-2 block whitespace-nowrap text-sm text-gray-11'>
                    {LL.General.RolesCount({ count: roles.length })}
                </span>
                <ul className='space-y-2 overflow-scroll pb-3'>
                    {filteredRoles.map((r) => (
                        <ListItem
                            intent='secondary'
                            isActionable
                            className='py-3'
                            key={r.id}
                            onClick={() => onRoleToggle(r.id)}
                        >
                            <span className='mr-auto select-none text-gray-12'>{r.name}</span>
                            <Checkbox isChecked={checkedRoles.includes(r.id)} />
                        </ListItem>
                    ))}
                </ul>
            </div>
        </div>
    );
};
