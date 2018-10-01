import { Provider } from '@nestjs/common';
import { createLogger } from 'winston';

import { WINSTON_MODULE_PROVIDER } from './winston.constants';
import { WinstonModuleOptions } from './winston.interfaces';

export function createWinstonProviders(options: WinstonModuleOptions): Provider[] {
  return [
    {
      provide: WINSTON_MODULE_PROVIDER,
      useFactory: () => createLogger(options),
    }
  ];
}
