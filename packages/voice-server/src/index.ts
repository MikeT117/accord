import { createMediaSoupWorker } from './createMediaSoupWorker';
import { createWebsocketServer } from './createWebsocketServer';
import { initialiseAMQP } from './lib/amqp/initialiseAMQP';
import { VoiceChannel } from './lib/VoiceChannel';

(async () => {
  try {
    const voiceChannels = new Map<string, VoiceChannel>();
    const mediasoupWorker = await createMediaSoupWorker();
    const { channel } = await initialiseAMQP();
    await createWebsocketServer(mediasoupWorker, voiceChannels, channel);
  } catch (err) {
    console.error(err);
  }
})();
