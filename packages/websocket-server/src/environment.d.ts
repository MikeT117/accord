declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      HOST: string;
      POSTGRES_HOST: string;
      POSTGRES_USER: string;
      POSTGRES_PASSWORD: string;
      POSTGRES_DB: string;
      POSTGRES_PORT: string;
      ACCESS_TOKEN_SECRET: string;
      REFRESH_TOKEN_SECRET: string;
      OAUTH_GITHUB_TOKEN_VALIDATION_URI: string;
      OAUTH_GITHUB_BASIC_AUTH: string;
      AMQP_HOST: string;
    }
  }
}

export {};
