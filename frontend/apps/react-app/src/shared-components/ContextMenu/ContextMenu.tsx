import { Root, Trigger, Content } from '@radix-ui/react-context-menu';
import { ReactNode } from 'react';

export const ContextMenu = ({
  className,
  children,
  tiggerElem,
}: {
  className?: string;
  tiggerElem: ReactNode;
  children: ReactNode;
}) => {
  return (
    <Root>
      <Trigger>{tiggerElem}</Trigger>
      <Content className={`z-50 space-y-1 rounded-md bg-gray-6 p-1.5 ${className}`}>
        {children}
      </Content>
    </Root>
  );
};
