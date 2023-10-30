import { Checkbox } from '@/shared-components/Checkbox';
import { useState } from 'react';
import { Input } from '@/shared-components/Input';
import { ListItem } from '@/shared-components/ListItem';
import { useCustomisableGuildRoles } from '@/shared-hooks/useCustomisableGuildRoles';

export const GuildRoleListSelector = ({
  checkedRoles,
  onRoleToggle,
}: {
  checkedRoles: string[];
  onRoleToggle: (id: string) => void;
}) => {
  const [filter, set] = useState('');
  const roles = useCustomisableGuildRoles();
  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    set(e.currentTarget.value);
  };

  const filteredRoles = filter
    ? roles.filter((r) => r.name.toLowerCase().includes(filter.toLowerCase()))
    : roles;
  return (
    <div className='flex flex-col space-y-4 px-4'>
      <Input
        id='role-filter'
        placeholder='Filter Roles'
        onChange={handleRoleFilterChange}
        value={filter}
      />
      <div className='mb-6 flex h-[300px] flex-col'>
        <span className='mb-2 block whitespace-nowrap text-sm text-gray-11'>
          Roles - {roles.length}
        </span>
        <ul className='space-y-2 overflow-scroll pb-3'>
          {filteredRoles?.map((r) => (
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
