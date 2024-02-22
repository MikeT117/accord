import { useI18nContext } from '../../../i18n/i18n-react';
import { useActionConfirmationStore } from '../stores/useActionConfirmationStore';

export const useActionConfirmation = () => {
    const { LL } = useI18nContext();

    const actionSubject = useActionConfirmationStore((s) => s.actionSubject);
    const actionType = useActionConfirmationStore((s) => s.actionType);
    const user = useActionConfirmationStore((s) => s.user);
    const relationship = useActionConfirmationStore((s) => s.relationship);
    const guild = useActionConfirmationStore((s) => s.guild);
    const channel = useActionConfirmationStore((s) => s.channel);
    const message = useActionConfirmationStore((s) => s.message);
    const guildRole = useActionConfirmationStore((s) => s.guildRole);
    const confirmation = useActionConfirmationStore((s) => s.confirmation);
    const action = useActionConfirmationStore((s) => s.action);

    if (!actionSubject || !actionType || (!guild && !channel && !message && !guildRole && !user)) {
        return null;
    }

    const isConfirmed =
        (message || guildRole || relationship) ??
        [user?.displayName, guild?.name, channel?.name].some((c) => c === confirmation);

    const confirmationPlaceholder = user?.displayName ?? guild?.name ?? channel?.name;

    return {
        title: `${actionType} ${actionSubject}`,
        user,
        relationship,
        guild,
        guildRole,
        channel,
        message,
        confirmation,
        confirmationPlaceholder,
        isConfirmed,
        confirmationLabel: LL.Inputs.Labels.DeletionConfirmation({ subject: actionSubject }),
        warning: LL.Hints.DeletetionWarning({ type: actionType, subject: actionSubject }),
        action,
    };
};
