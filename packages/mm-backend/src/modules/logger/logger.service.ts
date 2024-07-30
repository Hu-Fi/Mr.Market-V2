import { Injectable, Logger, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.DEFAULT })
export class CustomLogger extends Logger {
  constructor(context?: string) {
    super(context);
  }

  log(message: any, context?: string) {
    if (context) {
      super.log(message, context);
    } else {
      super.log(message);
    }
  }

  error(message: any, trace?: string, context?: string) {
    if (context) {
      super.error(message, trace, context);
    } else {
      super.error(message, trace);
    }
  }

  warn(message: any, context?: string) {
    if (context) {
      super.warn(message, context);
    } else {
      super.warn(message);
    }
  }

  debug(message: any, context?: string) {
    if (context) {
      super.debug(message, context);
    } else {
      super.debug(message);
    }
  }

  verbose(message: any, context?: string) {
    if (context) {
      super.verbose(message, context);
    } else {
      super.verbose(message);
    }
  }

  onModuleInit() {
    this.log('Logger module initialized.', 'Logger');
  }

  onModuleDestroy() {
    this.log('Logger module destroyed.', 'Logger');
  }
}
