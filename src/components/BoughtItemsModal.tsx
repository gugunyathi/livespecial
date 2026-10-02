import { useState } from "react";
import type { Store } from "@/lib/acn-data";

export interface BoughtItem {
  id: string;
  store: Store;
  item: string;
  price: number;
  open: number;
  boughtAt: number;
  qrToken: string;
}

interface BoughtItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  boughtItems: BoughtItem[];
  onClearReceipt?: (id: string) => void;
}

export function BoughtItemsModal({
  isOpen,
  onClose,
  boughtItems,
  onClearReceipt,
}: BoughtItemsModalProps) {
  const [selectedVoucher, setSelectedVoucher] = useState<BoughtItem | null>(null);

  if (!isOpen) return null;

  const totalSpent = boughtItems.reduce((sum, item) => sum + item.price, 0);
  const totalSaved = boughtItems.reduce((sum, item) => sum + (item.open - item.price), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <div
        className="glass relative w-full max-w-lg max-h-[85dvh] flex flex-col rounded-3xl border border-border/80 shadow-2xl overflow-hidden animate-slideup"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border/60 relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-accent/20 text-accent border border-accent/30 font-bold text-lg shadow-amber">
              🛍️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">Bought & Claimed Items</h3>
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-mono font-bold text-accent">
                  {boughtItems.length} items
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Digital QR discount vouchers ready for checkout
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

        {/* Financial Summary Strip */}
        {boughtItems.length > 0 && (
          <div className="bg-muted/30 px-5 py-3 border-b border-border/40 flex items-center justify-between text-xs font-mono shrink-0">
            <div>
              <span className="text-muted-foreground">Total Spent: </span>
              <strong className="text-foreground">R{totalSpent.toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">Saved: </span>
              <strong className="text-accent font-bold">R{totalSaved.toLocaleString()}</strong>
            </div>
          </div>
        )}

        {/* Voucher Detail Modal Overlay if item is selected */}
        {selectedVoucher ? (
          <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center text-center space-y-4 animate-fade-in">
            <button
              onClick={() => setSelectedVoucher(null)}
              className="self-start text-xs font-mono text-primary flex items-center gap-1 hover:underline mb-2 cursor-pointer"
            >
              ← Back to all purchases
            </button>

            <div className="grid h-16 w-16 place-items-center rounded-3xl bg-accent/15 border border-accent/40 text-3xl shadow-amber">
              {selectedVoucher.store.icon}
            </div>

            <div>
              <h4 className="text-lg font-bold text-foreground">{selectedVoucher.item}</h4>
              <p className="text-xs text-muted-foreground">
                {selectedVoucher.store.name} · {selectedVoucher.store.dist}m away
              </p>
            </div>

            {/* Simulated High-Contrast QR Code */}
            <div className="rounded-2xl bg-white p-4 shadow-xl border-4 border-accent/30 inline-block my-2">
              <div className="w-36 h-36 bg-slate-900 rounded-lg p-2 flex flex-col justify-between items-center text-white">
                <div className="w-full flex justify-between">
                  <div className="w-7 h-7 bg-white p-1 rounded-sm">
                    <div className="w-full h-full bg-slate-900" />
                  </div>
                  <div className="w-7 h-7 bg-white p-1 rounded-sm">
                    <div className="w-full h-full bg-slate-900" />
                  </div>
                </div>
                <div className="font-mono text-[9px] text-center tracking-widest text-emerald-400 font-bold">
                  AUTOCOM · VERIFIED
                </div>
                <div className="w-full flex justify-between">
                  <div className="w-7 h-7 bg-white p-1 rounded-sm">
                    <div className="w-full h-full bg-slate-900" />
                  </div>
                  <div className="w-7 h-7 bg-white flex items-center justify-center text-slate-900 font-bold text-[8px]">
                    QR
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-muted/60 border border-border p-3 w-full max-w-sm text-left font-mono text-xs space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Voucher Token:</span>
                <span className="text-primary font-bold">{selectedVoucher.qrToken}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Settled Price:</span>
                <span className="text-accent font-bold">
                  R{selectedVoucher.price} (was R{selectedVoucher.open})
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Claimed At:</span>
                <span className="text-foreground">
                  {new Date(selectedVoucher.boughtAt).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground max-w-xs">
              Present this digital token at {selectedVoucher.store.name} checkout counter for
              instant deal verification.
            </p>
          </div>
        ) : (
          /* List of Bought Items */
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
            {boughtItems.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-muted/40 text-3xl">
                  🛍️
                </div>
                <h4 className="text-base font-bold text-foreground">No Bought Items Yet</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  Accept deals directly on the sphere or buy offers from your{" "}
                  <strong>Parking Lot</strong> to issue verified digital discount QR tokens.
                </p>
              </div>
            ) : (
              boughtItems.map((item) => {
                const discount = Math.round((1 - item.price / item.open) * 100);

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border/80 bg-muted/40 p-4 hover:border-accent/50 transition-all shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl shrink-0">{item.store.icon}</span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-foreground truncate">
                            {item.item}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.store.name} · {item.store.dist}m away
                          </p>
                        </div>
                      </div>

                      <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-[11px] font-mono font-bold text-emerald-400 shrink-0">
                        -{discount}% OFF
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between border-t border-border/30 pt-2.5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-accent">R{item.price}</span>
                        <span className="text-xs text-muted-foreground line-through">
                          R{item.open}
                        </span>
                      </div>

                      <div className="font-mono text-[10px] text-muted-foreground">
                        {new Date(item.boughtAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedVoucher(item)}
                        className="bg-cta flex-1 min-h-[38px] rounded-xl py-1.5 px-3 text-xs font-bold text-accent-foreground shadow-amber transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Show QR Voucher</span>
                        <span>📱</span>
                      </button>

                      {onClearReceipt && (
                        <button
                          onClick={() => onClearReceipt(item.id)}
                          className="rounded-xl border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title="Archive Receipt"
                        >
                          Archive
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
