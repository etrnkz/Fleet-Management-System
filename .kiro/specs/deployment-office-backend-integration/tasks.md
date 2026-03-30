# Implementation Plan: Deployment Office Backend Integration

## Overview

Wire all Deployment Office pages to the real NestJS API at `http://localhost:3000/api/v1`, replacing mock data and fixing broken endpoints.

## Tasks

- [ ] 1. Fix API client endpoints in api.ts
  - Update `tripApi.assignVehicleAndDriver` to call `POST /trips/:id/allocate`
  - Update `notificationApi.markAsRead` to call `PATCH /notifications/:id/read`
  - Update `vehicleApi.getAvailableVehicles` to call `GET /vehicles?status=Active`
  - Remove `statsApi.getDeploymentStats` and `statsApi.getFleetUtilization`
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 2. Fix Dashboard page
  - [ ] 2.1 Replace hardcoded stats with real data derived from API responses
    - Fetch `GET /vehicles` and compute total/available/in-use/maintenance counts
    - Fetch `GET /maintenance` for pending maintenance items
    - Fetch `GET /trips?state=APPROVED` for trips needing allocation
    - Remove `statsApi` import and calls
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 3. Fix Trips page
  - [ ] 3.1 Replace mock trip data with real API calls
    - Call `GET /trips` for all trips
    - Call `GET /vehicles?status=Active` for available vehicles in assign modal
    - Call `GET /drivers?status=Available` for available drivers in assign modal
    - _Requirements: 2.1, 2.2_
  - [ ] 3.2 Fix allocation endpoint
    - Replace local state-only assignment with `POST /trips/:id/allocate` call
    - Update trip status in UI on success without full reload
    - Show toast on error and keep modal open
    - _Requirements: 2.3, 2.4, 2.5_

- [ ] 4. Fix Vehicles page
  - [ ] 4.1 Replace hardcoded vehicle list with `GET /vehicles`
    - Add `useEffect` + `useState` for loading/error states
    - Compute stats from fetched array
    - Map backend status values (`Active`, `In Use`, `Maintenance`) to display labels/badge colors
    - Show error state with retry button on failure
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 5. Fix Drivers page
  - [ ] 5.1 Replace hardcoded driver list with `GET /drivers`
    - Add `useEffect` + `useState` for loading/error states
    - Compute stats from fetched array
    - Map backend status values (`Available`, `On Trip`, `On Leave`) to display labels/badge colors
    - Show error state with retry button on failure
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 6. Fix Maintenance page
  - [ ] 6.1 Replace hardcoded maintenance list with `GET /maintenance`
    - Add `useEffect` + `useState` for loading/error states
    - Compute stats from fetched array
    - Show error state with retry button on failure
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 7. Fix layout notifications
  - [ ] 7.1 Use real `GET /notifications` and `PATCH /notifications/:id/read`
    - Display unread count badge from real data
    - Call `PATCH /notifications/:id/read` on notification click
    - Decrement unread count on success
    - Show zero count (no badge) on fetch failure
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 8. Checkpoint - Verify all pages load real data
  - Ensure all tests pass, ask the user if questions arise.
