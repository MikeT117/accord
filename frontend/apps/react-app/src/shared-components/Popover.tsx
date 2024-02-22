import { ReactNode, useState } from 'react';
import { Root, Trigger, Portal, Content } from '@radix-ui/react-popover';
import { DefaultTooltip } from './DefaultTooltip';

export const Popover = ({
    id,
    triggerClassName,
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
    triggerClassName?: string;
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
                <DefaultTooltip text={tooltipText} position={tooltipPosition}>
                    <Trigger className={triggerClassName} asChild>
                        {triggerElem}
                    </Trigger>
                </DefaultTooltip>
            ) : (
                <Trigger className={triggerClassName} asChild>
                    {triggerElem}
                </Trigger>
            )}
            <Portal>
                <Content
                    id={id}
                    className={`z-[9999] overflow-hidden rounded-md bg-gray-1 ${className}`}
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
