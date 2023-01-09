declare global {
  namespace NodeJS {
    interface ProcessEnv {
      HOST: string;
      PORT: string;
      AMQP_HOST: string;
      PUBLIC_URL: string;
      CORS_ORIGIN: string;
      POSTGRES_HOST: string;
      POSTGRES_USER: string;
      POSTGRES_PASSWORD: string;
      POSTGRES_DB: string;
      POSTGRES_PORT: string;
      REFRESH_TOKEN_SECRET: string;
      ACCESS_TOKEN_SECRET: string;
      OAUTH_STATE_SECRET: string;
      OAUTH_ERROR_REDIRECT_URL: string;
      OAUTH_GITHUB_CLIENT_ID: string;
      OAUTH_GITHUB_REDIRECT_URI: string;
      OAUTH_GITHUB_TOKEN_VALIDATION_URI: string;
      OAUTH_GITHUB_CLIENT_SECRET: string;
      OAUTH_GITHUB_BASIC_AUTH: string;
      CLOUDINARY_API_SECRET: string;
      CLOUDINARY_UPLOAD_PRESET: string;
      CLOUDINARY_CLOUD_NAME: string;
      CLOUDINARY_API_KEY: string;
      CLOUDINARY_UPLOAD_PATH: string;
    }
  }
}

export {};
