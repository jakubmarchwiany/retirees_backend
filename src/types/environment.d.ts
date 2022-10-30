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
            TOKEN_EXPIRE_AFTER: string;

            // google cloud settings
            PROJECT_ID: string;
            KEY_FILE_NAME: string;

            //google bucket settings
            GOOGLE_BUCKET_NAME: string;

            POSTS_FILE_NAME: string;
            POSTS_FOLDER: string;
            GOOGLE_BUCKET_URL: string;
        }
    }
}
