/**
 * Database seeder — run with: npm run seed
 * Seeds: organizations (colleges + departments), default workflows, and an initial admin user.
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

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] })

  const collegeRepo: Repository<College> = app.get(getRepositoryToken(College))
  const departmentRepo: Repository<Department> = app.get(getRepositoryToken(Department))
  const userRepo: Repository<User> = app.get(getRepositoryToken(User))
  const workflowService = app.get(WorkflowService)

  // ── 1. Colleges & Departments ──────────────────────────────────────────────
  console.log('Seeding colleges and departments...')

  const collegesData = [
    {
      name: 'College of Agriculture and Environmental Sciences',
      departments: ['Plant Sciences', 'Animal Sciences', 'Natural Resources Management', 'Agricultural Economics'],
    },
    {
      name: 'College of Computing and Informatics',
      departments: ['Computer Science', 'Information Technology', 'Software Engineering', 'Information Systems'],
    },
    {
      name: 'College of Engineering and Technology',
      departments: ['Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Chemical Engineering'],
    },
    {
      name: 'College of Business and Economics',
      departments: ['Management', 'Accounting and Finance', 'Economics', 'Marketing Management'],
    },
    {
      name: 'College of Natural and Computational Sciences',
      departments: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Statistics'],
    },
    {
      name: 'College of Social Sciences and Humanities',
      departments: ['History and Heritage Management', 'Geography and Environmental Studies', 'Sociology', 'Psychology'],
    },
    {
      name: 'College of Law',
      departments: ['Law'],
    },
    {
      name: 'College of Medicine and Health Sciences',
      departments: ['Medicine', 'Nursing', 'Public Health', 'Medical Laboratory Sciences'],
    },
    {
      name: 'College of Veterinary Medicine',
      departments: ['Veterinary Medicine', 'Veterinary Pharmacy'],
    },
    {
      name: 'College of Education and Behavioral Sciences',
      departments: ['Curriculum and Instruction', 'Educational Planning and Management', 'Special Needs Education'],
    },
  ]

  for (const collegeData of collegesData) {
    let college = await collegeRepo.findOne({ where: { name: collegeData.name } })
    if (!college) {
      const code = collegeData.name.split(' ').filter(w => w.length > 3).map(w => w[0]).join('').toUpperCase().substring(0, 6) + Math.floor(Math.random() * 100)
      college = await collegeRepo.save(collegeRepo.create({ name: collegeData.name, code }))
      console.log(`  + College: ${college.name}`)
    }

    for (const deptName of collegeData.departments) {
      const exists = await departmentRepo.findOne({ where: { name: deptName, college: { id: college.id } } })
      if (!exists) {
        const code = deptName.replace(/[^A-Z]/g, '').substring(0, 6) + Math.floor(Math.random() * 100)
        await departmentRepo.save(departmentRepo.create({ name: deptName, code, college }))
        console.log(`    + Department: ${deptName}`)
      }
    }
  }

  // Administrative offices (no college)
  const adminOffices = [
    'Office of the President',
    'Office of the Vice President for Academic Affairs',
    'Office of the Vice President for Administration and Finance',
    'Human Resource Management Office',
    'Finance Office',
    'Transport and Logistics Office',
    'ICT Directorate',
    'Library Services',
    'Main Registrar Office',
    'Research and Community Service Office',
  ]

  for (const officeName of adminOffices) {
    const exists = await departmentRepo.findOne({ where: { name: officeName } })
    if (!exists) {
      const code = 'ADM' + Math.floor(Math.random() * 1000)
      await departmentRepo.save(departmentRepo.create({ name: officeName, code, college: undefined }))
      console.log(`  + Admin Office: ${officeName}`)
    }
  }

  // ── 2. Default Workflows ───────────────────────────────────────────────────
  console.log('Seeding default workflows...')
  await workflowService.seedDefaultWorkflows()
  console.log('  + Workflows seeded')

  // ── 3. System Admin User ───────────────────────────────────────────────────
  console.log('Seeding admin user...')
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@haramaya.edu.et'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@1234'

  const existing = await userRepo.findOne({ where: { email: adminEmail } })
  if (!existing) {
    const hashed = await bcrypt.hash(adminPassword, 10)
    await userRepo.save(userRepo.create({
      name: 'System Administrator',
      email: adminEmail,
      password: hashed,
      role: UserRole.SystemAdmin,
      isActive: true,
    }))
    console.log(`  + Admin user created: ${adminEmail}`)
  } else {
    console.log(`  ~ Admin user already exists: ${adminEmail}`)
  }

  // ── 4. Test Users (one per role) ───────────────────────────────────────────
  console.log('Seeding test users...')
  const DEFAULT_PASSWORD = 'Password@123'

  const testUsers = [
    { name: 'Test Employee',        email: 'employee@test.com',        role: UserRole.User },
    { name: 'Test Dept Head',       email: 'depthead@test.com',        role: UserRole.DepartmentHead },
    { name: 'Test College Head',    email: 'collegehead@test.com',     role: UserRole.CollegeHead },
    { name: 'Test Dean',            email: 'dean@test.com',            role: UserRole.Dean },
    { name: 'Test President',       email: 'president@test.com',       role: UserRole.President },
    { name: 'Test Transport Office',email: 'transport@test.com',       role: UserRole.TransportOffice },
    { name: 'Test Deployment Team', email: 'deployment@test.com',      role: UserRole.DeploymentTeam },
    { name: 'Test Driver',          email: 'driver@test.com',          role: UserRole.Driver },
    { name: 'Test Maintenance',     email: 'maintenance@test.com',     role: UserRole.MaintenanceTeam },
    { name: 'Test Gate',            email: 'gate@test.com',            role: UserRole.Gate },
    { name: 'Test System Admin',    email: 'sysadmin@test.com',        role: UserRole.SystemAdmin },
  ]

  for (const u of testUsers) {
    const exists = await userRepo.findOne({ where: { email: u.email } })
    if (!exists) {
      const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10)
      await userRepo.save(userRepo.create({ ...u, password: hashed, isActive: true }))
      console.log(`  + ${u.role.padEnd(20)} ${u.email}`)
    } else {
      console.log(`  ~ ${u.role.padEnd(20)} ${u.email} (already exists)`)
    }
  }

  console.log('\n========================================')
  console.log('TEST USER CREDENTIALS')
  console.log('========================================')
  console.log(`Password for all test users: ${DEFAULT_PASSWORD}`)
  console.log('----------------------------------------')
  for (const u of testUsers) {
    console.log(`${u.role.padEnd(20)} ${u.email}`)
  }
  console.log('========================================')
  console.log(`\nAdmin: ${adminEmail} / ${adminPassword}`)
  console.log('========================================\n')

  console.log('Seeding complete.')
  await app.close()
}

seed().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
