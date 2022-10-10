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

    //google bucket settings
    GOOGLE_BUCKET_NAME: str(),

    POSTS_FILE_NAME: str(),
    POSTS_FOLDER: str(),
    GOOGLE_BUCKET_URL: str(),
  });
}
export default validateEnv;
