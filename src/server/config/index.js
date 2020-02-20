import _ from 'lodash';
import loggers from './loggers';
import secrets from './secrets';

export function loadEnv(options = {}) {
  let envPath = _.get(options, 'envPath', '../../../.env');
  const localEnv = _.get(options, process.env.NODE_ENV, process.env.NODE_ENV);

  switch (localEnv) {
    case 'development':
    case 'test': {
      break;
    }
    case 'local-prod': {
      envPath = '../' + envPath;
      break;
    }
    default: {
      console.error('[loadEnv] Unrecognized node env');
      return ;
    };
  }

  const path = require('path');
  const env = require('dotenv').config({
    path: path.join(__dirname, envPath),
  });

  if (env.error) {
    throw env.error;
  }
}

export config = {
  appName: 'stack',
  env: getEnvVar('NODE_ENV'),
  port: asNumber(getEnvVar('SERVER_PORT')),
  protocol: getEnvVar('PROTOCOL') || 'http',
  ip: getEnvVar('HOST') || 'localhost',
  LOG_DIR: getEnvVar('LOG_DIR') || 'logs',
  pg: {
    pgHost: getEnvVar('PG_HOST'),
    pgPort: getEnvVar('PG_PORT'),
    pgUser: getEnvVar('PG_USER'),
    pgPassword: getEnvVar('PG_PASSWORD'),
    pgDatabase: getEnvVar('PG_DATABASE'),
    pgSsl: isTrue(getEnvVar('PG_SSL')),
  },
  redis: {
    host: getEnvVar('REDIS_HOST'),
    port: getEnvVar('REDIS_PORT'),
    password: getEnvVar('REDIS_PASSWORD'),
    tls: getEnvVar('NODE_ENV') === 'production',
  },
  secrets,
  loggers,
};

export function getConfig() {
  return config;
}

function getEnvVar(name) {
  const envVar = process.env[name];
  if (!envVar) {
    console.error(`[getEnvVar] Env var ${name} not defined`);
  }

  return envVar;
}

function asJson(value) {
  try {
    const parsedValue = JSON.parse(value);
    return parsedValue;
  } catch (e) {
    throw e;
  }
}

function asNumber(value) {
  try {
    const parsedValue = _.parseInt(value);
    return value;
  } catch (e) {
    throw e;
  }
}

function isTrue(val) {
  return !(!val || val === 'false'); // it will return true for every truthy value except if val is false as string
}
