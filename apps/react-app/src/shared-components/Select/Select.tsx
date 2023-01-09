import { ChevronDownIcon } from '@heroicons/react/20/solid';
import {
  Root,
  Trigger,
  Content,
  Portal,
  Viewport,
  Icon,
  Value,
  SelectProps,
} from '@radix-ui/react-select';
import { ReactNode } from 'react';

export const Select = ({
  children,
  placeholder,
  className = '',
  ...props
}: SelectProps & { placeholder: string; className?: string; children: ReactNode }) => {
  return (
    <Root {...props}>
      <Trigger
        className={`inline-flex items-center justify-between space-x-2 rounded bg-indigo-9 px-3 py-2 text-sm ${className}`}
      >
        <Value placeholder={placeholder} className='whitespace-nowrap text-white' />
        <Icon>
          <ChevronDownIcon className='h-5 w-5 shrink-0' />
        </Icon>
      </Trigger>
      <Portal>
        <Content className='z-[9999] rounded bg-gray-5 p-1'>
          <Viewport>{children}</Viewport>
        </Content>
      </Portal>
    </Root>
  );
};
