# Database Normalization Analysis - Fleet Management System

## Current Schema Analysis

### Existing Tables
1. **users** - User accounts and authentication
2. **colleges** - College/Faculty entities
3. **departments** - Department entities
4. **drivers** - Driver profiles
5. **vehicles** - Vehicle fleet
6. **trip_requests** - Trip booking requests
7. **approvals** - Trip approval workflow
8. **trip_feedback** - Trip feedback/ratings
9. **gps_locations** - GPS tracking data
10. **fuel_records** - Fuel consumption tracking
11. **maintenance_requests** - Vehicle maintenance
12. **notifications** - System notifications
13. **audit_logs** - Audit trail
14. **workflow_configurations** - Workflow settings

---

## Normalization Issues & Anomalies

### 1. **First Normal Form (1NF) Violations**

#### ❌ Issue 1.1: `vehicles.restrictedZones` - Multi-valued Attribute
**Current**:
```typescript
@Column({ type: 'simple-json', nullable: true })
restrictedZones: VehicleRestrictedZone[] | null;

// Type: { name?: string; latitude: number; longitude: number; radiusMeters: number; }[]
```

**Problem**: Storing array of objects in a single column violates 1NF (atomic values only).

**Anomalies**:
- **Update Anomaly**: Updating a single zone requires reading, modifying, and writing the entire JSON array
- **Query Anomaly**: Cannot efficiently query vehicles by specific restricted zones
- **Integrity Anomaly**: No foreign key constraints on zone data

**Solution**: Create separate `restricted_zones` table

#### ❌ Issue 1.2: `trip_feedback.issues` - Multi-valued Attribute
**Current**:
```typescript
@Column({ type: 'json', nullable: true })
issues: string[]; // Array of issues
```

**Problem**: Storing array in single column violates 1NF.

**Solution**: Create separate `trip_feedback_issues` table

#### ❌ Issue 1.3: `gps_locations.metadata` - Unstructured JSON
**Current**:
```typescript
@Column({ type: 'text', nullable: true })
metadata?: string; // JSON string
```

**Problem**: Unstructured data, cannot query or index efficiently.

**Solution**: Extract common metadata fields into columns

---

### 2. **Second Normal Form (2NF) Violations**

#### ❌ Issue 2.1: `fuel_records` - Partial Dependencies
**Current**:
```typescript
@Column({ type: 'uuid' })
vehicleId: string;

@Column({ type: 'uuid', nullable: true })
tripId: string;

@Column({ type: 'uuid' })
recordedById: string;
```

**Problem**: `vehicleId` is stored redundantly when `tripId` is present (trip already has vehicle).

**Anomalies**:
- **Insertion Anomaly**: Must know vehicleId even though it's in trip
- **Update Anomaly**: If trip's vehicle changes, fuel_records become inconsistent
- **Redundancy**: vehicleId duplicated across fuel_records for same trip

**Solution**: Remove `vehicleId` from fuel_records when `tripId` is present, derive from trip

#### ❌ Issue 2.2: `trip_requests` - Calculated Fields
**Current**:
```typescript
@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
estimatedFuelCost: number | null;

@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
actualFuelCost: number | null;

@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
estimatedDistance: number | null;

@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
actualDistance: number | null;
```

**Problem**: `actualFuelCost` and `actualDistance` can be calculated from `fuel_records` and `gps_locations`.

**Anomalies**:
- **Update Anomaly**: Must update trip when fuel records change
- **Inconsistency**: Stored value may not match calculated value
- **Redundancy**: Data duplicated from child tables

**Solution**: Calculate these values dynamically or use database views

---

### 3. **Third Normal Form (3NF) Violations**

#### ❌ Issue 3.1: `users` - Transitive Dependencies
**Current**:
```typescript
@ManyToOne(() => Department, { nullable: true })
department: Department | null;

@ManyToOne(() => College, { nullable: true })
college: College | null;
```

**Problem**: `college` can be derived from `department.college` (transitive dependency).

**Anomalies**:
- **Update Anomaly**: If department changes college, user's college becomes inconsistent
- **Insertion Anomaly**: Must specify both department and college even though college is implied
- **Redundancy**: College stored in both user and department

**Solution**: Remove `college` from users table, derive from department

#### ❌ Issue 3.2: `drivers` - Redundant Statistics
**Current**:
```typescript
@Column({ default: 0 })
totalTrips: number;

@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
totalDistance: number;

@Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
rating: number;
```

