/* eslint @typescript-eslint/explicit-module-boundary-types: 'off' */
import { Logger } from 'winston';
import { LoggerService } from '@nestjs/common';

export class WinstonLogger implements LoggerService {
  private context?: string;

  constructor(private readonly logger: Logger) { }

  public setContext(context: string) {
    this.context = context;
  }

  public log(message: any, meta?: string | Record<string, unknown>) {
    if('object' === typeof meta) {
      return this.logger.info(message, { context: this.context, ...meta });
    }
    return this.logger.info(message, { context: meta || this.context, });
  }

  public error(message: any, trace?: string, meta?: string | Record<string, unknown>): any {
    if('object' === typeof meta) {
      return this.logger.error(message, { trace, context: this.context, ...meta });
    }
    return this.logger.error(message, { trace, context: meta || this.context });
  }

  public warn(message: any, meta?: string | Record<string, unknown>): any {
    if('object' === typeof meta) {
      return this.logger.warn(message, { context: this.context, ...meta });
    }
    return this.logger.warn(message, { context: meta || this.context });
  }

  public debug?(message: any, meta?: string | Record<string, unknown>): any {
    if('object' === typeof meta) {
      return this.logger.debug(message, { context: this.context, ...meta });
    }
    return this.logger.debug(message, { context: meta || this.context });
  }

  public verbose?(message: any, meta?: string | Record<string, unknown>): any {
    if('object' === typeof meta) {
      return this.logger.verbose(message, { context: this.context, ...meta });
    }
    return this.logger.verbose(message, { context: meta || this.context });
  }
}
