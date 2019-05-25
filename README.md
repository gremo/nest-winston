<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

 <p align="center">A Nest module wrapper for winston logger.</p>

<p align="center">
<a href="https://www.npmjs.com/package/nest-winston"><img src="https://img.shields.io/npm/v/nest-winston.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/package/nest-winstong"><img src="https://img.shields.io/npm/l/nest-winston.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/package/nest-winston"><img src="https://img.shields.io/npm/dm/nest-winston.svg" alt="NPM Downloads" /></a>
</p>

## Description

A [Nest](https://github.com/nestjs/nest) module wrapper for [winston](https://github.com/winstonjs/winston) logger.

## Installation

```bash
$ npm install --save nest-winston winston
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

> **Caveats**: because the way Nest works, you can't inject dependencies exported from the root module itself (using `exports`) or any other feature module that **isn't global**. In other words, if you use `forRootAsync()` and need to inject a service, that service must be exported from a [global module](https://docs.nestjs.com/modules#global-modules).

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

The factory might be async and is able to inject dependencies through the `inject` option.
