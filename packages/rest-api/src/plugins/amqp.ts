import amqp, { Channel, Connection } from 'amqplib';
import fp from 'fastify-plugin';

function initialiseAMQP(): Promise<{ connection: Connection; channel: Channel }> {
  let reconnecting = false;

  function onConnectionError() {
    if (reconnecting) {
      return;
    }
    reconnecting = true;
    return new Promise((resolve) => setTimeout(() => initialiseAMQP().then(resolve), 2000));
  }

  return amqp
    .connect({ hostname: process.env.AMQP_HOST })
    .then((connection) => {
      connection.once('close', onConnectionError);
      connection.once('error', onConnectionError);
      return connection.createChannel().then((channel) => {
        reconnecting = false;
        return { connection, channel };
      });
    })
    .catch((e) => {
      console.log('Failure connecting to AMQP: ', e);
      return new Promise((resolve) => setTimeout(() => initialiseAMQP().then(resolve), 2000));
    });
}

export default fp(async (fastify) => {
  const amqp = await initialiseAMQP();
  fastify.decorate('amqp', amqp);
  fastify.addHook('onClose', (fastify) => {
    fastify.amqp.connection.close();
  });
});

declare module 'fastify' {
  export interface FastifyInstance {
    amqp: {
      connection: Connection;
      channel: Channel;
    };
  }
}
