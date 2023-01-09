import { AccordOperation, WebsocketEvent } from '@accord/common';
import { SECOND } from '../../../lib/constants';
import { getClientInititialisationPayload } from '../../../lib/postgres/queries';
import type { AccordWebsocket, AuthenticationEvent, SessionCloseEvent } from '@accord/common';
import { handleWebsocketAuthentication } from './authentication';

export const handleWebsocketConnection = async (client: AccordWebsocket) => {
  client.id = '';
  client.roles = new Set();
  client.isAlive = false;
  client.refreshToken = '';

  const heartbeatInterval = setInterval(() => {
    if (!client.isAlive) {
      return client.close(1002, 'CLIENT_DEAD');
    }
    client.isAlive = false;
    return client.ping();
  }, 30 * SECOND);

  const authTimeout = setTimeout(() => {
    if (!client.id) {
      client.close(1000, 'AUTH_TIMEOUT');
    }
  }, 15 * SECOND);

  // This will run every 30 mins, checking the user session is still valid, if not the connection is closed.
  const authInterval = setInterval(() => {
    handleWebsocketAuthentication({ client, refreshToken: client.refreshToken }).then((userId) => {
      if (!userId) {
        client.close(1008, 'INVALID_SESSION');
      }
    });
  }, 1800000);

  client.on(WebsocketEvent.PONG, () => {
    client.isAlive = true;
  });

  client.onmessage = async ({ data }) => {
    if (typeof data !== 'string') {
      return client.close(1007); // Invalid frame payload data
    }

    let payload: AuthenticationEvent | SessionCloseEvent;

    try {
      payload = JSON.parse(data);
    } catch (err) {
      console.error(err);
      return client.close(1007); // Invalid frame payload data
    }

    if (payload.op === AccordOperation.SESSION_CLOSE_OP) {
      return client.close(1000); // Normal Closure
    }

    if (payload.op !== AccordOperation.AUTHENTICATE_OP) {
      return client.close(1008); // Policy Violation
    }

    const userId = await handleWebsocketAuthentication({ client, ...payload.d });

    if (!userId) {
      return client.close(1008, 'UNAUTHENTICATED');
    } else {
      client.send(
        JSON.stringify({
          op: payload.id,
          d: {
            success: true,
          },
        }),
      );
    }

    clearTimeout(authTimeout);
    client.refreshToken = payload.d.refreshToken;
    client.isAlive = true;
    client.id = userId;

    try {
      const { subscribeToRoles, ...initialisationData } = await getClientInititialisationPayload({
        userId: client.id,
      });

      client.roles = new Set(subscribeToRoles);
      client.send(
        JSON.stringify({
          op: AccordOperation.CLIENT_READY_OP,
          d: initialisationData,
        }),
      );
    } catch (err) {
      console.error(err);

      client.send(
        JSON.stringify({
          id: payload,
          error: { message: 'General error' },
        }),
      );

      return client.close(1011); // Internal Error
    }
  };

  client.on(WebsocketEvent.CLOSE, async () => {
    clearTimeout(heartbeatInterval);
    clearTimeout(authTimeout);
    clearInterval(authInterval);
  });
};
