import { Message } from '@/shared-components/Message';
import { actionConfirmationStore } from './stores/useActionConfirmationStore';

import { Dialog } from '@/shared-components/Dialog';
import { Button } from '@/shared-components/Button';
import { Input } from '@/shared-components/Input';
import { ListItem } from '@/shared-components/ListItem';
import { GuildRoleListItem } from '@/components/GuildSettings/GuildRoles/GuildRoleEditor/GuildRoleListItem';
import { RelationshipListItem } from '../UserDashboard/Relationships/RelationshipListItem';
import { useActionConfirmation } from './hooks/useActionConfirmation';
import { useActionConfirmationStore } from './stores/useActionConfirmationStore';
import { useI18nContext } from '../../i18n/i18n-react';

const { close, setConfirmation } = actionConfirmationStore;

export const ActionConfirmationDialogContent = () => {
    const { LL } = useI18nContext();
    const actionConfirmationState = useActionConfirmation();

    if (!actionConfirmationState) {
        return null;
    }

    const {
        user,
        relationship,
        title,
        guild,
        guildRole,
        isConfirmed,
        channel,
        message,
        warning,
        confirmation,
        confirmationLabel,
        confirmationPlaceholder,
        action,
    } = actionConfirmationState;

    const confirm = () => {
        if (typeof action === 'function' && isConfirmed) {
            action();
            close();
        }
    };

    return (
        <div className='flex w-full flex-col bg-grayA-4'>
            <h1 className='p-4 text-lg font-medium text-gray-12'>
                {title.charAt(0).toUpperCase() + title.slice(1)}
            </h1>
            <span className='mb-4 bg-yellow-9 p-2 px-3 text-sm text-black'>{warning}</span>
            <div className='mb-4 px-3'>
                {message && (
                    <ListItem className='py-2.5' intent='secondary' isHoverable={false}>
                        <Message
                            attachments={message.attachments}
                            author={message.author}
                            content={message.content}
                            createdAt={message.createdAt}
                        />
                    </ListItem>
                )}
                {(guild || channel || user) && (
                    <label className='flex w-full flex-col' id='delete-confirmation'>
                        <span className='mb-1.5 text-xs text-gray-11'>{confirmationLabel}</span>
                        <Input
                            id='delete-confirmation'
                            placeholder={confirmationPlaceholder}
                            value={confirmation}
                            onChange={(e) => setConfirmation(e.currentTarget.value)}
                        />
                    </label>
                )}
                {guildRole && <GuildRoleListItem name={guildRole.name} />}
                {relationship && <RelationshipListItem relationship={relationship} />}
            </div>
            <div className='flex justify-between bg-grayA-3 px-4 py-3'>
                <Button intent='link' padding='s' onClick={close}>
                    {LL.Actions.Cancel()}
                </Button>
                <Button intent='danger' onClick={confirm} disabled={!isConfirmed}>
                    {LL.Actions.Delete()}
                </Button>
            </div>
        </div>
    );
};

export const ActionConfirmationDialog = () => {
    const isOpen = useActionConfirmationStore((s) => s.isOpen);
    return (
        <Dialog
            isOpen={isOpen}
            onClose={close}
            className='flex flex-col'
            contentZLevel={2}
            backdropZLevel={2}
        >
            <ActionConfirmationDialogContent />
        </Dialog>
    );
};
