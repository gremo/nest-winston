import { DynamicModule, Global, Module } from '@nestjs/common';

import { WinstonModuleAsyncOptions, WinstonModuleOptions } from './winston.interfaces';
import { createWinstonAsyncProviders, createWinstonProviders } from './winston.providers';

@Global()
@Module({})
export class WinstonModule {
  static forRoot(options: WinstonModuleOptions): DynamicModule {
    const providers = createWinstonProviders(options);

    return {
      module: WinstonModule,
      providers: providers,
      exports: providers,
    };
  }

  static forRootAsync(options: WinstonModuleAsyncOptions): DynamicModule {
    const providers = createWinstonAsyncProviders(options);

    return {
      module: WinstonModule,
      providers: providers,
      exports: providers,
    };
  }
}
