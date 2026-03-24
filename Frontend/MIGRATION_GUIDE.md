# Migration Guide - Monorepo Structure

This document explains the new monorepo structure and how it differs from the previous setup.

## What Changed?

### Before (Multiple Independent Apps)
```
Fleet-Management-System/
├── employee-app/
├── admin-app/
├── maintenance-app/
├── college-dean-app/
├── president-app/
├── deployment-office-app/
└── driver-app/
```

### After (Monorepo with Shared Code)
```
Fleet-Management-System/
└── frontend/
    ├── apps/
    │   ├── employee/
    │   ├── admin/
    │   ├── maintenance/
    │   ├── college-dean/
    │   ├── president/
    │   ├── deployment-office/
    │   └── driver/
    └── shared/
        ├── components/
        ├── types/
        ├── utils/
        └── constants/
```

## Benefits

1. **Shared Code**: Common components, types, and utilities are now in one place
2. **Single Installation**: Run `npm install` once in the frontend folder
3. **Consistent Dependencies**: All apps use the same versions of shared dependencies
4. **Easy Maintenance**: Update shared code once, all apps benefit
5. **Type Safety**: Shared types ensure consistency across all apps
6. **Better Organization**: Clear separation between app-specific and shared code

## Key Features

### 1. NPM Workspaces
The root `package.json` uses npm workspaces to manage all apps together:

```json
{
  "workspaces": ["apps/*"]
}
```

### 2. TypeScript Path Aliases
Each app's `tsconfig.json` includes:

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@shared/*": ["../shared/*"]
  }
}
```

This allows importing shared code:
```typescript
import { Button } from '@shared/components/Button';
```

### 3. Shared Resources

#### Components
- `Button`: Reusable button with variants (primary, secondary, danger)
- `Card`: Container component with consistent styling

#### Types
- `User`: User interface with role-based typing
- `Vehicle`: Vehicle data structure
- `TripRequest`: Trip request interface
- `MaintenanceRecord`: Maintenance tracking interface

#### Utils
- `apiClient`: HTTP client for API calls
- `cn`: Utility for merging Tailwind classes

#### Constants
- `APP_PORTS`: Port numbers for each app
- `ROLES`: User role constants
- `TRIP_STATUS`: Trip status constants
- `VEHICLE_STATUS`: Vehicle status constants

## Running Apps

### Old Way
```bash
cd employee-app
npm install
npm run dev
```

### New Way
```bash
cd frontend
npm install
npm run dev:employee
```

Or still navigate to specific app:
```bash
cd frontend/apps/employee
npm run dev
```

## Adding New Shared Code

1. Add to appropriate folder in `frontend/shared/`
2. Export from `frontend/shared/index.ts`
3. Use in any app with `@shared/*` imports

## Migration Checklist

- [x] All apps moved to `frontend/apps/`
- [x] Shared code extracted to `frontend/shared/`
- [x] TypeScript configs updated with path aliases
- [x] Package names updated to `@fleet-management/*`
- [x] Root package.json created with workspaces
- [x] Installation scripts updated
- [x] Documentation created

## Next Steps

1. Run `npm install` in the frontend folder
2. Test each app to ensure it works
3. Start migrating duplicate code to shared folder
4. Update imports to use `@shared/*` aliases
