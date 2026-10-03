import { useState, useRef, useEffect, useCallback } from "react";
import type { MatchedDeal } from "@/components/DealMatchPopup";

interface MatchedDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: MatchedDeal[];
  onBuy: (deal: MatchedDeal) => void;
  onPark: (deal: MatchedDeal) => void;
  onDiscard: (dealId: string) => void;
}

export function MatchedDeckModal({
  isOpen,
  onClose,
  deck,
  onBuy,
  onPark,
  onDiscard,
}: MatchedDeckModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nowTime, setNowTime] = useState(Date.now());

  // Real-time ticking for live expiration countdown & progress bar
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setNowTime(Date.now()), 500);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Swipe gesture tracking state
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // Keep index in bounds when cards are removed
  useEffect(() => {
    if (currentIndex >= deck.length && deck.length > 0) {
      setCurrentIndex(deck.length - 1);
    }
  }, [deck.length, currentIndex]);

  const currentDeal = deck[currentIndex];

  // Dynamic special offer expiration calculation
  const totalDuration = currentDeal?.total || 465;
  const timeLeft = currentDeal
    ? Math.max(0, Math.round((currentDeal.expires - nowTime) / 1000))
    : 0;
  const progressPercent = currentDeal
    ? Math.min(100, Math.max(0, (timeLeft / totalDuration) * 100))
    : 0;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const isCritical = timeLeft < 60;
  const isUrgent = timeLeft < 180;

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setDragOffset({ x: dx, y: dy });
  };

  const handlePointerUp = useCallback(() => {
    if (!isDragging || !currentDeal) {
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
      return;
    }

    const { x, y } = dragOffset;
    const threshold = 90;

    if (x > threshold) {
      // Swiped Right -> BUY
      onBuy(currentDeal);
    } else if (x < -threshold) {
      // Swiped Left -> PARK
      onPark(currentDeal);
    } else if (y > threshold) {
      // Swiped Down -> DISCARD
      onDiscard(currentDeal.store.id);
    }

    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    dragStartRef.current = null;
  }, [isDragging, currentDeal, dragOffset, onBuy, onPark, onDiscard]);

  if (!isOpen) return null;

  // Swipe intent indicator helper
  const swipeAction =
    dragOffset.x > 70 ? "buy" : dragOffset.x < -70 ? "park" : dragOffset.y > 70 ? "discard" : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="matched-deck-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass relative w-full max-w-sm sm:max-w-md max-h-[90dvh] flex flex-col rounded-3xl border border-accent/40 bg-[#0c101c]/98 shadow-2xl overflow-hidden text-foreground animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-accent/20 text-accent border border-accent/30 font-bold text-lg shadow-amber">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="matched-deck-title" className="text-base sm:text-lg font-bold text-white">
                  Matched Deals Deck
                </h2>
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-mono font-bold text-accent">
                  {deck.length} {deck.length === 1 ? "Deal" : "Deals"}
                </span>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground">
                Scroll, or swipe right to Buy · left to Park · down to Discard
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors text-sm cursor-pointer"
            aria-label="Close Matched Deck"
          >
            ✕
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col justify-between">
          {deck.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <span className="text-5xl">🃏</span>
              <p className="text-sm font-bold text-white">Matched Deck is Empty</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                All matched deals have been acted upon. Sweep with your phone or tap Scan to
                discover new deals!
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-teal hover:opacity-95 transition-opacity cursor-pointer"
              >
                Return to 3D Stream
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Deck Navigation Strip */}
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-white"
                >
                  ◀ Prev
                </button>
                <span className="font-extrabold text-accent">
                  Card {currentIndex + 1} of {deck.length}
                </span>
                <button
                  disabled={currentIndex === deck.length - 1}
                  onClick={() => setCurrentIndex((prev) => Math.min(deck.length - 1, prev + 1))}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-white"
                >
                  Next ▶
                </button>
              </div>

              {/* Swipable Card Canvas */}
              {currentDeal && (
                <div
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="relative touch-none select-none cursor-grab active:cursor-grabbing transition-transform"
                  style={{
                    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.05}deg)`,
                  }}
                >
                  {/* Swipe Action Visual Overlays */}
                  {swipeAction === "buy" && (
                    <div className="absolute inset-0 z-30 rounded-3xl bg-accent/30 border-2 border-accent backdrop-blur-sm flex flex-col items-center justify-center text-accent font-bold animate-fade-in pointer-events-none p-4 text-center">
                      <span className="text-4xl animate-bounce">🛍️</span>
                      <p className="mt-1 font-mono text-sm uppercase tracking-widest text-accent font-extrabold">
                        Release to Buy Now
                      </p>
                    </div>
                  )}

                  {swipeAction === "park" && (
                    <div className="absolute inset-0 z-30 rounded-3xl bg-primary/30 border-2 border-primary backdrop-blur-sm flex flex-col items-center justify-center text-primary font-bold animate-fade-in pointer-events-none p-4 text-center">
                      <span className="text-4xl animate-bounce">🅿️</span>
                      <p className="mt-1 font-mono text-sm uppercase tracking-widest text-primary font-extrabold">
                        Release to Park in Lot
                      </p>
                    </div>
                  )}

                  {swipeAction === "discard" && (
                    <div className="absolute inset-0 z-30 rounded-3xl bg-destructive/30 border-2 border-destructive backdrop-blur-sm flex flex-col items-center justify-center text-destructive font-bold animate-fade-in pointer-events-none p-4 text-center">
                      <span className="text-4xl animate-bounce">🗑️</span>
                      <p className="mt-1 font-mono text-sm uppercase tracking-widest text-destructive font-extrabold">
                        Release to Discard
                      </p>
                    </div>
                  )}

                  {/* Main Card Container */}
                  <div className="rounded-3xl border border-white/20 bg-gradient-to-b from-[#141929] to-[#0c101c] p-4 sm:p-5 shadow-2xl">
                    {/* Item Image Banner */}
                    {currentDeal.store.image && (
                      <div className="relative h-36 sm:h-40 w-full overflow-hidden rounded-2xl border border-white/15 shadow-inner group">
                        <img
                          src={currentDeal.store.image}
                          alt={currentDeal.store.item}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c101c] via-transparent to-black/25" />
                        {currentDeal.store.specialBadge && (
                          <span className="absolute top-2 left-2 rounded-full bg-accent text-accent-foreground font-mono text-[9px] font-black px-2 py-0.5 shadow-md">
                            ⚡ {currentDeal.store.specialBadge}
                          </span>
                        )}
                        <span className="absolute bottom-2 right-2 rounded-lg bg-black/75 backdrop-blur-md px-2 py-0.5 font-mono text-[9.5px] text-white border border-white/15">
                          {currentDeal.store.dist}m away
                        </span>
                      </div>
                    )}

                    {/* Item Header */}
                    <div className="mt-3 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-white truncate">
                          {currentDeal.store.item}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                          <span>{currentDeal.store.icon}</span>
                          <span className="font-semibold text-white/90">
                            {currentDeal.store.name}
                          </span>
                          <span>·</span>
                          <span className="text-primary font-mono">{currentDeal.store.cat}</span>
                        </p>
                      </div>

                      <div className="text-2xl place-items-center rounded-2xl bg-white/5 p-2 border border-white/10 shrink-0">
                        {currentDeal.store.icon}
                      </div>
                    </div>

                    {/* Dynamic Special Offer Countdown Timer & Visual Progress Bar */}
                    <div className="mt-3 rounded-2xl bg-black/45 border border-white/10 p-2.5 sm:p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm ${isCritical ? "animate-bounce" : ""}`}>
                            {isCritical ? "🔥" : "⏳"}
                          </span>
                          <span className="text-muted-foreground font-semibold text-[10.5px]">
                            {timeLeft === 0 ? "Special Expired" : "Offer Expiration Window:"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className={`font-black tracking-wider text-xs px-2 py-0.5 rounded-md ${
                              isCritical
                                ? "bg-rose-500/25 text-rose-400 border border-rose-500/40 animate-pulse"
                                : isUrgent
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {timeFormatted}
                          </span>
                          <span className="text-[10px] text-muted-foreground">left</span>
                        </div>
                      </div>

                      {/* Visual Depleting Progress Bar */}
                      <div className="relative h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-linear ${
                            isCritical
                              ? "bg-gradient-to-r from-rose-500 to-red-600 shadow-[0_0_10px_rgba(244,63,94,0.7)]"
                              : isUrgent
                                ? "bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                                : "bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                          <span>Dynamic Pricing Mesh</span>
                        </span>
                        <span
                          className={
                            isCritical
                              ? "text-rose-400 font-bold"
                              : isUrgent
                                ? "text-amber-400 font-semibold"
                                : "text-emerald-400 font-semibold"
                          }
                        >
                          {isCritical
                            ? "⚡ Ending shortly!"
                            : `${Math.round(progressPercent)}% time remaining`}
                        </span>
                      </div>
                    </div>

                    {/* Pricing Comparison */}
                    <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-white/10">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold text-accent">
                          R{currentDeal.price}
                        </span>
                        <span className="text-xs text-muted-foreground line-through">
                          R{currentDeal.store.open}
                        </span>
                      </div>

                      <span className="rounded-md bg-accent/20 px-2 py-0.5 font-mono text-xs font-bold text-accent">
                        -
                        {Math.round(
                          ((currentDeal.store.open - currentDeal.price) / currentDeal.store.open) *
                            100,
                        )}
                        % OFF
                      </span>
                    </div>

                    {/* Hint overlay */}
                    <p className="mt-2 text-center text-[9px] font-mono text-muted-foreground">
                      ⇄ Drag left to Park · Drag right to Buy · Drag down to Discard
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons Row */}
              {currentDeal && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button
                    onClick={() => onDiscard(currentDeal.store.id)}
                    className="py-2.5 px-2 rounded-2xl border border-white/15 bg-white/5 hover:bg-destructive/20 hover:border-destructive text-muted-foreground hover:text-destructive text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>🗑️</span>
                    <span>Discard</span>
                  </button>

                  <button
                    onClick={() => onPark(currentDeal)}
                    className="py-2.5 px-2 rounded-2xl border border-primary/40 bg-primary/15 hover:bg-primary/25 text-primary text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1 shadow-teal"
                  >
                    <span>🅿️</span>
                    <span>Park in Lot</span>
                  </button>

                  <button
                    onClick={() => onBuy(currentDeal)}
                    className="py-2.5 px-2 rounded-2xl border border-accent/40 bg-accent text-accent-foreground hover:opacity-95 text-xs font-mono font-black transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1 shadow-amber"
                  >
                    <span>🛍️</span>
                    <span>Buy Now</span>
                  </button>
                </div>
              )}

              {/* Dot Indicators */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {deck.map((d, idx) => (
                  <button
                    key={d.store.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === currentIndex
                        ? "w-6 bg-accent shadow-[0_0_6px_var(--accent)]"
                        : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                    title={`View ${d.store.name}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
