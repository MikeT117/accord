import amqp, { Channel, Connection } from 'amqplib';

export const initialiseAMQP = (): Promise<{ connection: Connection; channel: Channel }> => {
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
    .catch(() => {
      return new Promise((resolve) => setTimeout(() => initialiseAMQP().then(resolve), 2000));
    });
};
