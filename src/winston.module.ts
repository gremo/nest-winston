import { DynamicModule, Global, Module } from '@nestjs/common';

import { WinstonModuleOptions } from './winston.interfaces';
import { createWinstonProviders } from './winston.providers';

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
}
