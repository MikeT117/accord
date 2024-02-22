import { ReactNode } from 'react';

export const MainSidebarHeaderLayout = ({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) => (
    <div
        className={`flex items-center bg-grayA-2 mr-0.5 mb-0.5 [grid-area:main-sidebar-header] ${className}`}
    >
        {children}
    </div>
);
