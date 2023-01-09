import { Provider, Root, Trigger, Portal, Content, TooltipArrow } from '@radix-ui/react-tooltip';
import { forwardRef, ReactNode } from 'react';

export const DefaultTooltip = forwardRef<
  HTMLButtonElement,
  {
    tootipText: string;
    children: ReactNode;
    className?: string;
    position?: 'top' | 'right' | 'bottom' | 'left';
    delayDuration?: number;
  }
>(({ tootipText, children, position = 'top', delayDuration = 200 }, ref) => {
  return (
    <Provider delayDuration={delayDuration}>
      <Root>
        <Trigger ref={ref} asChild>
          {children}
        </Trigger>
        <Portal>
          <Content
            side={position}
            sideOffset={4}
            className='z-[9999] flex items-center rounded bg-gray-6 px-2 py-1.5 shadow'
          >
            <span className='text-xs text-gray-12'>{tootipText}</span>
            <TooltipArrow className='fill-gray-4' />
          </Content>
        </Portal>
      </Root>
    </Provider>
  );
});

DefaultTooltip.displayName = 'DefaultTooltip';
