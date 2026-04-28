-- ============================================================================
-- Database Normalization - Data Migration
-- ============================================================================
-- This script migrates data from old denormalized columns to new normalized tables
-- Run this AFTER Phase 1 (creating new tables) and BEFORE Phase 2 (removing old columns)

-- ============================================================================
-- 1. MIGRATE VEHICLE RESTRICTED ZONES
-- ============================================================================
-- Note: This requires application-level migration since restrictedZones is stored as JSON
-- The application should:
-- 1. Read vehicles.restrictedZones JSON
-- 2. Parse each zone
-- 3. Insert into restricted_zones table
-- 4. Verify migration
-- 5. Then run Phase 2 to drop the column

-- Example application code (TypeScript):
/*
const vehicles = await vehicleRepository.find({ 
  where: { vipGeoRestrictionEnabled: true } 
});

for (const vehicle of vehicles) {
  if (vehicle.restrictedZones && Array.isArray(vehicle.restrictedZones)) {
    for (const zone of vehicle.restrictedZones) {
      await restrictedZoneRepository.insert({
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
*/

-- ============================================================================
-- 2. MIGRATE TRIP FEEDBACK ISSUES
-- ============================================================================
-- Note: This requires application-level migration since issues is stored as JSON array
-- The application should:
-- 1. Read trip_feedback.issues JSON array
-- 2. For each issue string, find or create matching issue_type
-- 3. Insert into trip_feedback_issues table

-- Example application code (TypeScript):
/*
const feedbacks = await tripFeedbackRepository.find();

for (const feedback of feedbacks) {
  if (feedback.issues && Array.isArray(feedback.issues)) {
    for (const issueText of feedback.issues) {
      // Try to match to existing issue type
      let issueType = await issueTypeRepository.findOne({ 
        where: { name: issueText } 
      });
      
      // If not found, create as 'OTHER' category
      if (!issueType) {
        issueType = await issueTypeRepository.save({
          code: issueText.toUpperCase().replace(/\s+/g, '_'),
          name: issueText,
          category: 'other',
          severity: 'low',
        });
      }
      
      await tripFeedbackIssueRepository.insert({
        feedbackId: feedback.id,
        issueTypeId: issueType.id,
        description: null,
        severity: issueType.severity,
      });
    }
  }
}
*/

-- ============================================================================
-- 3. MIGRATE VEHICLE-DRIVER ASSIGNMENTS
-- ============================================================================
-- Migrate current vehicle → driver assignments
INSERT INTO vehicle_driver_assignments (
  vehicle_id,
  driver_id,
  assigned_at,
  assigned_by,
  is_active,
  assignment_type,
  notes
)
SELECT 
  v.id as vehicle_id,
  v."assignedDriverId" as driver_id,
  v.updated_at as assigned_at, -- Use vehicle's last update as assignment time
  NULL as assigned_by, -- Unknown who assigned
  true as is_active,
  'permanent' as assignment_type,
  'Migrated from vehicles.assignedDriverId' as notes
FROM vehicles v
WHERE v."assignedDriverId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM vehicle_driver_assignments vda 
    WHERE vda.vehicle_id = v.id AND vda.is_active = true
  );

-- Migrate current driver → vehicle assignments (if different from above)
INSERT INTO vehicle_driver_assignments (
  vehicle_id,
  driver_id,
  assigned_at,
  assigned_by,
  is_active,
  assignment_type,
  notes
)
SELECT 
  d."assignedVehicleId" as vehicle_id,
  d.id as driver_id,
  d.updated_at as assigned_at,
  NULL as assigned_by,
  true as is_active,
  'permanent' as assignment_type,
  'Migrated from drivers.assignedVehicleId' as notes
FROM drivers d
WHERE d."assignedVehicleId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM vehicle_driver_assignments vda 
    WHERE vda.driver_id = d.id AND vda.is_active = true
  )
  AND NOT EXISTS (
    SELECT 1 FROM vehicle_driver_assignments vda 
    WHERE vda.vehicle_id = d."assignedVehicleId" AND vda.is_active = true
  );

-- ============================================================================
-- 4. MIGRATE GPS_LOCATIONS METADATA
-- ============================================================================
-- Extract source from metadata JSON
UPDATE gps_locations
SET source = 
  CASE 
    WHEN metadata LIKE '%flutter-driver-rest%' THEN 'flutter-driver-rest'
    WHEN metadata LIKE '%gps-sender%' THEN 'gps-sender'
    WHEN metadata LIKE '%mobile%' THEN 'mobile-app'
    ELSE 'unknown'
  END
WHERE source IS NULL AND metadata IS NOT NULL;

-- Set default source for records without metadata
UPDATE gps_locations
SET source = 'legacy'
WHERE source IS NULL;

-- ============================================================================
-- 5. VERIFICATION QUERIES
-- ============================================================================

-- Verify restricted zones migration
SELECT 
  'Restricted Zones' as migration_item,
  COUNT(*) as migrated_count,
  (SELECT COUNT(*) FROM vehicles WHERE "restrictedZones" IS NOT NULL) as source_count
FROM restricted_zones;

-- Verify vehicle-driver assignments migration
SELECT 
  'Vehicle-Driver Assignments' as migration_item,
  COUNT(*) as migrated_count,
  (SELECT COUNT(*) FROM vehicles WHERE "assignedDriverId" IS NOT NULL) + 
  (SELECT COUNT(*) FROM drivers WHERE "assignedVehicleId" IS NOT NULL) as source_count
FROM vehicle_driver_assignments
WHERE is_active = true;

-- Verify GPS metadata migration
SELECT 
  'GPS Metadata' as migration_item,
  COUNT(*) as migrated_count,
  (SELECT COUNT(*) FROM gps_locations) as total_count
FROM gps_locations
WHERE source IS NOT NULL;

-- Check for assignment conflicts (should be 0)
SELECT 
  'Assignment Conflicts' as check_item,
  COUNT(*) as conflict_count
FROM (
  SELECT vehicle_id, COUNT(*) as active_count
  FROM vehicle_driver_assignments
  WHERE is_active = true
  GROUP BY vehicle_id
  HAVING COUNT(*) > 1
) conflicts;

-- ============================================================================
-- 6. DATA CONSISTENCY CHECKS
-- ============================================================================

-- Check for orphaned restricted zones (should be 0)
SELECT 
  'Orphaned Restricted Zones' as check_item,
  COUNT(*) as orphan_count
FROM restricted_zones rz
WHERE NOT EXISTS (SELECT 1 FROM vehicles v WHERE v.id = rz.vehicle_id);

-- Check for orphaned trip feedback issues (should be 0)
SELECT 
  'Orphaned Feedback Issues' as check_item,
  COUNT(*) as orphan_count
FROM trip_feedback_issues tfi
WHERE NOT EXISTS (SELECT 1 FROM trip_feedback tf WHERE tf.id = tfi.feedback_id);

-- Check for invalid vehicle-driver assignments (should be 0)
SELECT 
  'Invalid Assignments' as check_item,
  COUNT(*) as invalid_count
FROM vehicle_driver_assignments vda
WHERE NOT EXISTS (SELECT 1 FROM vehicles v WHERE v.id = vda.vehicle_id)
   OR NOT EXISTS (SELECT 1 FROM drivers d WHERE d.id = vda.driver_id);

-- ============================================================================
-- MIGRATION COMPLETE - DATA MIGRATION
-- ============================================================================
-- Next steps:
-- 1. Verify all counts match expected values
-- 2. Test application with new tables
-- 3. Run Phase 2 migration to remove old columns
-- 4. Update application code to use new schema
