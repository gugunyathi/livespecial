import { useState } from "react";
import { formatCardinal, type SpatialCoordinates } from "@/lib/spatial-sensors";
import type { Store } from "@/lib/acn-data";

interface SpatialCompassHUDProps {
  heading: number;
  facingStore: Store | null;
  outdoor: boolean;
  isLiveSensor: boolean;
  userCoords: SpatialCoordinates;
  onTurnLeft: () => void;
  onTurnRight: () => void;
  onSetHeading: (deg: number) => void;
  onRequestPermission: () => Promise<boolean>;
  permissionStatus: string;
}

export function SpatialCompassHUD({
  heading,
  facingStore,
  outdoor,
  isLiveSensor,
  userCoords,
  onTurnLeft,
  onTurnRight,
  onSetHeading,
  onRequestPermission,
  permissionStatus,
}: SpatialCompassHUDProps) {
  const [showControls, setShowControls] = useState<boolean>(false);

  return (
    <div className="z-30 w-full max-w-xl mx-auto transition-all">
      <div className="glass rounded-2xl p-2 sm:p-2.5 border border-white/20 shadow-2xl backdrop-blur-2xl bg-[#090d19]/90 ring-1 ring-white/10">
        {/* Main Status Strip */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Left: Compass Orientation Dial */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {/* Rotating Mini-Compass Dial */}
            <div
              className="relative grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full bg-black/60 border border-primary/50 shadow-inner shrink-0"
              title={`Compass Heading: ${heading}° (${formatCardinal(heading)})`}
            >
              <span
                className="text-xs sm:text-sm font-bold transition-transform duration-300 inline-block pointer-events-none"
                style={{ transform: `rotate(${-heading}deg)` }}
              >
                🧭
              </span>
              <span className="absolute -top-1 font-mono text-[7px] font-bold text-accent">N</span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5 font-mono text-[9.5px] sm:text-[11px] leading-tight">
                <span className="font-extrabold text-primary">{formatCardinal(heading)}</span>
                <span className="text-muted-foreground">·</span>
                <span className="font-mono text-[9px] sm:text-xs font-semibold text-white truncate">
                  {heading}°
                </span>
                <span className="text-muted-foreground hidden xs:inline">·</span>
                <span className="text-[8.5px] sm:text-[10px] text-muted-foreground font-mono truncate hidden xs:inline">
                  {outdoor ? "Outdoor GPS" : "Indoor BLE"}
                </span>
              </div>
              <p className="font-mono text-[8px] sm:text-[9px] text-muted-foreground truncate">
                {isLiveSensor ? "⚡ Gyro/Compass Active" : "📡 Spatial Heading Mesh"}
              </p>
            </div>
          </div>

          {/* Center/Right: Facing Store Target Badge */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {facingStore ? (
              <div className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-accent/20 border border-accent/60 px-2 sm:px-2.5 py-0.5 sm:py-1 text-accent animate-pulse shadow-amber min-w-0">
                <span className="text-[10px] sm:text-xs">🎯</span>
                <div className="text-left font-mono leading-none min-w-0">
                  <p className="text-[8px] sm:text-[9px] uppercase tracking-wider font-extrabold truncate max-w-[85px] xs:max-w-[120px] sm:max-w-[150px]">
                    {facingStore.name}
                  </p>
                  <p className="text-[7.5px] sm:text-[8px] text-white/90 truncate max-w-[85px] xs:max-w-[120px] sm:max-w-[150px] hidden xs:block">
                    {facingStore.item}
                  </p>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1 font-mono text-[8.5px] text-muted-foreground px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                <span>Turn to face stores</span>
              </div>
            )}

            {/* Quick turn buttons */}
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              <button
                onClick={onTurnLeft}
                className="h-6 sm:h-7 px-1.5 sm:px-2 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-[10px] sm:text-xs font-mono text-white transition-all cursor-pointer"
                title="Turn 30° Left"
              >
                ⟲ -30°
              </button>
              <button
                onClick={onTurnRight}
                className="h-6 sm:h-7 px-1.5 sm:px-2 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-[10px] sm:text-xs font-mono text-white transition-all cursor-pointer"
                title="Turn 30° Right"
              >
                +30° ⟳
              </button>
              <button
                onClick={() => setShowControls((prev) => !prev)}
                className={`h-6 sm:h-7 w-6 sm:w-7 rounded-lg sm:rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-mono transition-all cursor-pointer ${
                  showControls
                    ? "bg-primary text-primary-foreground font-bold shadow-teal"
                    : "bg-white/10 hover:bg-white/20 text-muted-foreground hover:text-white"
                }`}
                title="Toggle Sensor Controls"
                aria-label="Toggle Sensor Controls"
              >
                ⚙
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Manual Orientation Slider & Sensor Calibration Drawer */}
        {showControls && (
          <div className="mt-2.5 pt-2.5 border-t border-white/15 space-y-2 animate-fade-in text-[10px] font-mono">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-semibold">
                Manual Compass Heading Wheel:
              </span>
              <span className="text-accent font-extrabold">
                {heading}° ({formatCardinal(heading)})
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={359}
              value={heading}
              onChange={(e) => onSetHeading(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer h-2 bg-black/60 rounded-lg"
            />

            <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-1">
              <span>0° (North)</span>
              <span>90° (East)</span>
              <span>180° (South)</span>
              <span>270° (West)</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10">
              <div className="text-[9px] text-slate-300">
                Coords: {userCoords.latitude.toFixed(5)}, {userCoords.longitude.toFixed(5)} ·
                Accuracy: ±{userCoords.accuracy}m
              </div>

              {permissionStatus === "prompt" && (
                <button
                  onClick={onRequestPermission}
                  className="px-2.5 py-1 rounded-lg bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30 transition-colors cursor-pointer"
                >
                  Enable iOS Compass Sensor
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
