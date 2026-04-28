# Fuel Price Documentation

## Overview
The Fleet Management System handles fuel prices in two ways:
1. **Stored in Database** - Actual fuel prices per transaction
2. **Hardcoded Constants** - Default prices for calculations

---

## 1. Database Storage (Actual Fuel Records)

### Table: `fuel_records`

Fuel prices are saved in the **`fuel_records`** table with the following structure:

```sql
CREATE TABLE fuel_records (
  id UUID PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  trip_id UUID REFERENCES trip_requests(id),
  recorded_by_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR NOT NULL, -- 'Refuel', 'TripConsumption', 'Adjustment'
  quantity DECIMAL(10,2) NOT NULL, -- Liters
  price_per_liter DECIMAL(10,2) NOT NULL, -- ⭐ FUEL PRICE SAVED HERE
  total_cost DECIMAL(10,2) NOT NULL, -- quantity × price_per_liter
  mileage_at_refuel INTEGER,
  station VARCHAR,
  receipt_number VARCHAR,
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Key Column: `price_per_liter`
- **Type**: `DECIMAL(10,2)`
- **Description**: Price per liter at the time of refuel/consumption
- **Example**: `65.50` (65.50 Birr per liter)
- **Purpose**: Records the actual price paid for fuel

### Entity: `FuelRecord`
**File**: `Backend/src/fuel/entities/fuel-record.entity.ts`

```typescript
@Entity('fuel_records')
export class FuelRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number; // in liters

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerLiter: number; // ⭐ FUEL PRICE

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalCost: number; // quantity × pricePerLiter

  @Column({ type: 'varchar', nullable: true })
  station: string; // Gas station name

  @Column({ type: 'varchar', nullable: true })
  receiptNumber: string; // Receipt number

  // ... other fields
}
```

---

## 2. Hardcoded Fuel Prices (For Calculations)

### Current Prices (Hardcoded)

The system uses hardcoded fuel prices for **estimations and calculations**:

```typescript
const PETROL_PRICE = 132.18; // Birr per liter
const DIESEL_PRICE = 139.84; // Birr per liter
```

### Where They're Used

#### Location 1: Trip Completion
**File**: `Backend/src/trips/trips.service.ts` (Line 1075-1077)

```typescript
// When completing a trip, calculate fuel quantity from cost
const PETROL_PRICE = 132.18; // Birr per liter
const DIESEL_PRICE = 139.84; // Birr per liter
const fuelPricePerLiter = trip.allocatedVehicle.fuelType === 'Diesel' 
  ? DIESEL_PRICE 
  : PETROL_PRICE;

const fuelQuantity = completeTripDto.actualFuelCost / fuelPricePerLiter;

// Save to fuel_records table
await this.fuelService.create({
  vehicleId: trip.allocatedVehicle.id,
  tripId: trip.id,
  type: 'TripConsumption',
  quantity: fuelQuantity,
  pricePerLiter: fuelPricePerLiter, // ⭐ Saved to database
  totalCost: completeTripDto.actualFuelCost,
  // ...
});
```

#### Location 2: Live GPS Tracking
**File**: `Backend/src/tracking/tracking.service.ts` (Line 365-367, 447-449)

```typescript
// Calculate real-time fuel cost during trip
const PETROL_PRICE = 132.18;
const DIESEL_PRICE = 139.84;
const fuelPricePerLiter = vehicle.fuelType === 'Diesel' 
  ? DIESEL_PRICE 
  : PETROL_PRICE;