**Problem**: These are calculated from `trip_requests` and `trip_feedback` tables.

**Anomalies**:
- **Update Anomaly**: Must update driver stats when trips complete
- **Inconsistency**: Stats may not match actual trip data
- **Redundancy**: Data duplicated from trip tables

**Solution**: Calculate dynamically or use materialized views

#### ❌ Issue 3.3: `vehicles.currentMileage` - Derived Data
**Current**:
```typescript
@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
currentMileage: number;
```

**Problem**: Can be calculated from `gps_locations` or `fuel_records.mileageAtRefuel`.

**Solution**: Calculate from GPS data or maintain as denormalized for performance (with proper triggers)

---

### 4. **Referential Integrity Issues**

#### ❌ Issue 4.1: Circular Dependencies
**Current**:
```typescript
// Vehicle → Driver
@ManyToOne(() => Driver, { nullable: true })
assignedDriver: Driver | null;

// Driver → Vehicle
@ManyToOne(() => Vehicle, { nullable: true })
assignedVehicle: Vehicle | null;
```

**Problem**: Bidirectional relationship creates circular dependency.

**Anomalies**:
- **Update Anomaly**: Must update both tables to maintain consistency
- **Integrity Risk**: Vehicle.assignedDriver and Driver.assignedVehicle can become inconsistent

**Solution**: Keep relationship in one table only (e.g., `vehicle_driver_assignments`)

#### ❌ Issue 4.2: Soft Delete Issues
**Current**: No soft delete mechanism for critical entities.

**Problem**: Deleting a user/vehicle/driver breaks historical trip data.

**Solution**: Add `deletedAt` timestamp for soft deletes

---

### 5. **Denormalization for Performance (Acceptable)**

Some denormalization is acceptable for performance:

#### ✅ Acceptable: `trip_requests.requestNumber`
- Unique identifier for user-facing display
- Not derived from other data
- **Keep as is**

#### ✅ Acceptable: `notifications.data`
- Snapshot of data at notification time
- Historical record, not live data
- **Keep as is**

#### ✅ Acceptable: `audit_logs` structure
- Historical audit trail
- Should capture state at time of action
- **Keep as is**

---

## Proposed Normalized Schema

### New Tables to Add

#### 1. **restricted_zones** (Fixes 1NF violation)
```sql
CREATE TABLE restricted_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  name VARCHAR(255),
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  radius_meters INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_vehicle_zones (vehicle_id),
  INDEX idx_zone_location (latitude, longitude)
);
```

#### 2. **trip_feedback_issues** (Fixes 1NF violation)
```sql
CREATE TABLE trip_feedback_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES trip_feedback(id) ON DELETE CASCADE,
  issue_type VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_feedback_issues (feedback_id),
  INDEX idx_issue_type (issue_type)
);
```

#### 3. **vehicle_driver_assignments** (Fixes circular dependency)
```sql
CREATE TABLE vehicle_driver_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  unassigned_at TIMESTAMP,
  unassigned_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  
  UNIQUE INDEX idx_active_vehicle (vehicle_id) WHERE is_active = true,
  UNIQUE INDEX idx_active_driver (driver_id) WHERE is_active = true,
  INDEX idx_assignment_history (vehicle_id, assigned_at),
  INDEX idx_driver_history (driver_id, assigned_at)
);
```

#### 4. **issue_types** (Reference data for feedback issues)
```sql
CREATE TABLE issue_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- 'vehicle', 'driver', 'service', 'other'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_issue_category (category)
);
```

---

### Tables to Modify

#### 1. **users** - Remove transitive dependency
```sql
-- Remove college_id column (derive from department)
ALTER TABLE users DROP COLUMN college_id;

-- Add view for convenience
CREATE VIEW users_with_college AS
SELECT 
  u.*,
  d.college_id,
  c.name as college_name
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN colleges c ON d.college_id = c.id;
```

#### 2. **vehicles** - Remove circular dependency
```sql
-- Remove assignedDriverId column
ALTER TABLE vehicles DROP COLUMN assigned_driver_id;

-- Use vehicle_driver_assignments table instead
```

#### 3. **drivers** - Remove circular dependency
```sql
-- Remove assignedVehicleId column
ALTER TABLE drivers DROP COLUMN assigned_vehicle_id;

-- Use vehicle_driver_assignments table instead
```

