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

  createIOServer(_port: number, options?: ServerOptions): Server {
    const wsPort = this.configService.get<number>('WS_PORT', _port);
    const origin = this.configService.get<string>('WS_CORS_ORIGIN', '*');
    const namespace = this.configService.get<string>('WS_NAMESPACE', '/events');

    const serverOptions = {
      ...options,
      cors: { origin },
      namespace,
    };

    return super.createIOServer(wsPort, serverOptions);
  }
}
