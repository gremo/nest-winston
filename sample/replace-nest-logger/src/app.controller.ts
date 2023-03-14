import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { WinstonLogger, WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
  ) {
    this.logger.setContext('App Controller');
  }

  @Get()
  getHello(): string {
    this.logger.log('Calling getHello()', AppController.name);

    return this.appService.getHello();
  }
}
