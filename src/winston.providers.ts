import { LoggerService, Provider } from '@nestjs/common';
import { createLogger, Logger, LoggerOptions } from 'winston';
import { WINSTON_MODULE_NEST_PROVIDER, WINSTON_MODULE_OPTIONS, WINSTON_MODULE_PROVIDER } from './winston.constants';
import { WinstonModuleAsyncOptions, WinstonModuleOptions } from './winston.interfaces';

class WinstonLogger implements LoggerService {
  constructor(private readonly logger: Logger) { }

  public log(message: any, context?: string) {
    return this.logger.info(message, context);
  }

  public error(message: any, trace?: string, context?: string): any {
    return this.logger.error(message, trace, context);
  }

  public warn(message: any, context?: string): any {
    return this.logger.warn(message, context);
  }

  public debug?(message: any, context?: string): any {
    return this.logger.debug(message, context);
  }

  public verbose?(message: any, context?: string): any {
    return this.logger.verbose(message, context);
  }
}

export function createWinstonProviders(loggerOpts: WinstonModuleOptions): Provider[] {
  return [
    {
      provide: WINSTON_MODULE_PROVIDER,
      useFactory: () => createLogger(loggerOpts),
    },
    {
      provide: WINSTON_MODULE_NEST_PROVIDER,
      useFactory: (logger: Logger) => {
        return new WinstonLogger(logger);
      },
      inject: [WINSTON_MODULE_PROVIDER],
    },
  ];
}

export function createWinstonAsyncProviders(options: WinstonModuleAsyncOptions): Provider[] {
  return [
    {
      provide: WINSTON_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    },
    {
      provide: WINSTON_MODULE_PROVIDER,
      useFactory: (loggerOpts: LoggerOptions) => createLogger(loggerOpts),
      inject: [WINSTON_MODULE_OPTIONS],
    },
    {
      provide: WINSTON_MODULE_NEST_PROVIDER,
      useFactory: (logger: Logger) => {
        return new WinstonLogger(logger);
      },
      inject: [WINSTON_MODULE_PROVIDER],
    },
  ];
}
