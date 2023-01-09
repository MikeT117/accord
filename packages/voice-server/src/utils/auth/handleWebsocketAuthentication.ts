import type { AccordVoiceWebsocket } from '@accord/common';
import { verifyToken } from './accordTokens';

export const handleWebsocketAuthentication = async ({
  client,
  refreshToken,
}: {
  client: AccordVoiceWebsocket;
  refreshToken: string;
}) => {
  if (typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
    client.close(1008);
    return;
  }

  return verifyToken({ refreshToken });
};
