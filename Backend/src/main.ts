import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Fleet Management System API')
    .setDescription(
      'Production-grade Fleet Management System for school transportation with RBAC, workflow automation, and real-time tracking.',
    )
    .setVersion('1.0')
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Departments', 'Department management endpoints')
    .addTag('Colleges', 'College management endpoints')
    .addTag('Vehicles', 'Vehicle management endpoints')
    .addTag('Drivers', 'Driver management endpoints')
    .addTag('Trips', 'Trip request and management endpoints')
    .addTag('Workflow', 'Workflow configuration and management')
    .addTag('Deployment', 'Vehicle and driver allocation')
    .addTag('Transport', 'Transport office operations')
    .addTag('Maintenance', 'Vehicle maintenance management')
    .addTag('Fuel', 'Fuel tracking and management')
    .addTag('Tracking', 'Real-time GPS tracking')
    .addTag('Notifications', 'Notification management')
    .addTag('Reports', 'Reporting and analytics')
    .addTag('Audit', 'Audit logs and trail')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3000', 'Local Development')
    .addServer('https://api.fleet.school.edu', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Fleet Management API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
    🚀 Application is running on: http://localhost:${port}
    📚 API Documentation: http://localhost:${port}/api/docs
    🔍 Health Check: http://localhost:${port}/api/health
  `);
}
bootstrap();
