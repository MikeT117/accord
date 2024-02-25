import { Dialog } from '../../shared-components/Dialog';
import { GuildBanCreatorContent } from './GuildBanCreatorContent';
import { guildBanCreatorStore, useGuildBanCreatorStore } from './stores/guildBanCreatorStore';

export const GuildBanCreator = () => {
    const isOpen = useGuildBanCreatorStore((s) => s.isOpen);
    const user = useGuildBanCreatorStore((s) => s.user);
    const guildId = useGuildBanCreatorStore((s) => s.guildId);

    if (!user || !guildId) {
        return null;
    }

    return (
        <Dialog onClose={guildBanCreatorStore.close} isOpen={isOpen}>
            <GuildBanCreatorContent guildId={guildId} user={user} />
        </Dialog>
    );
};
