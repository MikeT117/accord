import { QueryClientProvider } from '@tanstack/react-query';
import { WaitForAuth } from '@/components/WaitForAuth';
import { queryClient } from '@/lib/queryClient/queryClient';
import { AccordWebsocket } from '@/components/AccordWebsocket';
import { GuildSettings } from '@/components/GuildSettings';
import { ChannelSettings } from '@/components/ChannelSettings';
import { UserSettings } from '@/components/UserSettings/UserSettingsDialog';
import { AppLayout } from '@/shared-components/Layouts';
import { AppSidebar } from '@/components/AppSidebar';
import { ToastsProvider } from '@/shared-components/Toast';
import { GuildCreator } from '@/components/GuildCreator';
import { GuildChannelCreator } from '@/components/GuildChannelCreator';
import { GuildInviteCreator } from '@/components/GuildInviteCreator';
import { ImageViewer } from '@/shared-components/Image';
import { ActionConfirmationDialog } from '@/components/ActionConfirmation';
import { ReactNode } from 'react';
import { GuildBanCreator } from './components/GuildBanCreator/GuildBanCreatorDialog';
import { RelationshipCreatorDialog } from './components/UserDashboard';

export const App = ({ children }: { children: ReactNode }) => (
    <WaitForAuth>
        <QueryClientProvider client={queryClient}>
            <AccordWebsocket>
                <ActionConfirmationDialog />
                <GuildCreator />
                <GuildChannelCreator />
                <GuildBanCreator />
                <RelationshipCreatorDialog />
                <GuildInviteCreator />
                <GuildSettings />
                <ChannelSettings />
                <UserSettings />
                <ImageViewer />
                <AppLayout>
                    <AppSidebar />
                    <ToastsProvider>{children}</ToastsProvider>
                </AppLayout>
            </AccordWebsocket>
        </QueryClientProvider>
    </WaitForAuth>
);
