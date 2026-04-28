# How to Run Database Normalization Migrations

## Prerequisites

1. **Backup the database**
   ```bash
   pg_dump -U postgres -d fleet_management -F c -f backup_before_normalization_$(date +%Y%m%d_%H%M%S).dump
   ```

2. **Verify backup**
   ```bash
   pg_restore --list backup_before_normalization_*.dump | head -20
   ```

3. **Test in staging first**
   - Never run migrations directly in production
   - Test thoroughly in staging environment
   - Verify all application functionality

---

## Migration Steps

### Step 1: Run Phase 1 Migration (Non-breaking)

This creates new tables without breaking existing functionality.

```bash
# Connect to database
psql -U postgres -d fleet_management

# Run Phase 1 migration
\i Backend/src/database/migrations/normalization-phase1-new-tables.sql

# Verify tables were created
\dt restricted_zones
\dt issue_types
\dt trip_feedback_issues
\dt vehicle_driver_assignments

# Check for errors
SELECT * FROM restricted_zones LIMIT 1;
SELECT * FROM issue_types LIMIT 5;
```

**Expected Output**:
```
CREATE TABLE
CREATE INDEX
...
INSERT 0 15  (issue_types seeded)
```

**Verification**:
```sql
-- Check new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('restricted_zones', 'issue_types', 'trip_feedback_issues', 'vehicle_driver_assignments');

-- Should return 4 rows
```

---

### Step 2: Run Data Migration

This migrates data from old columns to new tables.

```bash
# Run data migration
\i Backend/src/database/migrations/normalization-data-migration.sql
```

**Expected Output**:
```
INSERT 0 X  (vehicle-driver assignments)
UPDATE X    (GPS metadata)
...
Verification queries showing counts
```

**Verification Queries**:
```sql
-- Check vehicle-driver assignments migrated
SELECT COUNT(*) FROM vehicle_driver_assignments WHERE is_active = true;

-- Check GPS metadata migrated
SELECT COUNT(*) FROM gps_locations WHERE source IS NOT NULL;

-- Check for conflicts (should be 0)
SELECT COUNT(*) FROM (
  SELECT vehicle_id, COUNT(*) 
  FROM vehicle_driver_assignments 
  WHERE is_active = true 
  GROUP BY vehicle_id 
  HAVING COUNT(*) > 1
) conflicts;
```

**Manual Data Migration Required**:

For JSON fields, you need to run application-level migration:

```typescript
// Migrate vehicle restricted zones
import { dataSource } from './data-source';
import { Vehicle } from './vehicles/entities/vehicle.entity';
import { RestrictedZone } from './vehicles/entities/restricted-zone.entity';

async function migrateRestrictedZones() {
  const vehicleRepo = dataSource.getRepository(Vehicle);
  const zoneRepo = dataSource.getRepository(RestrictedZone);
  
  const vehicles = await vehicleRepo.find({
    where: { vipGeoRestrictionEnabled: true }
  });
  
  for (const vehicle of vehicles) {
    if (vehicle.restrictedZones && Array.isArray(vehicle.restrictedZones)) {
      for (const zone of vehicle.restrictedZones) {
        await zoneRepo.save({
          vehicleId: vehicle.id,
          name: zone.name || `Zone ${zone.latitude},${zone.longitude}`,
          latitude: zone.latitude,
          longitude: zone.longitude,
          radiusMeters: zone.radiusMeters,
          isActive: true,
        });
      }
    }
  }
  
  console.log(`Migrated restricted zones for ${vehicles.length} vehicles`);
}

// Run migration
migrateRestrictedZones().catch(console.error);
```

---

### Step 3: Update Application Code

**Before running Phase 2**, update your application code to use new tables and views.

#### Example: Update Vehicle Service

**Before**:
```typescript
// Get vehicle with assigned driver
const vehicle = await vehicleRepository.findOne({
  where: { id },
  relations: ['assignedDriver']
});

// Access driver
const driverName = vehicle.assignedDriver?.user?.name;
```

**After**:
```typescript
// Use view instead
const vehicle = await dataSource
  .createQueryBuilder()
  .select('*')
  .from('vehicle_current_assignment', 'vca')
  .where('vca.vehicle_id = :id', { id })
  .getRawOne();

// Access driver
const driverName = vehicle.driver_name;
```

#### Example: Update Driver Statistics

**Before**:
```typescript
// Get driver with statistics
const driver = await driverRepository.findOne({
  where: { id },
  select: ['id', 'totalTrips', 'totalDistance', 'rating']
});
```

**After**:
```typescript
// Use view instead
const stats = await dataSource
  .createQueryBuilder()
  .select('*')
  .from('driver_statistics', 'ds')
  .where('ds.driver_id = :id', { id })
  .getRawOne();
```

---

### Step 4: Test Application

Test all functionality before running Phase 2:

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:e2e

# Test manually
# - Create trip
# - Assign vehicle/driver
# - Complete trip
# - Submit feedback
# - View statistics
```

---

### Step 5: Run Phase 2 Migration (Breaking)

⚠️ **WARNING**: This is a breaking change! Only run after application code is updated.

```bash
# Run Phase 2 migration
\i Backend/src/database/migrations/normalization-phase2-remove-columns.sql
```

**Expected Output**:
```
CREATE VIEW
CREATE VIEW
...
ALTER TABLE
DROP COLUMN
...
```

**Verification**:
```sql
-- Check views were created
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public';

-- Should include:
-- - users_with_college
-- - trip_requests_with_actuals
-- - driver_statistics
-- - vehicle_current_assignment
-- - driver_current_assignment

