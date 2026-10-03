/**
 * AutoCom Spatial Sensor Engine
 * Provides native Capacitor-ready sensor abstractions with browser fallbacks:
 * - GPS/GNSS Geolocation tracking
 * - Magnetometer Compass Heading (DeviceOrientation)
 * - Haversine distance calculations (20m - 50m proximity filtering)
 * - Heading vs. Bearing cone geometry
 */

export interface SpatialCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
}

// Cape Town Mall / City Center Reference Origin
export const DEFAULT_USER_COORDS: SpatialCoordinates = {
  latitude: -33.92487,
  longitude: 18.4241,
  accuracy: 3.5,
};

/**
 * Calculates physical distance in meters between two GPS coordinates using Haversine formula
 */
export function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Earth's mean radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Calculates initial target bearing in degrees (0° - 360° True North) from origin to target
 */
export function getBearingAngle(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  const bearing = (θ * 180) / Math.PI;

  return Math.round((bearing + 360) % 360);
}

/**
 * Computes shortest angular distance between user device heading and target bearing (-180° to +180°)
 */
export function getAngleDifference(heading: number, bearing: number): number {
  let diff = ((bearing - heading + 180) % 360) - 180;
  if (diff < -180) diff += 360;
  return diff;
}

/**
 * Checks if target is within the user's facing cone (e.g. ±35° cone of sight)
 */
export function isFacingTarget(heading: number, bearing: number, coneThreshold = 35): boolean {
  const diff = Math.abs(getAngleDifference(heading, bearing));
  return diff <= coneThreshold;
}

/**
 * Converts degree heading to cardinal name (e.g. N, NNE, E, SSW)
 */
export function formatCardinal(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round(normalized / 22.5) % 16;
  return `${directions[index]} ${Math.round(normalized)}°`;
}

/**
 * Capacitor bridge detection & helper
 */
export function isCapacitorNative(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (
      window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }
    )?.Capacitor?.isNativePlatform?.(),
  );
}
