/**
 * Database seeder — run with: npm run seed
 * Seeds: all colleges + departments, full role chain, 1 employee per department.
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
  if (existing) return existing
  return repo.save(repo.create({
    name: data.name,
    email: data.email,
    password: await hash(PASSWORD),
    role: data.role,
    department: data.department ?? null,
    college: data.college ?? null,
    isActive: true,
  }))
}

// Slug: "College of Law" → "col-law", "Computer Science" → "cs"
function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/college of /g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 20)
}

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false })

  const collegeRepo: Repository<College> = app.get(getRepositoryToken(College))
  const departmentRepo: Repository<Department> = app.get(getRepositoryToken(Department))
  const userRepo: Repository<User> = app.get(getRepositoryToken(User))
  const workflowService = app.get(WorkflowService)

  // ── 1. Workflows ───────────────────────────────────────────────────────────
  await workflowService.seedDefaultWorkflows()

  // ── 2. Colleges & Departments ──────────────────────────────────────────────
  const collegesData = [
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

  const colleges: Record<string, College> = {}
  const departments: Record<string, Department> = {}

  for (const cd of collegesData) {
    let college = await collegeRepo.findOne({ where: { name: cd.name } })
    if (!college) college = await collegeRepo.save(collegeRepo.create({ name: cd.name, code: cd.code }))
    colleges[cd.name] = college

    for (const deptName of cd.departments) {
      let dept = await departmentRepo.findOne({ where: { name: deptName } })
      if (!dept) {
        // Use college code + index to guarantee uniqueness
        const idx = cd.departments.indexOf(deptName) + 1
        const code = `${cd.code}${idx.toString().padStart(2, '0')}`
        dept = await departmentRepo.save(departmentRepo.create({ name: deptName, code, college }))
      }
      departments[deptName] = dept
    }
  }

  // Administrative offices
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
    let dept = await departmentRepo.findOne({ where: { name: officeName } })
    if (!dept) {
      const idx = adminOffices.indexOf(officeName) + 1
      const code = `ADM${idx.toString().padStart(2, '0')}`
      dept = await departmentRepo.save(departmentRepo.create({ name: officeName, code, college: undefined }))
    }
    departments[officeName] = dept
  }

  // ── 3. System roles ────────────────────────────────────────────────────────
  await createUser(userRepo, { name: 'System Administrator',  email: 'admin@haramaya.edu.et',      role: UserRole.SystemAdmin })
  await createUser(userRepo, { name: 'University President',  email: 'president@haramaya.edu.et',  role: UserRole.President })
  await createUser(userRepo, { name: 'Transport Officer',     email: 'transport@haramaya.edu.et',  role: UserRole.TransportOffice })
  await createUser(userRepo, { name: 'Deployment Officer',    email: 'deployment@haramaya.edu.et', role: UserRole.DeploymentTeam })
  await createUser(userRepo, { name: 'Test Driver',           email: 'driver@haramaya.edu.et',     role: UserRole.Driver })
  await createUser(userRepo, { name: 'Gate Security',         email: 'gate@haramaya.edu.et',       role: UserRole.Gate })

  // ── 4. One Dean + one DeptHead + one Employee per college/department ───────
  const createdUsers: { role: string; email: string; college?: string; department?: string }[] = []

  for (const cd of collegesData) {
    const college = colleges[cd.name]
    const collegeSlug = slug(cd.name)

    // Dean
    const deanEmail = `dean.${collegeSlug}@haramaya.edu.et`
    await createUser(userRepo, { name: `Dean of ${cd.name}`, email: deanEmail, role: UserRole.Dean, college })
    createdUsers.push({ role: 'Dean', email: deanEmail, college: cd.name })

    for (const deptName of cd.departments) {
      const dept = departments[deptName]
      const deptSlug = slug(deptName)

      // Department Head
      const headEmail = `head.${deptSlug}@haramaya.edu.et`
      await createUser(userRepo, { name: `Head of ${deptName}`, email: headEmail, role: UserRole.DepartmentHead, department: dept, college })
      createdUsers.push({ role: 'DeptHead', email: headEmail, department: deptName })

      // Employee
      const empEmail = `emp.${deptSlug}@haramaya.edu.et`
      await createUser(userRepo, { name: `Employee - ${deptName}`, email: empEmail, role: UserRole.User, department: dept, college })
      createdUsers.push({ role: 'Employee', email: empEmail, department: deptName })
    }
  }

  // ── 5. Summary ─────────────────────────────────────────────────────────────
  console.log('\n========================================')
  console.log('SEED COMPLETE')
  console.log(`Password for ALL users: ${PASSWORD}`)
  console.log('========================================')
  console.log('\nSYSTEM ACCOUNTS')
  console.log('  SystemAdmin     admin@haramaya.edu.et')
  console.log('  President       president@haramaya.edu.et')
  console.log('  TransportOffice transport@haramaya.edu.et')
  console.log('  DeploymentTeam  deployment@haramaya.edu.et')
  console.log('  Driver          driver@haramaya.edu.et')
  console.log('  Gate            gate@haramaya.edu.et')

  console.log('\nCOLLEGE ACCOUNTS (Dean + DeptHead + Employee per dept)')
  for (const cd of collegesData) {
    const collegeSlug = slug(cd.name)
    console.log(`\n  ${cd.name}`)
    console.log(`    Dean:  dean.${collegeSlug}@haramaya.edu.et`)
    for (const deptName of cd.departments) {
      const deptSlug = slug(deptName)
      console.log(`    ${deptName}`)
      console.log(`      Head: head.${deptSlug}@haramaya.edu.et`)
      console.log(`      Emp:  emp.${deptSlug}@haramaya.edu.et`)
    }
  }
  console.log('\n========================================\n')

  await app.close()
}

seed().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
