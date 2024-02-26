import { Dialog } from '../../shared-components/Dialog';
import { GuildSettingsContent } from './GuildSettingsContent';
import { useGuildSettingsStore, guildSettingsStore } from './stores/useGuildSettingsStore';

export const GuildSettings = () => {
    const isOpen = useGuildSettingsStore((s) => s.isOpen);
    return (
        <Dialog
            size='screen'
            isOpen={isOpen}
            onClose={guildSettingsStore.close}
            className='flex space-x-0.5'
        >
            <GuildSettingsContent />
        </Dialog>
    );
};
