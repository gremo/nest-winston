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
import { Logger } from 'winston';

@Controller('cats')
export class CatsController {
  constructor(@Inject('winston') private readonly logger: Logger) { }
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

## Use as the main Nest logger

If you want to use winston logger across the whole app, including bootstrapping and error handling, use the following:

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get('NestWinston'));
}
bootstrap();
```
