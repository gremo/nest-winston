import { Provider } from '@nestjs/common';
import { createLogger, LoggerOptions } from 'winston';

export function createWinstonProviders(options: LoggerOptions): Provider[] {
  return [
    {
      provide: 'winston',
      useFactory: () => createLogger(options),
    }
  ];
}
