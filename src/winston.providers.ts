import { createLogger, Logger, LoggerOptions } from 'winston';

export function createWinstonProviders(options: LoggerOptions) {
  return [
    {
      provide: 'winston',
      useFactory: () => {
        return createLogger(options) as Logger;
      }
    }
  ];
}
