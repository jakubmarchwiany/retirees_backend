export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      //running type
      NODE_ENV: "development" | "production";

      // server running mode
      PORT: string;

      // CORS Options
      DEV_WHITELISTED_DOMAINS: string;
      PRO_WHITELISTED_DOMAINS: string;

      // Authentication configuration
      JWT_SECRET: string;

      // google cloud settings
      PROJECT_ID: string;
      KEY_FILE_NAME: string;
      DEV_POSTS_JSON_PATH: string;
      PRO_POSTS_JSON_PATH: string;

      // User default image and path
      GCLOUD_STORAGE_IMAGE_BUCKET: string;
    }
  }
}
