import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { App } from '@/App';
import { ChannelSidebar } from '@/components/ChannelSidebar';
import { GuildBrowser } from '@/components/GuildBrowser';
import { Login } from '@/components/Landing';
import { UserDashboardRelationships } from '@/components/UserDashboard';
import { UserDashboardBlockedRelationships } from '@/components/UserDashboard/Relationships/Blocked/UserDashboardBlockedRelationships';
import { UserDashboardFriendRequests } from '@/components/UserDashboard/Relationships/Requests/UserDashboardFriendRequests';
import { PrivateChannel } from './components/Channel/PrivateChannel';
import { GuildChannel } from './components/Channel/GuildChannel';
import { UserDashboardSidebar } from './components/UserDashboard/UserDashboardSidebar/UserDashboardSidebar';
import { ErrorBoundary } from 'react-error-boundary';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/app',
    element: <App />,
    children: [
      {
        path: '/app/public-servers',
        element: <GuildBrowser />,
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
    <ErrorBoundary fallback={<p>Something went wrong!</p>}>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
);
