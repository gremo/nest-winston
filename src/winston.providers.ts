import { Logger, LoggerOptions, createLogger } from 'winston';
import { Provider, Type } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER, WINSTON_MODULE_OPTIONS, WINSTON_MODULE_PROVIDER } from './winston.constants';
import { WinstonModuleAsyncOptions, WinstonModuleOptions, WinstonModuleOptionsFactory } from './winston.interfaces';
import { WinstonLogger } from './winston.classes';

export function createNestWinstonLogger(loggerOpts: WinstonModuleOptions): WinstonLogger {
  if (loggerOpts.instance) {
    return new WinstonLogger(loggerOpts.instance);
  }
  return new WinstonLogger(createLogger(loggerOpts));
}

export function createWinstonProviders(loggerOpts: WinstonModuleOptions): Provider[] {
  return [
    {
      provide: WINSTON_MODULE_PROVIDER,
      useFactory: () => createLogger(loggerOpts),
      scope: loggerOpts.scope
    },
    {
      provide: WINSTON_MODULE_NEST_PROVIDER,
      useFactory: (logger: Logger) => {
        return new WinstonLogger(logger);
      },
      inject: [WINSTON_MODULE_PROVIDER],
      scope: loggerOpts.scope
    },
  ];
}

export function createWinstonAsyncProviders(options: WinstonModuleAsyncOptions): Provider[] {
  const providers: Provider[] = [
    {
      provide: WINSTON_MODULE_PROVIDER,
      useFactory: (loggerOpts: LoggerOptions) => createLogger(loggerOpts),
      inject: [WINSTON_MODULE_OPTIONS],
      scope: options.scope
    },
    {
      provide: WINSTON_MODULE_NEST_PROVIDER,
      useFactory: (logger: Logger) => {
        return new WinstonLogger(logger);
      },
      inject: [WINSTON_MODULE_PROVIDER],
      scope: options.scope
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
        scope: options.scope
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
        scope: options.scope
      },
    );
  }

  return providers;
}
