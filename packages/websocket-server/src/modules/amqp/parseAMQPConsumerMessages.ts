import { ConsumeMessage } from 'amqplib';

export const parseAMQPConsumerMessages = <T>(msg: ConsumeMessage | null) => {
  if (!msg) {
    return;
  }

  const content = msg.content.toString();
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch (e) {
    console.error(e);
    return;
  }

  return parsed as T;
};
