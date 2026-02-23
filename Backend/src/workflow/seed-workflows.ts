import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { WorkflowService } from './workflow.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const workflowService = app.get(WorkflowService);

  console.log('Seeding default workflows...');
  await workflowService.seedDefaultWorkflows();
  console.log('Workflows seeded successfully!');

  await app.close();
}

bootstrap();