const actualFuelCost = fuelUsedLiters * fuelPricePerLiter;
```

**Purpose**: Calculate estimated fuel cost in real-time based on GPS distance traveled.

---

## 3. How Fuel Prices Work

### Scenario 1: Manual Refuel Entry
When transport office records a refuel:

```typescript
POST /api/v1/fuel
{
  "vehicleId": "uuid",
  "type": "Refuel",
  "quantity": 50.5,
  "pricePerLiter": 65.50, // ⭐ User enters actual price
  "station": "Total Gas Station",
  "receiptNumber": "RCP-12345"
}
```

**Flow**:
1. User enters actual price per liter (e.g., 65.50 Birr)
2. System calculates: `totalCost = quantity × pricePerLiter`
3. Saved to `fuel_records` table with actual price

### Scenario 2: Trip Completion (Automatic)
When driver completes a trip:

```typescript
POST /api/v1/trips/:id/complete
{
  "actualFuelCost": 3500, // Total cost in Birr
  "finalMileage": 125000
}
```

**Flow**:
1. System uses hardcoded price (132.18 or 139.84) based on vehicle fuel type
2. Calculates: `quantity = actualFuelCost / pricePerLiter`
3. Creates fuel record with calculated quantity and hardcoded price
4. Saved to `fuel_records` table

### Scenario 3: Live Tracking (Real-time Calculation)
During trip, GPS tracking calculates fuel cost:

```typescript
// Real-time calculation (not saved until trip completes)
const distanceTraveled = 45.5; // km
const fuelEfficiency = 10; // km per liter
const fuelUsed = distanceTraveled / fuelEfficiency; // 4.55 liters
const fuelCost = fuelUsed * PETROL_PRICE; // 4.55 × 132.18 = 601.42 Birr
```

**Flow**:
1. GPS calculates distance traveled
2. Uses vehicle's fuel efficiency to estimate fuel used
3. Uses hardcoded price to estimate cost
4. Displayed in live tracking map
5. **Not saved to database** until trip completes

---

## 4. API Endpoints

### Create Fuel Record
```http
POST /api/v1/fuel
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicleId": "uuid",
  "tripId": "uuid", // Optional
  "type": "Refuel", // or "TripConsumption", "Adjustment"
  "quantity": 50.5,
  "pricePerLiter": 65.50, // ⭐ Actual price
  "mileageAtRefuel": 125000,
  "station": "Total Gas Station",
  "receiptNumber": "RCP-12345",
  "notes": "Regular refuel"
}
```

### Get Fuel Records
```http
GET /api/v1/fuel?vehicleId=uuid&type=Refuel&startDate=2026-01-01&endDate=2026-12-31
Authorization: Bearer <token>
```

### Get Fuel Statistics
```http
GET /api/v1/fuel/statistics?startDate=2026-01-01&endDate=2026-12-31
Authorization: Bearer <token>
```

**Response**:
```json
{
  "totalRecords": 120,
  "totalCost": 495000,
  "totalQuantity": 7550,
  "averagePricePerLiter": 65.56, // ⭐ Calculated from actual records
  "byType": {
    "Refuel": 100,
    "TripConsumption": 20
  },
  "byVehicle": {
    "ET-6-22904": {
      "count": 25,
      "totalCost": 125000,
      "totalQuantity": 1900
    }
  }
}
```

---

## 5. Database Queries

### Get All Fuel Records with Prices
```sql
SELECT 
  fr.id,
  fr.created_at,
  v.plate_number,
  fr.type,
  fr.quantity,
  fr.price_per_liter, -- ⭐ Actual price paid
  fr.total_cost,
  fr.station,
  fr.receipt_number,
  u.name as recorded_by
FROM fuel_records fr
JOIN vehicles v ON v.id = fr.vehicle_id
JOIN users u ON u.id = fr.recorded_by_id
ORDER BY fr.created_at DESC;
```

### Calculate Average Fuel Price
```sql
SELECT 
  AVG(price_per_liter) as average_price,
  MIN(price_per_liter) as min_price,
  MAX(price_per_liter) as max_price,
  COUNT(*) as record_count
FROM fuel_records
WHERE type = 'Refuel'
  AND created_at >= '2026-01-01'
  AND created_at <= '2026-12-31';
```

### Get Fuel Price Trends by Month
```sql
SELECT 
  DATE_TRUNC('month', created_at) as month,
  AVG(price_per_liter) as average_price,
  SUM(quantity) as total_liters,
  SUM(total_cost) as total_cost,
  COUNT(*) as refuel_count
FROM fuel_records
WHERE type = 'Refuel'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

