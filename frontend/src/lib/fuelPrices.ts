// Fuel price configuration — stored in localStorage, editable by transport admin

const STORAGE_KEY = 'hufms_fuel_prices'

export interface FuelPrices {
  petrol: number  // ETB per liter
  diesel: number  // ETB per liter
  updatedAt?: string
}

const DEFAULTS: FuelPrices = {
  petrol: 132.18,
  diesel: 139.84,
}

export function getFuelPrices(): FuelPrices {
  if (typeof window === 'undefined') return DEFAULTS
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...DEFAULTS, ...JSON.parse(stored) }
  } catch {}
  return DEFAULTS
}

export function saveFuelPrices(prices: FuelPrices): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prices, updatedAt: new Date().toISOString() }))
}

export function getFuelPriceForType(fuelType?: string | null): number {
  const prices = getFuelPrices()
  return fuelType?.toLowerCase() === 'diesel' ? prices.diesel : prices.petrol
}
