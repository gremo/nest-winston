import { Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER, WINSTON_MODULE_PROVIDER } from './winston.constants';
import { WinstonModuleOptions, WinstonModuleOptionsFactory } from './winston.interfaces';
import { WinstonModule } from './winston.module';

describe('Winston module', function () {
  it('boots successfully', async function () {
    const rootModule = await Test.createTestingModule({
      imports: [
        WinstonModule.forRoot({}),
      ],
    }).compile();

    expect(await rootModule.resolve(WINSTON_MODULE_PROVIDER)).toBeDefined();
    expect(await rootModule.resolve(WINSTON_MODULE_NEST_PROVIDER)).toBeDefined();
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

    expect(await rootModule.resolve(WINSTON_MODULE_PROVIDER)).toBeDefined();
    expect(await rootModule.resolve(WINSTON_MODULE_NEST_PROVIDER)).toBeDefined();
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

    expect(await rootModule.resolve(WINSTON_MODULE_PROVIDER)).toBeDefined();
    expect(await rootModule.resolve(WINSTON_MODULE_NEST_PROVIDER)).toBeDefined();
  });
});
