import { Message } from '@/shared-components/Message';
import { actionConfirmationStore } from './stores/useActionConfirmationStore';
import { useCallback } from 'react';
import { Dialog } from '@/shared-components/Dialog';
import { Button } from '@/shared-components/Button';
import { Input } from '@/shared-components/Input';
import { ListItem } from '@/shared-components/ListItem';
import { GuildRoleListItem } from '@/components/GuildSettings/GuildRoles/GuildRoleEditor/GuildRoleListItem';
import { RelationshipListItem } from '../UserDashboard/Relationships/RelationshipListItem';
import { useActionConfirmation } from './hooks/useActionConfirmation';
import { useActionConfirmationStore } from './stores/useActionConfirmationStore';

const { toggleOpen, setConfirmation } = actionConfirmationStore;

export const ActionConfirmationDialogContent = () => {
  const actionConfirmationState = useActionConfirmation();
  if (!actionConfirmationState) {
    console.log({ actionConfirmationState });
    return null;
  }

  const {
    account,
    relationship,
    title,
    guild,
    guildRole,
    isConfirmed,
    channel,
    channelMessage,
    warning,
    confirmation,
    confirmationLabel,
    confirmationPlaceholder,
    action,
  } = actionConfirmationState;

  const confirm = async () => {
    if (typeof action === 'function' && isConfirmed) {
      await action();
      toggleOpen();
    }
  };

  return (
    <>
      <h1 className='p-4 text-lg font-medium text-gray-12'>
        {title.charAt(0).toUpperCase() + title.slice(1)}
      </h1>
      <span className='mb-6 bg-yellow-9 p-2 px-4 text-sm text-black'>{warning}</span>
      <div className='mb-6 px-4'>
        {channelMessage && (
          <ListItem className='py-2.5' intent='secondary' isHoverable={false}>
            <Message message={channelMessage} />
          </ListItem>
        )}
        {(guild || channel || account) && (
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
        <Button intent='link' padding='s' onClick={toggleOpen}>
          Cancel
        </Button>
        <Button intent='danger' onClick={confirm} disabled={!isConfirmed}>
          Delete
        </Button>
      </div>
    </>
  );
};

export const ActionConfirmationDialog = () => {
  const isOpen = useActionConfirmationStore(useCallback((s) => s.isOpen, []));
  return (
    <Dialog
      isOpen={isOpen}
      onClose={toggleOpen}
      className='flex flex-col'
      contentZLevel={2}
      backdropZLevel={2}
    >
      <ActionConfirmationDialogContent />
    </Dialog>
  );
};
