import { ModuleMetadata } from '@nestjs/common/interfaces';
import { LoggerOptions } from 'winston';

export type WinstonModuleOptions = LoggerOptions;

export interface WinstonModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (
    ...args: any[]
  ) => Promise<WinstonModuleOptions> | WinstonModuleOptions;
  inject?: any[];
}
