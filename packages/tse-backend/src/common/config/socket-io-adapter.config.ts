import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { ConfigService } from '@nestjs/config';

export class CustomAdapter extends IoAdapter {
  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService,
  ) {
    super(app);
  }

  create(_port: number, options?: ServerOptions): Server {
    const port = this.configService.get<number>('WS_PORT', _port);
    const origin = this.configService.get<string>('WS_CORS_ORIGIN', '*');
    const namespace = this.configService.get<string>('WS_NAMESPACE', '/events');
    return super.create(port, {
      ...options,
      cors: { origin },
      namespace,
    });
  }
}
