import { ReactNode } from 'react';

export const MainSidebarHeaderLayout = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`flex items-center border-b border-r border-black [grid-area:main-sidebar-header] ${className}`}
  >
    {children}
  </div>
);
