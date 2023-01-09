import { Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { WaitForAuth } from '@/components/WaitForAuth';
import { queryClient } from '@/lib/queryClient/queryClient';
import { AccordWebsocket } from '@/components/AccordWebsocket';
import { GuildSettings } from '@/components/GuildSettings';
import { ChannelSettings } from '@/components/ChannelSettings';
import { UserSettings } from '@/components/UserSettings/UserSettings';
import { AppLayout } from '@/shared-components/Layouts';
import { AppSidebar } from '@/components/AppSidebar';
import { ToastsProvider } from '@/shared-components/Toast';
import { GuildCreator } from '@/components/GuildCreator';
import { GuildChannelCreator } from '@/components/GuildChannelCreator';
import { GuildChannelCategoryCreator } from '@/components/GuildChannelCategoryCreator';
import { RelationshipCreator } from '@/components/UserDashboard';
import { GuildInviteCreator } from '@/components/GuildInviteCreator';
import { FullscreenImagePreview } from '@/shared-components/Image';
import { ActionConfirmationDialog } from '@/components/ActionConfirmation';

export const App = () => (
  <WaitForAuth>
    <QueryClientProvider client={queryClient}>
      <AccordWebsocket>
        <ActionConfirmationDialog />
        <GuildCreator />
        <GuildChannelCreator />
        <GuildChannelCategoryCreator />
        <RelationshipCreator />
        <GuildInviteCreator />
        <GuildSettings />
        <ChannelSettings />
        <UserSettings />
        <FullscreenImagePreview />
        <AppLayout>
          <AppSidebar />
          <ToastsProvider>
            <Outlet />
          </ToastsProvider>
        </AppLayout>
      </AccordWebsocket>
    </QueryClientProvider>
  </WaitForAuth>
);
