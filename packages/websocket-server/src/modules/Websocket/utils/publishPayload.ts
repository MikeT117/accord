import type { AccordWebsocket } from '@accord/common';

export const publishPayload = async ({
  clients,
  excludedUserIds,
  op,
  d,
  publishToRoleIds,
  publishToUserIds,
}: {
  clients: Set<AccordWebsocket>;
  op: unknown;
  d: unknown;
  publishToRoleIds?: string[] | null;
  publishToUserIds?: string[] | null;
  excludedUserIds?: string[] | null;
}) => {
  if (Array.isArray(publishToRoleIds)) {
    for (const client of clients) {
      if (
        !excludedUserIds?.some((id) => id === client.id) &&
        publishToRoleIds.some((r) => client.roles.has(r))
      ) {
        client.send(JSON.stringify({ op, d }));
      }
    }
  } else if (Array.isArray(publishToUserIds)) {
    for (const client of clients) {
      if (publishToUserIds.some((r) => r === client.id)) {
        client.send(JSON.stringify({ op, d }));
      }
    }
  }
};
