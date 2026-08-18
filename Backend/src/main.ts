import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { getCorsOrigin } from './config/cors-origins';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: getCorsOrigin(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global serializer — strips @Exclude() fields (e.g. password) from all responses
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

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
      `Production-grade Fleet Management System for school transportation with RBAC, workflow automation, and real-time tracking.
      
## Features
- 🔐 JWT Authentication with refresh tokens
- 👥 Role-based access control (9 roles)
- 🚗 Vehicle and driver management
- 📋 Trip request workflow with multi-level approval
- ⏰ Automatic timeout and rejection (48 hours per level)
- 🔔 Real-time notifications
- 🔧 Maintenance management
- 📊 Comprehensive audit logs
- 📈 Statistics and analytics

## Authentication
Most endpoints require authentication. To use protected endpoints:
1. Register or login to get an access token
2. Click the "Authorize" button (🔓 icon)
3. Enter: \`Bearer <your_access_token>\`
4. Click "Authorize" and "Close"

## Roles
- **User**: Regular users who can request trips
- **DepartmentHead**: Approve department-level trips
- **CollegeHead**: Approve college-level trips
- **Dean**: Final approval for all trips
- **DeploymentTeam**: Allocate vehicles and drivers
- **TransportOffice**: Confirm transport and manage fuel
- **MaintenanceTeam**: Handle vehicle maintenance
- **Driver**: Execute trips and report issues
- **Developer**: Full system access

## Workflow
Normal Trip: User → Department → College → Dean → Allocation → Transport → Execution
VIP Trip: User → Dean → Allocation → Transport → Execution`,
    )
    .setVersion('1.0.0')
    .setContact(
      'Fleet Management Team',
      'https://github.com/etrnkz/Fleet-Management-System',
      'support@fleet.school.edu',
    )
    .setLicense('Apache 2.0', 'https://opensource.org/licenses/Apache-2.0')
    .addTag('App', 'System information and health checks')
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Users', 'User management and profiles')
    .addTag('Departments', 'Department management and hierarchy')
    .addTag('Colleges', 'College management and operations')
    .addTag('Vehicles', 'Vehicle fleet management and tracking')
    .addTag('Drivers', 'Driver management and assignments')
    .addTag('Trips', 'Trip requests, approvals, and execution')
    .addTag('Notifications', 'User notifications and alerts')
    .addTag('Maintenance', 'Vehicle maintenance and repairs')
    .addTag('Audit', 'Audit logs and activity tracking')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token (obtained from /auth/login)',
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
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
      tryItOutEnabled: true,
      requestSnippetsEnabled: true,
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
    },
    customSiteTitle: 'Fleet Management API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info .title { font-size: 36px; }
      .swagger-ui .scheme-container { background: #fafafa; padding: 15px; }
    `,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
    🚀 Application is running on: http://localhost:${port}
    📚 API Documentation: http://localhost:${port}/api/docs
    🔍 Health Check: http://localhost:${port}/api/v1/health
  `);
}
bootstrap();
