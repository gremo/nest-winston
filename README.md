<p align="center">
  <a href="http://nestjs.com"><img src="https://nestjs.com/img/logo_text.svg" alt="Nest Logo" width="320" /></a>
</p>

<p align="center">
  A <a href="https://github.com/nestjs/nest">Nest</a> module wrapper for <a href="https://github.com/winstonjs/winston">winston</a> logger.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/nest-winston"><img src="https://img.shields.io/npm/v/nest-winston.svg" alt="NPM version" /></a>
  <a href="https://www.npmjs.com/package/nest-winston"><img src="https://img.shields.io/npm/dw/nest-winston.svg" alt="NPM downloads" /></a>
  <a href="https://travis-ci.com/gremo/nest-winston"><img src="https://travis-ci.com/gremo/nest-winston.svg?branch=master" alt="Travis build" /></a>
  <a href="https://github.com/gremo/nest-winston/issues"><img src="https://img.shields.io/github/issues/gremo/nest-winston.svg" alt="GitHub issues" /></a>
  <a href="https://david-dm.org/gremo/nest-winston"><img src="https://img.shields.io/david/gremo/nest-winston.svg" alt="dependencies status"></a>
  <a href="https://david-dm.org/gremo/nest-winston?type=dev"><img src="https://david-dm.org/gremo/nest-winston/dev-status.svg" alt="devDependencies status" /></a>
</p>

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

This module also provides the `WinstonLogger` class (custom implementation of the [`LoggerService`](https://github.com/nestjs/nest/blob/master/packages/common/services/logger.service.ts#L10) interface) to be used by Nest for system logging. This will ensure consistent behavior and formatting across both Nest system logging and your application event/message logging.

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

Change your main module to provide the `Logger` service:

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

| Injection token and typing                                                | Module config | Usage                                                                                  |
| :------------------------------------------------------------------------ | :------------ | :------------------------------------------------------------------------------------- |
| `WINSTON_MODULE_PROVIDER` <br> `Logger` from `winston`                    | Yes           | + Your application/message logging                                                     |
| `WINSTON_MODULE_NEST_PROVIDER` <br> `LoggerService` from `@nestjs/common` | Yes           | + Your application/message logging <br> + Nest logger                                  |
| *none* <br> `Logger` from `@nestjs/common`                                | No            | + Your application/message logging <br> + Nest logger <br> + Application bootstrapping |

## Utilities

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
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('MyApp', { prettyPrint: true }),
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

## Contributing

New features and bugfixes are always welcome! In order to contribute to this project, follow a few easy steps:

1. [Fork](https://help.github.com/en/github/getting-started-with-github/fork-a-repo) this repository, clone it on your machine and run `npm install`
2. Open your local repository with [Visual Studio Code](https://code.visualstudio.com/) and install all the suggested extensions
3. Create a branch `my-awesome-feature` and commit to it
4. Run `npm run lint`, `npm run test` and `npm run build` and verify that they complete without errors
5. Push `my-awesome-feature` branch to GitHub and open a [pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests)
