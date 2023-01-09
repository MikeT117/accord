import {
  Root,
  Trigger,
  Portal,
  Content,
  DropdownMenuContentProps,
} from '@radix-ui/react-dropdown-menu';
import { forwardRef, ReactNode } from 'react';
import { DefaultTooltip } from '@/shared-components/DefaultTooltip';

export const DropdownMenu = forwardRef<
  HTMLButtonElement,
  DropdownMenuContentProps & {
    tooltipText?: string;
    tooltipPosition?: 'bottom' | 'top' | 'right' | 'left';
    triggerElem: ReactNode;
  }
>(({ triggerElem, children, tooltipText, tooltipPosition, className = '', ...props }, ref) => {
  return (
    <Root>
      {tooltipText ? (
        <DefaultTooltip tootipText={tooltipText} position={tooltipPosition}>
          <Trigger asChild ref={ref}>
            {triggerElem}
          </Trigger>
        </DefaultTooltip>
      ) : (
        <Trigger asChild ref={ref}>
          {triggerElem}
        </Trigger>
      )}
      <Portal>
        <Content
          className={`z-[9999] space-y-1 rounded-md bg-gray-6 p-1.5 ${className}`}
          {...props}
        >
          {children}
        </Content>
      </Portal>
    </Root>
  );
});

DropdownMenu.displayName = 'DropdownMenu';
