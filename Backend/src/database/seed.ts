/**
 * System seed — run with: npm run seed
 *
 * Creates ONLY what is needed to operate the system from day one:
 *   - All colleges and departments (structure only, no users)
 *   - System-level accounts: SystemAdmin, President, TransportOffice,
 *     DeploymentTeam, Gate, and one test Driver
 *
 * College/department users (Deans, DeptHeads, Employees) are created
 * by invitation via the system admin panel — NOT seeded here.
 *
 * For a full demo dataset (all roles pre-created), run: npm run seed:all
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

// ── College / Department data ─────────────────────────────────────────────────
export const COLLEGES_DATA = [
  { name: 'College of Agriculture and Environmental Sciences', code: 'CAES', departments: ['Plant Sciences', 'Animal Sciences', 'Natural Resources Management', 'Agricultural Economics'] },
  { name: 'College of Computing and Informatics',              code: 'CCI',  departments: ['Computer Science', 'Information Technology', 'Software Engineering', 'Information Systems'] },
  { name: 'College of Engineering and Technology',             code: 'CET',  departments: ['Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Chemical Engineering'] },
  { name: 'College of Business and Economics',                 code: 'CBE',  departments: ['Management', 'Accounting and Finance', 'Economics', 'Marketing Management'] },
  { name: 'College of Natural and Computational Sciences',     code: 'CNCS', departments: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Statistics'] },
  { name: 'College of Social Sciences and Humanities',         code: 'CSSH', departments: ['History and Heritage Management', 'Geography and Environmental Studies', 'Sociology', 'Psychology'] },
  { name: 'College of Law',                                    code: 'COL',  departments: ['Law'] },
  { name: 'College of Medicine and Health Sciences',           code: 'CMHS', departments: ['Medicine', 'Nursing', 'Public Health', 'Medical Laboratory Sciences'] },
  { name: 'College of Veterinary Medicine',                    code: 'CVM',  departments: ['Veterinary Medicine', 'Veterinary Pharmacy'] },
  { name: 'College of Education and Behavioral Sciences',      code: 'CEBS', departments: ['Curriculum and Instruction', 'Educational Planning and Management', 'Special Needs Education'] },
]

export const ADMIN_OFFICES = [
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

// ── Helpers ───────────────────────────────────────────────────────────────────
export function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/college of /g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 20)
}

export async function seedStructure(
  collegeRepo: Repository<College>,
  departmentRepo: Repository<Department>,
): Promise<{ colleges: Record<string, College>; departments: Record<string, Department> }> {
  const colleges: Record<string, College> = {}
  const departments: Record<string, Department> = {}

  for (const cd of COLLEGES_DATA) {
    let college = await collegeRepo.findOne({ where: { name: cd.name } })
    if (!college) {
      college = await collegeRepo.save(collegeRepo.create({ name: cd.name, code: cd.code }))
    }
    colleges[cd.name] = college

    for (const deptName of cd.departments) {
      let dept = await departmentRepo.findOne({ where: { name: deptName } })
      if (!dept) {
        const idx = cd.departments.indexOf(deptName) + 1
        const code = `${cd.code}${idx.toString().padStart(2, '0')}`
        dept = await departmentRepo.save(departmentRepo.create({ name: deptName, code, college }))
      }
      departments[deptName] = dept
    }
  }

  for (const officeName of ADMIN_OFFICES) {
    let dept = await departmentRepo.findOne({ where: { name: officeName } })
    if (!dept) {
      const idx = ADMIN_OFFICES.indexOf(officeName) + 1
      const code = `ADM${idx.toString().padStart(2, '0')}`
      dept = await departmentRepo.save(departmentRepo.create({ name: officeName, code }))
    }
    departments[officeName] = dept
  }

  return { colleges, departments }
}

// ── Main seed (system-level only) ─────────────────────────────────────────────
async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false })

  const collegeRepo: Repository<College>     = app.get(getRepositoryToken(College))
  const departmentRepo: Repository<Department> = app.get(getRepositoryToken(Department))
  const userRepo: Repository<User>           = app.get(getRepositoryToken(User))
  const driverRepo: Repository<Driver>       = app.get(getRepositoryToken(Driver))
  const workflowService                      = app.get(WorkflowService)

  // 1. Workflows
  await workflowService.seedDefaultWorkflows()

  // 2. Colleges & Departments (structure only — no users)
  await seedStructure(collegeRepo, departmentRepo)

  // 3. System-level accounts
  await upsertUser(userRepo, { name: 'System Administrator', email: 'admin@haramaya.edu.et',      role: UserRole.SystemAdmin })
  await upsertUser(userRepo, { name: 'University President', email: 'president@haramaya.edu.et',  role: UserRole.President })
  await upsertUser(userRepo, { name: 'Transport Officer',    email: 'transport@haramaya.edu.et',  role: UserRole.TransportOffice })
  await upsertUser(userRepo, { name: 'Deployment Officer',   email: 'deployment@haramaya.edu.et', role: UserRole.DeploymentTeam })
  await upsertUser(userRepo, { name: 'Gate Security',        email: 'gate@haramaya.edu.et',       role: UserRole.Gate })

  // 4. One test driver (with driver profile)
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

  // 5. Summary
  console.log('\n╔══════════════════════════════════════════════╗')
  console.log('║         SYSTEM SEED COMPLETE                 ║')
  console.log('╚══════════════════════════════════════════════╝')
  console.log(`\nPassword for all seeded accounts: ${PASSWORD}\n`)
  console.log('SYSTEM ACCOUNTS')
  console.log('  SystemAdmin     admin@haramaya.edu.et')
  console.log('  President       president@haramaya.edu.et')
  console.log('  TransportOffice transport@haramaya.edu.et')
  console.log('  DeploymentTeam  deployment@haramaya.edu.et')
  console.log('  Gate            gate@haramaya.edu.et')
  console.log('  Driver (test)   driver@haramaya.edu.et')
  console.log('\nSTRUCTURE')
  console.log(`  ${COLLEGES_DATA.length} colleges seeded`)
  const totalDepts = COLLEGES_DATA.reduce((s, c) => s + c.departments.length, 0)
  console.log(`  ${totalDepts} departments seeded`)
  console.log(`  ${ADMIN_OFFICES.length} administrative offices seeded`)
  console.log('\nNOTE: Deans, Department Heads, and Employees are')
  console.log('      created by invitation via the System Admin panel.')
  console.log('      Run  npm run seed:all  for a full demo dataset.\n')

  await app.close()
}

seed().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
