interface OfflineIndicatorProps {
  isOnline: boolean;
  cachedOffersCount: number;
  lastCachedTime?: number | null;
}

export function OfflineIndicator({
  isOnline,
  cachedOffersCount,
  lastCachedTime,
}: OfflineIndicatorProps) {
  if (isOnline) return null;

  const minutesAgo = lastCachedTime
    ? Math.max(0, Math.round((Date.now() - lastCachedTime) / 60000))
    : 0;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-amber-500/95 text-black px-4 py-2 text-xs font-mono font-bold shadow-2xl backdrop-blur-md border border-amber-300 animate-slideup pointer-events-auto"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-60" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-black" />
      </span>
      <span className="truncate">
        Offline Mode · {cachedOffersCount} cached {cachedOffersCount === 1 ? "offer" : "offers"}{" "}
        available
        {minutesAgo > 0 ? ` (${minutesAgo}m ago)` : ""}
      </span>
    </div>
  );
}
