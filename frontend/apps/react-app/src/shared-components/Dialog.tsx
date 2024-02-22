import { Root, Portal, Content, Overlay } from '@radix-ui/react-dialog';
import { cva, VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

const dialogContentStyles = cva('bg-gray-1 fixed overflow-auto', {
    variants: {
        size: {
            unsized: 'rounded-md top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]',
            small: 'max-h-[720px] w-[440px] max-w-[440px] rounded-md top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]',
            medium: 'max-h-[720px] w-[640px] max-w-[640px] rounded-md top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]',
            large: 'max-h-[720px] w-[840px] max-w-[840px] rounded-md top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]',
            screen: 'top-0 left-0 h-screen w-screen',
        },
        contentZLevel: {
            5: 'z-[500]',
            4: 'z-[400]',
            3: 'z-[300]',
            2: 'z-[200]',
            1: 'z-[100]',
        },
    },
    defaultVariants: {
        size: 'small',

        contentZLevel: 1,
    },
});

const dialogBackdropStyles = cva('fixed inset-0 bg-gray-1/80', {
    variants: {
        backdropZLevel: {
            5: 'z-[500]',
            4: 'z-[400]',
            3: 'z-[300]',
            2: 'z-[200]',
            1: 'z-[100]',
        },
    },
    defaultVariants: {
        backdropZLevel: 1,
    },
});

export interface DialogProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof dialogBackdropStyles>,
        VariantProps<typeof dialogContentStyles> {
    isOpen: boolean;
    onClose: () => void;
}

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(
    (
        {
            isOpen,
            onClose,
            children,
            size = 'small',
            contentZLevel = 1,
            backdropZLevel = 1,
            className,
        },
        ref,
    ) => {
        return (
            <Root modal={true} open={isOpen}>
                {size !== 'screen' && (
                    <Overlay className={dialogBackdropStyles({ backdropZLevel })} />
                )}
                <Portal>
                    {isOpen && (
                        <Content
                            ref={ref}
                            className={dialogContentStyles({
                                size,
                                contentZLevel,
                                class: className,
                            })}
                            onEscapeKeyDown={onClose}
                            onPointerDownOutside={onClose}
                        >
                            {children}
                        </Content>
                    )}
                </Portal>
            </Root>
        );
    },
);

Dialog.displayName = 'Dialog';
