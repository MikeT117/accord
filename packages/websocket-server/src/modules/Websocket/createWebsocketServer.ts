import ws from 'ws';
import { PORT } from '../../lib/constants';
import type { AccordWebsocketServer } from '@accord/common';
import { WebsocketEvent } from '@accord/common';
import { handleWebsocketConnection } from './handlers/connection';

export const createWebsocketServer = async (): Promise<AccordWebsocketServer> => {
  return new Promise((resolve) => {
    const server = new ws.Server({
      clientTracking: true,
      port: PORT,
    }) as AccordWebsocketServer;

    server.addListener(WebsocketEvent.CONNECTION, handleWebsocketConnection);
    server.addListener(WebsocketEvent.LISTENING, () => {
      console.log(`Websocket Server Listening On Port: ${PORT}`);
      resolve(server);
    });
  });
};
