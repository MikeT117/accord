import { forwardRef, ReactNode } from 'react';

export const Input = forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement> & {
        leftInputElement?: ReactNode;
        rightInputElement?: ReactNode;
        isError?: boolean;
    }
>(({ leftInputElement, rightInputElement, className = '', isError = false, ...props }, ref) => {
    return (
        <div
            className={`flex w-full items-center rounded-md bg-gray-1 px-3 py-0 focus-within:ring-2 ${
                isError ? 'focus-within:ring-redA-8' : 'focus-within:ring-grayA-8'
            } ${className}`}
        >
            {leftInputElement && (
                <div className='mr-3 flex items-center justify-center'>{leftInputElement}</div>
            )}
            <input
                ref={ref}
                type='text'
                className='w-full border-none bg-transparent px-0 py-2.5 text-sm placeholder:text-grayA-10 text-gray-11 focus:text-gray-12 focus:ring-0'
                {...props}
            />
            {rightInputElement && (
                <div className='ml-3 flex items-center justify-center'>{rightInputElement}</div>
            )}
        </div>
    );
});

Input.displayName = 'Input';
