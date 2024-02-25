import { Dialog } from '../../shared-components/Dialog';
import { ChannelSettingsContent } from './ChannelSettingsContent';
import { useChannelSettingsStore, channelSettingsStore } from './stores/useChannelSettingsStore';

export const ChannelSettings = () => {
    const isOpen = useChannelSettingsStore((s) => s.isOpen);
    return (
        <Dialog
            isOpen={isOpen}
            onClose={channelSettingsStore.close}
            size='screen'
            className='flex space-x-0.5'
        >
            <ChannelSettingsContent />
        </Dialog>
    );
};
