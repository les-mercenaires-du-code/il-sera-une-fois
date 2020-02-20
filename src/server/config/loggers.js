/*
  Loggers
  1.0.0
 */
const loggers = {
  options: {
    logDir: 'logs',
    prefix: 'log'
  },
  loggerApp: {
    level: 'info',
    console: Boolean(process.env.LOGGER_LEVEL) || true,
    process: true,
    prefix: 'APP'
  },
};

export default loggers;
