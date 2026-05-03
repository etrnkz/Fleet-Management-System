/**
 * Full demo seed — run with: npm run seed:all
 *
 * Creates everything needed for a complete demo/development environment:
 *   - 5 system accounts (same as npm run seed)
 *   - All colleges and departments
 *   - One test Driver with driver profile
 *   - One Dean per college
 *   - One Department Head per department
 *   - One Employee per department
 *
 * Safe to run multiple times — existing records are skipped.
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

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/college of /g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 20)
}

const COLLEGES_DATA = [
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

const ADMIN_OFFICES = [
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

async function seedAll() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false })

  const collegeRepo: Repository<College>       = app.get(getRepositoryToken(College))
  const departmentRepo: Repository<Department> = app.get(getRepositoryToken(Department))
  const userRepo: Repository<User>             = app.get(getRepositoryToken(User))
  const driverRepo: Repository<Driver>         = app.get(getRepositoryToken(Driver))
  const workflowService                        = app.get(WorkflowService)

  // ── 1. Workflows ────────────────────────────────────────────────────────────
  await workflowService.seedDefaultWorkflows()

  // ── 2. Colleges & Departments ───────────────────────────────────────────────
  const colleges: Record<string, College> = {}
  const departments: Record<string, Department> = {}

  for (const cd of COLLEGES_DATA) {
    let college = await collegeRepo.findOne({ where: { name: cd.name } })
    if (!college) {
      const byCode = await collegeRepo.findOne({ where: { code: cd.code } })
      if (byCode) { colleges[cd.name] = byCode; continue }
      college = await collegeRepo.save(collegeRepo.create({ name: cd.name, code: cd.code }))
    }
    colleges[cd.name] = college

    for (const deptName of cd.departments) {
      let dept = await departmentRepo.findOne({ where: { name: deptName } })
      if (!dept) {
        const idx = cd.departments.indexOf(deptName) + 1
        const code = `${cd.code}${idx.toString().padStart(2, '0')}`
        // Also check by code — avoid duplicate key if code already used
        const byCode = await departmentRepo.findOne({ where: { code } })
        if (byCode) {
          departments[deptName] = byCode
          continue
        }
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
      const byCode = await departmentRepo.findOne({ where: { code } })
      if (!byCode) {
        dept = await departmentRepo.save(departmentRepo.create({ name: officeName, code }))
      }
    }
    if (dept) departments[officeName] = dept
  }

  // ── 3. System accounts ──────────────────────────────────────────────────────
  await upsertUser(userRepo, { name: 'System Administrator', email: 'admin@haramaya.edu.et',      role: UserRole.SystemAdmin })
  await upsertUser(userRepo, { name: 'University President', email: 'president@haramaya.edu.et',  role: UserRole.President })
  await upsertUser(userRepo, { name: 'Transport Officer',    email: 'transport@haramaya.edu.et',  role: UserRole.TransportOffice })
  await upsertUser(userRepo, { name: 'Deployment Officer',   email: 'deployment@haramaya.edu.et', role: UserRole.DeploymentTeam })
  await upsertUser(userRepo, { name: 'Gate Security',        email: 'gate@haramaya.edu.et',       role: UserRole.Gate })

  // ── 4. Test Driver ──────────────────────────────────────────────────────────
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

  // ── 5. Postman test employee ────────────────────────────────────────────────
  const cciCollege = colleges['College of Computing and Informatics']
  const itDept     = departments['Information Technology']
  await upsertUser(userRepo, {
    name: 'Postman Tester',
    email: 'postman@haramaya.edu.et',
    role: UserRole.User,
    department: itDept,
    college: cciCollege,
  })

  // ── 6. One Dean + DeptHead + Employee per college/department ────────────────
  let deanCount = 0, headCount = 0, empCount = 0

  for (const cd of COLLEGES_DATA) {
    const college     = colleges[cd.name]
    const collegeSlug = slug(cd.name)

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

      await upsertUser(userRepo, {
        name:  `Head of ${deptName}`,
        email: `head.${deptSlug}@haramaya.edu.et`,
        role:  UserRole.DepartmentHead,
        department: dept,
        college,
      })
      headCount++

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

  // ── 7. Summary ──────────────────────────────────────────────────────────────
  const totalDepts = COLLEGES_DATA.reduce((s, c) => s + c.departments.length, 0)

  console.log('\n╔══════════════════════════════════════════════╗')
  console.log('║         FULL DEMO SEED COMPLETE              ║')
  console.log('╚══════════════════════════════════════════════╝')
  console.log(`\nPassword for ALL accounts: ${PASSWORD}\n`)

  console.log('SYSTEM ACCOUNTS')
  console.log('  admin@haramaya.edu.et       SystemAdmin')
  console.log('  president@haramaya.edu.et   President')
  console.log('  transport@haramaya.edu.et   TransportOffice')
  console.log('  deployment@haramaya.edu.et  DeploymentTeam')
  console.log('  gate@haramaya.edu.et        Gate')
  console.log('  driver@haramaya.edu.et      Driver (test)')
  console.log('  postman@haramaya.edu.et     Employee (test)')

  console.log('\nSTRUCTURE')
  console.log(`  ${COLLEGES_DATA.length} colleges  |  ${totalDepts} departments  |  ${ADMIN_OFFICES.length} admin offices`)

  console.log('\nDEMO USERS')
  console.log(`  ${deanCount} Deans  |  ${headCount} Dept Heads  |  ${empCount} Employees`)

  console.log('\nEMAIL PATTERNS')
  console.log('  dean.computing-and-inform@haramaya.edu.et')
  console.log('  head.information-technolo@haramaya.edu.et')
  console.log('  emp.information-technolo@haramaya.edu.et\n')

  await app.close()
}

seedAll().catch((err) => {
  console.error('Full seed failed:', err)
  process.exit(1)
})
