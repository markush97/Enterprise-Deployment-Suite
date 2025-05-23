import { Logger, ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { MikroORM } from '@mikro-orm/core';

import { AppModule } from './app.module';
import { CoreConfigService } from './core/config/core.config.service';
import { BadRequestMTIException } from './core/errorhandling/exceptions/bad-request.mti-exception';
import { MTIErrorCodes } from './core/errorhandling/exceptions/mti.error-codes.enum';
import { CoreLogger } from './core/logging/logging.service';

const DEFAULT_VERSION = '1';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule /*, { bufferLogs: true }*/,
  );

  const config = app.get<CoreConfigService>(CoreConfigService);

  // Global Validation (inbound)
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        Logger.error(JSON.stringify(validationErrors));
        return new BadRequestMTIException(MTIErrorCodes.GENERIC_VALIDATION_ERROR, validationErrors);
      },
      forbidNonWhitelisted: true,
      whitelist: true,
      skipMissingProperties: false,
      transformOptions: {
        enableImplicitConversion: true,
        exposeDefaultValues: true,
      },
      transform: true,
      enableDebugMessages: config.processEnv === 'development',
    }),
  );

  // shutdown hooks to trigger actions on application shutdown
  app.enableShutdownHooks();

  // Enable validation
  app.useGlobalPipes(new ValidationPipe());

  // Enable logging
  app.useLogger(app.get(CoreLogger));

  // Enable CORS
  app.enableCors();

  // Disable x-powered-by header
  app.disable('x-powered-by');

  app.setGlobalPrefix(config.globalPrefix);

  // Setup database
  const orm = app.get(MikroORM);
  await orm.getSchemaGenerator().updateSchema();

  // Setup Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Enterprise Deployment Suite API')
    .setDescription('API documentation for Enterprise Deployment Suite')
    .setVersion(DEFAULT_VERSION)
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  Logger.log(`Starting application in ${config.processEnv} mode`);
  await app.listen(config.httpsPort);
  Logger.log(
    `🚀 Application is running on: http://localhost:${config.httpsPort}/${config.globalPrefix}`,
  );
}
bootstrap();
