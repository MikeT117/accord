import { useCallback } from 'react';
import {
  ConfirmationActionSubjects,
  ConfirmationActionTypes,
  useActionConfirmationStore,
} from '../stores/useActionConfirmationStore';

const warnings = (actionType: ConfirmationActionTypes, actionSubject: ConfirmationActionSubjects) =>
  `Are you sure you want to ${actionType} this ${actionSubject}, this action cannot be undone?`;

const confirmationLabel = (actionSubject: ConfirmationActionSubjects) =>
  `Enter the ${actionSubject} name below to confirm.`;

export const useActionConfirmation = () => {
  const actionSubject = useActionConfirmationStore(useCallback((s) => s.actionSubject, []));
  const actionType = useActionConfirmationStore(useCallback((s) => s.actionType, []));
  const account = useActionConfirmationStore(useCallback((s) => s.account, []));
  const relationship = useActionConfirmationStore(useCallback((s) => s.relationship, []));
  const guild = useActionConfirmationStore(useCallback((s) => s.guild, []));
  const channel = useActionConfirmationStore(useCallback((s) => s.channel, []));
  const channelMessage = useActionConfirmationStore(useCallback((s) => s.channelMessage, []));
  const guildRole = useActionConfirmationStore(useCallback((s) => s.guildRole, []));
  const confirmation = useActionConfirmationStore(useCallback((s) => s.confirmation, []));
  const action = useActionConfirmationStore(useCallback((s) => s.action, []));

  if (
    !actionSubject ||
    !actionType ||
    (!guild && !channel && !channelMessage && !guildRole && !account)
  ) {
    return null;
  }

  const isConfirmed =
    (channelMessage || guildRole || relationship) ??
    [account?.displayName, guild?.name, channel?.name].some((c) => c === confirmation);

  const confirmationPlaceholder = account?.displayName ?? guild?.name ?? channel?.name;

  return {
    title: `${actionType} ${actionSubject}`,
    account,
    relationship,
    guild,
    guildRole,
    channel,
    channelMessage,
    confirmation,
    confirmationPlaceholder,
    isConfirmed,
    confirmationLabel: confirmationLabel(actionSubject),
    warning: warnings(actionType, actionSubject),
    action,
  };
};
