import type { AccordWebsocket } from '@accord/common';
import { verifyToken } from '../../auth/accordTokens';

export const handleWebsocketAuthentication = async ({
  client,
  refreshToken,
}: {
  client: AccordWebsocket;
  refreshToken: string;
}) => {
  if (typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
    return client.close(1008);
  }

  return verifyToken({ refreshToken });
};
