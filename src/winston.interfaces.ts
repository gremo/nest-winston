import { Logger, LoggerOptions } from 'winston';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { Type } from '@nestjs/common';

export type LoggerMessage = string | { message: string; [ key: string ]: any };
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
};

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
