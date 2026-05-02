/**
 * System seed — run with: npm run seed
 *
 * Creates ONLY the 5 core system accounts needed to operate:
 *   SystemAdmin, President, TransportOffice, DeploymentTeam, Gate
 *
 * Everything else (colleges, departments, drivers, deans, employees)
 * is either created via the admin panel or by running: npm run seed:all
 */
import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../app.module'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User, UserRole } from '../users/entities/user.entity'
import { WorkflowService } from '../workflow/workflow.service'

const PASSWORD = 'Password@123'

async function upsertUser(
  repo: Repository<User>,
  data: { name: string; email: string; role: UserRole },
): Promise<void> {
  const existing = await repo.findOne({ where: { email: data.email } })
  if (existing) return
  await repo.save(
    repo.create({
      name: data.name,
      email: data.email,
      password: await bcrypt.hash(PASSWORD, 10),
      role: data.role,
      isActive: true,
    }),
  )
}

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false })

  const userRepo: Repository<User> = app.get(getRepositoryToken(User))
  const workflowService = app.get(WorkflowService)

  // Seed default workflows
  await workflowService.seedDefaultWorkflows()

  // 5 system accounts — nothing else
  await upsertUser(userRepo, { name: 'System Administrator', email: 'admin@haramaya.edu.et',      role: UserRole.SystemAdmin })
  await upsertUser(userRepo, { name: 'University President', email: 'president@haramaya.edu.et',  role: UserRole.President })
  await upsertUser(userRepo, { name: 'Transport Officer',    email: 'transport@haramaya.edu.et',  role: UserRole.TransportOffice })
  await upsertUser(userRepo, { name: 'Deployment Officer',   email: 'deployment@haramaya.edu.et', role: UserRole.DeploymentTeam })
  await upsertUser(userRepo, { name: 'Gate Security',        email: 'gate@haramaya.edu.et',       role: UserRole.Gate })

  console.log('\n╔══════════════════════════════════════════════╗')
  console.log('║           SYSTEM SEED COMPLETE               ║')
  console.log('╚══════════════════════════════════════════════╝')
  console.log(`\nPassword for all accounts: ${PASSWORD}\n`)
  console.log('  SystemAdmin     admin@haramaya.edu.et')
  console.log('  President       president@haramaya.edu.et')
  console.log('  TransportOffice transport@haramaya.edu.et')
  console.log('  DeploymentTeam  deployment@haramaya.edu.et')
  console.log('  Gate            gate@haramaya.edu.et')
  console.log('\nAll other users (Deans, Dept Heads, Employees, Drivers)')
  console.log('are created via the System Admin panel or: npm run seed:all\n')

  await app.close()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
