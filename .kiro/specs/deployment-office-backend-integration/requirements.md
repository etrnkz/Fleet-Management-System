# Requirements Document

## Introduction

The Deployment Office frontend app (Next.js 14, port 3005) needs full backend integration with the NestJS API at `http://localhost:3000/api/v1`. Currently, several pages use hardcoded mock data and some API calls target non-existent endpoints (e.g., `/statistics/deployment`). The deployment team's core responsibilities are viewing approved trips and allocating vehicles and drivers to those trips. This feature replaces all mock data with real API responses across the dashboard, trips, vehicles, drivers, and maintenance pages, and ensures the allocation workflow calls the correct backend endpoint.

## Glossary

- **App**: The Deployment Office Next.js 14 frontend application running on port 3005
- **API**: The NestJS backend REST API running at `http://localhost:3000/api/v1`
- **Trip**: A travel request that has been approved and is awaiting vehicle/driver allocation
- **Allocation**: The act of assigning an available vehicle and an available driver to an approved trip via `POST /trips/:id/allocate`
- **Dashboard**: The `/dashboard` page showing fleet overview stats, active trips, and pending maintenance
- **Trips_Page**: The `/trips` page listing all trips with filtering and allocation actions
- **Vehicles_Page**: The `/vehicles` page listing all vehicles with real-time status counts
- **Drivers_Page**: The `/drivers` page listing all drivers with real-time status counts
- **Maintenance_Page**: The `/maintenance` page listing maintenance records
- **Notifications_Panel**: The notification bell in the layout header showing unread notifications
- **Auth_Token**: The JWT bearer token stored in `localStorage` under the key `access_token`

## Requirements

### Requirement 1: Fix Dashboard Stats

**User Story:** As a deployment officer, I want the dashboard to show real fleet statistics, so that I can see an accurate overview of the fleet without errors.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE App SHALL fetch vehicle counts by calling `GET /vehicles` and derive total, available, in-use, and maintenance counts from the response array instead of calling the non-existent `/statistics/deployment` endpoint.
2. WHEN the Dashboard loads, THE App SHALL fetch pending maintenance items by calling `GET /maintenance` and display records with status `PENDING` or `pending`.
3. WHEN the Dashboard loads, THE App SHALL fetch trips needing allocation by calling `GET /trips?state=APPROVED` and display trips that have no assigned vehicle or driver.
4. IF any API call during dashboard load returns a non-2xx response, THEN THE App SHALL display an inline error message within the affected card rather than crashing the page.
5. WHILE the Dashboard is loading data, THE App SHALL display skeleton placeholder cards for each stats section.

### Requirement 2: Fix Trips Page Real Data

**User Story:** As a deployment officer, I want the trips page to show real trip data from the backend, so that I can see and act on actual approved trips.

#### Acceptance Criteria

1. WHEN the Trips_Page loads, THE App SHALL fetch all trips by calling `GET /trips` and render the returned array, replacing all hardcoded mock trip objects.
2. WHEN the Trips_Page loads, THE App SHALL fetch available vehicles by calling `GET /vehicles?status=Active` and available drivers by calling `GET /drivers?status=Available` for use in the assignment modal.
3. WHEN a deployment officer clicks "Assign Vehicle" on a trip, THE App SHALL call `POST /trips/:id/allocate` with body `{ vehicleId, driverId }` to persist the allocation.
4. WHEN the allocate call succeeds, THE App SHALL update the trip's displayed status to reflect the assignment without requiring a full page reload.
5. IF the allocate call returns an error, THEN THE App SHALL display a toast notification with the error message and keep the assignment modal open.
6. WHILE the Trips_Page is loading, THE App SHALL display a loading skeleton in place of the trips list.

### Requirement 3: Fix Vehicles Page Real Data

**User Story:** As a deployment officer, I want the vehicles page to show real vehicle data, so that I can see the actual fleet status.

#### Acceptance Criteria

