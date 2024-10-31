import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationError, ValidationPipe, VersioningType } from '@nestjs/common';
import { BadRequestMTIException } from './core/errorhandling/exceptions/bad-request.mti-exception'
import { MTIErrorCodes } from './core/errorhandling/exceptions/mti.error-codes.enum';
import { CoreConfigService } from './core/config/core.config.service';
import { Logger as PinoLogger } from 'nestjs-pino';


const DEFAULT_VERSION = '1';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const config = app.get<CoreConfigService>(CoreConfigService);

  // Global Validation (inbound)
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        Logger.error(JSON.stringify(validationErrors));
        return new BadRequestMTIException(
          MTIErrorCodes.GENERIC_VALIDATION_ERROR,
          validationErrors,
        );
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
  app.useLogger(app.get(PinoLogger));

  // Enable CORS
  app.enableCors();

  // Setup Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Image Assistant API')
    .setDescription('API documentation for Image Assistant')
    .setVersion('1.0')
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