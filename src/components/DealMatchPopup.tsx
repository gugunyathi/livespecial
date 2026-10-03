import { useEffect, useState } from "react";
import type { Store } from "@/lib/acn-data";

export interface MatchedDeal {
  store: Store;
  price: number;
  counter: number;
  expires: number;
  total: number;
  isHighValue?: boolean;
  isFreeGiveaway?: boolean;
  isPriorityTransitDeal?: boolean;
}

interface DealMatchPopupProps {
  deal: MatchedDeal | null;
  onAutoDismissToDeck: (deal: MatchedDeal) => void;
  onOpenDeck: () => void;
  onDismiss: () => void;
}

export function DealMatchPopup({
  deal,
  onAutoDismissToDeck,
  onOpenDeck,
  onDismiss,
}: DealMatchPopupProps) {
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!deal) {
      setProgress(100);
      return;
    }

    setProgress(100);
    let start = Date.now();
    const duration = 2000; // 2 seconds

    const timer = setInterval(() => {
      if (isHovered) {
        start += 40; // pause progress while hovering
        return;
      }
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (elapsed >= duration) {
        clearInterval(timer);
        // Safe invocation outside setState callback
        onAutoDismissToDeck(deal);
      }
    }, 40);

    return () => clearInterval(timer);
  }, [deal, isHovered, onAutoDismissToDeck]);

  if (!deal) return null;

  const isFree = deal.price === 0 || deal.isFreeGiveaway;
  const discountPercent = isFree
    ? 100
    : Math.max(5, Math.round(((deal.store.open - deal.price) / deal.store.open) * 100));
  const isSuperDeal = discountPercent >= 40 || isFree || deal.isHighValue;

  return (
    <aside
      aria-label="New deal matched notification"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed top-16 right-3 sm:top-20 sm:right-6 z-50 w-[88vw] max-w-[310px] select-none animate-slideup"
    >
      <div
        className={`glass relative rounded-2xl border p-3 shadow-2xl backdrop-blur-2xl overflow-hidden text-foreground ${
          isFree
            ? "border-emerald-500 bg-[#081812]/95 ring-2 ring-emerald-500/60 animate-giveaway-flash"
            : isSuperDeal
              ? "border-rose-500 bg-[#140810]/95 ring-2 ring-rose-500/60 animate-mega-flash"
              : "border-accent bg-[#0c101c]/95 ring-2 ring-accent/60 animate-deal-flash"
        }`}
      >
        {/* Subtle glow accent */}
        <div
          className={`absolute -top-12 -right-12 h-24 w-24 rounded-full blur-xl pointer-events-none ${
            isFree ? "bg-emerald-500/30" : isSuperDeal ? "bg-rose-500/30" : "bg-accent/20"
          }`}
        />

        {/* 2-Second Depleting Progress Bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-white/10">
          <div
            className={`h-full transition-all ease-linear ${
              isFree
                ? "bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                : isSuperDeal
                  ? "bg-gradient-to-r from-rose-500 to-amber-400 shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                  : "bg-accent shadow-[0_0_8px_var(--accent)]"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header Strip */}
        <div className="flex items-center justify-between gap-1 pt-0.5">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isFree ? "bg-emerald-400" : isSuperDeal ? "bg-rose-400" : "bg-accent"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isFree ? "bg-emerald-500" : isSuperDeal ? "bg-rose-500" : "bg-accent"
                }`}
              />
            </span>
            <span
              className={`font-mono text-[9.5px] uppercase tracking-wider font-black ${
                isFree
                  ? "text-emerald-400 animate-pulse"
                  : isSuperDeal
                    ? "text-rose-400 animate-pulse"
                    : "text-accent"
              }`}
            >
              {isFree
                ? "🎁 100% FREE GIVEAWAY!"
                : isSuperDeal
                  ? `🔥 PRIORITY +${discountPercent}% SPECIAL!`
                  : "⚡ Deal Matched!"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="font-mono text-[8.5px] text-muted-foreground">
              {isHovered ? "Paused" : "Saving in 2s"}
            </span>
            <button
              onClick={onDismiss}
              className="h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 text-xs transition-colors cursor-pointer"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Product Image Thumbnail */}
        {deal.store.image && (
          <div className="relative mt-2 h-20 w-full overflow-hidden rounded-xl border border-white/15 shadow-inner">
            <img
              src={deal.store.image}
              alt={deal.store.item}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c101c] via-transparent to-black/30" />
            {deal.store.specialBadge && (
              <span className="absolute top-1 left-1 rounded-full bg-accent text-accent-foreground font-mono text-[8px] font-black px-1.5 py-0.5 shadow-sm">
                ⚡ {deal.store.specialBadge}
              </span>
            )}
            <span className="absolute bottom-1 right-1 rounded-md bg-black/75 px-1.5 py-0.5 font-mono text-[8.5px] text-white border border-white/10">
              {deal.store.dist}m
            </span>
          </div>
        )}

        {/* Item Info & Pricing */}
        <div className="mt-2 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-extrabold text-white truncate leading-tight">
              {deal.store.item}
            </p>
            <p className="text-[10px] text-muted-foreground truncate font-medium flex items-center gap-1 mt-0.5">
              <span>{deal.store.icon}</span>
              <span className="text-white/90 font-semibold">{deal.store.name}</span>
              <span>·</span>
              <span className="text-primary font-mono">{deal.store.cat}</span>
            </p>
          </div>

          <div className="text-right shrink-0">
            <p className="font-extrabold text-accent text-sm sm:text-base leading-tight">
              R{deal.price}
            </p>
            <p className="text-[9px] font-mono text-muted-foreground line-through">
              R{deal.store.open}
            </p>
          </div>
        </div>

        {/* Dynamic Special Offer Expiration Countdown Bar */}
        <div className="mt-2 rounded-xl bg-black/40 border border-white/10 p-2 space-y-1 text-[9.5px] font-mono">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1">
              <span>⏳</span>
              <span>Special Offer Window:</span>
            </span>
            <span className="text-accent font-bold">
              {(() => {
                const sec = Math.max(0, Math.round((deal.expires - Date.now()) / 1000));
                const m = Math.floor(sec / 60);
                const s = sec % 60;
                return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
              })()}{" "}
              left
            </span>
          </div>
          <div className="relative h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-accent transition-all duration-300"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    (Math.max(0, Math.round((deal.expires - Date.now()) / 1000)) /
                      (deal.total || 465)) *
                      100,
                  ),
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
          <span className="rounded-md bg-accent/15 px-1.5 py-0.5 text-[9px] font-bold text-accent">
            -{discountPercent}% OFF
          </span>

          <button
            onClick={() => {
              onAutoDismissToDeck(deal);
              onOpenDeck();
            }}
            className="flex items-center gap-1 text-primary hover:text-white transition-colors cursor-pointer font-bold"
          >
            <span>View in Matched Deck</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
