import { Injectable, Logger, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER, WINSTON_MODULE_PROVIDER } from './winston.constants';
import { WinstonModuleOptions, WinstonModuleOptionsFactory } from './winston.interfaces';
import { WinstonModule } from './winston.module';
import * as winston from 'winston';
import { utilities } from './winston.utilities';

describe('Winston module', function () {
  it('boots successfully', async function () {
    const rootModule = await Test.createTestingModule({
      imports: [
        WinstonModule.forRoot({}),
      ],
    }).compile();

    expect(rootModule.get(WINSTON_MODULE_PROVIDER)).toBeDefined();
    expect(rootModule.get(WINSTON_MODULE_NEST_PROVIDER)).toBeDefined();
  });

  it('boots successfully asynchronously via useFactory', async function () {
    @Injectable()
    class ConfigService {
      public loggerOptions = {};
    }

    @Module({
      providers: [ConfigService],
      exports: [ConfigService],
    })
    class FeatureModule {}

    const rootModule = await Test.createTestingModule({
      imports: [
        WinstonModule.forRootAsync({
          imports: [FeatureModule],
          useFactory: (cfg: ConfigService) => cfg.loggerOptions,
          inject: [ConfigService],
        }),
      ],
    }).compile();

    const app = rootModule.createNestApplication();
    await app.init();

    expect(rootModule.get(WINSTON_MODULE_PROVIDER)).toBeDefined();
    expect(rootModule.get(WINSTON_MODULE_NEST_PROVIDER)).toBeDefined();
  });

  it('boots successfully asynchronously via useClass', async function () {
    @Injectable()
    class ConfigService implements WinstonModuleOptionsFactory {
      private loggerOptions = {};

      public createWinstonModuleOptions(): WinstonModuleOptions {
        return this.loggerOptions;
      }
    }

    const rootModule = await Test.createTestingModule({
      imports: [
        WinstonModule.forRootAsync({
          useClass: ConfigService,
        }),
      ],
    }).compile();

    const app = rootModule.createNestApplication();
    await app.init();

    expect(rootModule.get(WINSTON_MODULE_PROVIDER)).toBeDefined();
    expect(rootModule.get(WINSTON_MODULE_NEST_PROVIDER)).toBeDefined();
  });

  it('boots successfully with nestLikeConsoleFormat format', async function () {
    const rootModule = await Test.createTestingModule({
      imports: [
        WinstonModule.forRoot({
          transports: [
            new winston.transports.Console({
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.ms(),
                utilities.format.nestLike(),
              ),
            }),
            new winston.transports.Console({
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.ms(),
                utilities.format.nestLike('NestWinston', { useColor: false }),
              ),
            }),
          ]
        }),
      ],
    }).compile();

    const app = rootModule.createNestApplication();
    await app.init();

    expect(rootModule.get(WINSTON_MODULE_PROVIDER)).toBeDefined();
    expect(rootModule.get(WINSTON_MODULE_NEST_PROVIDER)).toBeDefined();

    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
    const logger = new Logger('TEST');
    const loggerMock = jest.spyOn(logger, 'log');
    logger.log('testing nestLike format with color and without color');
    
    expect(loggerMock).toHaveBeenCalled();
  });
});
