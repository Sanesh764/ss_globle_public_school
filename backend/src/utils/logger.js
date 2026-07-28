// Centralized logger utility for recording system events and security logs

const formatTime = () => new Date().toISOString();

export const logger = {
  info: (message, meta = '') => {
    console.log(`[INFO] [${formatTime()}] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  warn: (message, meta = '') => {
    console.warn(`[WARN] [${formatTime()}] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  error: (message, error = '') => {
    console.error(
      `[ERROR] [${formatTime()}] ${message}`,
      error?.message || error || ''
    );
  },
  security: (event, details = {}) => {
    console.warn(`[SECURITY EVENT] [${formatTime()}] ${event}`, JSON.stringify(details));
  },
};

export default logger;
