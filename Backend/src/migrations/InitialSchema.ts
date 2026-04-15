import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── colleges ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "colleges" (
        "id"        uuid NOT NULL DEFAULT gen_random_uuid(),
        "name"      character varying NOT NULL,
        "code"      character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_colleges" PRIMARY KEY ("id")
      )
    `);

    // ── departments ───────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "departments" (
        "id"        uuid NOT NULL DEFAULT gen_random_uuid(),
        "name"      character varying NOT NULL,
        "code"      character varying,
        "collegeId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_departments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_departments_college" FOREIGN KEY ("collegeId")
          REFERENCES "colleges"("id") ON DELETE SET NULL
      )
    `);

    // ── users ─────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id"               uuid NOT NULL DEFAULT gen_random_uuid(),
        "name"             character varying NOT NULL,
        "email"            character varying NOT NULL,
        "password"         character varying NOT NULL,
        "role"             character varying NOT NULL DEFAULT 'User',
        "phoneNumber"      character varying,
        "isActive"         boolean NOT NULL DEFAULT true,
        "profileImage"     character varying,
        "resetToken"       character varying,
        "resetTokenExpiry" TIMESTAMP,
        "departmentId"     uuid,
        "collegeId"        uuid,
        "createdAt"        TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"        TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users"       PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "FK_users_department" FOREIGN KEY ("departmentId")
          REFERENCES "departments"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_users_college" FOREIGN KEY ("collegeId")
          REFERENCES "colleges"("id") ON DELETE SET NULL
      )
    `);

    // ── vehicles ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vehicles" (
        "id"                       uuid NOT NULL DEFAULT gen_random_uuid(),
        "vehicleId"                character varying UNIQUE,
        "plateNumber"              character varying NOT NULL UNIQUE,
        "vehicleType"              character varying,
        "make"                     character varying NOT NULL,
        "model"                    character varying NOT NULL,
        "year"                     integer NOT NULL,
        "capacity"                 integer NOT NULL,
        "fuelType"                 character varying NOT NULL,
        "fuelCapacity"             numeric(10,2),
        "fuelEfficiency"           numeric(5,2),
        "status"                   character varying NOT NULL DEFAULT 'Active',
        "currentMileage"           numeric(10,2) NOT NULL DEFAULT 0,
        "lastMaintenanceDate"      TIMESTAMP,
        "nextMaintenanceDate"      TIMESTAMP,
        "purchaseDate"             date,
        "insuranceExpiryDate"      date,
        "nextServiceDate"          date,
        "color"                    character varying,
        "vinNumber"                character varying,
        "notes"                    text,
        "vipGeoRestrictionEnabled" boolean NOT NULL DEFAULT false,
        "restrictedZones"          text,
        "assignedDriverId"         uuid,
        "createdAt"                TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"                TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vehicles" PRIMARY KEY ("id")
      )
    `);

    // ── drivers ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "drivers" (
        "id"                uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId"            uuid NOT NULL UNIQUE,
        "licenseNumber"     character varying NOT NULL UNIQUE,
        "licenseExpiry"     date NOT NULL,
        "experienceYears"   integer NOT NULL,
        "status"            character varying NOT NULL DEFAULT 'Available',
        "rating"            numeric(3,2) NOT NULL DEFAULT 0,
        "specializations"   text,
        "notes"             text,
        "totalTrips"        integer NOT NULL DEFAULT 0,
        "totalDistance"     numeric(10,2) NOT NULL DEFAULT 0,
        "assignedVehicleId" uuid,
        "createdAt"         TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"         TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_drivers" PRIMARY KEY ("id"),
        CONSTRAINT "FK_drivers_user"    FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_drivers_vehicle" FOREIGN KEY ("assignedVehicleId")
          REFERENCES "vehicles"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_drivers_assignedVehicle"
        ON "drivers"("assignedVehicleId")
        WHERE "assignedVehicleId" IS NOT NULL
    `);

    // Add FK from vehicles.assignedDriverId → drivers now that drivers table exists
    await queryRunner.query(`
      ALTER TABLE "vehicles"
        ADD CONSTRAINT "FK_vehicles_assignedDriver"
        FOREIGN KEY ("assignedDriverId") REFERENCES "drivers"("id") ON DELETE SET NULL
    `);

    // ── trip_requests ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "trip_requests" (
        "id"                   uuid NOT NULL DEFAULT gen_random_uuid(),
        "requestNumber"        character varying NOT NULL UNIQUE,
        "requesterId"          uuid,
        "tripType"             character varying NOT NULL,
        "tripCategory"         character varying NOT NULL DEFAULT 'STANDARD',
        "purpose"              text NOT NULL,
        "destination"          character varying NOT NULL,
        "startDateTime"        TIMESTAMP NOT NULL,
        "endDateTime"          TIMESTAMP NOT NULL,
        "passengerCount"       integer NOT NULL,
        "state"                character varying NOT NULL DEFAULT 'DRAFT',
        "currentApprovalLevel" character varying,
        "allocatedVehicleId"   uuid,
        "allocatedDriverId"    uuid,
        "deploymentTeamMemberId" uuid,
        "transportOfficerId"   uuid,
        "estimatedFuelCost"    numeric(10,2),
        "actualFuelCost"       numeric(10,2),
        "estimatedDistance"    numeric(10,2),
        "actualDistance"       numeric(10,2),
        "rejectionReason"      text,
        "rejectedById"         uuid,
        "rejectedAt"           TIMESTAMP,
        "completedAt"          TIMESTAMP,
        "createdAt"            TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"            TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_trip_requests" PRIMARY KEY ("id"),
        CONSTRAINT "FK_trip_requests_requester"    FOREIGN KEY ("requesterId")    REFERENCES "users"("id")    ON DELETE SET NULL,
        CONSTRAINT "FK_trip_requests_vehicle"      FOREIGN KEY ("allocatedVehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_trip_requests_driver"       FOREIGN KEY ("allocatedDriverId")  REFERENCES "drivers"("id")  ON DELETE SET NULL,
        CONSTRAINT "FK_trip_requests_deployment"   FOREIGN KEY ("deploymentTeamMemberId") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_trip_requests_transport"    FOREIGN KEY ("transportOfficerId")    REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_trip_requests_rejectedBy"   FOREIGN KEY ("rejectedById")          REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_trip_requests_tripId_timestamp" ON "trip_requests"("id")`);

    // ── approvals ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "approvals" (
        "id"             uuid NOT NULL DEFAULT gen_random_uuid(),
        "tripRequestId"  uuid,
        "approvalLevel"  character varying NOT NULL,
        "status"         character varying NOT NULL DEFAULT 'Pending',
        "approverId"     uuid,
        "comments"       text,
        "dueDate"        TIMESTAMP NOT NULL,
        "approvedAt"     TIMESTAMP,
        "createdAt"      TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"      TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_approvals" PRIMARY KEY ("id"),
        CONSTRAINT "FK_approvals_trip"     FOREIGN KEY ("tripRequestId") REFERENCES "trip_requests"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_approvals_approver" FOREIGN KEY ("approverId")    REFERENCES "users"("id")         ON DELETE SET NULL
      )
    `);

    // ── trip_feedbacks ────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "trip_feedbacks" (
        "id"                uuid NOT NULL DEFAULT gen_random_uuid(),
        "tripRequestId"     uuid,
        "submittedById"     uuid,
        "overallRating"     integer,
        "driverRating"      integer,
        "vehicleRating"     integer,
        "punctualityRating" integer,
        "comments"          text,
        "suggestions"       text,
        "wouldRecommend"    boolean NOT NULL DEFAULT false,
        "issues"            text,
        "createdAt"         TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"         TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_trip_feedbacks" PRIMARY KEY ("id"),
        CONSTRAINT "FK_trip_feedbacks_trip"        FOREIGN KEY ("tripRequestId") REFERENCES "trip_requests"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_trip_feedbacks_submittedBy" FOREIGN KEY ("submittedById") REFERENCES "users"("id")         ON DELETE SET NULL
      )
    `);

    // ── gps_locations ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "gps_locations" (
        "id"        uuid NOT NULL DEFAULT gen_random_uuid(),
        "tripId"    uuid NOT NULL,
        "latitude"  numeric(10,7) NOT NULL,
        "longitude" numeric(10,7) NOT NULL,
        "speed"     numeric(5,2),
        "heading"   numeric(5,2),
        "altitude"  numeric(6,2),
        "accuracy"  numeric(4,2),
        "isOffline" boolean NOT NULL DEFAULT false,
        "metadata"  text,
        "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_gps_locations" PRIMARY KEY ("id"),
        CONSTRAINT "FK_gps_locations_trip" FOREIGN KEY ("tripId")
          REFERENCES "trip_requests"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_gps_tripId_timestamp" ON "gps_locations"("tripId","timestamp")`);

    // ── maintenance_requests ──────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "maintenance_requests" (
        "id"               uuid NOT NULL DEFAULT gen_random_uuid(),
        "vehicleId"        uuid,
        "requestedById"    uuid,
        "issueDescription" text NOT NULL,
        "priority"         character varying NOT NULL DEFAULT 'Medium',
        "status"           character varying NOT NULL DEFAULT 'Pending',
        "estimatedCost"    numeric(10,2),
        "actualCost"       numeric(10,2),
        "notes"            text,
        "inspectedAt"      TIMESTAMP,
        "startedAt"        TIMESTAMP,
        "completedAt"      TIMESTAMP,
        "rejectedAt"       TIMESTAMP,
        "rejectionReason"  text,
        "createdAt"        TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"        TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_maintenance_requests" PRIMARY KEY ("id"),
        CONSTRAINT "FK_maintenance_vehicle"     FOREIGN KEY ("vehicleId")     REFERENCES "vehicles"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_maintenance_requestedBy" FOREIGN KEY ("requestedById") REFERENCES "users"("id")   ON DELETE SET NULL
      )
    `);

    // ── fuel_records ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "fuel_records" (
        "id"              uuid NOT NULL DEFAULT gen_random_uuid(),
        "vehicleId"       uuid,
        "recordedById"    uuid,
        "quantity"        numeric(8,2) NOT NULL,
        "pricePerLiter"   numeric(8,2) NOT NULL,
        "totalCost"       numeric(10,2) NOT NULL,
        "fuelType"        character varying,
        "mileageAtRefuel" numeric(10,2),
        "notes"           text,
        "createdAt"       TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"       TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_fuel_records" PRIMARY KEY ("id"),
        CONSTRAINT "FK_fuel_vehicle"     FOREIGN KEY ("vehicleId")    REFERENCES "vehicles"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_fuel_recordedBy"  FOREIGN KEY ("recordedById") REFERENCES "users"("id")   ON DELETE SET NULL
      )
    `);

    // ── notifications ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id"          uuid NOT NULL DEFAULT gen_random_uuid(),
        "recipientId" uuid,
        "type"        character varying NOT NULL,
        "title"       character varying NOT NULL,
        "message"     text NOT NULL,
        "data"        text,
        "isRead"      boolean NOT NULL DEFAULT false,
        "readAt"      TIMESTAMP,
        "sentAt"      TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notifications_recipient" FOREIGN KEY ("recipientId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // ── audit_logs ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id"         uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId"     uuid,
        "userEmail"  character varying,
        "userRole"   character varying,
        "action"     character varying NOT NULL,
        "entity"     character varying NOT NULL,
        "entityId"   character varying,
        "oldValues"  text,
        "newValues"  text,
        "ipAddress"  character varying,
        "userAgent"  text,
        "notes"      text,
        "createdAt"  TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_audit_logs_user" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // ── workflow_configs ──────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "workflow_configs" (
        "id"        uuid NOT NULL DEFAULT gen_random_uuid(),
        "name"      character varying NOT NULL UNIQUE,
        "steps"     text NOT NULL,
        "isActive"  boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_workflow_configs" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "workflow_configs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fuel_records" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "maintenance_requests" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "gps_locations" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "trip_feedbacks" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "approvals" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "trip_requests" CASCADE`);
    await queryRunner.query(`ALTER TABLE "vehicles" DROP CONSTRAINT IF EXISTS "FK_vehicles_assignedDriver"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "drivers" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vehicles" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "departments" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "colleges" CASCADE`);
  }
}
