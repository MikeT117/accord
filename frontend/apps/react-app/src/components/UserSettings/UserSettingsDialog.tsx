import { useCurrentUserSettingsStore } from '.';
import { Dialog } from '../../shared-components/Dialog';
import { UserSettingsContent } from './UserSettingsContent';

export const UserSettings = () => {
    const isOpen = useCurrentUserSettingsStore((s) => s.isOpen);
    return (
        <Dialog size='screen' isOpen={isOpen} onClose={close} className='flex space-x-0.5'>
            <UserSettingsContent />
        </Dialog>
    );
};
