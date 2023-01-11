import { Injectable, Module } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Logger } from "winston";
import {
  WINSTON_MODULE_NEST_PROVIDER,
  WINSTON_MODULE_PROVIDER,
} from "./winston.constants";
import {
  WinstonModuleOptions,
  WinstonModuleOptionsFactory,
} from "./winston.interfaces";
import { WinstonModule } from "./winston.module";

describe("Winston module", function () {
  it("boots successfully", async function () {
    const rootModule = await Test.createTestingModule({
      imports: [WinstonModule.forRoot({})],
    }).compile();

    expect(rootModule.get(WINSTON_MODULE_PROVIDER)).toBeDefined();
    expect(rootModule.get(WINSTON_MODULE_NEST_PROVIDER)).toBeDefined();
  });

  it("boots successfully asynchronously via useFactory", async function () {
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

  it("boots successfully asynchronously via useClass", async function () {
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

  describe("instance in module options", () => {
    let mockLogger: Logger;

    beforeEach(() => {
      mockLogger = {} as Logger;
    });

    it("boots successfully", async function () {
      const rootModule = await Test.createTestingModule({
        imports: [WinstonModule.forRoot({ instance: mockLogger })],
      }).compile();

      expect(rootModule.get(WINSTON_MODULE_PROVIDER)).toBe(mockLogger);
      expect(rootModule.get(WINSTON_MODULE_NEST_PROVIDER)).toEqual(
        expect.objectContaining({ logger: mockLogger })
      );
    });

    it("boots successfully asynchronously via useFactory", async function () {
      @Injectable()
      class ConfigService {
        public loggerOptions = { instance: mockLogger };
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

      expect(rootModule.get(WINSTON_MODULE_PROVIDER)).toBe(mockLogger);
      expect(rootModule.get(WINSTON_MODULE_NEST_PROVIDER)).toEqual(
        expect.objectContaining({ logger: mockLogger })
      );
    });

    it("boots successfully asynchronously via useClass", async function () {
      @Injectable()
      class ConfigService implements WinstonModuleOptionsFactory {
        private loggerOptions = { instance: mockLogger };

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

      expect(rootModule.get(WINSTON_MODULE_PROVIDER)).toBe(mockLogger);
      expect(rootModule.get(WINSTON_MODULE_NEST_PROVIDER)).toEqual(expect.objectContaining({logger: mockLogger}))
    });
  });
});
