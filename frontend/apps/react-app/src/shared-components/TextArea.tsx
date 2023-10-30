import { forwardRef } from 'react';

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    isError?: boolean;
  }
>(({ className = '', isError = false, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={`w-full rounded-md border-none bg-grayA-3 px-3 py-2.5 text-sm text-gray-11 placeholder:text-gray-11 focus:text-gray-12 focus:ring-2 ${
        isError ? 'focus-within:ring-redA-8' : 'focus-within:ring-grayA-8'
      } ${className}`}
      {...props}
    />
  );
});

TextArea.displayName = 'TextArea';
