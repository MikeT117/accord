import { ReactNode } from 'react';

export const AppLayout = ({ children }: { children: ReactNode }) => (
    <div
        className={String.raw`grid h-screen w-screen grid-cols-[min-content_240px_1fr_min-content] grid-rows-[55px_1fr_min-content] [grid-template-areas:"app-sidebar_main-sidebar-header_main-content-header_guild-members-panel-header""app-sidebar_main-sidebar-body_main-content-body_guild-members-panel-body""app-sidebar_main-sidebar-body_main-content-footer_guild-members-panel-footer"]`}
    >
        {children}
    </div>
);
