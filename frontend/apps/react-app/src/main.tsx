import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { App } from '@/App';
import { ChannelSidebar } from '@/components/ChannelSidebar';
import { GuildBrowser, GuildBrowserSidebar } from '@/components/GuildBrowser';
import { Login } from '@/components/Landing';
import {
    UserDashboardRelationships,
    UserDashboardBlockedRelationships,
    UserDashboardFriendRequests,
    UserDashboardSidebar,
} from '@/components/UserDashboard';
import { GuildChannel, PrivateChannel } from '@/components/Channel';
import { Locale } from './shared-components/Locale';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Login />,
    },
    {
        path: '/app',
        element: (
            <App>
                <Outlet />
            </App>
        ),
        children: [
            {
                path: '/app/public-servers',
                element: (
                    <>
                        <GuildBrowserSidebar />
                        <GuildBrowser />
                    </>
                ),
            },
            {
                path: '/app/@me',
                element: (
                    <>
                        <UserDashboardSidebar />
                        <Outlet />
                    </>
                ),
                children: [
                    {
                        path: '/app/@me/friends',
                        element: <UserDashboardRelationships />,
                    },
                    {
                        path: '/app/@me/requests',
                        element: <UserDashboardFriendRequests />,
                    },
                    {
                        path: '/app/@me/blocked',
                        element: <UserDashboardBlockedRelationships />,
                    },
                    {
                        path: '/app/@me/channel/:channelId',
                        element: <PrivateChannel />,
                    },
                ],
            },
            {
                path: '/app/server/:guildId',
                element: (
                    <DndProvider backend={HTML5Backend}>
                        <ChannelSidebar />
                        <Outlet />
                    </DndProvider>
                ),
                children: [
                    {
                        path: '/app/server/:guildId/channel/:channelId',
                        element: <GuildChannel />,
                    },
                ],
            },
        ],
    },
]);

createRoot(document.getElementById('app')!).render(
    <StrictMode>
        <Locale>
            <RouterProvider router={router} />
        </Locale>
    </StrictMode>,
);
