/* tslint:disable:only-arrow-functions max-classes-per-file */

import { Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { expect } from 'chai';
import { WINSTON_MODULE_NEST_PROVIDER, WINSTON_MODULE_PROVIDER } from './winston.constants';
import { WinstonModule } from './winston.module';
import {WinstonModuleOptions, WinstonModuleOptionsFactory} from './winston.interfaces';

describe('Winston module', function() {
  it('boots successfully', async function() {
    const rootModule = await Test.createTestingModule({
      imports: [
        WinstonModule.forRoot({}),
      ],
    }).compile();

    expect(rootModule.get(WINSTON_MODULE_PROVIDER)).to.be.an('object');
    expect(rootModule.get(WINSTON_MODULE_NEST_PROVIDER)).to.be.an('object');
  });

  it('boots successfully asynchronously via useFactory', async function() {
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

    expect(rootModule.get(WINSTON_MODULE_PROVIDER)).to.be.an('object');
    expect(rootModule.get(WINSTON_MODULE_NEST_PROVIDER)).to.be.an('object');
  });

  it('boots successfully asynchronously via useClass', async function() {
    @Injectable()
    class ConfigService implements WinstonModuleOptionsFactory {
      private loggerOptions = {};

      createWinstonModuleOptions(): WinstonModuleOptions {
        return this.loggerOptions;
      }
    }

    @Module({
      providers: [ConfigService],
      exports: [ConfigService],
    })
    class FeatureModule {}

    const rootModule = await Test.createTestingModule({
      imports: [
        WinstonModule.forRootAsync({
          useClass: ConfigService,
        }),
      ],
    }).compile();

    const app = rootModule.createNestApplication();
    await app.init();

    expect(rootModule.get(WINSTON_MODULE_PROVIDER)).to.be.an('object');
    expect(rootModule.get(WINSTON_MODULE_NEST_PROVIDER)).to.be.an('object');
  });
});
