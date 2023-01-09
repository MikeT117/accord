import fp from 'fastify-plugin';
import postgres from 'postgres';

export default fp(async (fastify) => {
  const sql = postgres({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    port: parseInt(process.env.POSTGRES_PORT, 10),
    debug: true,
    transform: {
      column: {
        from: postgres.toCamel,
        to: postgres.fromCamel,
      },
    },
  });
  fastify.addHook('onClose', async () => sql.end({ timeout: 5 }));
  fastify.decorate('sql', sql);
});

declare module 'fastify' {
  export interface FastifyInstance {
    sql: postgres.Sql;
  }
}
