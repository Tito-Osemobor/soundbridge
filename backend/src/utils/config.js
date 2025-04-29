import 'dotenv/config';

export const getRequiredEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
};
