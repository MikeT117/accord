import 'dotenv/config';
export const AMQP_URL = process.env.AMQP_URL;

export const PORT = parseInt(process.env.PORT, 10);
export const POSTGRES_HOST = process.env.POSTGRES_HOST;
export const POSTGRES_USER = process.env.POSTGRES_USER;
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
export const POSTGRES_DB = process.env.POSTGRES_DB;
export const POSTGRES_PORT = parseInt(process.env.POSTGRES_PORT, 10);

export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const OAUTH_GITHUB_TOKEN_VALIDATION_URI = process.env.OAUTH_GITHUB_TOKEN_VALIDATION_URI;
export const OAUTH_GITHUB_BASIC_AUTH = Buffer.from(
  process.env.OAUTH_GITHUB_BASIC_AUTH,
  'utf8',
).toString('base64');
