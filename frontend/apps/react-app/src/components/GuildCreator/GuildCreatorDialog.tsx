import { useGuildCreatorStore, guildCreatorStore } from '.';
import { Dialog } from '../../shared-components/Dialog';
import { GuildCreatorContent } from './GuildCreatorContent';

export const GuildCreator = () => {
    const isOpen = useGuildCreatorStore((s) => s.isOpen);
    return (
        <Dialog onClose={guildCreatorStore.close} isOpen={isOpen}>
            <GuildCreatorContent />
        </Dialog>
    );
};
