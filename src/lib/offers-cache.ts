import type { Store } from "@/lib/acn-data";
import type { MatchedDeal } from "@/components/DealMatchPopup";

export const STORAGE_OFFERS_CACHE_KEY = "autocom_cached_offers_v1";

export interface CachedOffersPayload {
  timestamp: number;
  expiresAt: number;
  matchedDeck: MatchedDeal[];
  activeDeal: MatchedDeal | null;
  savedStores: Store[];
  ttlMinutes: number;
}

const DEFAULT_TTL_MINUTES = 30; // 30-minute offline persistence window

/**
 * Saves current active deals, matched deck, and stores to localStorage
 * so the application remains fully functional offline.
 */
export function saveSpecialOffersCache(
  matchedDeck: MatchedDeal[],
  savedStores: Store[],
  activeDeal: MatchedDeal | null = null,
  ttlMinutes = DEFAULT_TTL_MINUTES,
): void {
  if (typeof window === "undefined") return;

  try {
    const now = Date.now();
    const payload: CachedOffersPayload = {
      timestamp: now,
      expiresAt: now + ttlMinutes * 60 * 1000,
      matchedDeck,
      activeDeal,
      savedStores,
      ttlMinutes,
    };
    localStorage.setItem(STORAGE_OFFERS_CACHE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn("[OffersCache] Failed to save offline cache:", err);
  }
}

/**
 * Loads the last known cached special offers from localStorage.
 * If strictlyExpired is false, returns cached offers even if slightly past TTL
 * when running without an active internet connection.
 */
export function loadSpecialOffersCache(
  allowGracePeriodIfOffline = true,
): CachedOffersPayload | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_OFFERS_CACHE_KEY);
    if (!raw) return null;

    const payload = JSON.parse(raw) as CachedOffersPayload;
    if (!payload || !Array.isArray(payload.matchedDeck)) return null;

    const now = Date.now();
    const isPastTtl = now > payload.expiresAt;

    // If online and expired, purge
    if (isPastTtl && !allowGracePeriodIfOffline && navigator.onLine) {
      localStorage.removeItem(STORAGE_OFFERS_CACHE_KEY);
      return null;
    }

    return payload;
  } catch (err) {
    console.warn("[OffersCache] Failed to parse offline cache:", err);
    return null;
  }
}

/**
 * Clears the local storage special offers cache
 */
export function clearSpecialOffersCache(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_OFFERS_CACHE_KEY);
  } catch {
    // ignore
  }
}
