# Quick Reference Guide

## Installation

**Install all apps:**
```bash
# From project root
install-all.bat  # Windows
./install-all.sh # Linux/Mac
```

**Install single app:**
```bash
cd frontend/apps/employee
npm install
```

## Run Apps

**From app directory:**
```bash
cd frontend/apps/employee
npm run dev
```

**From frontend directory:**
```bash
cd frontend
npm run dev:employee           # Port 3000
npm run dev:admin              # Port 3001
npm run dev:maintenance        # Port 3002
npm run dev:college-dean       # Port 3003
npm run dev:president          # Port 3004
npm run dev:deployment-office  # Port 3005
npm run dev:driver             # Port 3006
```

## Import Shared Resources

Each app has its own copy of shared code:

```typescript
// Types
import { User, Vehicle, TripRequest } from '@shared/types';

// Components
import { Button, Card } from '@shared/components/Button';

// Utils
import { apiClient } from '@shared/utils/api';
import { cn } from '@shared/utils/cn';

// Constants
import { ROLES, TRIP_STATUS } from '@shared/constants';
```

## Folder Structure

```
frontend/
├── apps/              # Independent apps
│   └── employee/
│       ├── src/
│       │   ├── app/       # Pages
│       │   └── components/ # App-specific components
│       ├── shared/        # Shared code (local copy)
│       ├── package.json
│       └── node_modules/  # Independent dependencies
└── shared/            # Template for shared code
```

## Common Commands

```bash
# Install app dependencies
cd frontend/apps/employee
npm install

# Run app
npm run dev

# Build app
npm run build

# Start production server
npm start

# Add dependency to app
npm install <package>
```

## App URLs

- Employee: http://localhost:3000
- Admin: http://localhost:3001
- Maintenance: http://localhost:3002
- College Dean: http://localhost:3003
- President: http://localhost:3004
- Deployment Office: http://localhost:3005
- Driver: http://localhost:3006

## Independence

Each app is completely independent:
- Has its own node_modules
- Can be deployed separately
- Can have different dependency versions
- Can be moved to different repositories
