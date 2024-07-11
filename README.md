<p align="center">
  <a href="http://nestjs.com"><img alt="Nest Logo" src="https://nestjs.com/img/logo-small.svg" width="120"></a>
</p>

<h1 align="center">
  nest-winston
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/nest-winston"><img alt="NPM version" src="https://img.shields.io/npm/v/nest-winston.svg"></a>
  <a href="https://www.npmjs.com/package/nest-winston"><img alt="NPM downloads" src="https://img.shields.io/npm/dw/nest-winston.svg"></a>
  <a href="https://github.com/gremo/nest-winston/pulse"><img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/m/gremo/nest-winston"></a>
  <a href="https://github.com/gremo/nest-winston/graphs/contributors" alt="Contributors"><img src="https://img.shields.io/github/contributors/gremo/nest-winston"></a>
  <a href="https://paypal.me/marcopolichetti" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"></a>
</p>

<p align="center">
  <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/gremo/nest-winston">
  <img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/gremo/nest-winston/ci.yaml">
  <a href="https://github.com/gremo/nest-winston/issues"><img alt="GitHub issues" src="https://img.shields.io/github/issues/gremo/nest-winston.svg"></a>
  <a href="https://github.com/gremo/nest-winston/pulls"><img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/gremo/nest-winston"></a>
</p>

<p align="center">
  A <a href="https://github.com/nestjs/nest">Nest</a> module wrapper for <a href="https://github.com/winstonjs/winston">winston</a> logger.
</p>

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Installation](#installation)
- [Quick start](#quick-start)
- [Async configuration](#async-configuration)
- [Replacing the Nest logger](#replacing-the-nest-logger)
- [Replacing the Nest logger (also for bootstrapping)](#replacing-the-nest-logger-also-for-bootstrapping)
- [Injection and usage summary](#injection-and-usage-summary)
- [Utilities](#utilities)
- [Logger methods](#logger-methods)
- [Upgrade](#upgrade)
- [Contributing](#contributing)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```bash
npm install --save nest-winston winston
```

Having troubles configuring `nest-winston`? Clone this repository and `cd` in a sample:

```bash
cd sample/quick-start
npm install
npm run start:dev
```

If you want to upgrade to a major or minor version, have a look at the [upgrade](#upgrade) section.

## Quick start

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

Afterward, the winston instance will be available to inject across entire project (and in your feature modules, being `WinstonModule` a global one) using the `WINSTON_MODULE_PROVIDER` injection token:

```typescript
import { Controller, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Controller('cats')
export class CatsController {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) { }
}
```

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

## Replacing the Nest logger

This module also provides the `WinstonLogger` class (custom implementation of the [`LoggerService`](https://github.com/nestjs/nest/blob/main/packages/common/services/logger.service.ts#L10) interface) to be used by Nest for system logging. This will ensure consistent behavior and formatting across both Nest system logging and your application event/message logging.

Change your `main.ts` as shown below:

```typescript
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  await app.listen(3000);
}
bootstrap();
```

Then inject the logger using the `WINSTON_MODULE_NEST_PROVIDER` token and the `LoggerService` typing:

```typescript
import { Controller, Inject, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Controller('cats')
export class CatsController {
  constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService) { }
}
```

Under the hood, the `WinstonLogger` class uses the configured winston logger instance (through `forRoot` or `forRootAsync`), forwarding all calls to it.

## Replacing the Nest logger (also for bootstrapping)

> **Important**: by doing this, you give up the dependency injection, meaning that `forRoot` and `forRootAsync` are not needed and shouldn't be used. Remove them from your main module.

Using the dependency injection has one minor drawback. Nest has to bootstrap the application first (instantiating modules and providers, injecting dependencies, etc.) and during this process the instance of `WinstonLogger` is not yet available, which means that Nest falls back to the internal logger.

One solution is to create the logger outside of the application lifecycle, using the `createLogger` function, and pass it to `NestFactory.create`. Nest will then wrap our winston logger (the same instance returned by the `createLogger` method) into the `Logger` class, forwarding all calls to it:

```typescript
import { WinstonModule } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      // options (same as WinstonModule.forRoot() options)
    })
  });
  await app.listen(3000);
}
bootstrap();
```

An alternative is to provide directly an instance of Winston in the options. This allows you to keep a reference to the instance and interact with it.

```typescript
import { createLogger } from 'winston';
import { WinstonModule } from 'nest-winston';

async function bootstrap() {
  // createLogger of Winston
  const instance = createLogger({
    // options of Winston
  });
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance,
    }),
  });
  await app.listen(3000);
}
bootstrap();
```

The usage afterwards for both solutions is the same. First, change your main module to provide the `Logger` service:

```typescript
import { Logger, Module } from '@nestjs/common';

