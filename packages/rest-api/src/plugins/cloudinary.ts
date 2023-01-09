import fp from 'fastify-plugin';
import { createHash } from 'node:crypto';

export default fp(async (fastify) => {
  function sign(fileName: string) {
    return new Promise<{
      signature: string;
      timestamp: number;
      publicId: string;
    }>((resolve) => {
      const publicId = fileName.includes('.') ? fileName.split('.')[0] : fileName;
      const timestamp = new Date().getTime();
      const hash = createHash('sha1');
      const data = hash.update(
        `timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`,
        'utf-8',
      );
      resolve({ signature: data.digest('hex'), timestamp, publicId });
    });
  }

  async function deleteFile(publicId: string, resourceType: string, timestamp: number) {
    const hash = createHash('sha1');
    hash.update(
      `public_id=${publicId}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`,
      'utf-8',
    );
    try {
      const resp = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/destroy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            timestamp: timestamp.toString(),
            public_id: publicId,
            api_key: process.env.CLOUDINARY_API_KEY,
            signature: hash.digest('hex'),
          }),
        },
      );

      return resp.status === 200;
    } catch {
      return false;
    }
  }

  fastify.decorate('cloudinary', { sign, deleteFile });
});

declare module 'fastify' {
  export interface FastifyInstance {
    cloudinary: {
      sign(fileName: string): Promise<{
        signature: string;
        timestamp: number;
        publicId: string;
      }>;
      deleteFile(publicId: string, resourceType: string, timestamp: number): Promise<boolean>;
    };
  }
}
