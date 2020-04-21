<p align="center">
  <a href="http://nestjs.com"><img src="https://nestjs.com/img/logo_text.svg" alt="Nest Logo" width="320" /></a>
</p>

<p align="center">
  A <a href="https://github.com/nestjs/nest">Nest</a> module wrapper for <a href="https://github.com/winstonjs/winston">winston</a> logger.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/nest-winston"><img src="https://img.shields.io/npm/v/nest-winston.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/package/nest-winston"><img src="https://img.shields.io/npm/dw/nest-winston.svg" alt="NPM Downloads" /></a>
  <a href="https://travis-ci.org/gremo/nest-winston"><img src="https://travis-ci.org/gremo/nest-winston.svg?branch=master" alt="Travis build" /></a>
  <a href="https://github.com/gremo/nest-winston/issues"><img src="https://img.shields.io/github/issues/gremo/nest-winston.svg" alt="GitHub issues" /></a>
  <a href="https://david-dm.org/gremo/nest-winston"><img alt="David" src="https://img.shields.io/david/gremo/nest-winston.svg" alt="dependencies Status"></a>
  <a href="https://david-dm.org/gremo/nest-winston?type=dev"><img src="https://david-dm.org/gremo/nest-winston/dev-status.svg" alt="devDependencies status" /></a>
</p>

## Installation

```bash
npm install --save nest-winston winston
```

## Quick Start

Import `WinstonModule` into the root `AppModule` and use the `forRoot()` method to configure it. This method accepts the same options object as [`createLogger()`](https://github.com/winstonjs/winston#usage) function from the winston package:

```typescript
import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

@Module({
  imports: [
    WinstonModule.forRoot({
      // options
    }),
  ],
})
export class AppModule {}
```

Afterward, the winston instance will be available to inject across entire project using the `winston` injection token:

```typescript
import { Controller, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Controller('cats')
export class CatsController {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) { }
}
```

Note that `WinstonModule` is a global module, it will be available in all you feature modules.

## Async configuration

> **Caveats**: because the way Nest works, you can't inject dependencies exported from the root module itself (using `exports`). If you use `forRootAsync()` and need to inject a service, that service must be either imported using the `imports` options or exported from a [global module](https://docs.nestjs.com/modules#global-modules).

Maybe you need to asynchronously pass your module options, for example when you need a configuration service. In such case, use the `forRootAsync()` method, returning an options object from the `useFactory` method:

```typescript
import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: () => ({
        // options
      }),
      inject: [],
    }),
  ],
})
export class AppModule {}
```

The factory might be async, can inject dependencies with `inject` option and import other modules using the `imports` option.

Alternatively, you can use the `useClass` syntax:

```typescript
WinstonModule.forRootAsync({
  useClass: WinstonConfigService,
})
```

With the above code, Nest will create a new instance of `WinstonConfigService` and its method `createWinstonModuleOptions` will be called in order to provide the module options.

## Use as the main Nest logger

If you want to use winston logger across the whole app use the following:

```typescript
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
}
bootstrap();
```

The module also provides a custom Nest-like special formatter for console transports:

```typescript
import { Module } from '@nestjs/common';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike(),
          ),
        }),
        // other transports...
      ],
      // other options
    }),
  ],
})
export class AppModule {}
```

When creating loggers from `WinstonModule`, Nest has to bootstrap the application first. This means instantiating all the modules and the providers, injecting dependencies, etc. During this "bootstrapping" process, instances of `WinstonLogger` are not available which means Nest falls back to an internal logger.

In order to have a winston logger used during bootstrapping, the logger has to created outside of the application lifecycle and passed to `NestFactory.create` as [an option](https://docs.nestjs.com/techniques/logger):

```typescript
import { WinstonModule } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      // options (same as WinstonModule.forRoot() options)
    })
  });
}
bootstrap();
```

The bootstrapping logger will be used unless another logger is set (i.e. when `app.useLogger()` is called).

## Contributing

New features and bugfixes are always welcome! In order to contribute to this project, follow a few easy steps:

1. [Fork](https://help.github.com/en/github/getting-started-with-github/fork-a-repo) this repository, clone it on your machine and run `npm install`
2. Open your local repository with [Visual Studio code](https://code.visualstudio.com/) and install all the suggested extensions
3. Create a branch `my-awesome-feature` and commit to it
4. Run `npm run lint`, `npm run test` and `npm run build` and verify that they complete without errors
5. Push `my-awesome-feature` branch to GitHub and open a [pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests)
