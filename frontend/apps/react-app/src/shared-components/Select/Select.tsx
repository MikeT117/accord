import { CaretDown } from '@phosphor-icons/react';
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
    required,
    value,
    onValueChange,
    children,
    placeholder,
    className = '',
}: Pick<SelectProps, 'onValueChange' | 'required' | 'value'> & {
    placeholder: string;
    className?: string;
    children: ReactNode;
}) => (
    <Root required={required} value={value} onValueChange={onValueChange}>
        <Trigger
            className={`inline-flex items-center justify-between space-x-2 rounded-md bg-indigo-9 px-3 py-2 text-sm ${className}`}
        >
            <Value placeholder={placeholder} className='whitespace-nowrap text-white' />
            <Icon>
                <CaretDown size={20} className='shrink-0' />
            </Icon>
        </Trigger>
        <Portal>
            <Content className='z-[9999] rounded-md bg-gray-5 p-1'>
                <Viewport>{children}</Viewport>
            </Content>
        </Portal>
    </Root>
);
