import { FingerPrintIcon, TrashIcon } from '@heroicons/react/24/solid';
import { DefaultTooltip } from '@/shared-components/DefaultTooltip';
import { IconButton } from '@/shared-components/IconButton';
import { ListItem } from '@/shared-components/ListItem';
import { TimeAgo } from '@/shared-components/TimeAgo';
import { Pip } from '../../shared-components/Pip';
import { useCurrentUserSessions } from './hooks/useCurrentUserSessions';

export const UserSessions = () => {
  const { sessions, deleteSession } = useCurrentUserSessions();
  return (
    <div className='flex flex-col space-y-6 pl-8 pt-12'>
      <h1 className='text-3xl font-semibold text-gray-12'>Sessions Manager</h1>
      <div className='flex flex-col space-y-2'>
        <span className='text-sm text-gray-11'>Sessions</span>
        <ul className='space-y-1'>
          {sessions?.pages.map((page) =>
            page.map((s) => (
              <ListItem
                key={s.id}
                intent='secondary'
                className='justify-between'
                isHoverable={false}
                padding='lg'
              >
                <FingerPrintIcon className='h-5 w-5' />
                <span>{s.id}</span>
                <TimeAgo
                  className='w-[90px] whitespace-nowrap align-bottom text-xs font-medium text-gray-11'
                  date={s.createdAt}
                />
                <div className='flex w-[120px] items-center justify-end'>
                  {s.isCurrentSession ? (
                    <Pip>Current Session</Pip>
                  ) : (
                    <DefaultTooltip tootipText='Delete Session'>
                      <IconButton intent='danger' onClick={() => deleteSession(s)}>
                        <TrashIcon className='h-4 w-4' />
                      </IconButton>
                    </DefaultTooltip>
                  )}
                </div>
              </ListItem>
            )),
          )}
        </ul>
      </div>
    </div>
  );
};
