import { StarIcon } from '@heroicons/react/20/solid';
import { ReactNode } from 'react';
import { LoadingSpinner } from '@/shared-components/LoadingSpinner';
import { IconButton } from '@/shared-components/IconButton';
import { Popover } from '@/shared-components/Popover';
import { InfiniteLoad } from '@/shared-components/InfiniteLoad';
import { PinnedMessageListItem } from '@/shared-components/Message/PinnedMessageListItem';
import { useGetChannelPinsQuery } from '../../api/channelPins/getChannelPins';

export const PinnedMessagesPopoverContent = ({
  channelId,
  permissions,
}: {
  channelId: string;
  permissions: number;
}) => {
  const { data, isLoading, fetchNextPage } = useGetChannelPinsQuery(channelId);
  return (
    <>
      <div className='flex items-center bg-grayA-3 px-4 py-3'>
        <h1 className='font-semibold text-gray-12'>Pinned Messages</h1>
      </div>
      {!isLoading && data?.pages?.[0].length === 0 ? (
        <>
          <div className='flex w-full flex-col py-3'>
            <span className='m-auto w-[65%] p-4 text-xs text-gray-11'>
              This channel, doesn&apos;t have any pinned messages
            </span>
          </div>
          <div className='flex justify-center bg-grayA-3 px-4 py-4'>
            <span className='text-xs text-gray-11'>
              Users with &apos;<span className='font-semibold'>Manage Messages</span>&apos; can pin
              messages
            </span>
          </div>
        </>
      ) : (
        <ul className='flex flex-col-reverse space-y-2 space-y-reverse overflow-x-auto px-2 pb-2'>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            data?.pages.map((page) =>
              page.map((message) => (
                <PinnedMessageListItem
                  key={message.id}
                  message={message}
                  permissions={permissions}
                />
              )),
            )
          )}
          <InfiniteLoad onInView={fetchNextPage} />
        </ul>
      )}
    </>
  );
};

export const PinnedMessagesPopover = ({
  children,
  ...props
}: {
  children?: ReactNode;
  side?: 'top' | 'bottom' | 'right' | 'left';
  sideOffset?: number;
  alignOffset?: number;
  align?: 'start' | 'center' | 'end';
}) => {
  return (
    <Popover
      className='max-h-[80vh] w-[400px]'
      tooltipText='Pinned Messages'
      triggerElem={
        <IconButton intent='secondary'>
          <StarIcon className='h-4 w-4' />
        </IconButton>
      }
      {...props}
    >
      {children}
    </Popover>
  );
};
