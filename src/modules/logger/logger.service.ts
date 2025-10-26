import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService {
  logger: ConsoleLogger;
  constructor() {
    this.logger = new ConsoleLogger({
      json: false,
    });
  }
}
