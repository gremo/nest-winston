import { Provider } from '@nestjs/common';
import { createLogger, LoggerOptions } from 'winston';

import { WINSTON_MODULE_PROVIDER } from './winston.constants';

export function createWinstonProviders(options: LoggerOptions): Provider[] {
  return [
    {
      provide: WINSTON_MODULE_PROVIDER,
      useFactory: () => createLogger(options),
    }
  ];
}
