import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { forwardRef, ReactNode } from 'react';
import { GuildChannelContextMenu } from './GuildChannelContextMenu';
import { Root, Item, Trigger, Content } from '@radix-ui/react-accordion';
import { collapsedCategoriesStore } from './stores/collapsedCategoriesStore';
import { useDrop } from 'react-dnd';
import { mergeRefs } from 'react-merge-refs';
import { useCollapsedCategoryById } from './hooks/useCollapsedCategoryById';
import { useUpdateGuildChannelMutation } from '../../api/channels/updateGuildChannel';
import { GuildChannel } from '../../types';

const { toggleCategory } = collapsedCategoriesStore;

export const CategoryChannelListItem = forwardRef<
  HTMLDivElement,
  {
    categoryChannel: GuildChannel;
    isActive: boolean;
    children: ReactNode;
    onDelete: () => void;
    onSettings: () => void;
  }
>(({ categoryChannel, children, onDelete, onSettings }, ref) => {
  const isExpanded = useCollapsedCategoryById(categoryChannel.id);

  const { mutate: updateGuildChannel } = useUpdateGuildChannelMutation();

  // TODO: present a prompt to the user so that they may
  // decide to sync permissionw with the parent or not
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'GUILD_CHANNEL',
    drop: (channel: GuildChannel) => {
      updateGuildChannel({
        channelId: channel.id,
        guildId: channel.guildId,
        parentId: categoryChannel.id,
        sync: true,
      });
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
      onValueChange={() => toggleCategory(categoryChannel.id)}
      ref={mergeRefs([ref, drop])}
      className={`rounded ${isOver ? 'bg-grayA-3' : ''}`}
    >
      <Item value={categoryChannel.id} className='rounded'>
        <GuildChannelContextMenu
          id={categoryChannel.id}
          channelType={categoryChannel.channelType}
          onDelete={onDelete}
          onSettings={onSettings}
        >
          <Trigger className='flex w-full items-center space-x-1 py-1 text-gray-11 hover:text-gray-12'>
            <ChevronDownIcon
              className={`h-3 w-3 stroke-[4px] transition-transform ${
                isExpanded ? '' : '-rotate-90'
              }`}
            />
            <span className='text-xs font-semibold'>{categoryChannel.name}</span>
          </Trigger>
        </GuildChannelContextMenu>
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
