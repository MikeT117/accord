import { Root, Trigger, Content } from '@radix-ui/react-context-menu';
import { ReactNode } from 'react';

export const ContextMenu = ({
    children,
    tiggerElem,
    className = '',
}: {
    children: ReactNode;
    tiggerElem: ReactNode;
    className?: string;
}) => {
    return (
        <Root>
            <Trigger>{tiggerElem}</Trigger>
            <Content className={`z-50 space-y-1 rounded-md bg-gray-1 p-1.5 ${className}`}>
                {children}
            </Content>
        </Root>
    );
};