@Module({
  providers: [Logger],
})
export class AppModule {}
```

Then inject the logger simply by type hinting it with `Logger` from `@nestjs/common`:

```typescript
import { Controller, Logger } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  constructor(private readonly logger: Logger) {}
}
```

Alternative syntax using the `LoggerService` typing and the `@Inject` decorator:

```typescript
import { Controller, Inject, Logger, LoggerService } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  constructor(@Inject(Logger) private readonly logger: LoggerService) {}
}
```

## Injection and usage summary

Here is a summary of the three techniques explained above:

| Injection token                | Typing                                | Module config | Usage                                                                  |
| :----------------------------- | :------------------------------------ | :------------ | :--------------------------------------------------------------------- |
| `WINSTON_MODULE_PROVIDER`      | `Logger` from `winston`               | Yes           | + Your application/message logging
| `WINSTON_MODULE_NEST_PROVIDER` | `LoggerService` from `@nestjs/common` | Yes           | + Your application/message logging <br> + Nest logger |
| *none*                         | `Logger` from `@nestjs/common`        | No            | + Your application/message logging <br> + Nest logger <br> + Application bootstrapping |

## Utilities

The module also provides a custom Nest-like special formatter for console transports named `nestLike`. Supported options:

- `colors`: enable console colors, defaults to `true`, unless `process.env.NO_COLOR` is set (same behaviour of Nest > 7.x)
- `prettyPrint`: pretty format log metadata, defaults to `true`
- `processId`: includes the Node Process ID (`process.pid`) in the output, defaults to `true`
- `appName`: includes the provided application name in the output, defaults to `true`

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
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('MyApp', {
              colors: true,
              prettyPrint: true,
              processId: true,
              appName: true,
            }),
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

## Logger methods

> **Note**: the logger instance has different logger methods, and each takes different arguments. To make sure the logger is being formatted the same way across the board take note of the following:

```typescript
debug(message: any, context?: string)
log(message: any, context?: string)
error(message: any, stack?: string, context?: string)
fatal(message: any, stack?: string, context?: string)
verbose(message: any, context?: string)
warn(message: any, context?: string)
```

Example:

```typescript
import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: Logger,
  ) {}

  @Get()
  getHello(): string {
    this.logger.log('Calling getHello()', AppController.name);
    this.logger.debug('Calling getHello()', AppController.name);
    this.logger.verbose('Calling getHello()', AppController.name);
    this.logger.warn('Calling getHello()', AppController.name);

    try {
      throw new Error()
    } catch (e) {
      this.logger.error('Calling getHello()', e.stack, AppController.name);
    }

    return this.appService.getHello();
  }
}
```

## Upgrade

Some notes about upgrading to a major or minor version.

### 1.6.x to 1.7

- The exported type `NestLikeConsoleFormatOptions` has slightly changed: `prettyPrint` is now optional and `colors` has been added.
- The `nestLike` formatter has the new `colors` option: if not provided, colors will be used according to Nest "approach" (disabled if env variable `process.env.NO_COLOR` is defined). Before output was always colorized.

## Contributing

All types of contributions are encouraged and valued. See the [Contributing](CONTRIBUTING.md) guidelines, the community looks forward to your contributions!

[![Contributors list](https://raw.githubusercontent.com/gremo/nest-winston/main/contributors.svg)](https://github.com/gremo/nest-winston/graphs/contributors)

## License

This project is released under the under terms of the [ISC License](LICENSE).
