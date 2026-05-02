/**
 * Full demo seed — run with: npm run seed:all
 *
 * Runs the system seed first, then adds:
 *   - One Dean per college
 *   - One Department Head per department
 *   - One Employee per department
 *
 * Use this for development/demo environments only.
 * In production, use  npm run seed  and invite users via the admin panel.
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
import { Driver, DriverStatus } from '../drivers/entities/driver.entity'
import { WorkflowService } from '../workflow/workflow.service'
import { COLLEGES_DATA, ADMIN_OFFICES, slug, seedStructure } from './seed'

const PASSWORD = 'Password@123'
async function hash(p: string) { return bcrypt.hash(p, 10) }

async function upsertUser(
  repo: Repository<User>,
  data: {
    name: string
    email: string
    role: UserRole
    department?: Department | null
    college?: College | null
  },
): Promise<User> {
  const existing = await repo.findOne({ where: { email: data.email } })
  if (existing) return existing
  return repo.save(
    repo.create({
      name: data.name,
      email: data.email,
      password: await hash(PASSWORD),
      role: data.role,
      department: data.department ?? null,
      college: data.college ?? null,
      isActive: true,
    }),
  )
}

async function seedAll() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false })

  const collegeRepo: Repository<College>       = app.get(getRepositoryToken(College))
  const departmentRepo: Repository<Department> = app.get(getRepositoryToken(Department))
  const userRepo: Repository<User>             = app.get(getRepositoryToken(User))
  const driverRepo: Repository<Driver>         = app.get(getRepositoryToken(Driver))
  const workflowService                        = app.get(WorkflowService)

  // 1. Workflows
  await workflowService.seedDefaultWorkflows()

  // 2. Colleges & Departments
  const { colleges, departments } = await seedStructure(collegeRepo, departmentRepo)

  // 3. System-level accounts (same as npm run seed)
  await upsertUser(userRepo, { name: 'System Administrator', email: 'admin@haramaya.edu.et',      role: UserRole.SystemAdmin })
  await upsertUser(userRepo, { name: 'University President', email: 'president@haramaya.edu.et',  role: UserRole.President })
  await upsertUser(userRepo, { name: 'Transport Officer',    email: 'transport@haramaya.edu.et',  role: UserRole.TransportOffice })
  await upsertUser(userRepo, { name: 'Deployment Officer',   email: 'deployment@haramaya.edu.et', role: UserRole.DeploymentTeam })
  await upsertUser(userRepo, { name: 'Gate Security',        email: 'gate@haramaya.edu.et',       role: UserRole.Gate })

  const driverUser = await upsertUser(userRepo, {
    name: 'Test Driver',
    email: 'driver@haramaya.edu.et',
    role: UserRole.Driver,
  })
  const existingProfile = await driverRepo.findOne({ where: { user: { id: driverUser.id } } })
  if (!existingProfile) {
    await driverRepo.save(driverRepo.create({
      user: driverUser,
      licenseNumber: 'DL-TEST-001',
      licenseExpiry: new Date('2027-12-31'),
      experienceYears: 5,
      status: DriverStatus.Available,
      rating: 4.5,
      notes: 'Seeded test driver',
    }))
  }

  // Postman test employee (CCI / Computer Science)
  const cciCollege = colleges['College of Computing and Informatics']
  const csDept     = departments['Computer Science']
  await upsertUser(userRepo, {
    name: 'Postman Tester',
    email: 'postman@haramaya.edu.et',
    role: UserRole.User,
    department: csDept,
    college: cciCollege,
  })

  // 4. One Dean + one DeptHead + one Employee per college/department
  let deanCount = 0, headCount = 0, empCount = 0

  for (const cd of COLLEGES_DATA) {
    const college     = colleges[cd.name]
    const collegeSlug = slug(cd.name)

    // Dean
    await upsertUser(userRepo, {
      name:  `Dean of ${cd.name}`,
      email: `dean.${collegeSlug}@haramaya.edu.et`,
      role:  UserRole.Dean,
      college,
    })
    deanCount++

    for (const deptName of cd.departments) {
      const dept     = departments[deptName]
      const deptSlug = slug(deptName)

      // Department Head
      await upsertUser(userRepo, {
        name:  `Head of ${deptName}`,
        email: `head.${deptSlug}@haramaya.edu.et`,
        role:  UserRole.DepartmentHead,
        department: dept,
        college,
      })
      headCount++

      // Employee
      await upsertUser(userRepo, {
        name:  `Employee - ${deptName}`,
        email: `emp.${deptSlug}@haramaya.edu.et`,
        role:  UserRole.User,
        department: dept,
        college,
      })
      empCount++
    }
  }

  // 5. Summary
  const totalDepts = COLLEGES_DATA.reduce((s, c) => s + c.departments.length, 0)

  console.log('\n╔══════════════════════════════════════════════╗')
  console.log('║         FULL DEMO SEED COMPLETE              ║')
  console.log('╚══════════════════════════════════════════════╝')
  console.log(`\nPassword for ALL accounts: ${PASSWORD}\n`)

  console.log('SYSTEM ACCOUNTS')
  console.log('  SystemAdmin     admin@haramaya.edu.et')
  console.log('  President       president@haramaya.edu.et')
  console.log('  TransportOffice transport@haramaya.edu.et')
  console.log('  DeploymentTeam  deployment@haramaya.edu.et')
  console.log('  Gate            gate@haramaya.edu.et')
  console.log('  Driver (test)   driver@haramaya.edu.et')
  console.log('  Employee (test) postman@haramaya.edu.et')

  console.log('\nCOLLEGE / DEPARTMENT ACCOUNTS')
  console.log(`  ${COLLEGES_DATA.length} colleges  →  ${deanCount} Deans`)
  console.log(`  ${totalDepts} departments  →  ${headCount} Dept Heads  +  ${empCount} Employees`)

  console.log('\nEMAIL PATTERNS')
  console.log('  Dean:     dean.<college-slug>@haramaya.edu.et')
  console.log('  DeptHead: head.<dept-slug>@haramaya.edu.et')
  console.log('  Employee: emp.<dept-slug>@haramaya.edu.et')

  console.log('\nEXAMPLES')
  console.log('  dean.computing-and-inform@haramaya.edu.et')
  console.log('  head.information-technolo@haramaya.edu.et')
  console.log('  emp.information-technolo@haramaya.edu.et')
  console.log()

  await app.close()
}

seedAll().catch((err) => {
  console.error('Full seed failed:', err)
  process.exit(1)
})
