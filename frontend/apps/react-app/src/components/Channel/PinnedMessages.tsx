import { ReactNode } from 'react';
import { LoadingSpinner } from '@/shared-components/LoadingSpinner';
import { IconButton } from '@/shared-components/IconButton';
import { Popover } from '@/shared-components/Popover';
import { InfiniteLoad } from '@/shared-components/InfiniteLoad';
import { PinnedMessageListItem } from '@/shared-components/Message/PinnedMessageListItem';
import { useInfiniteChannelPinsQuery } from '../../api/channelPins/getChannelPins';
import { PushPin } from '@phosphor-icons/react';
import { useI18nContext } from '../../i18n/i18n-react';

export const PinnedMessagesPopoverContent = ({
    channelId,
    permissions,
}: {
    channelId: string;
    permissions: number;
}) => {
    const { LL } = useI18nContext();
    const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteChannelPinsQuery(channelId);

    if (isLoading) {
        <LoadingSpinner />;
    }

    if (data?.pages?.[0].length === 0) {
        return (
            <>
                <div className='flex w-full flex-col py-3 bg-grayA-2'>
                    <span className='text-center m-auto w-[65%] p-4 font-medium text-xs text-gray-11'>
                        {LL.Hints.NoPinnedMessages()}
                    </span>
                </div>
                <div className='flex justify-center px-4 py-4'>
                    <span className='text-xs text-gray-11'>{LL.Hints.PinMessages()}</span>
                </div>
            </>
        );
    }

    return (
        <ul className='flex flex-col-reverse space-y-2 space-y-reverse overflow-x-auto px-2 pb-2 bg-grayA-2'>
            {data?.pages.map((page) =>
                page.map((message) => (
                    <PinnedMessageListItem
                        key={message.id}
                        message={message}
                        permissions={permissions}
                    />
                )),
            )}
            <InfiniteLoad enabled={hasNextPage} onInView={fetchNextPage} />
        </ul>
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
    const { LL } = useI18nContext();
    return (
        <Popover
            className='max-h-[80vh] w-[400px] border border-gray-2'
            tooltipText={LL.Tooltips.PinnedMessages()}
            triggerElem={
                <IconButton intent='secondary'>
                    <PushPin size={20} weight='fill' />
                </IconButton>
            }
            {...props}
        >
            <div className='flex items-center px-4 py-3'>
                <h1 className='font-semibold text-gray-12'>{LL.General.PinnedMessages()}</h1>
            </div>
            {children}
        </Popover>
    );
};