#### 4. **fuel_records** - Remove partial dependency
```sql
-- Keep vehicleId for non-trip fuel records (refuels, adjustments)
-- For trip consumption, vehicleId is derived from trip

-- Add constraint to ensure consistency
ALTER TABLE fuel_records ADD CONSTRAINT chk_vehicle_consistency
CHECK (
  (trip_id IS NULL) OR 
  (vehicle_id = (SELECT allocated_vehicle_id FROM trip_requests WHERE id = trip_id))
);
```

#### 5. **trip_requests** - Remove calculated fields
```sql
-- Remove actualFuelCost and actualDistance (calculate dynamically)
ALTER TABLE trip_requests DROP COLUMN actual_fuel_cost;
ALTER TABLE trip_requests DROP COLUMN actual_distance;

-- Keep estimatedFuelCost and estimatedDistance (planning data)

-- Create views for calculated values
CREATE VIEW trip_requests_with_actuals AS
SELECT 
  tr.*,
  COALESCE(SUM(fr.total_cost), 0) as actual_fuel_cost,
  COALESCE(MAX(gl.calculated_distance), 0) as actual_distance
FROM trip_requests tr
LEFT JOIN fuel_records fr ON fr.trip_id = tr.id AND fr.type = 'TripConsumption'
LEFT JOIN (
  SELECT 
    trip_id,
    SUM(ST_Distance(
      ST_MakePoint(longitude, latitude)::geography,
      ST_MakePoint(LAG(longitude) OVER (PARTITION BY trip_id ORDER BY timestamp), 
                   LAG(latitude) OVER (PARTITION BY trip_id ORDER BY timestamp))::geography
    )) / 1000 as calculated_distance
  FROM gps_locations
  GROUP BY trip_id
) gl ON gl.trip_id = tr.id
GROUP BY tr.id;
```

#### 6. **drivers** - Remove calculated statistics
```sql
-- Remove totalTrips, totalDistance, rating (calculate dynamically)
ALTER TABLE drivers DROP COLUMN total_trips;
ALTER TABLE drivers DROP COLUMN total_distance;
ALTER TABLE drivers DROP COLUMN rating;

-- Create view for driver statistics
CREATE VIEW driver_statistics AS
SELECT 
  d.id as driver_id,
  COUNT(DISTINCT tr.id) as total_trips,
  COALESCE(SUM(trwa.actual_distance), 0) as total_distance,
  COALESCE(AVG(tf.driver_rating), 0) as average_rating,
  COUNT(DISTINCT CASE WHEN tr.state = 'COMPLETED' THEN tr.id END) as completed_trips,
  COUNT(DISTINCT CASE WHEN tr.state = 'CANCELLED' THEN tr.id END) as cancelled_trips
FROM drivers d
LEFT JOIN trip_requests tr ON tr.allocated_driver_id = d.id
LEFT JOIN trip_requests_with_actuals trwa ON trwa.id = tr.id
LEFT JOIN trip_feedback tf ON tf.trip_request_id = tr.id
GROUP BY d.id;
```

#### 7. **trip_feedback** - Normalize issues array
```sql
-- Remove issues column
ALTER TABLE trip_feedback DROP COLUMN issues;

-- Use trip_feedback_issues table instead
```

#### 8. **vehicles** - Remove restrictedZones JSON
```sql
-- Remove restrictedZones column
ALTER TABLE vehicles DROP COLUMN restricted_zones;

-- Use restricted_zones table instead
```

#### 9. **gps_locations** - Extract metadata fields
```sql
-- Add specific metadata columns
ALTER TABLE gps_locations ADD COLUMN source VARCHAR(50); -- 'flutter-driver-rest', 'gps-sender', etc.
ALTER TABLE gps_locations ADD COLUMN battery_level INTEGER; -- 0-100
ALTER TABLE gps_locations ADD COLUMN network_type VARCHAR(20); -- '4G', 'WiFi', etc.

-- Keep metadata for additional unstructured data
-- But extract common fields to columns
```

---

## Soft Delete Implementation

Add soft delete support to critical tables:

