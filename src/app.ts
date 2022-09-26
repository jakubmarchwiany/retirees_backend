import "dotenv/config";
import AuthenticationController from "./controllers/authentication-controller";
import PostController from "./controllers/post-controller";

import Server from "./server";
import validateEnv from "./utils/validate-env";

validateEnv();

const app = new Server([new PostController(), new AuthenticationController()]);

app.listen();
