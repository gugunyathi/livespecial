import { useState, useRef, useEffect, useCallback } from "react";
import type { Store } from "@/lib/acn-data";

interface FloatingDeckCardProps {
  store: Store;
  liveTick: string;
  isBought: boolean;
  isParked: boolean;
  initialPos: { x: number; y: number };
  deckAlignment?: { x: number; y: number; zIndex: number } | null;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onNegotiate: (store: Store) => void;
  onPark: (store: Store) => void;
  onBuy: (store: Store) => void;
  onRelease: (storeId: string) => void;
}

// Safe haptic feedback trigger helper
function triggerHaptic(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors
    }
  }
}

export function FloatingDeckCard({
  store,
  liveTick,
  isBought,
  isParked,
  initialPos,
  deckAlignment,
  isExpanded,
  onToggleExpand,
  onNegotiate,
  onPark,
  onBuy,
  onRelease,
}: FloatingDeckCardProps) {
  // Drag & Position State
  const [pos, setPos] = useState<{ x: number; y: number }>(initialPos);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeAction, setSwipeAction] = useState<"park" | "buy" | "release" | null>(null);

  // Gesture refs
  const cardRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPosRef = useRef<{ x: number; y: number }>({ ...initialPos });
  const lastTapRef = useRef<number>(0);
  const lastSwipeStateRef = useRef<"park" | "buy" | "release" | null>(null);

  const SWIPE_X_THRESHOLD = 85;
  const SWIPE_UP_THRESHOLD = -75;

  // Sync position with auto-deck alignment if set
  useEffect(() => {
    if (deckAlignment) {
      setPos({ x: deckAlignment.x, y: deckAlignment.y });
    }
  }, [deckAlignment]);

  // Pointer / Touch / Mouse drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;

    // Check for double tap to toggle expanded view
    const now = Date.now();
    if (now - lastTapRef.current < 340) {
      onToggleExpand();
      lastTapRef.current = 0;
      triggerHaptic([30, 45, 30]);
      return;
    }
    lastTapRef.current = now;

    // Don't drag if clicking buttons
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;

    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPosRef.current = { ...pos };
    lastSwipeStateRef.current = null;

    triggerHaptic(18);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    setDragOffset({ x: dx, y: dy });

    let currentAction: "park" | "buy" | "release" | null = null;
    if (dy < SWIPE_UP_THRESHOLD) {
      currentAction = "release";
    } else if (dx < -SWIPE_X_THRESHOLD) {
      currentAction = "park";
    } else if (dx > SWIPE_X_THRESHOLD) {
      currentAction = "buy";
    }

    if (currentAction !== lastSwipeStateRef.current) {
      if (currentAction === "park") {
        triggerHaptic([25, 35, 45]);
      } else if (currentAction === "buy") {
        triggerHaptic([35, 25, 60]);
      } else if (currentAction === "release") {
        triggerHaptic([30, 40, 50]);
      } else {
        triggerHaptic(12);
      }
      lastSwipeStateRef.current = currentAction;
      setSwipeAction(currentAction);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    const totalDx = dragOffset.x;
    const totalDy = dragOffset.y;

    if (totalDy < SWIPE_UP_THRESHOLD) {
      triggerHaptic([40, 50, 70]);
      onRelease(store.id);
    } else if (totalDx < -SWIPE_X_THRESHOLD) {
      triggerHaptic([40, 60, 80]);
      onPark(store);
    } else if (totalDx > SWIPE_X_THRESHOLD) {
      triggerHaptic([50, 40, 100, 40, 120]);
      onBuy(store);
    } else {
      if (Math.abs(totalDx) > 10 || Math.abs(totalDy) > 10) {
        triggerHaptic(16);
      }
      setPos({
        x: initialPosRef.current.x + totalDx,
        y: initialPosRef.current.y + totalDy,
      });
      setDragOffset({ x: 0, y: 0 });
      setSwipeAction(null);
      lastSwipeStateRef.current = null;
    }
  };

  const totalX = pos.x + dragOffset.x;
  const totalY = pos.y + dragOffset.y;
  const rotation = dragOffset.x * 0.05 - (dragOffset.y < 0 ? dragOffset.y * 0.02 : 0);

  const walkingSeconds = Math.max(12, Math.round(store.dist * 3.2));
  const rssiValue = -(42 + (store.dist % 24));

  return (
    <div
      ref={cardRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={onToggleExpand}
      style={{
        transform: `translate3d(${totalX}px, ${totalY}px, 0) scale(${isExpanded ? 1.06 : 1}) rotate(${rotation}deg)`,
        transformOrigin: "center center",
        touchAction: "none",
        zIndex: deckAlignment ? deckAlignment.zIndex : isDragging ? 100 : isExpanded ? 90 : 60,
      }}
      className={`fixed rounded-3xl p-3.5 sm:p-4.5 shadow-2xl transition-[box-shadow,background-color,border-color] duration-200 select-none cursor-grab active:cursor-grabbing border ${
        swipeAction === "release"
          ? "border-secondary bg-secondary/30 ring-4 ring-secondary/40"
          : swipeAction === "park"
            ? "border-primary bg-primary/30 ring-4 ring-primary/40"
            : swipeAction === "buy"
              ? "border-accent bg-accent/30 ring-4 ring-accent/40"
              : isExpanded
                ? "border-primary/80 shadow-teal ring-2 ring-primary/30 bg-[#0f1423]/95 w-[90vw] sm:w-[360px]"
                : "border-white/20 shadow-2xl bg-[#0f1423]/95 w-[85vw] sm:w-[310px]"
      } backdrop-blur-2xl`}
    >
      {/* Visual Swipe Direction Indicators */}
      {swipeAction === "release" && (
        <div className="absolute inset-0 z-30 rounded-3xl bg-secondary/35 backdrop-blur-sm flex flex-col items-center justify-center text-secondary font-bold animate-fade-in pointer-events-none p-4 text-center">
          <span className="text-3xl animate-bounce">↩️</span>
          <p className="mt-1.5 font-mono text-xs uppercase tracking-widest text-secondary font-extrabold">
            Release to Carousel
          </p>
          <p className="text-[10px] text-secondary/80">Return card to 3D Orbit</p>
        </div>
      )}

      {swipeAction === "park" && (
        <div className="absolute inset-0 z-30 rounded-3xl bg-primary/35 backdrop-blur-sm flex flex-col items-center justify-center text-primary font-bold animate-fade-in pointer-events-none p-4 text-center">
          <span className="text-3xl animate-bounce">🅿️</span>
          <p className="mt-1.5 font-mono text-xs uppercase tracking-widest text-primary font-extrabold">
            Release to Park
          </p>
          <p className="text-[10px] text-primary/80">Hold in parking lot</p>
        </div>
      )}

      {swipeAction === "buy" && (
        <div className="absolute inset-0 z-30 rounded-3xl bg-accent/35 backdrop-blur-sm flex flex-col items-center justify-center text-accent font-bold animate-fade-in pointer-events-none p-4 text-center">
          <span className="text-3xl animate-bounce">🛍️</span>
          <p className="mt-1.5 font-mono text-xs uppercase tracking-widest text-accent font-extrabold">
            Release to Buy
          </p>
          <p className="text-[10px] text-accent/80">Claim instant voucher</p>
        </div>
      )}

      {/* Card Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative h-2 w-2 rounded-full bg-primary" />
          </span>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary truncate">
            {isExpanded ? "Pulled Deck Card (Expanded)" : "Pulled Deck Card"}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {/* Release back button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic(20);
              onRelease(store.id);
            }}
            className="h-6 px-2 flex items-center justify-center gap-1 rounded-full text-[9px] font-mono border border-border/70 text-muted-foreground hover:text-secondary hover:border-secondary/50 transition-colors cursor-pointer"
            title="Return back to 3D carousel"
          >
            <span>↩ Return</span>
          </button>

          {/* Toggle Expand */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="h-6 w-6 flex items-center justify-center rounded-full text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
            title="Expand or shrink"
          >
            {isExpanded ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {/* Store & Item Info */}
      {store.image && (
        <div className="relative mt-2 h-24 sm:h-28 w-full overflow-hidden rounded-xl border border-white/15 shadow-inner">
          <img
            src={store.image}
            alt={store.item}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1423] via-transparent to-black/30" />
          {store.specialBadge && (
            <span className="absolute top-1.5 left-1.5 rounded-full bg-accent text-accent-foreground font-mono text-[8.5px] font-black px-1.5 py-0.5 shadow-md">
              ⚡ {store.specialBadge}
            </span>
          )}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-foreground truncate">{store.item}</h3>
          <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
            <span>{store.icon}</span>
            <span className="font-semibold text-foreground/90">{store.name}</span>
            <span>·</span>
            <span className="text-primary font-mono">{store.dist}m</span>
          </p>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-muted/40 border border-border/50 text-xl shrink-0 shadow-sm">
          {store.icon}
        </span>
      </div>

      {/* Price & Status Line */}
      <div className="mt-2.5 flex items-baseline justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-xs text-muted-foreground">Price:</span>
          <span className="font-mono text-lg font-extrabold text-foreground">R{store.open}</span>
        </div>
        <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[9px] font-mono font-bold text-primary">
          {isBought ? "Purchased ✓" : isParked ? "Parked 🅿️" : "Ready to Negotiate"}
        </span>
      </div>

      {/* Live Ticker Line */}
      <div className="mt-2 h-4 overflow-hidden rounded-md bg-muted/30 px-1.5 py-0.5 font-mono text-[9px] text-foreground/90">
        <p className="animate-ticker truncate">{liveTick}</p>
      </div>

      {/* EXPANDED TELEMETRY (When Double-Tapped / Expanded) */}
      {isExpanded && (
        <div className="mt-3 space-y-2 pt-2.5 border-t border-border/70 animate-fade-in text-left">
          {/* Specifications */}
          <div className="rounded-xl bg-muted/30 border border-border/60 p-2.5 space-y-1 text-[10px]">
            <div className="flex items-center justify-between font-mono text-primary font-bold">
              <span>📋 Item Specs</span>
              <span className="text-muted-foreground font-normal">
                SKU-{store.id.toUpperCase()}-2026
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <span className="text-muted-foreground">Category: </span>
                <span className="text-foreground font-medium">{store.cat}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Intent Tag: </span>
                <span className="text-foreground font-medium">#{store.tag}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Radial Dist: </span>
                <span className="font-mono text-primary font-bold">{store.dist}m</span>
              </div>
              <div>
                <span className="text-muted-foreground">Walking ETA: </span>
                <span className="font-mono text-accent font-bold">~{walkingSeconds}s</span>
              </div>
            </div>
            <div className="flex justify-between font-mono text-[9px] text-muted-foreground border-t border-border/40 pt-1">
              <span>Beacon Signal: RSSI {rssiValue} dBm</span>
              <span className="text-emerald-400">Micro-Mesh Linked ✓</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-3 flex gap-1.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic([40, 60]);
            onPark(store);
          }}
          className="flex-1 min-h-[38px] rounded-xl border border-primary/50 bg-primary/10 hover:bg-primary/20 py-2 px-2 text-[11px] font-bold text-primary transition-transform active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>🅿️ Park</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic([50, 30, 90]);
            onNegotiate(store);
          }}
          className="bg-cta flex-1 min-h-[38px] rounded-xl py-2 px-2 text-[11px] font-bold text-accent-foreground shadow-amber transition-transform active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>⚡ Negotiate</span>
        </button>
      </div>

      {/* Swipe & Gesture Tips */}
      <div className="mt-2 text-center text-[8.5px] font-mono text-muted-foreground flex items-center justify-between px-1">
        <span>← Park</span>
        <span>↑ Swipe Up to Return</span>
        <span>Buy →</span>
      </div>
    </div>
  );
}
