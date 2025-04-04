
const isDev = process.env.NODE_ENV === "development";

export const logger = {
  log: (...args) => {
    if (isDev) console.log(...args);
  },
  warn: (...args) => {
    if (isDev) console.warn(...args);
  },
  error: (...args) => {
    if (isDev) {
      console.error(...args);
    }
    // Future hook for Sentry or backend error reporting
    // Example: Sentry.captureException(args[0]);
  },
  track: (event, payload) => {
    // Optional: Add analytics tracking (e.g., Mixpanel, Amplitude)
    if (isDev) {
      console.info(`[track] ${event}`, payload);
    }
  }
};
