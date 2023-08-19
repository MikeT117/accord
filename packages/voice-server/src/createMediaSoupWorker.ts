process.env.DEBUG = 'mediasoup*';
import { createWorker } from 'mediasoup';

export const createMediaSoupWorker = async () => {
  const worker = await createWorker({
    rtcMinPort: 10000,
    rtcMaxPort: 10050,
    logLevel: 'none',
  });

  worker.on('died', () => {
    console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid);
    setTimeout(() => process.exit(1), 2000);
  });

  return worker;
};
