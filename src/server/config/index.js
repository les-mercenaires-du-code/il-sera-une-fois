import loggers from './loggers';
import secrets from './secrets';

const config = {
  appName: 'stack',
  env: process.env.NODE_ENV || 'development',
  protocol: process.env.PROTOCOL || 'http',
  ip: process.env.HOST || 'localhost',
  port: process.env.PORT || 4000,
  LOG_DIR: process.env.LOG_DIR || 'logs',
  secrets,
  loggers,
};

export default config;
