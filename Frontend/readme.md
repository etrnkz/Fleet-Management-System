## Frontend Development Guide and Workflow - Fleet Management System


**Tech Stack:**
- **Framework:** Next.js 13+ with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS Shadcn
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Icons:** Lucide React

---

### Frontend Folder Structure

```text
fleet-management-frontend/
├── src/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── store/
│   └── types/
├── public/
├── .env.local.example
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```


**Workflow:**
1.  **Weekly Sprints:** We work in one-week sprints. Each developer is assigned specific pages/components to complete.
2.  **Branching:** For each task, create a new feature branch from `develop`. Name it `feature/your-name-description` (e.g., `feature/lebsi-login-page`).
3.  **Daily Stand-ups:** Briefly share what you did yesterday, what you'll do today, and any blockers.
4.  **Code Review:** Before merging into `develop`, create a Pull Request. Another team member must review and approve it.
5.  **End of Week:** On Friday, we merge all completed features into `develop` and prepare for the next week's assignments.

---

### Week-by-Week Task Breakdown

####  **Week 1: Project Setup & Authentication**

**Goal:** Get the project running locally and build the login/register pages.

| Assigned To | Task                   | Pages/Components to Create                                                           | Details                                                                                                                     |
| :------------| :-----------------------| :-------------------------------------------------------------------------------------| :----------------------------------------------------------------------------------------------------------------------------|
| **Lebsi**   | Auth Pages             | `src/app/(auth)/login/page.tsx`<br>`src/app/(auth)/register/page.tsx`                | Build the UI for both pages. Use form inputs for email/password. Add validation.                                            |
| **Eyuel**   | Auth Logic & Hooks     | `src/hooks/useAuth.ts`<br>`src/lib/auth.ts`<br>`src/store/auth-store.ts`             | Create the `useAuth` hook to handle login/logout calls and manage auth state. Set up token storage.                         |
| **Yididya** | Project Setup & Layout | `src/app/layout.tsx`<br>`src/app/(dashboard)/layout.tsx`<br>`src/components/layout/` | Initialize the Next.js project. Create the root layout and the main dashboard layout with a placeholder sidebar and header. |

---

##@# **Week 2: Core Fleet Management - Vehicles**

**Goal:** Build the complete UI for managing vehicles.

| Assigned To | Task | Pages/Components to Create | Details |
| :--- | :--- | :--- | :--- |
| **Lebsi** | Vehicle List Page | `src/app/(dashboard)/vehicles/page.tsx`<br>`src/components/features/VehicleList.tsx` | Create a page that displays a table of all vehicles. The table should show plate number, make, model, and status. |
| **Eyuel** | Vehicle Form | `src/components/forms/VehicleForm.tsx` | Create a reusable form component with fields for all vehicle details (make, model, year, etc.). Include validation. |
| **Yididya** | Add/Edit Vehicle Pages | `src/app/(dashboard)/vehicles/new/page.tsx`<br>`src/app/(dashboard)/vehicles/[id]/page.tsx` | The "new" page should use the `VehicleForm` to create a vehicle. The `[id]` page should fetch vehicle data and populate the form for editing. |

---

#### **Week 3: Core Fleet Management - Drivers**

**Goal:** Build the complete UI for managing drivers.

| Assigned To | Task | Pages/Components to Create | Details |
| :--- | :--- | :--- | :--- |
| **Eyuel** | Driver List Page | `src/app/(dashboard)/drivers/page.tsx`<br>`src/components/features/DriverList.tsx` | Create a page with a table of all drivers. Show name, license number, phone, and status. |
| **Yididya** | Driver Form | `src/components/forms/DriverForm.tsx` | Create a reusable form for driver details (name, license, phone, etc.). Include validation. |
| **Lebsi** | Add Driver Page & API Integration | `src/app/(dashboard)/drivers/new/page.tsx`<br>`src/hooks/useVehicles.ts`<br>`src/lib/api.ts` | Build the "new driver" page. Create the `useVehicles` and `useDrivers` hooks to fetch data from the backend API. Ensure the vehicle list from Week 2 now displays real data. |

---

#### **Week 4: Trip Management**

**Goal:** Allow users to request and view trips.

| Assigned To | Task | Pages/Components to Create | Details |
| :--- | :--- | :--- | :--- |
| **Yididya** | Trip Request Form | `src/components/forms/TripRequestForm.tsx` | Build a form for requesting a trip: purpose, origin, destination, required date/time, number of passengers. |
| **Lebsi** | Trip List & Request Page | `src/app/(dashboard)/trips/page.tsx`<br>`src/app/(dashboard)/trips/new/page.tsx` | The list page shows all trips (pending, approved, completed). The "new" page uses the `TripRequestForm`. |
| **Eyuel** | Trip Details Page | `src/app/(dashboard)/trips/[id]/page.tsx` | This page shows detailed information about a single trip: driver, vehicle, route, status. For now, add a placeholder for the map. |

---

#### **Week 5: Real-time GPS Tracking**

**Goal:** Integrate the live map to track vehicles during trips.

| Assigned To | Task | Pages/Components to Create | Details |
| :--- | :--- | :--- | :--- |
| **Eyuel** | WebSocket Hook | `src/hooks/useWebSocket.ts` | Create a hook to connect to the backend WebSocket, listen for location updates, and manage the connection state. |
| **Lebsi** | Map Component | `src/components/features/TripMap.tsx` | Integrate a map library (like Leaflet). The component should take a list of location coordinates and display them as a route. |
| **Yididya** | Integrate Map on Trip Page | Update `src/app/(dashboard)/trips/[id]/page.tsx` | Use the `useWebSocket` hook to get live location data for the active trip and pass it to the `TripMap` component. |

---

#### **Week 6: Fuel, Maintenance & Reports**

**Goal:** Complete the remaining feature pages.

| Assigned To | Task | Pages/Components to Create | Details |
| :--- | :--- | :--- | :--- |
| **Yididya** | Fuel & Maintenance Pages | `src/app/(dashboard)/fuel/page.tsx`<br>`src/app/(dashboard)/maintenance/page.tsx` | Create pages to log new fuel/maintenance entries and view a history table for each. |
| **Lebsi** | Reports Page | `src/app/(dashboard)/reports/page.tsx`<br>`src/components/charts/` | Create a dashboard with charts (using a library like Chart.js) to visualize data like fuel efficiency, vehicle utilization, etc. |
| **Eyuel** | Dashboard Home & Polish | `src/app/(dashboard)/dashboard/page.tsx`<br>`src/components/ui/` | Build the main dashboard home page with key stats and quick links. Polish all `ui` components for consistency. |

---


**Developers:**
- Lebsi Turara
- Eyuel Kasahun
- Yididya Wossen

---

###  Getting Started

```bash
git clone https://github.com/etrnkz/Fleet-Management-System.git
cd Frontend
npm install
npm run dev
```
