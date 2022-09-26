import { cleanEnv, port, str } from "envalid";

function validateEnv() {
  cleanEnv(process.env, {
    //running mode
    NODE_ENV: str({ choices: ["development", "production"] }),

    // server running port
    PORT: port(),

    // CORS Options
    DEV_WHITELISTED_DOMAINS: str(),
    PRO_WHITELISTED_DOMAINS: str(),

    // Authentication configuration
    JWT_SECRET: str(),

    // google cloud settings
    PROJECT_ID: str(),
    KEY_FILE_NAME: str(),
    DEV_POSTS_JSON_PATH: str(),
    PRO_POSTS_JSON_PATH: str(),

    // User default image and path
    GCLOUD_STORAGE_IMAGE_BUCKET: str(),
  });
}
export default validateEnv;
