import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { forwardRef, ReactNode } from 'react';
import type { Channel, GuildCategoryChannel } from '@accord/common';
import { ChannelContextMenu } from './ChannelContextMenu';
import { Root, Item, Trigger, Content } from '@radix-ui/react-accordion';
import { collapsedCategoriesActions } from './stores/collapsedCategoriesStore';
import { useDrop } from 'react-dnd';
import { useUpdateChannelMutation } from '@/api/channel/updateChannel';
import { mergeRefs } from 'react-merge-refs';
import { useCollapsedCategoryById } from './hooks/useCollapsedCategoryById';

const { toggleCategory } = collapsedCategoriesActions;

export const CategoryChannelListItem = forwardRef<
  HTMLDivElement,
  Pick<GuildCategoryChannel, 'id' | 'name' | 'type'> & {
    isActive: boolean;
    children: ReactNode;
    onDelete: () => void;
    onSettings: () => void;
  }
>(({ id, name, type, children, onDelete, onSettings }, ref) => {
  const isExpanded = useCollapsedCategoryById(id);

  const { mutate: updateChannel } = useUpdateChannelMutation();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'GUILD_CHANNEL',
    drop: (channel: Channel) => {
      updateChannel({ ...channel, parentId: id });
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <Root
      type='single'
      collapsible
      value={isExpanded}
      onValueChange={() => toggleCategory(id)}
      ref={mergeRefs([ref, drop])}
      className={`rounded ${isOver ? 'bg-grayA-3' : ''}`}
    >
      <Item value={id} className='rounded'>
        <ChannelContextMenu type={type} id={id} onDelete={onDelete} onSettings={onSettings}>
          <Trigger className='flex w-full items-center space-x-1 py-1 text-gray-11 hover:text-gray-12'>
            <ChevronDownIcon
              className={`h-3 w-3 stroke-[4px] transition-transform ${
                isExpanded ? '' : '-rotate-90'
              }`}
            />
            <span className='text-xs font-semibold'>{name}</span>
          </Trigger>
        </ChannelContextMenu>
        {isExpanded && (
          <Content className='flex flex-col space-y-1 pl-3' asChild>
            <ul className='py-1'>{children}</ul>
          </Content>
        )}
      </Item>
    </Root>
  );
});

CategoryChannelListItem.displayName = 'CategoryChannelListItem';
