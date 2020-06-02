import { LoggerOptions } from 'winston';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { Type } from '@nestjs/common';

export type WinstonModuleOptions = LoggerOptions;

export interface WinstonModuleOptionsFactory {
  createWinstonModuleOptions(): Promise<WinstonModuleOptions> | WinstonModuleOptions;
}

export interface WinstonModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (
    ...args: any[]
  ) => Promise<WinstonModuleOptions> | WinstonModuleOptions;
  inject?: any[];
  useClass?: Type<WinstonModuleOptionsFactory>;
}
