import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { forwardRef } from 'react';
import { DefaultTooltip } from '@/shared-components/DefaultTooltip';
import { IconButton } from '@/shared-components/IconButton';
import { ListItem } from '@/shared-components/ListItem';

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
  return (
    <ListItem className='py-2.5' ref={ref} intent='secondary' isHoverable={false}>
      <ShieldExclamationIcon className='h-6 w-6 text-gray-11' />
      <div className='mx-3 flex flex-col space-y-1'>
        <span className='text-sm font-medium text-gray-12'>{name}</span>
        {roleDescription && <span className='text-xs text-gray-11'>{roleDescription}</span>}
      </div>
      <div className='ml-auto flex space-x-2'>
        {typeof onDeleteRole === 'function' && (
          <DefaultTooltip tootipText='Delete Role' position='top'>
            <IconButton
              intent='danger'
              padding='m'
              onClick={(e) => {
                e.stopPropagation();
                onDeleteRole();
              }}
            >
              <TrashIcon className='h-4 w-4' />
            </IconButton>
          </DefaultTooltip>
        )}
        {typeof onEditRole === 'function' && (
          <DefaultTooltip tootipText='Edit Role' position='top'>
            <IconButton
              intent='secondary'
              padding='m'
              onClick={(e) => {
                e.stopPropagation();
                onEditRole();
              }}
            >
              <PencilIcon className='h-4 w-4' />
            </IconButton>
          </DefaultTooltip>
        )}
      </div>
    </ListItem>
  );
});

GuildRoleListItem.displayName = 'GuildRoleListItem';
