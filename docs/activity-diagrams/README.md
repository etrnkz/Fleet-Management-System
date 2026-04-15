# Fleet Management System - Activity Diagrams

This directory contains comprehensive activity diagrams for all actors/roles in the Fleet Management System. Activity diagrams show the workflow, decision points, and process flow from each user's perspective.

## Overview

Activity diagrams focus on:
- User workflows and decision-making processes
- Business logic and validation rules
- Alternative paths and error handling
- System state transitions
- User interactions and confirmations

## Available Diagrams

### 1. [Employee App](./01-employee-app.md)
**Actor:** Employee (University Staff/Faculty)

**Key Flows:**
- Login with authentication
- Create and submit trip requests
- View trip status
- Cancel trip requests
- Provide trip feedback
- Update profile (info, picture, password)
- View notifications
- Logout

**Responsibilities:** Request trips, track status, provide feedback

---

### 2. [Department Head App](./02-department-head-app.md)
**Actor:** Department Head (Faculty Department Leader)

**Key Flows:**
- Login with role verification
- Review and approve/reject trip requests
- View department trip history
- View department statistics
- Manage notifications
- Logout

**Responsibilities:** First-level approval for department trips

---

### 3. [College Dean App](./03-college-dean-app.md)
**Actor:** College Dean (College Administrator)

**Key Flows:**
- Login with role verification
- Review trips with department approval
- Approve/reject trips with comments
- View college trip history
- View college statistics by department
- Manage notifications
- Logout

**Responsibilities:** Second-level approval for college trips

---

### 4. [President App](./04-president-app.md)
**Actor:** President (University President)

**Key Flows:**
- Login with highest-level role
- Final approval with full approval chain review
- View university-wide statistics
- View fleet overview
- View all university trips
- Manage notifications
- Logout

**Responsibilities:** Final approval authority for all trips

---

### 5. [Transport Admin App](./05-transport-admin-app.md)
**Actor:** Transport Admin (Fleet Manager)

**Key Flows:**
- Login with role verification
- Allocate vehicles and drivers to approved trips
- Manage vehicles (CRUD)
- Manage drivers (CRUD)
- Manage fuel records
- Manage maintenance schedules
- View reports and analytics
- QR code scanning
- Logout

**Responsibilities:** Resource allocation and fleet management

---

### 6. [Deployment Office App](./06-deployment-office-app.md)
**Actor:** Deployment Office (Operations Manager)

**Key Flows:**
- Login with role verification
- View comprehensive dashboard
- Monitor all trips
- Monitor fleet operations
- Manage maintenance (overview, requests, schedule, costs, reports)
- Generate comprehensive reports
- Manage notifications
- Logout

**Responsibilities:** Operational oversight and reporting

---

### 7. [Driver App](./07-driver-app.md)
**Actor:** Driver (Vehicle Operator)

**Key Flows:**
- Login with role verification
- View assigned trips
- Start trip with vehicle check
- Complete trip with odometer
- Report issues during trip
- View trip history
- Update profile
- Manage notifications
- Logout

**Responsibilities:** Execute trips and maintain vehicles

---

### 8. [System Admin App](./08-system-admin-app.md)
**Actor:** System Admin (System Administrator)

**Key Flows:**
- Login with system access
- User management (CRUD, roles, passwords)
- View audit logs
- Configure system settings
- Broadcast messages
- View system dashboard
- Manage backups
- Logout

**Responsibilities:** System administration and user management

---

## Trip Approval Workflow

The complete trip approval workflow across all actors:

```
1. Employee creates trip → Status: DRAFT
2. Employee submits trip → Status: PENDING_DEPARTMENT
3. Department Head approves → Status: PENDING_COLLEGE
4. College Dean approves → Status: PENDING_PRESIDENT
5. President approves → Status: APPROVED_FOR_ALLOCATION
6. Transport Admin allocates vehicle & driver → Status: CAR_ALLOCATED
7. Driver starts trip → Status: IN_PROGRESS
8. Driver completes trip → Status: COMPLETED
9. Employee provides feedback → Trip closed
```

## Key Decision Points Across System

### Authentication & Authorization
- Role-based access control
- JWT token validation
- Permission checks before actions

### Trip Management
- Status validation before actions
- Multi-level approval chain
- Cancellation rules based on status

### Resource Allocation
- Vehicle availability checks
- Driver availability checks
- Capacity validation

### Maintenance Management
- Request approval workflow
- Vehicle status updates
- Cost tracking

### System Administration
- User role management
- Security configuration
- Backup and restore procedures

## Diagram Conventions

### Shapes Used
- **Rounded rectangles** ([text]): Start/End points
- **Rectangles** [text]: Process/Action steps
- **Diamonds** {text?}: Decision points
- **Parallelograms**: Input/Output operations

### Flow Directions
- **Solid arrows** →: Normal flow
- **Dashed arrows** ⇢: Alternative paths
- **Labels on arrows**: Conditions (Yes/No, specific values)

### Color Coding (if rendered)
- **Green paths**: Success flows
- **Red paths**: Error/rejection flows
- **Yellow paths**: Alternative/optional flows

## Usage

These activity diagrams are useful for:
1. **Understanding user workflows** - See how each actor interacts with the system
2. **Identifying decision points** - Understand where business logic is applied
3. **Training new team members** - Visual guide to system processes
4. **Testing scenarios** - Identify test cases from different paths
5. **System documentation** - Comprehensive process documentation
6. **Requirements validation** - Verify all requirements are covered

## Related Documentation

- [Sequence Diagrams](../sequence-diagrams/) - Component interaction diagrams
- [API Documentation](../api/) - Backend API endpoints
- [User Guides](../user-guides/) - End-user documentation
- [System Architecture](../architecture/) - System design documentation

## Maintenance

These diagrams should be updated when:
- New features are added
- Workflows are modified
- Business rules change
- New decision points are introduced
- User roles or permissions change

---

**Last Updated:** April 11, 2026
**Diagram Format:** Mermaid (GitHub-compatible)
**Total Actors:** 8
**Total Activity Flows:** 60+
