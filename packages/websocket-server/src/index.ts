import { initialiseAMQP } from './modules/amqp/initialiseAMQP';
import { initialiseAMQPConsumers } from './modules/amqp/initialiseAMQPConsumers';
import { createWebsocketServer } from './modules/Websocket/createWebsocketServer';

(async () => {
  try {
    const server = await createWebsocketServer();
    const { channel } = await initialiseAMQP();
    await initialiseAMQPConsumers(channel, server.clients);
  } catch (e) {
    console.error(e);
  }
})();