```sql
-- Add deletedAt to users
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE users ADD COLUMN deleted_by UUID REFERENCES users(id);
CREATE INDEX idx_users_deleted ON users(deleted_at) WHERE deleted_at IS NOT NULL;

-- Add deletedAt to vehicles
ALTER TABLE vehicles ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE vehicles ADD COLUMN deleted_by UUID REFERENCES users(id);
CREATE INDEX idx_vehicles_deleted ON vehicles(deleted_at) WHERE deleted_at IS NOT NULL;

-- Add deletedAt to drivers
ALTER TABLE drivers ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE drivers ADD COLUMN deleted_by UUID REFERENCES users(id);
CREATE INDEX idx_drivers_deleted ON drivers(deleted_at) WHERE deleted_at IS NOT NULL;

-- Update queries to filter out soft-deleted records
-- WHERE deleted_at IS NULL
```

---

## Migration Strategy

### Phase 1: Add New Tables (Non-breaking)
1. Create `restricted_zones` table
2. Create `trip_feedback_issues` table
3. Create `vehicle_driver_assignments` table
4. Create `issue_types` table
5. Migrate existing data to new tables

### Phase 2: Create Views (Non-breaking)
1. Create `users_with_college` view
2. Create `trip_requests_with_actuals` view
3. Create `driver_statistics` view
4. Update application to use views

### Phase 3: Remove Redundant Columns (Breaking)
1. Remove `users.college_id`
2. Remove `vehicles.assignedDriverId`
3. Remove `drivers.assignedVehicleId`
4. Remove `trip_requests.actualFuelCost`
5. Remove `trip_requests.actualDistance`
6. Remove `drivers.totalTrips`, `totalDistance`, `rating`
7. Remove `trip_feedback.issues`
8. Remove `vehicles.restrictedZones`

### Phase 4: Add Soft Delete (Non-breaking)
1. Add `deleted_at` columns
2. Update application logic to use soft deletes
3. Update queries to filter soft-deleted records

---

## Benefits of Normalization

### 1. **Data Integrity**
- ✅ No redundant data
- ✅ Consistent relationships
- ✅ Foreign key constraints enforced
- ✅ No update anomalies

### 2. **Query Efficiency**
- ✅ Can query restricted zones independently
- ✅ Can query feedback issues independently
- ✅ Proper indexes on normalized tables
- ✅ Better query optimization

### 3. **Maintainability**
- ✅ Single source of truth for each data point
- ✅ Easier to update and maintain
- ✅ Clear data relationships
- ✅ Better documentation

### 4. **Scalability**
- ✅ Smaller table sizes
- ✅ Better index performance
- ✅ Easier to partition
- ✅ Better caching strategies

---

## Performance Considerations

### When to Denormalize

Some denormalization is acceptable for performance:

1. **Read-heavy calculated fields**: If `driver.totalTrips` is queried frequently, consider keeping it with proper triggers
2. **Caching layer**: Use Redis to cache calculated statistics
3. **Materialized views**: For complex aggregations, use materialized views with refresh strategy
4. **Event sourcing**: For audit trail, keep snapshots of state

### Recommended Approach

1. **Normalize first**: Start with fully normalized schema
2. **Measure performance**: Identify slow queries
3. **Selective denormalization**: Only denormalize proven bottlenecks
4. **Maintain consistency**: Use triggers or application logic to keep denormalized data in sync

---

## Summary

### Critical Issues Fixed
1. ✅ **1NF**: Removed multi-valued attributes (restrictedZones, issues, metadata)
2. ✅ **2NF**: Removed partial dependencies (fuel_records.vehicleId when tripId present)
3. ✅ **3NF**: Removed transitive dependencies (users.college, calculated statistics)
4. ✅ **Integrity**: Fixed circular dependencies (vehicle ↔ driver)
5. ✅ **Soft Delete**: Added support for historical data preservation

### New Tables
- `restricted_zones`
- `trip_feedback_issues`
- `vehicle_driver_assignments`
- `issue_types`

### Modified Tables
- `users` (removed college_id)
- `vehicles` (removed assignedDriverId, restrictedZones)
- `drivers` (removed assignedVehicleId, statistics)
- `trip_requests` (removed actualFuelCost, actualDistance)
- `fuel_records` (added consistency constraint)
- `trip_feedback` (removed issues array)
- `gps_locations` (extracted metadata fields)

### Views Created
- `users_with_college`
- `trip_requests_with_actuals`
- `driver_statistics`

This normalized schema follows 3NF principles while maintaining performance through strategic use of views and indexes.
