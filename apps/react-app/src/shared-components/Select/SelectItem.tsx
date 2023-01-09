import { CheckIcon } from '@heroicons/react/20/solid';
import { Item, ItemText, ItemIndicator, SelectItemProps } from '@radix-ui/react-select';
import { forwardRef } from 'react';

export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps & { children: string }>(
  ({ children, className, ...props }, ref) => {
    return (
      <Item
        className={`relative flex flex-col justify-center space-x-2 whitespace-nowrap rounded py-2 pl-9 text-sm font-medium text-gray-12 hover:cursor-pointer hover:bg-indigoA-10 active:bg-indigoA-11 ${className}`}
        {...props}
        ref={ref}
      >
        <ItemText>{children}</ItemText>
        <ItemIndicator className='absolute left-0'>
          <CheckIcon className='h-4 w-4 shrink-0' />
        </ItemIndicator>
      </Item>
    );
  },
);

SelectItem.displayName = 'SelectItem';
