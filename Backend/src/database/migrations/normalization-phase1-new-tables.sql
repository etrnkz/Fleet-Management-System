-- ============================================================================
-- Database Normalization - Phase 1: Add New Tables
-- ============================================================================
-- This migration adds new normalized tables without breaking existing functionality
-- Run this first, then migrate data, then run phase 2 to remove old columns

-- ============================================================================
-- 1. RESTRICTED_ZONES TABLE (Fixes 1NF violation in vehicles.restrictedZones)
-- ============================================================================
CREATE TABLE IF NOT EXISTS restricted_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL,
  name VARCHAR(255),
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  radius_meters INTEGER NOT NULL CHECK (radius_meters > 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_restricted_zone_vehicle 
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE INDEX idx_vehicle_zones ON restricted_zones(vehicle_id);
CREATE INDEX idx_zone_location ON restricted_zones(latitude, longitude);
CREATE INDEX idx_zone_active ON restricted_zones(is_active) WHERE is_active = true;

COMMENT ON TABLE restricted_zones IS 'VIP geofence restricted zones for vehicles (normalized from vehicles.restrictedZones JSON)';
COMMENT ON COLUMN restricted_zones.radius_meters IS 'Radius of restricted zone in meters';

-- ============================================================================
-- 2. ISSUE_TYPES TABLE (Reference data for feedback issues)
-- ============================================================================
CREATE TABLE IF NOT EXISTS issue_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) CHECK (category IN ('vehicle', 'driver', 'service', 'punctuality', 'safety', 'other')),
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_issue_category ON issue_types(category);
CREATE INDEX idx_issue_active ON issue_types(is_active) WHERE is_active = true;

COMMENT ON TABLE issue_types IS 'Reference table for standardized trip feedback issue types';

-- Insert common issue types
INSERT INTO issue_types (code, name, description, category, severity) VALUES
  ('VEHICLE_BREAKDOWN', 'Vehicle Breakdown', 'Vehicle mechanical failure during trip', 'vehicle', 'critical'),
  ('LATE_ARRIVAL', 'Late Arrival', 'Driver arrived late for pickup', 'punctuality', 'medium'),
  ('LATE_DEPARTURE', 'Late Departure', 'Trip departed later than scheduled', 'punctuality', 'medium'),
  ('UNSAFE_DRIVING', 'Unsafe Driving', 'Driver exhibited unsafe driving behavior', 'driver', 'high'),
  ('POOR_VEHICLE_CONDITION', 'Poor Vehicle Condition', 'Vehicle was dirty or poorly maintained', 'vehicle', 'low'),
  ('RUDE_BEHAVIOR', 'Rude Behavior', 'Driver was rude or unprofessional', 'driver', 'medium'),
  ('ROUTE_DEVIATION', 'Route Deviation', 'Driver took unexpected or inefficient route', 'service', 'low'),
  ('AC_NOT_WORKING', 'AC Not Working', 'Air conditioning system malfunction', 'vehicle', 'low'),
  ('UNCOMFORTABLE_RIDE', 'Uncomfortable Ride', 'Ride was uncomfortable (suspension, seats, etc.)', 'vehicle', 'low'),
  ('COMMUNICATION_ISSUE', 'Communication Issue', 'Difficulty communicating with driver', 'driver', 'low'),
  ('FUEL_SHORTAGE', 'Fuel Shortage', 'Vehicle ran low on fuel during trip', 'service', 'high'),
  ('NAVIGATION_ISSUE', 'Navigation Issue', 'Driver had difficulty finding destination', 'driver', 'low'),
  ('SAFETY_CONCERN', 'Safety Concern', 'General safety concern during trip', 'safety', 'high'),
  ('CLEANLINESS_ISSUE', 'Cleanliness Issue', 'Vehicle interior was not clean', 'vehicle', 'low'),
  ('OTHER', 'Other Issue', 'Other issue not listed', 'other', 'low')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 3. TRIP_FEEDBACK_ISSUES TABLE (Fixes 1NF violation in trip_feedback.issues)
-- ============================================================================
CREATE TABLE IF NOT EXISTS trip_feedback_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL,
  issue_type_id UUID NOT NULL,
  description TEXT,
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_feedback_issue_feedback 
    FOREIGN KEY (feedback_id) REFERENCES trip_feedback(id) ON DELETE CASCADE,
  CONSTRAINT fk_feedback_issue_type 
    FOREIGN KEY (issue_type_id) REFERENCES issue_types(id)
);

CREATE INDEX idx_feedback_issues ON trip_feedback_issues(feedback_id);
CREATE INDEX idx_issue_type_ref ON trip_feedback_issues(issue_type_id);
CREATE INDEX idx_issue_severity ON trip_feedback_issues(severity);

COMMENT ON TABLE trip_feedback_issues IS 'Normalized trip feedback issues (from trip_feedback.issues JSON array)';

