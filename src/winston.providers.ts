import { LoggerService, Provider, Type } from '@nestjs/common';
import { createLogger, Logger, LoggerOptions } from 'winston';
import { WINSTON_MODULE_NEST_PROVIDER, WINSTON_MODULE_OPTIONS, WINSTON_MODULE_PROVIDER } from './winston.constants';
import { WinstonModuleAsyncOptions, WinstonModuleOptions, WinstonModuleOptionsFactory } from './winston.interfaces';

class WinstonLogger implements LoggerService {
  private context?: string;

  constructor(private readonly logger: Logger) { }

  public setContext(context: string) {
    this.context = context;
  }

  public log(message: any, context?: string) {
    return this.logger.info(message, { context: context || this.context });
  }

  public error(message: any, trace?: string, context?: string): any {
    return this.logger.error(message, { trace, context: context || this.context });
  }

  public warn(message: any, context?: string): any {
    return this.logger.warn(message, { context: context || this.context });
  }

  public debug?(message: any, context?: string): any {
    return this.logger.debug(message, { context: context || this.context });
  }

  public verbose?(message: any, context?: string): any {
    return this.logger.verbose(message, { context: context || this.context });
  }
}

export function createNestWinstonLogger(loggerOpts: WinstonModuleOptions): WinstonLogger {
  return new WinstonLogger(createLogger(loggerOpts));
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
  const providers: Provider[] = [
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

  if (options.useClass) {
    const useClass = options.useClass as Type<WinstonModuleOptionsFactory>;
    providers.push(...[
      {
        provide: WINSTON_MODULE_OPTIONS,
        useFactory: async (optionsFactory: WinstonModuleOptionsFactory) =>
          await optionsFactory.createWinstonModuleOptions(),
        inject: [useClass],
      },
      {
        provide: useClass,
        useClass,
      },
    ]);
  }

  if (options.useFactory) {
    providers.push(
      {
        provide: WINSTON_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
    );
  }

  return providers;
}
