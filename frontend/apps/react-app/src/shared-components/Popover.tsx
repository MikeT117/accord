import { ReactNode, useState } from 'react';
import { Root, Trigger, Portal, Content } from '@radix-ui/react-popover';
import { DefaultTooltip } from './DefaultTooltip';

export const Popover = ({
  id,
  className,
  triggerElem,
  tooltipText,
  tooltipPosition,
  children,
  align,
  side,
  sideOffset,
  alignOffset,
}: {
  id?: string;
  className?: string;
  tooltipText?: string;
  tooltipPosition?: 'bottom' | 'top' | 'right' | 'left';
  triggerElem: ReactNode;
  children?: ReactNode;
  side?: 'top' | 'bottom' | 'right' | 'left';
  sideOffset?: number;
  alignOffset?: number;
  align?: 'start' | 'center' | 'end';
}) => {
  const [isOpen, set] = useState(false);
  return (
    <Root onOpenChange={set}>
      {tooltipText ? (
        <DefaultTooltip tootipText={tooltipText} position={tooltipPosition}>
          <Trigger asChild>{triggerElem}</Trigger>
        </DefaultTooltip>
      ) : (
        <Trigger asChild>{triggerElem}</Trigger>
      )}
      <Portal>
        <Content
          id={id}
          className={`z-[9999] flex h-full flex-col overflow-hidden rounded bg-gray-3 ${className}`}
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
        >
          {isOpen && children}
        </Content>
      </Portal>
    </Root>
  );
};
