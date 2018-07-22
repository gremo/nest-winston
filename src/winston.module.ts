import { DynamicModule, Global, Module } from '@nestjs/common';
import { LoggerOptions } from 'winston';

import { createWinstonProviders } from './winston.providers';

@Global()
@Module({})
export class WinstonModule {
  static forRoot(options: LoggerOptions): DynamicModule {
    const providers = createWinstonProviders(options);

    return {
      module: WinstonModule,
      providers: providers,
      exports: providers,
    };
  }
}
