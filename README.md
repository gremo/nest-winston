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
$ npm i winston nest-winston --save
```

If you are using Yarn:

```bash
$ yarn add winston nest-winston
```

## Quick Start

Import the `WinstonModule` into the root `ApplicationModule`:

```typescript
import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';

@Module({
  imports: [
    WinstonModule.forRoot({
      // options
    }),
  ],
})
export class ApplicationModule { }
```

The `forRoot()` method accepts the same options object as `createLogger()` function from the winston package. Afterward, winston instance will be available to inject across entire project using the `winston` injection token:

```typescript
import { Controller, Inject } from '@nestjs/common';
import { Logger } from 'winston';

@Controller('cats')
export class CatsController {
  constructor(@Inject('winston') private readonly logger: Logger) { }
}
```

Note that `WinstonModule` is a global module, it will be available in all you feature modules.
