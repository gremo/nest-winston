// DynamicModule (unlike ModuleMetadata) is exported from the package root by every supported nestjs version, and
// deep imports such as "@nestjs/common/interfaces" don't resolve with the "exports" map of nestjs 12.x
import { DynamicModule, Type } from '@nestjs/common';
import { Logger, LoggerOptions } from 'winston';

export type WinstonModuleOptions = LoggerOptions & {
  /**
   * Optional Winston instance to use
   * This takes precedence on any other options provided
   */
  instance?: Logger;
};

export type NestLikeConsoleFormatOptions = {
  colors?: boolean;
  prettyPrint?: boolean;
  processId?: boolean;
  appName?: boolean;
};

export interface WinstonModuleOptionsFactory {
  createWinstonModuleOptions(): Promise<WinstonModuleOptions> | WinstonModuleOptions;
}

export interface WinstonModuleAsyncOptions extends Pick<DynamicModule, 'imports'> {
  useFactory?: (
    ...args: any[]
  ) => Promise<WinstonModuleOptions> | WinstonModuleOptions;
  inject?: any[];
  useClass?: Type<WinstonModuleOptionsFactory>;
}
