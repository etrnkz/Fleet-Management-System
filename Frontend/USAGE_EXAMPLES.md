# Using Shared Resources - Examples

This guide shows how to use shared resources from the `@shared` folder in your apps.

## Importing Shared Types

```typescript
// In any app file (e.g., apps/employee/src/app/dashboard/page.tsx)
import { User, Vehicle, TripRequest } from '@shared/types';

const user: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'employee',
  department: 'Engineering'
};
```

## Using Shared Components

```typescript
// In any app component
import { Button, Card } from '@shared/components/Button';

export default function MyPage() {
  return (
    <Card className="max-w-md">
      <h1>Welcome</h1>
      <Button variant="primary" size="lg" onClick={() => alert('Clicked!')}>
        Click Me
      </Button>
    </Card>
  );
}
```

## Using Shared API Client

```typescript
// In any app file
import { apiClient } from '@shared/utils/api';

async function fetchTrips() {
  try {
    const trips = await apiClient.get('/trips');
    return trips;
  } catch (error) {
    console.error('Failed to fetch trips:', error);
  }
}

async function createTrip(data: any) {
  try {
    const newTrip = await apiClient.post('/trips', data);
    return newTrip;
  } catch (error) {
    console.error('Failed to create trip:', error);
  }
}
```

## Using Shared Constants

```typescript
// In any app file
import { ROLES, TRIP_STATUS, VEHICLE_STATUS } from '@shared/constants';

function checkUserRole(role: string) {
  if (role === ROLES.ADMIN) {
    // Admin logic
  } else if (role === ROLES.EMPLOYEE) {
    // Employee logic
  }
}

function getTripStatusColor(status: string) {
  switch (status) {
    case TRIP_STATUS.PENDING:
      return 'yellow';
    case TRIP_STATUS.APPROVED:
      return 'green';
    case TRIP_STATUS.REJECTED:
      return 'red';
    default:
      return 'gray';
  }
}
```

## Using Utility Functions

```typescript
// In any app component
import { cn } from '@shared/utils/cn';

export function MyComponent({ className }: { className?: string }) {
  return (
    <div className={cn('base-class', 'another-class', className)}>
      Content
    </div>
  );
}
```

## Adding New Shared Resources

### Adding a New Shared Component

1. Create the component in `frontend/shared/components/`:

```typescript
// frontend/shared/components/Input.tsx
'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div>
      {label && <label className="block mb-2">{label}</label>}
      <input 
        className={`border rounded px-3 py-2 ${className}`}
        {...props}
      />
    </div>
  );
};
```

2. Export it from `frontend/shared/index.ts`:

```typescript
export * from './components/Input';
```

3. Use it in any app:

```typescript
import { Input } from '@shared/components/Input';
```

### Adding New Shared Types

1. Add to `frontend/shared/types/index.ts`:

```typescript
export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phoneNumber: string;
  status: 'available' | 'on-trip' | 'off-duty';
}
```

2. Use in any app:

```typescript
import { Driver } from '@shared/types';
```

## Environment Variables

Each app can have its own `.env.local` file, but shared API configuration should use:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

This is referenced in `@shared/utils/api.ts`.
