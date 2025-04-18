import {getRequiredEnv} from "../utils/config.js";

const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 8080;

const getFrontendUrl = () => {
  if (NODE_ENV === "production") {
    return getRequiredEnv("FRONTEND_PROD_URL");
  }
  return getRequiredEnv("FRONTEND_DEV_URL");
};

const FRONTEND_URL = getFrontendUrl();

const JWT_SECRET = getRequiredEnv("JWT_SECRET");
const DATABASE_URL = getRequiredEnv("DATABASE_URL");

const OAUTH_STATE_TIMEOUT_MS = 10 * 60 * 1000; // 10 min

export {
  NODE_ENV,
  PORT,
  FRONTEND_URL,
  JWT_SECRET,
  DATABASE_URL,
  OAUTH_STATE_TIMEOUT_MS,
};
