import { useState, useEffect } from "react";
import type { Store } from "@/lib/acn-data";

export interface ParkedOffer {
  id: string;
  store: Store;
  price: number;
  counter: number;
  open: number;
  expires: number;
  parkedAt: number;
}

interface ParkingLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  parkedOffers: ParkedOffer[];
  onClaimAndBuy: (offer: ParkedOffer) => void;
  onRemoveOffer: (id: string) => void;
}

export function ParkingLotModal({
  isOpen,
  onClose,
  parkedOffers,
  onClaimAndBuy,
  onRemoveOffer,
}: ParkingLotModalProps) {
  const [nowTime, setNowTime] = useState(Date.now());

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setNowTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const totalParkedValue = parkedOffers.reduce((sum, o) => sum + o.price, 0);
  const totalParkedSavings = parkedOffers.reduce((sum, o) => sum + (o.open - o.price), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <div
        className="glass relative w-full max-w-lg max-h-[85dvh] flex flex-col rounded-3xl border border-border/80 shadow-2xl overflow-hidden animate-slideup"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border/60 relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/20 text-primary border border-primary/30 font-bold text-lg shadow-teal">
              🅿️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">Parking Lot</h3>
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-mono font-bold text-primary">
                  {parkedOffers.length} held
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Locked-in negotiated prices held for you
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Summary Banner if has items */}
        {parkedOffers.length > 0 && (
          <div className="bg-muted/30 px-5 py-3 border-b border-border/40 flex items-center justify-between text-xs font-mono shrink-0">
            <span className="text-muted-foreground">Total locked value:</span>
            <div className="flex items-center gap-3">
              <span className="text-foreground font-bold">
                R{totalParkedValue.toLocaleString()}
              </span>
              <span className="text-accent font-semibold">
                (Save R{totalParkedSavings.toLocaleString()})
              </span>
            </div>
          </div>
        )}

        {/* List of Parked Offers */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {parkedOffers.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-muted/40 text-3xl">
                🅿️
              </div>
              <h4 className="text-base font-bold text-foreground">Your Parking Lot is Empty</h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                When an AI agent deal appears on the sphere, tap <strong>"Park in Lot"</strong> to
                hold the negotiated discount without buying right away.
              </p>
            </div>
          ) : (
            parkedOffers.map((offer) => {
              const secondsLeft = Math.max(0, Math.round((offer.expires - nowTime) / 1000));
              const isExpired = secondsLeft <= 0;
              const discountPercent = Math.round((1 - offer.price / offer.open) * 100);
              const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
              const ss = String(secondsLeft % 60).padStart(2, "0");

              return (
                <div
                  key={offer.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    isExpired
                      ? "border-border/40 bg-muted/20 opacity-60"
                      : "border-border/80 bg-muted/40 hover:border-primary/50 shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl shrink-0">{offer.store.icon}</span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-foreground truncate">
                          {offer.store.item}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {offer.store.name} · {offer.store.dist}m away
                        </p>
                      </div>
                    </div>

                    <span className="rounded-lg bg-accent/20 px-2 py-0.5 text-[11px] font-mono font-bold text-accent shrink-0">
                      -{discountPercent}% OFF
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-extrabold text-accent">R{offer.price}</span>
                      <span className="text-xs text-muted-foreground line-through">
                        R{offer.open}
                      </span>
                    </div>

                    <div className="font-mono text-xs text-right">
                      {isExpired ? (
                        <span className="text-destructive font-semibold">Expired</span>
                      ) : (
                        <span className="text-muted-foreground">
                          Holds for:{" "}
                          <strong className="text-foreground">
                            {mm}:{ss}
                          </strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-border/40">
                    <button
                      onClick={() => onClaimAndBuy(offer)}
                      disabled={isExpired}
                      className="bg-cta flex-1 min-h-[40px] rounded-xl py-2 px-3 text-xs font-bold text-accent-foreground shadow-amber transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Claim & Buy Now</span>
                      <span>🛍️</span>
                    </button>
                    <button
                      onClick={() => onRemoveOffer(offer.id)}
                      className="rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors cursor-pointer"
                      title="Remove from Parking Lot"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
