import { cleanEnv, str } from 'envalid';

import AbstractService from './service';
import logger from '../utils/logger';

export type EnvVariables = {
  NODE_ENV: string;
  PORT: string;
  SLACK_CLIENT_ID: string;
  SLACK_CLIENT_SECRET: string;
  SLACK_SIGNING_SECRET: string;
  SLACK_BOT_TOKEN: string;
  DOCSBOT_WS_URL: string;
};

/*
 * This service is responsible for loading environment variables
 */
class EnvService implements AbstractService {
  static envVariables = {
    NODE_ENV: str({
      choices: ['development', 'staging', 'debug', 'production'],
    }),
    PORT: str(),
    SLACK_CLIENT_ID: str(),
    SLACK_CLIENT_SECRET: str(),
    SLACK_SIGNING_SECRET: str(),
    SLACK_BOT_TOKEN: str(),
    DOCSBOT_WS_URL: str(),
  };

  static envs: Readonly<EnvVariables>;

  // This is an idempotent operation, you can call init as many times as you want
  static init(): void {
    this.envs = cleanEnv(process.env, EnvService.envVariables, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reporter: ({ errors }: { errors: any }) => {
        if (Object.keys(errors).length > 0) {
          logger.error(`Invalid env vars: ${Object.keys(errors)}`);
        }
      },
    });

    logger.info(`Loaded env and running in env ${process.env.NODE_ENV}`);
  }

  static env(): Readonly<EnvVariables> {
    return (
      this.envs ?? {
        NODE_ENV: 'test',
        PORT: '3001',
      }
    );
  }
}

export default EnvService;
