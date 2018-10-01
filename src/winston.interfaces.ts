import { LoggerOptions } from 'winston';

export type WinstonModuleOptions = LoggerOptions;

export interface WinstonModuleAsyncOptions {
  useFactory: (
    ...args: any[]
  ) => Promise<WinstonModuleOptions> | WinstonModuleOptions;
  inject?: any[];
}
