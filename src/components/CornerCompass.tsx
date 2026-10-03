import { useState } from "react";
import type { Store } from "@/lib/acn-data";
import { formatCardinal, isFacingTarget } from "@/lib/spatial-sensors";

interface CornerCompassProps {
  heading: number; // 0-360 degrees
  facingStore: Store | null;
  stores: Store[];
  outdoor: boolean;
  onTurnLeft?: () => void;
  onTurnRight?: () => void;
  onSelectStore?: (store: Store) => void;
}

export function CornerCompass({
  heading,
  facingStore,
  stores,
  outdoor,
  onTurnLeft,
  onTurnRight,
  onSelectStore,
}: CornerCompassProps) {
  const [expanded, setExpanded] = useState(false);

  // Radius of the mini compass radar in px
  const radarRadius = 24;

  return (
    <aside
      aria-label="Device orientation compass"
      className="fixed bottom-20 left-3 sm:bottom-24 sm:left-5 z-40 select-none animate-slideup"
    >
      <div
        className={`glass rounded-2xl border border-white/20 bg-[#0b0f19]/90 backdrop-blur-2xl shadow-2xl transition-all duration-300 ${
          expanded
            ? "p-3 sm:p-3.5 w-64 sm:w-72"
            : "p-2 sm:p-2.5 flex items-center gap-2.5 hover:border-primary/50"
        }`}
      >
        {/* Compact Clickable Compass Widget */}
        <div
          onClick={() => setExpanded((prev) => !prev)}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Click to view full spatial radar"
        >
          {/* Compass Radar Circle */}
          <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-black/80 border border-white/25 shadow-inner flex items-center justify-center shrink-0 overflow-hidden">
            {/* Field of View Cone (User's ~45° Facing Direction pointing Up) */}
            <div
              className="absolute top-0 inset-x-0 h-1/2 pointer-events-none"
              style={{
                background:
                  "conic-gradient(from 155deg at 50% 100%, transparent 0deg, rgba(34, 211, 238, 0.28) 25deg, rgba(245, 158, 11, 0.35) 45deg, transparent 50deg)",
              }}
            />

            {/* Rotating Compass Ring (True North Needle + Cardinal Points) */}
            <div
              className="absolute inset-0 transition-transform duration-300 pointer-events-none"
              style={{ transform: `rotate(${-heading}deg)` }}
            >
              {/* North Arrow Pointer */}
              <div className="absolute top-0.5 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <span className="h-2 w-0.5 bg-accent rounded-full shadow-[0_0_6px_var(--accent)]" />
                <span className="font-mono text-[7px] font-black text-accent leading-none mt-0.5">
                  N
                </span>
              </div>

              {/* South Marker */}
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 font-mono text-[6.5px] text-muted-foreground/70 leading-none">
                S
              </span>
              {/* East Marker */}
              <span className="absolute right-1 top-1/2 -translate-y-1/2 font-mono text-[6.5px] text-muted-foreground/70 leading-none">
                E
              </span>
              {/* West Marker */}
              <span className="absolute left-1 top-1/2 -translate-y-1/2 font-mono text-[6.5px] text-muted-foreground/70 leading-none">
                W
              </span>

              {/* Crosshair grid lines */}
              <div className="absolute inset-2 border border-white/10 rounded-full" />
              <div className="absolute left-1/2 inset-y-1 w-px bg-white/10 -translate-x-1/2" />
              <div className="absolute top-1/2 inset-x-1 h-px bg-white/10 -translate-y-1/2" />

              {/* Store Blips plotted around compass based on absolute bearing */}
              {stores.map((s) => {
                const rad = ((s.bearing - 90) * Math.PI) / 180;
                // Scale distance into radar radius (max distance is 50m)
                const distRatio = Math.min(1, Math.max(0.35, s.dist / (outdoor ? 50 : 20)));
                const blipDist = radarRadius * distRatio;
                const bx = Math.cos(rad) * blipDist;
                const by = Math.sin(rad) * blipDist;
                const isTarget = facingStore?.id === s.id;

                return (
                  <div
                    key={s.id}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform pointer-events-none"
                    style={{
                      transform: `translate(${bx}px, ${by}px)`,
                    }}
                  >
                    <span
                      className={`block rounded-full transition-all ${
                        isTarget
                          ? "h-2.5 w-2.5 bg-accent ring-2 ring-accent/60 shadow-[0_0_8px_var(--accent)] animate-ping"
                          : "h-1.5 w-1.5 bg-white/70"
                      }`}
                      style={{
                        backgroundColor: isTarget ? "var(--accent)" : "rgba(255,255,255,0.7)",
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Center Pivot Point */}
            <div className="relative h-2 w-2 rounded-full bg-white border border-black shadow-sm z-10" />

            {/* Top Facing Reticle Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1.5 w-1 bg-accent rounded-b-sm shadow-[0_0_6px_var(--accent)] z-20" />
          </div>

          {/* Compact Telemetry Text beside compass */}
          {!expanded && (
            <div className="min-w-0 pr-1">
              <div className="flex items-center gap-1.5 font-mono text-[10px] leading-tight">
                <span className="font-extrabold text-white">{formatCardinal(heading)}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-primary font-bold">{heading}°</span>
              </div>
              <p className="font-mono text-[9px] text-muted-foreground truncate max-w-[125px] sm:max-w-[145px]">
                {facingStore ? (
                  <span className="text-accent font-semibold flex items-center gap-1">
                    <span>🎯</span>
                    <span className="truncate">{facingStore.name}</span>
                  </span>
                ) : (
                  <span>Sweep to aim</span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Expanded Drawer View: Details on why items appear */}
        {expanded && (
          <div className="mt-2.5 space-y-2 border-t border-white/15 pt-2 text-[10px] font-mono animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-semibold">Live Heading:</span>
              <span className="text-accent font-extrabold">
                {formatCardinal(heading)} ({heading}°)
              </span>
            </div>

            {/* Facing Target Explanation */}
            <div className="rounded-xl bg-black/40 border border-white/10 p-2 space-y-1">
              <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                <span>Cone of View:</span>
                <span className="text-emerald-400 font-bold">±26° Facing Arc</span>
              </div>

              {facingStore ? (
                <div className="flex items-start gap-2 pt-1 border-t border-white/10">
                  <span className="text-base shrink-0">{facingStore.icon}</span>
                  <div className="min-w-0">
                    <p className="font-extrabold text-white leading-tight truncate">
                      {facingStore.name}
                    </p>
                    <p className="text-[9px] text-slate-300 truncate">{facingStore.item}</p>
                    <p className="text-[8.5px] text-accent mt-0.5">
                      Bearing: {facingStore.bearing}° · In center of carousel
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-[9px] text-slate-400 italic pt-0.5">
                  Turn phone to face nearby stores and bring their deals into view.
                </p>
              )}
            </div>

            {/* Quick manual turn buttons for testing */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {onTurnLeft && (
                <button
                  onClick={onTurnLeft}
                  className="flex-1 py-1 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-[9.5px] text-white transition-all cursor-pointer"
                >
                  ⟲ -30°
                </button>
              )}
              {onTurnRight && (
                <button
                  onClick={onTurnRight}
                  className="flex-1 py-1 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-[9.5px] text-white transition-all cursor-pointer"
                >
                  +30° ⟳
                </button>
              )}
              <button
                onClick={() => setExpanded(false)}
                className="px-2 py-1 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 text-[9.5px] font-bold cursor-pointer"
              >
                Close ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