-- ============================================================================
-- 4. VEHICLE_DRIVER_ASSIGNMENTS TABLE (Fixes circular dependency)
-- ============================================================================
CREATE TABLE IF NOT EXISTS vehicle_driver_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL,
  driver_id UUID NOT NULL,
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by UUID,
  unassigned_at TIMESTAMP,
  unassigned_by UUID,
  is_active BOOLEAN DEFAULT true,
  assignment_type VARCHAR(50) DEFAULT 'permanent' CHECK (assignment_type IN ('permanent', 'temporary', 'trip')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_assignment_vehicle 
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  CONSTRAINT fk_assignment_driver 
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
  CONSTRAINT fk_assignment_assigned_by 
    FOREIGN KEY (assigned_by) REFERENCES users(id),
  CONSTRAINT fk_assignment_unassigned_by 
    FOREIGN KEY (unassigned_by) REFERENCES users(id),
  CONSTRAINT chk_unassignment_logic 
    CHECK ((is_active = true AND unassigned_at IS NULL) OR (is_active = false AND unassigned_at IS NOT NULL))
);

-- Ensure only one active assignment per vehicle
CREATE UNIQUE INDEX idx_active_vehicle_assignment 
  ON vehicle_driver_assignments(vehicle_id) 
  WHERE is_active = true;

-- Ensure only one active assignment per driver
CREATE UNIQUE INDEX idx_active_driver_assignment 
  ON vehicle_driver_assignments(driver_id) 
  WHERE is_active = true;

CREATE INDEX idx_assignment_history_vehicle ON vehicle_driver_assignments(vehicle_id, assigned_at DESC);
CREATE INDEX idx_assignment_history_driver ON vehicle_driver_assignments(driver_id, assigned_at DESC);
CREATE INDEX idx_assignment_active ON vehicle_driver_assignments(is_active) WHERE is_active = true;

COMMENT ON TABLE vehicle_driver_assignments IS 'Vehicle-Driver assignment history (replaces circular dependency between vehicles and drivers)';
COMMENT ON COLUMN vehicle_driver_assignments.assignment_type IS 'Type of assignment: permanent (long-term), temporary (short-term), trip (single trip)';

-- ============================================================================
-- 5. ADD SOFT DELETE COLUMNS
-- ============================================================================

-- Users soft delete
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);
CREATE INDEX IF NOT EXISTS idx_users_deleted ON users(deleted_at) WHERE deleted_at IS NOT NULL;
COMMENT ON COLUMN users.deleted_at IS 'Soft delete timestamp - user is hidden but data preserved for history';

-- Vehicles soft delete
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);
CREATE INDEX IF NOT EXISTS idx_vehicles_deleted ON vehicles(deleted_at) WHERE deleted_at IS NOT NULL;
COMMENT ON COLUMN vehicles.deleted_at IS 'Soft delete timestamp - vehicle is hidden but data preserved for history';

-- Drivers soft delete
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);
CREATE INDEX IF NOT EXISTS idx_drivers_deleted ON drivers(deleted_at) WHERE deleted_at IS NOT NULL;
COMMENT ON COLUMN drivers.deleted_at IS 'Soft delete timestamp - driver is hidden but data preserved for history';

-- Departments soft delete
ALTER TABLE departments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE departments ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);
CREATE INDEX IF NOT EXISTS idx_departments_deleted ON departments(deleted_at) WHERE deleted_at IS NOT NULL;

-- Colleges soft delete
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);
CREATE INDEX IF NOT EXISTS idx_colleges_deleted ON colleges(deleted_at) WHERE deleted_at IS NOT NULL;

-- ============================================================================
-- 6. EXTRACT GPS_LOCATIONS METADATA FIELDS
-- ============================================================================

-- Add specific metadata columns (extract from JSON)
ALTER TABLE gps_locations ADD COLUMN IF NOT EXISTS source VARCHAR(50);
ALTER TABLE gps_locations ADD COLUMN IF NOT EXISTS battery_level INTEGER CHECK (battery_level BETWEEN 0 AND 100);
ALTER TABLE gps_locations ADD COLUMN IF NOT EXISTS network_type VARCHAR(20);
ALTER TABLE gps_locations ADD COLUMN IF NOT EXISTS device_id VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_gps_source ON gps_locations(source);
CREATE INDEX IF NOT EXISTS idx_gps_battery ON gps_locations(battery_level) WHERE battery_level < 20;

COMMENT ON COLUMN gps_locations.source IS 'GPS data source: flutter-driver-rest, gps-sender, etc.';
COMMENT ON COLUMN gps_locations.battery_level IS 'Device battery level at time of GPS reading (0-100)';
COMMENT ON COLUMN gps_locations.network_type IS 'Network type: 4G, 5G, WiFi, etc.';

-- ============================================================================
-- 7. ADD FUEL_RECORDS CONSISTENCY CONSTRAINT
-- ============================================================================

-- Note: This constraint ensures vehicleId matches trip's allocated vehicle
-- Commented out for now as it requires data migration first
-- ALTER TABLE fuel_records ADD CONSTRAINT chk_fuel_vehicle_consistency
-- CHECK (
--   trip_id IS NULL OR 
--   vehicle_id = (SELECT allocated_vehicle_id FROM trip_requests WHERE id = trip_id)
-- );

-- ============================================================================
-- MIGRATION COMPLETE - PHASE 1
-- ============================================================================
-- Next steps:
-- 1. Migrate existing data from old columns to new tables
-- 2. Update application code to use new tables
-- 3. Run Phase 2 migration to remove old columns
