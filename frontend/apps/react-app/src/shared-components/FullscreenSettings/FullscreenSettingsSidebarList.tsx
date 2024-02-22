import { ReactNode } from 'react';

export const FullscreenSettingsSidebarList = ({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) => <ul className={`w-[180px] space-y-1 ${className}`}>{children}</ul>;
