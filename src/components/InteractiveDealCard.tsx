import { useState, useRef, useEffect, useCallback } from "react";
import type { Store } from "@/lib/acn-data";

export interface MatchedDeal {
  store: Store;
  price: number;
  counter: number;
  expires: number;
  total: number;
}

interface InteractiveDealCardProps {
  deal: MatchedDeal;
  timeLeft: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  deckAlignment?: { x: number; y: number; zIndex: number } | null;
  onPark: () => void;
  onBuy: () => void;
  onRelease?: () => void;
  onDismiss: () => void;
}

// Safe haptic feedback trigger helper
function triggerHaptic(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors if blocked by browser policy
    }
  }
}

export function InteractiveDealCard({
  deal,
  timeLeft,
  isExpanded: controlledExpanded,
  onToggleExpand: controlledToggleExpand,
  deckAlignment,
  onPark,
  onBuy,
  onRelease,
  onDismiss,
}: InteractiveDealCardProps) {
  // Drag & position state
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeAction, setSwipeAction] = useState<"park" | "buy" | "release" | null>(null);

  // Size scale & internal expanded state fallback
  const [internalExpanded, setInternalExpanded] = useState<boolean>(false);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  // Sync position if deckAlignment is provided
  useEffect(() => {
    if (deckAlignment) {
      setPos({ x: deckAlignment.x, y: deckAlignment.y });
    }
  }, [deckAlignment]);

  // Gesture tracking refs
  const cardRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTapRef = useRef<number>(0);
  const lastSwipeStateRef = useRef<"park" | "buy" | "release" | null>(null);

  const SWIPE_X_THRESHOLD = 90;
  const SWIPE_UP_THRESHOLD = -80;

  // Toggle expanded size with rich tactile feedback
  const toggleSize = useCallback(() => {
    if (controlledToggleExpand) {
      controlledToggleExpand();
    } else {
      setInternalExpanded((prev) => !prev);
    }
    triggerHaptic(isExpanded ? [20, 30, 20] : [30, 50, 40]);
  }, [controlledToggleExpand, isExpanded]);

  // Keyboard controls: ArrowLeft (Park), ArrowRight (Buy), ArrowUp / Escape (Release / Dismiss), Space (Size)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "p") {
        e.preventDefault();
        triggerHaptic([40, 60]);
        onPark();
      } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "b" || e.key === "Enter") {
        e.preventDefault();
        triggerHaptic([50, 30, 90]);
        onBuy();
      } else if (e.key === " " || e.key.toLowerCase() === "z") {
        e.preventDefault();
        toggleSize();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        triggerHaptic([30, 40, 50]);
        if (onRelease) onRelease();
        else onDismiss();
      } else if (e.key === "Escape") {
        e.preventDefault();
        triggerHaptic(20);
        onDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onPark, onBuy, onRelease, onDismiss, toggleSize]);

  // Pointer / Touch / Mouse drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;

    // Check for double tap
    const now = Date.now();
    if (now - lastTapRef.current < 340) {
      toggleSize();
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;

    // Don't drag if clicking buttons or links directly
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
      if (onRelease) onRelease();
      else onDismiss();
    } else if (totalDx < -SWIPE_X_THRESHOLD) {
      triggerHaptic([40, 60, 80]);
      onPark();
    } else if (totalDx > SWIPE_X_THRESHOLD) {
      triggerHaptic([50, 40, 100, 40, 120]);
      onBuy();
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

  // Format time remaining
  const mm = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")}`;
  const percentLeft = Math.max(0, Math.min(100, (timeLeft / deal.total) * 100));

  // Walking estimate
  const walkingSeconds = Math.max(12, Math.round(deal.store.dist * 3.2));
  const rssiValue = -(42 + (deal.store.dist % 24));
  const discountAmount = deal.store.open - deal.price;
  const discountPercent = Math.round((1 - deal.price / deal.store.open) * 100);

  // Dynamic transform
  const totalX = pos.x + dragOffset.x;
  const totalY = pos.y + dragOffset.y;
  const rotation = dragOffset.x * 0.05 - (dragOffset.y < 0 ? dragOffset.y * 0.02 : 0);

  return (
    <aside
      ref={cardRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={toggleSize}
      style={{
        transform: `translate3d(${totalX}px, ${totalY}px, 0) scale(${isExpanded ? 1.05 : 1}) rotate(${rotation}deg)`,
        transformOrigin: "center center",
        touchAction: "none",
        zIndex: deckAlignment ? deckAlignment.zIndex : isDragging ? 100 : isExpanded ? 90 : 50,
      }}
      className={`glass fixed rounded-3xl p-4 sm:p-5 shadow-2xl transition-all duration-300 select-none cursor-grab active:cursor-grabbing border ${
        swipeAction === "release"
          ? "border-secondary bg-secondary/25 ring-4 ring-secondary/40"
          : swipeAction === "park"
            ? "border-primary bg-primary/20 ring-4 ring-primary/30"
            : swipeAction === "buy"
              ? "border-accent bg-accent/20 ring-4 ring-accent/30"
              : isExpanded
                ? "border-primary/80 shadow-teal ring-2 ring-primary/30 bg-background/95 w-[92vw] sm:w-[440px] max-w-[460px]"
                : "border-accent/50 shadow-amber bg-background/90 w-[92vw] sm:w-[375px]"
      } bottom-24 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-28 md:right-8 md:top-24 md:bottom-auto backdrop-blur-xl max-h-[85vh] overflow-y-auto`}
    >
      {/* Visual Swipe Direction Indicators */}
      {swipeAction === "release" && (
        <div className="absolute inset-0 z-30 rounded-3xl bg-secondary/30 backdrop-blur-sm flex flex-col items-center justify-center text-secondary font-bold animate-fade-in pointer-events-none p-4 text-center">
          <span className="text-4xl animate-bounce">↩️</span>
          <p className="mt-2 font-mono text-sm uppercase tracking-widest text-secondary font-extrabold">
            Release to Carousel
          </p>
          <p className="text-xs text-secondary/80">Dismiss back to 3D radar stream</p>
        </div>
      )}

      {swipeAction === "park" && (
        <div className="absolute inset-0 z-30 rounded-3xl bg-primary/30 backdrop-blur-sm flex flex-col items-center justify-center text-primary font-bold animate-fade-in pointer-events-none p-4 text-center">
          <span className="text-4xl animate-bounce">🅿️</span>
          <p className="mt-2 font-mono text-sm uppercase tracking-widest text-primary font-extrabold">
            Release to Park in Lot
          </p>
          <p className="text-xs text-primary/80">Save for later checkout</p>
        </div>
      )}

      {swipeAction === "buy" && (
        <div className="absolute inset-0 z-30 rounded-3xl bg-accent/30 backdrop-blur-sm flex flex-col items-center justify-center text-accent font-bold animate-fade-in pointer-events-none p-4 text-center">
          <span className="text-4xl animate-bounce">🛍️</span>
          <p className="mt-2 font-mono text-sm uppercase tracking-widest text-accent font-extrabold">
            Release to Accept & Buy
          </p>
          <p className="text-xs text-accent/80">Claim instant voucher</p>
        </div>
      )}

      {/* Header & Expanded State Indicator */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent animate-ping" />
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent font-bold">
            {isExpanded ? "⚡ Deal Details (Expanded)" : "⚡ Deal Matched"}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {/* Zoom / Expanded Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSize();
            }}
            className="h-7 px-2.5 flex items-center justify-center gap-1 rounded-full text-[10px] font-mono border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
            title="Double-tap or tap to toggle expanded view"
          >
            <span>{isExpanded ? "▲ Collapse" : "▼ Expand Specs"}</span>
          </button>

          {/* Dismiss / Release Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic(20);
              onDismiss();
            }}
            className="h-7 w-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
            aria-label="Dismiss deal"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Primary Item details */}
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-foreground truncate">
            {deal.store.item}
          </h2>
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
            <span>{deal.store.icon}</span>
            <span className="font-semibold text-foreground/90">{deal.store.name}</span>
            <span>·</span>
            <span className="text-primary font-mono">{deal.store.dist}m away</span>
          </p>
        </div>
        <div className="text-2xl place-items-center rounded-2xl bg-muted/40 p-2 border border-border/50 shrink-0 shadow-sm">
          {deal.store.icon}
        </div>
      </div>

      {/* Pricing comparison */}
      <div className="mt-3 flex items-baseline gap-2.5">
        <span className="text-2xl sm:text-3xl font-extrabold text-accent">R{deal.price}</span>
        <span className="text-xs text-muted-foreground line-through">R{deal.store.open}</span>
        <span className="ml-auto rounded-md bg-accent/20 px-2.5 py-0.5 font-mono text-[11px] font-bold text-accent">
          -{discountPercent}% OFF (Save R{discountAmount})
        </span>
      </div>

      {/* Countdown timer bar */}
      <div className="mt-2.5">
        <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
          <span>Lock Expiry Timer</span>
          <span className="text-foreground font-bold tabular-nums">{mm} remaining</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted/60">
          <div
            className="h-full bg-cta transition-[width] duration-300"
            style={{ width: `${percentLeft}%` }}
          />
        </div>
      </div>

      {/* EXPANDED STATE SPECIFIC DETAILS (Revealed on Double-Tap / Expand) */}
      {isExpanded && (
        <div className="mt-3.5 space-y-3 pt-3 border-t border-border/70 animate-fade-in text-left">
          {/* Section 1: Item Specifications */}
          <div className="rounded-2xl bg-muted/30 border border-border/60 p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-primary font-bold">
              <span>📋 Item Specifications</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                SKU-{deal.store.id.toUpperCase()}-2026
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <p className="text-[10px] text-muted-foreground">Category & Tag</p>
                <p className="font-medium text-foreground truncate">
                  {deal.store.cat} · #{deal.store.tag}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Perimeter Inventory</p>
                <p className="font-medium text-emerald-400">3 units in stock</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Settlement Protocol</p>
                <p className="font-mono text-foreground">AutoCom-FIDO2</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Biometric Enclave</p>
                <p className="font-mono text-primary">Signed & Verified ✓</p>
              </div>
            </div>
          </div>

          {/* Section 2: Shop Distance & Walking Spatial Telemetry */}
          <div className="rounded-2xl bg-muted/30 border border-border/60 p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-accent font-bold">
              <span>📍 Proximity & Walking ETA</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                Beacon RSSI {rssiValue} dBm
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <p className="text-[10px] text-muted-foreground">Linear Radial Distance</p>
                <p className="font-mono font-bold text-foreground">{deal.store.dist} meters away</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Estimated Walking Time</p>
                <p className="font-mono font-bold text-accent">~{walkingSeconds} seconds</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Indoor Mall Location</p>
                <p className="font-medium text-foreground truncate">
                  Level 1 · Aisle {(deal.store.dist % 4) + 1}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Broadcast Status</p>
                <p className="font-mono text-emerald-400">Active Handshake ⚡</p>
              </div>
            </div>
          </div>

          {/* Section 3: Negotiation Telemetry Breakdown */}
          <div className="rounded-2xl bg-muted/30 border border-border/60 p-3 space-y-1">
            <p className="text-[11px] font-mono text-secondary font-bold">
              ⚡ 3-Stage Price Negotiation Log
            </p>
            <div className="font-mono text-[10px] space-y-1 pt-1">
              <div className="flex justify-between text-muted-foreground">
                <span>1. Merchant Opening:</span>
                <span className="text-foreground">R{deal.store.open}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>2. Agent Counter-Offer:</span>
                <span className="text-primary font-bold">R{deal.counter}</span>
              </div>
              <div className="flex justify-between text-muted-foreground border-t border-border/40 pt-1">
                <span>3. Final Settlement:</span>
                <span className="text-accent font-extrabold text-[11px]">
                  R{deal.price} (-{discountPercent}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Non-expanded Negotiation Summary Log */}
      {!isExpanded && (
        <ol className="mt-2.5 space-y-1 border-l border-border/80 pl-2.5 font-mono text-[10px] sm:text-[11px]">
          <li className="text-muted-foreground truncate">
            Shop opened: <span className="text-foreground">R{deal.store.open}</span>
          </li>
          <li className="text-muted-foreground truncate">
            Agent counter: <span className="text-primary font-semibold">R{deal.counter}</span>
          </li>
          <li className="text-muted-foreground truncate">
            Settlement: <span className="text-accent font-bold">R{deal.price}!</span>
          </li>
        </ol>
      )}

      {/* Gesture Controls Guide Chip */}
      <div className="mt-3 py-1 px-2 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-[9.5px] font-mono text-muted-foreground">
        <span className="text-primary">← Swipe: Park</span>
        <span className="text-secondary">↑ Up: Return</span>
        <span className="text-accent">Buy →</span>
      </div>

      {/* Dual Action Buttons */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic([40, 60]);
            onPark();
          }}
          className="flex-1 min-h-[44px] rounded-2xl border border-primary/50 bg-primary/10 hover:bg-primary/20 py-2.5 px-3 text-xs font-bold text-primary transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>🅿️ Park in Lot</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic([50, 30, 90]);
            onBuy();
          }}
          className="bg-cta flex-1 min-h-[44px] rounded-2xl py-2.5 px-3 text-xs font-bold text-accent-foreground shadow-amber transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Accept & Buy</span>
          <span>🛍️</span>
        </button>
      </div>

      {/* Double-tap prompt & Keyboard hint */}
      <div className="mt-2 text-center text-[9px] font-mono text-muted-foreground/80 flex items-center justify-center gap-2">
        <span>👆 Double-tap for {isExpanded ? "summary" : "specs & distance"}</span>
        <span>·</span>
        <span>⌨ ← / → / ↑</span>
      </div>
    </aside>
  );
}