1. WHEN the Vehicles_Page loads, THE App SHALL fetch all vehicles by calling `GET /vehicles` and render the returned array, replacing all hardcoded mock vehicle objects.
2. WHEN the Vehicles_Page loads, THE App SHALL compute stats (total, available, in-use, maintenance) from the fetched vehicles array.
3. WHEN the Vehicles_Page renders a vehicle card, THE App SHALL map the backend `status` field values (`Active`, `In Use`, `Maintenance`) to the appropriate display labels and badge colors.
4. IF the `GET /vehicles` call fails, THEN THE App SHALL display an error state with a retry button.
5. WHILE the Vehicles_Page is loading, THE App SHALL display loading skeleton cards.

### Requirement 4: Fix Drivers Page Real Data

**User Story:** As a deployment officer, I want the drivers page to show real driver data, so that I can see who is available for assignment.

#### Acceptance Criteria

1. WHEN the Drivers_Page loads, THE App SHALL fetch all drivers by calling `GET /drivers` and render the returned array, replacing all hardcoded mock driver objects.
2. WHEN the Drivers_Page loads, THE App SHALL compute stats (total, available, on-trip, on-leave) from the fetched drivers array.
3. WHEN the Drivers_Page renders a driver card, THE App SHALL map the backend `status` field values (`Available`, `On Trip`, `On Leave`) to the appropriate display labels and badge colors.
4. IF the `GET /drivers` call fails, THEN THE App SHALL display an error state with a retry button.
5. WHILE the Drivers_Page is loading, THE App SHALL display loading skeleton cards.

### Requirement 5: Fix Maintenance Page Real Data

**User Story:** As a deployment officer, I want the maintenance page to show real maintenance records, so that I can track actual vehicle service needs.

#### Acceptance Criteria

1. WHEN the Maintenance_Page loads, THE App SHALL fetch all maintenance records by calling `GET /maintenance` and render the returned array, replacing all hardcoded mock maintenance objects.
2. WHEN the Maintenance_Page loads, THE App SHALL compute stats (total, pending, scheduled, in-progress, completed) from the fetched records array.
3. WHEN the Maintenance_Page renders a record, THE App SHALL map the backend status values to the appropriate display labels and badge colors.
4. IF the `GET /maintenance` call fails, THEN THE App SHALL display an error state with a retry button.
5. WHILE the Maintenance_Page is loading, THE App SHALL display loading skeleton rows.

### Requirement 6: Fix API Client Alignment

**User Story:** As a developer, I want the API client methods to match the actual backend endpoints, so that all calls succeed without 404 errors.

#### Acceptance Criteria

1. THE App SHALL update `tripApi.assignVehicleAndDriver` to call `POST /trips/:id/allocate` instead of `POST /trips/:id/assign`.
2. THE App SHALL update `notificationApi.markAsRead` to call `PATCH /notifications/:id/read` instead of `POST /notifications/:id/read`.
3. THE App SHALL update `vehicleApi.getAvailableVehicles` to call `GET /vehicles?status=Active` to match the backend's status enum value.
4. THE App SHALL remove or stub out `statsApi.getDeploymentStats` and `statsApi.getFleetUtilization` since those endpoints do not exist on the backend, deriving stats from existing list endpoints instead.
5. WHEN any API method is called without a valid Auth_Token in localStorage, THE App SHALL redirect the user to `/login`.

### Requirement 7: Notifications Integration

**User Story:** As a deployment officer, I want to see real notifications in the header, so that I am alerted to new trip requests and system events.

#### Acceptance Criteria

1. WHEN the layout renders, THE App SHALL fetch notifications by calling `GET /notifications` and display the unread count badge on the notification bell icon.
2. WHEN a deployment officer clicks a notification, THE App SHALL call `PATCH /notifications/:id/read` to mark it as read and decrement the unread count.
3. IF the `GET /notifications` call fails, THEN THE App SHALL display zero as the unread count without crashing the layout.
4. WHILE notifications are loading, THE App SHALL show the bell icon without a count badge.
