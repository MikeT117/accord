import postgres from 'postgres';

import {
  POSTGRES_DB,
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
  POSTGRES_USER,
} from '../../constants';

export const sql = postgres({
  host: POSTGRES_HOST,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
  port: POSTGRES_PORT,
  debug: true,
  transform: {
    column: {
      from: postgres.toCamel,
      to: postgres.fromCamel,
    },
  },
});
