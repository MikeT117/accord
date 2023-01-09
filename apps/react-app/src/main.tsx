import './index.css';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { App } from '@/App';
import { ChannelSidebar } from '@/components/ChannelSidebar';
import { GuildBrowser } from '@/components/GuildBrowser';
import { Login } from '@/components/Landing';
import { UserDashboard, UserDashboardRelationships } from '@/components/UserDashboard';
import { UserDashboardBlockedRelationships } from '@/components/UserDashboard/Relationships/Blocked/UserDashboardBlockedRelationships';
import { UserDashboardFriendRequests } from '@/components/UserDashboard/Relationships/Requests/UserDashboardFriendRequests';
import { PrivateChannel } from './components/Channel/PrivateChannel';
import { GuildChannel } from './components/Channel/GuildChannel';

const rootElem = document.getElementById('app');
if (rootElem) {
  ReactDOM.createRoot(rootElem).render(
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/app' element={<App />}>
            <Route path='/app/public-servers' element={<GuildBrowser />} />
            <Route path='/app/@me' element={<UserDashboard />}>
              <Route path='/app/@me/friends' element={<UserDashboardRelationships />} />
              <Route path='/app/@me/requests' element={<UserDashboardFriendRequests />} />
              <Route path='/app/@me/blocked' element={<UserDashboardBlockedRelationships />} />
              <Route path='/app/@me/channel/:channelId' element={<PrivateChannel />} />
            </Route>
            <Route
              path='/app/server/:guildId'
              element={
                <DndProvider backend={HTML5Backend}>
                  <ChannelSidebar />
                </DndProvider>
              }
            >
              <Route path='/app/server/:guildId/channel/:channelId' element={<GuildChannel />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </StrictMode>,
  );
}
