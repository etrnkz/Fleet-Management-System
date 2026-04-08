/**
 * Database seeder — run with: npm run seed
 * Seeds: Law + Veterinary colleges, full role chain, 2 employees per college.
 */
import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../app.module'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { College } from '../colleges/entities/college.entity'
import { Department } from '../departments/entities/department.entity'
import { User, UserRole } from '../users/entities/user.entity'
import { WorkflowService } from '../workflow/workflow.service'

const PASSWORD = 'Password@123'

async function hash(p: string) { return bcrypt.hash(p, 10) }

async function createUser(
  repo: Repository<User>,
  data: { name: string; email: string; role: UserRole; department?: Department | null; college?: College | null }
): Promise<User> {
  const existing = await repo.findOne({ where: { email: data.email } })
  if (existing) {
    console.log(`  ~ ${data.role.padEnd(20)} ${data.email} (already exists)`)
    return existing
  }
  const user = repo.create({
    name: data.name,
    email: data.email,
    password: await hash(PASSWORD),
    role: data.role,
    department: data.department ?? null,
    college: data.college ?? null,
    isActive: true,
  })
  await repo.save(user)
  console.log(`  + ${data.role.padEnd(20)} ${data.email}`)
  return user
}

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] })

  const collegeRepo: Repository<College> = app.get(getRepositoryToken(College))
  const departmentRepo: Repository<Department> = app.get(getRepositoryToken(Department))
  const userRepo: Repository<User> = app.get(getRepositoryToken(User))
  const workflowService = app.get(WorkflowService)

  // ── 1. Workflows ───────────────────────────────────────────────────────────
  console.log('\nSeeding workflows...')
  await workflowService.seedDefaultWorkflows()
  console.log('  + Workflows seeded')

  // ── 2. Colleges & Departments ──────────────────────────────────────────────
  console.log('\nSeeding colleges...')

  const collegesData = [
    { name: 'College of Law',              code: 'COL',  departments: ['Law'] },
    { name: 'College of Veterinary Medicine', code: 'CVM', departments: ['Veterinary Medicine', 'Veterinary Pharmacy'] },
  ]

  const colleges: Record<string, College> = {}
  const departments: Record<string, Department> = {}

  for (const cd of collegesData) {
    let college = await collegeRepo.findOne({ where: { name: cd.name } })
    if (!college) {
      college = await collegeRepo.save(collegeRepo.create({ name: cd.name, code: cd.code }))
      console.log(`  + College: ${college.name}`)
    }
    colleges[cd.name] = college

    for (const deptName of cd.departments) {
      let dept = await departmentRepo.findOne({ where: { name: deptName } })
      if (!dept) {
        const code = deptName.replace(/\s+/g, '').substring(0, 8).toUpperCase()
        dept = await departmentRepo.save(departmentRepo.create({ name: deptName, code, college }))
        console.log(`    + Department: ${deptName}`)
      }
      departments[deptName] = dept
    }
  }

  // ── 3. System Admin ────────────────────────────────────────────────────────
  console.log('\nSeeding system admin...')
  await createUser(userRepo, {
    name: 'System Administrator',
    email: 'admin@haramaya.edu.et',
    role: UserRole.SystemAdmin,
  })

  // ── 4. President ───────────────────────────────────────────────────────────
  console.log('\nSeeding president...')
  await createUser(userRepo, {
    name: 'University President',
    email: 'president@haramaya.edu.et',
    role: UserRole.President,
  })

  // ── 5. Transport & Deployment ──────────────────────────────────────────────
  console.log('\nSeeding operational roles...')
  await createUser(userRepo, { name: 'Transport Officer',  email: 'transport@haramaya.edu.et',  role: UserRole.TransportOffice })
  await createUser(userRepo, { name: 'Deployment Officer', email: 'deployment@haramaya.edu.et', role: UserRole.DeploymentTeam })
  await createUser(userRepo, { name: 'Test Driver',        email: 'driver@haramaya.edu.et',     role: UserRole.Driver })

  // ── 6. Law College chain ───────────────────────────────────────────────────
  console.log('\nSeeding Law College chain...')
  const lawCollege = colleges['College of Law']
  const lawDept    = departments['Law']

  const lawDean = await createUser(userRepo, {
    name: 'Law College Dean',
    email: 'dean.law@haramaya.edu.et',
    role: UserRole.Dean,
    college: lawCollege,
  })

  const lawDeptHead = await createUser(userRepo, {
    name: 'Law Department Head',
    email: 'depthead.law@haramaya.edu.et',
    role: UserRole.DepartmentHead,
    department: lawDept,
    college: lawCollege,
  })

  await createUser(userRepo, {
    name: 'Law Employee One',
    email: 'employee1.law@haramaya.edu.et',
    role: UserRole.User,
    department: lawDept,
    college: lawCollege,
  })

  await createUser(userRepo, {
    name: 'Law Employee Two',
    email: 'employee2.law@haramaya.edu.et',
    role: UserRole.User,
    department: lawDept,
    college: lawCollege,
  })

  // ── 7. Veterinary College chain ────────────────────────────────────────────
  console.log('\nSeeding Veterinary College chain...')
  const vetCollege  = colleges['College of Veterinary Medicine']
  const vetDept     = departments['Veterinary Medicine']

  const vetDean = await createUser(userRepo, {
    name: 'Veterinary College Dean',
    email: 'dean.vet@haramaya.edu.et',
    role: UserRole.Dean,
    college: vetCollege,
  })

  const vetDeptHead = await createUser(userRepo, {
    name: 'Veterinary Department Head',
    email: 'depthead.vet@haramaya.edu.et',
    role: UserRole.DepartmentHead,
    department: vetDept,
    college: vetCollege,
  })

  await createUser(userRepo, {
    name: 'Vet Employee One',
    email: 'employee1.vet@haramaya.edu.et',
    role: UserRole.User,
    department: vetDept,
    college: vetCollege,
  })

  await createUser(userRepo, {
    name: 'Vet Employee Two',
    email: 'employee2.vet@haramaya.edu.et',
    role: UserRole.User,
    department: vetDept,
    college: vetCollege,
  })

  // ── 8. Summary ─────────────────────────────────────────────────────────────
  console.log('\n========================================')
  console.log('SEED COMPLETE — ALL CREDENTIALS')
  console.log('========================================')
  console.log(`Password for ALL users: ${PASSWORD}`)
  console.log('----------------------------------------')
  console.log('SYSTEM')
  console.log(`  SystemAdmin     admin@haramaya.edu.et`)
  console.log(`  President       president@haramaya.edu.et`)
  console.log(`  TransportOffice transport@haramaya.edu.et`)
  console.log(`  DeploymentTeam  deployment@haramaya.edu.et`)
  console.log(`  Driver          driver@haramaya.edu.et`)
  console.log('----------------------------------------')
  console.log('LAW COLLEGE')
  console.log(`  Dean            dean.law@haramaya.edu.et`)
  console.log(`  DepartmentHead  depthead.law@haramaya.edu.et`)
  console.log(`  Employee 1      employee1.law@haramaya.edu.et`)
  console.log(`  Employee 2      employee2.law@haramaya.edu.et`)
  console.log('----------------------------------------')
  console.log('VETERINARY COLLEGE')
  console.log(`  Dean            dean.vet@haramaya.edu.et`)
  console.log(`  DepartmentHead  depthead.vet@haramaya.edu.et`)
  console.log(`  Employee 1      employee1.vet@haramaya.edu.et`)
  console.log(`  Employee 2      employee2.vet@haramaya.edu.et`)
  console.log('========================================\n')

  await app.close()
}

seed().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
