# App Independence Guide

## Overview

Each app in this project is **completely independent** with:
- Its own `node_modules` folder
- Its own `package.json` with dependencies
- Its own copy of the `shared` folder
- No reliance on npm workspaces or hoisting

## Structure

```
frontend/
├── apps/
│   ├── employee/
│   │   ├── node_modules/      # Independent dependencies
│   │   ├── shared/             # Local copy of shared code
│   │   ├── src/
│   │   └── package.json        # Independent dependencies
│   ├── admin/
│   │   ├── node_modules/
│   │   ├── shared/
│   │   ├── src/
│   │   └── package.json
│   └── ... (other apps)
└── shared/                     # Template (not used at runtime)
```

## Benefits of Independence

1. **Isolated Dependencies**: Each app can use different versions of packages
2. **Separate Deployment**: Deploy each app independently
3. **No Hoisting Issues**: No dependency conflicts between apps
4. **Portable**: Move any app to a different repo without issues
5. **Independent Development**: Work on one app without affecting others
6. **Flexible Versioning**: Update dependencies per app as needed

## How It Works

### Installation
Each app installs its own dependencies:
```bash
cd frontend/apps/employee
npm install
```

This creates a local `node_modules` folder with all dependencies.

### Shared Code
Each app has its own copy of the `shared` folder containing:
- Components (Button, Card)
- Types (User, Vehicle, TripRequest)
- Utils (apiClient, cn)
- Constants (ROLES, TRIP_STATUS)

### Imports
Apps import from their local shared folder using `@shared/*`:
```typescript
import { Button } from '@shared/components/Button';
```

This resolves to `./shared/components/Button.tsx` in each app.

## Working with Shared Code

### Option 1: Update Template and Copy
1. Update `frontend/shared/` (the template)
2. Copy to each app:
   ```bash
   cp -r frontend/shared/* frontend/apps/employee/shared/
   cp -r frontend/shared/* frontend/apps/admin/shared/
   # ... repeat for other apps
   ```

### Option 2: Update Directly
Update the shared folder in each app independently:
```bash
# Edit frontend/apps/employee/shared/components/Button.tsx
# Edit frontend/apps/admin/shared/components/Button.tsx
```

### Option 3: Selective Updates
Update only specific apps that need the changes:
```bash
# Only update employee and admin apps
cp -r frontend/shared/* frontend/apps/employee/shared/
cp -r frontend/shared/* frontend/apps/admin/shared/
```

## Running Apps

Each app runs independently:

```bash
# Option 1: Navigate to app
cd frontend/apps/employee
npm run dev

# Option 2: From frontend directory
cd frontend
npm run dev:employee
```

## Deploying Apps

Each app can be deployed separately:

```bash
cd frontend/apps/employee
npm run build
npm start
```

Or containerize each app independently:

```dockerfile
# Dockerfile for employee app
FROM node:20-alpine
WORKDIR /app
COPY frontend/apps/employee/package*.json ./
RUN npm install
COPY frontend/apps/employee/ ./
RUN npm run build
CMD ["npm", "start"]
```

## Adding Dependencies

Add dependencies to individual apps:

```bash
cd frontend/apps/employee
npm install axios
```

This only affects the employee app, not others.

## Advantages Over Monorepo

| Feature | Independent Apps | Monorepo |
|---------|-----------------|----------|
| Dependency isolation | ✅ Yes | ❌ Shared |
| Independent deployment | ✅ Easy | ⚠️ Complex |
| Version flexibility | ✅ Per app | ❌ Shared |
| Setup complexity | ✅ Simple | ⚠️ Complex |
| Disk space | ⚠️ More | ✅ Less |
| Shared code updates | ⚠️ Manual | ✅ Automatic |

## Best Practices

1. **Keep shared code in sync**: Regularly update all apps with shared changes
2. **Document changes**: Note when shared code is updated
3. **Test independently**: Each app should be tested separately
4. **Version control**: Commit each app's changes independently
5. **Deploy separately**: Each app has its own deployment pipeline

## Migration from Monorepo

If you previously had a monorepo setup:

1. ✅ Each app now has its own `node_modules`
2. ✅ Each app has its own copy of `shared` folder
3. ✅ No npm workspaces in root `package.json`
4. ✅ Apps can be moved/deployed independently
5. ✅ No dependency hoisting or conflicts

## Troubleshooting

### Issue: Shared code out of sync
**Solution**: Copy the template to all apps:
```bash
for app in employee admin maintenance college-dean president deployment-office driver; do
  cp -r frontend/shared/* frontend/apps/$app/shared/
done
```

### Issue: Different dependency versions
**Solution**: This is intentional! Each app can have different versions.

### Issue: Large disk space usage
**Solution**: This is expected with independent apps. Each has its own `node_modules`.