-- Verify views work
SELECT COUNT(*) FROM users_with_college;
SELECT COUNT(*) FROM driver_statistics;
SELECT COUNT(*) FROM vehicle_current_assignment;
```

---

## Rollback Procedure

If something goes wrong:

### Option 1: Restore from Backup (Safest)

```bash
# Drop current database
dropdb -U postgres fleet_management

# Restore from backup
pg_restore -U postgres -C -d postgres backup_before_normalization_*.dump
```

### Option 2: Manual Rollback

```sql
-- Rollback Phase 2 (if columns were dropped)
ALTER TABLE users ADD COLUMN college_id UUID;
ALTER TABLE vehicles ADD COLUMN "assignedDriverId" UUID;
ALTER TABLE drivers ADD COLUMN "assignedVehicleId" UUID;
ALTER TABLE drivers ADD COLUMN total_trips INTEGER DEFAULT 0;
ALTER TABLE drivers ADD COLUMN total_distance DECIMAL(10,2) DEFAULT 0;
ALTER TABLE drivers ADD COLUMN rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE trip_requests ADD COLUMN actual_fuel_cost DECIMAL(10,2);
ALTER TABLE trip_requests ADD COLUMN actual_distance DECIMAL(10,2);
ALTER TABLE trip_feedback ADD COLUMN issues TEXT;
ALTER TABLE vehicles ADD COLUMN restricted_zones TEXT;

-- Drop views
DROP VIEW IF EXISTS users_with_college CASCADE;
DROP VIEW IF EXISTS trip_requests_with_actuals CASCADE;
DROP VIEW IF EXISTS driver_statistics CASCADE;
DROP VIEW IF EXISTS vehicle_current_assignment CASCADE;
DROP VIEW IF EXISTS driver_current_assignment CASCADE;

-- Rollback Phase 1 (if needed)
DROP TABLE IF EXISTS vehicle_driver_assignments CASCADE;
DROP TABLE IF EXISTS trip_feedback_issues CASCADE;
DROP TABLE IF EXISTS restricted_zones CASCADE;
DROP TABLE IF EXISTS issue_types CASCADE;
```

---

## Post-Migration Checklist

### Database Verification
- [ ] All new tables exist
- [ ] All views exist and return data
- [ ] All indexes exist
- [ ] No orphaned records
- [ ] Foreign keys are valid
- [ ] Soft delete works

### Application Verification
- [ ] All API endpoints work
- [ ] All queries return correct data
- [ ] No 500 errors in logs
- [ ] Mobile apps work
- [ ] Reports generate correctly
- [ ] Statistics calculate correctly

### Performance Verification
- [ ] Query performance is acceptable
- [ ] No slow queries (> 1 second)
- [ ] Indexes are being used (check EXPLAIN)
- [ ] Database size is reasonable
- [ ] No connection pool issues

### Monitoring
- [ ] Set up alerts for slow queries
- [ ] Monitor database CPU/memory
- [ ] Monitor application errors
- [ ] Track query execution times
- [ ] Monitor disk space

---

## Troubleshooting

### Issue: Foreign Key Constraint Violation

**Error**:
```
ERROR: insert or update on table "restricted_zones" violates foreign key constraint
```

**Solution**:
```sql
-- Check for invalid vehicle IDs
SELECT * FROM restricted_zones rz
WHERE NOT EXISTS (SELECT 1 FROM vehicles v WHERE v.id = rz.vehicle_id);

-- Delete invalid records
DELETE FROM restricted_zones rz
WHERE NOT EXISTS (SELECT 1 FROM vehicles v WHERE v.id = rz.vehicle_id);
```

### Issue: View Returns No Data

**Error**: View exists but returns 0 rows

**Solution**:
```sql
-- Check if base tables have data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM drivers;
SELECT COUNT(*) FROM vehicles;

-- Check view definition
\d+ driver_statistics

-- Test view query manually
SELECT * FROM driver_statistics LIMIT 1;
```

### Issue: Slow Query Performance

**Error**: Queries taking > 1 second

**Solution**:
```sql
-- Check if indexes are being used
EXPLAIN ANALYZE SELECT * FROM driver_statistics WHERE driver_id = 'some-uuid';

-- Create missing indexes
CREATE INDEX idx_trip_requests_driver ON trip_requests(allocated_driver_id);
CREATE INDEX idx_trip_feedback_trip ON trip_feedback(trip_request_id);

-- Consider materialized view
CREATE MATERIALIZED VIEW driver_statistics_mv AS SELECT * FROM driver_statistics;
REFRESH MATERIALIZED VIEW driver_statistics_mv;
```

---

## Summary

### Migration Order
1. ✅ Backup database
2. ✅ Run Phase 1 (create new tables)
3. ✅ Run data migration
4. ✅ Update application code
5. ✅ Test thoroughly
6. ✅ Run Phase 2 (remove old columns)
7. ✅ Verify and monitor

### Estimated Downtime
- **Phase 1**: 0 minutes (non-breaking)
- **Data Migration**: 5-10 minutes (depends on data size)
- **Phase 2**: 2-5 minutes (breaking, requires app restart)
- **Total**: ~15 minutes

### Success Criteria
- ✅ All migrations run without errors
- ✅ All tests pass
- ✅ Application works correctly
- ✅ No data loss
- ✅ Performance is acceptable

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review migration logs for errors
3. Verify data integrity with verification queries
4. Restore from backup if needed
5. Contact database administrator

**Emergency Rollback**: Restore from backup immediately if critical issues arise.
