import { cva, VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

const buttonStyles = cva(
  'flex items-center justify-center rounded focus:outline-none cursor-pointer font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap font shrink-0',
  {
    variants: {
      intent: {
        primary: 'hover:bg-indigo-10 active:bg-indigo-11 text-white',
        primaryAlpha: 'hover:bg-indigoA-5 active:bg-indigoA-6 text-indigo-11',
        secondary: 'hover:bg-gray-10 active:bg-gray-11 text-white',
        secondaryAlpha: 'hover:bg-grayA-5 active:bg-grayA-6 text-gray-11',
        warning: 'hover:bg-yellow-10 active:bg-yellow-11 text-black',
        warningAlpha: 'hover:bg-yellowA-5 active:bg-yellowA-6 text-yellow-11',
        danger: 'hover:bg-red-10 active:bg-red-11 text-white',
        dangerAlpha: 'hover:bg-redA-5 active:bg-redA-6 text-red-11',
        success: 'hover:bg-mint-10 active:bg-mint-11 text-black',
        successAlpha: 'hover:bg-mintA-5 active:bg-mintA-6 text-mint-11',
        link: 'bg-transparent hover:underline text-gray-11 hover:text-gray-12',
        unstyled: '',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-min',
      },
      isActive: {
        true: '',
        false: '',
      },
      padding: {
        none: '',
        xs: 'px-1 py-0.5',
        s: 'px-3 py-1.5',
        m: 'px-4 py-2',
      },
      baseBg: {
        true: '',
        false: '',
      },
    },

    compoundVariants: [
      { intent: 'primary', baseBg: true, class: 'bg-indigo-9' },
      { intent: 'primaryAlpha', baseBg: true, class: 'bg-indigoA-4' },
      { intent: 'secondary', baseBg: true, class: 'bg-gray-9' },
      { intent: 'secondaryAlpha', baseBg: true, class: 'bg-grayA-4' },
      { intent: 'warning', baseBg: true, class: 'bg-yellow-9' },
      { intent: 'warningAlpha', baseBg: true, class: 'bg-yellowA-4' },
      { intent: 'danger', baseBg: true, class: 'bg-red-9' },
      { intent: 'dangerAlpha', baseBg: true, class: 'bg-redA-4' },
      { intent: 'success', baseBg: true, class: 'bg-mint-9' },
      { intent: 'successAlpha', baseBg: true, class: 'bg-mintA-4' },
      { intent: 'primary', isActive: true, class: '!bg-indigo-11' },

      { intent: 'primaryAlpha', isActive: true, class: '!bg-indigoA-6' },
      { intent: 'secondary', isActive: true, class: '!bg-gray-11' },
      { intent: 'secondaryAlpha', isActive: true, class: '!bg-grayA-6' },
      { intent: 'warning', isActive: true, class: '!bg-yellow-11' },
      { intent: 'warningAlpha', isActive: true, class: '!bg-yellowA-6' },
      { intent: 'danger', isActive: true, class: '!bg-red-11' },
      { intent: 'dangerAlpha', isActive: true, class: '!bg-redA-6' },
      { intent: 'success', isActive: true, class: '!bg-mint-11' },
      { intent: 'successAlpha', isActive: true, class: '!bg-mintA-6' },
    ],

    defaultVariants: {
      intent: 'primary',
      padding: 'm',
      fullWidth: false,
      isActive: false,
      baseBg: true,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      intent = 'primary',
      fullWidth = false,
      className = '',
      padding = 'm',
      isActive = false,
      baseBg = true,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        className={buttonStyles({ intent, fullWidth, isActive, baseBg, padding, class: className })}
        {...props}
        ref={ref}
      />
    );
  },
);

Button.displayName = 'Button';
