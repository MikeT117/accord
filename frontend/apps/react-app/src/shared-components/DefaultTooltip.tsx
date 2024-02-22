import { Provider, Root, Trigger, Portal, Content, TooltipArrow } from '@radix-ui/react-tooltip';
import { forwardRef, ReactNode } from 'react';

export type DefaultTooltipProps = {
    text: string;
    delay?: number;
    position?: 'top' | 'right' | 'bottom' | 'left';
    children: ReactNode;
    className?: string;
};

export const DefaultTooltip = forwardRef<HTMLButtonElement, DefaultTooltipProps>(
    ({ text, children, position = 'top', delay = 200 }, ref) => (
        <Provider delayDuration={delay}>
            <Root>
                <Trigger ref={ref} asChild>
                    {children}
                </Trigger>
                <Portal>
                    <Content
                        side={position}
                        sideOffset={4}
                        className='z-[9999] flex items-center rounded-md bg-gray-6 px-2 py-1.5 shadow'
                    >
                        <span className='text-xs text-gray-12'>{text}</span>
                        <TooltipArrow className='fill-gray-4' />
                    </Content>
                </Portal>
            </Root>
        </Provider>
    ),
);

DefaultTooltip.displayName = 'DefaultTooltip';
