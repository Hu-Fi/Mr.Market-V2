import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CustomAdapter } from './common/config/socket-io-adapter.config';
import * as path from 'path';
import * as express from 'express';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapterHost));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const configService: ConfigService = app.get(ConfigService);
  const corsConfig = configService.get<string>('CORS_ORIGIN', '*');
  app.enableCors({
    origin: corsConfig,
    methods: ['GET', 'OPTIONS', 'POST', 'PATCH', 'DELETE'],
  });

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const config = new DocumentBuilder()
    .setTitle('Trading Strategy Execution API')
    .setDescription('Documentation of API endpoints')
    .setVersion('0.0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const swaggerUiDistPath = path.join(
    __dirname,
    '..',
    'node_modules',
    'swagger-ui-dist',
  );
  app.use('/swagger-static', express.static(swaggerUiDistPath));
  app.use('/', express.static(swaggerUiDistPath, { index: false }));

  SwaggerModule.setup('', app, document);

  // app.useWebSocketAdapter(new CustomAdapter(app, configService));

  const port = configService.get<number>('TSE_BE_PORT', 3001);
  await app.listen(port, async () => {
    logger.log(`Server is running on port ${port}`);
  });
}
bootstrap();