### Get Fuel Records by Vehicle
```sql
SELECT 
  v.plate_number,
  v.fuel_type,
  COUNT(fr.id) as refuel_count,
  SUM(fr.quantity) as total_liters,
  SUM(fr.total_cost) as total_cost,
  AVG(fr.price_per_liter) as average_price
FROM vehicles v
LEFT JOIN fuel_records fr ON fr.vehicle_id = v.id AND fr.type = 'Refuel'
GROUP BY v.id, v.plate_number, v.fuel_type
ORDER BY total_cost DESC;
```

---

## 6. Updating Hardcoded Prices

### Current Approach (Not Recommended)
Fuel prices are hardcoded in multiple files:

```typescript
// Backend/src/trips/trips.service.ts
const PETROL_PRICE = 132.18;
const DIESEL_PRICE = 139.84;

// Backend/src/tracking/tracking.service.ts
const PETROL_PRICE = 132.18;
const DIESEL_PRICE = 139.84;
```

**Problem**: Must update in multiple places when prices change.

### Recommended Approach: Configuration Table

Create a `fuel_prices` configuration table:

```sql
CREATE TABLE fuel_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fuel_type VARCHAR(50) NOT NULL, -- 'Gasoline', 'Diesel', 'Electric'
  price_per_liter DECIMAL(10,2) NOT NULL,
  effective_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE INDEX idx_active_fuel_price (fuel_type, is_active) WHERE is_active = true
);

-- Insert current prices
INSERT INTO fuel_prices (fuel_type, price_per_liter, effective_date, is_active) VALUES
  ('Gasoline', 132.18, '2026-01-01', true),
  ('Diesel', 139.84, '2026-01-01', true);
```

**Benefits**:
- ✅ Single source of truth
- ✅ Price history tracking
- ✅ Easy to update via admin panel
- ✅ No code changes needed when prices change

### Implementation

**Entity**:
```typescript
@Entity('fuel_prices')
export class FuelPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fuelType: string; // 'Gasoline', 'Diesel', 'Electric'

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerLiter: number;

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
```

**Service**:
```typescript
async getCurrentFuelPrice(fuelType: string): Promise<number> {
  const price = await this.fuelPriceRepository.findOne({
    where: { fuelType, isActive: true },
    order: { effectiveDate: 'DESC' }
  });
  
  if (!price) {
    // Fallback to hardcoded prices
    return fuelType === 'Diesel' ? 139.84 : 132.18;
  }
  
  return Number(price.pricePerLiter);
}
```

**Usage**:
```typescript
// Instead of hardcoded
const PETROL_PRICE = 132.18;

// Use service
const petrolPrice = await this.fuelPriceService.getCurrentFuelPrice('Gasoline');
```

---

## 7. Summary

### Where Fuel Prices Are Saved

| Location | Purpose | Editable | Historical |
|----------|---------|----------|------------|
| **`fuel_records.price_per_liter`** | Actual price paid per transaction | ✅ Yes | ✅ Yes |
| **Hardcoded constants** | Default prices for calculations | ❌ No (requires code change) | ❌ No |

### Current Hardcoded Prices
- **Petrol/Gasoline**: 132.18 Birr per liter
- **Diesel**: 139.84 Birr per liter

### Files with Hardcoded Prices
1. `Backend/src/trips/trips.service.ts` (Line 1075-1076)
2. `Backend/src/tracking/tracking.service.ts` (Line 365-366, 447-448)

### Recommendation
Create a `fuel_prices` configuration table to:
- ✅ Centralize fuel price management
- ✅ Track price history
- ✅ Allow admin to update prices without code changes
- ✅ Support multiple fuel types
- ✅ Enable price change notifications

### Quick Fix (Update Hardcoded Prices)
If you need to update prices now:

1. Edit `Backend/src/trips/trips.service.ts`:
   ```typescript
   const PETROL_PRICE = 150.00; // New price
   const DIESEL_PRICE = 160.00; // New price
   ```

2. Edit `Backend/src/tracking/tracking.service.ts`:
   ```typescript
   const PETROL_PRICE = 150.00; // New price
   const DIESEL_PRICE = 160.00; // New price
   ```

3. Rebuild and redeploy:
   ```bash
   cd Backend
   npm run build
   pm2 restart fleet-backend
   ```

### Long-term Solution
Implement the `fuel_prices` configuration table as described above for better maintainability and flexibility.
