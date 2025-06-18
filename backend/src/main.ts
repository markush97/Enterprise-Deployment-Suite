import { INestApplication, Logger, ValidationError, ValidationPipe } from '@nestjs/common';
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

export async function setupApp(app: INestApplication) {
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
}

function setupSwagger(app: NestExpressApplication) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Enterprise Deployment Suite API')
    .setDescription('API documentation for Enterprise Deployment Suite')
    .setVersion(DEFAULT_VERSION)
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule /*, { bufferLogs: true }*/,
  );
  await setupApp(app);
  const config = app.get<CoreConfigService>(CoreConfigService);

  // Enable logging
  app.useLogger(app.get(CoreLogger));

  // Disable x-powered-by header (only available on Express apps)
  app.disable('x-powered-by');

  app.setGlobalPrefix(config.globalPrefix);

  // Enable CORS
  app.enableCors();

  // Setup database
  const orm = app.get(MikroORM);
  await orm.getSchemaGenerator().updateSchema();

  setupSwagger(app);

  Logger.log(`Starting application in ${config.processEnv} mode`);
  await app.listen(config.httpPort);
  Logger.log(
    `🚀 Application is running on: http://localhost:${config.httpPort}/${config.globalPrefix}`,
  );
}

// Only execute the bootstrap function if this file is run directly
// this is to prevent the bootstrap from running when this file is imported in tests
if (require.main === module) {
  bootstrap();
}
