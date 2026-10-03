interface EnvironmentModalProps {
  open: boolean;
  onClose: () => void;
  mode: "auto" | "indoor" | "outdoor";
  onSetMode: (mode: "auto" | "indoor" | "outdoor") => void;
  isOutdoor: boolean;
  autoDetectedAs: "indoor" | "outdoor";
  gpsAccuracy: number;
  bleNodesCount: number;
  proximityRadius: number;
  onSetProximityRadius: (radius: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  vibrateEnabled: boolean;
  onToggleVibrate: () => void;
  mobilityMode?: "auto" | "walking" | "fast_walking" | "driving";
  onSetMobilityMode?: (mode: "auto" | "walking" | "fast_walking" | "driving") => void;
  currentSpeedKmh?: number;
  currentCadenceSec?: number;
}

export function EnvironmentModal({
  open,
  onClose,
  mode,
  onSetMode,
  isOutdoor,
  autoDetectedAs,
  gpsAccuracy,
  bleNodesCount,
  proximityRadius,
  onSetProximityRadius,
  soundEnabled,
  onToggleSound,
  vibrateEnabled,
  onToggleVibrate,
  mobilityMode = "auto",
  onSetMobilityMode,
  currentSpeedKmh = 4.2,
  currentCadenceSec = 30,
}: EnvironmentModalProps) {
  if (!open) return null;

  const maxRange = isOutdoor ? 50 : 20;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="env-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass relative w-full max-w-sm rounded-3xl p-5 border border-white/20 bg-[#0c101c]/95 shadow-2xl backdrop-blur-2xl text-foreground animate-scale-up max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xl">📍</span>
            <div>
              <h2 id="env-modal-title" className="text-sm sm:text-base font-bold text-white">
                Environment & Perimeter
              </h2>
              <p className="text-[10px] font-mono text-muted-foreground">
                Spatial Mesh Sensor & Notifications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors text-xs cursor-pointer"
            aria-label="Close environment selector"
          >
            ✕
          </button>
        </div>

        {/* Current Active Status Pill */}
        <div className="mt-3 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{isOutdoor ? "🌳" : "🏢"}</span>
            <div>
              <p className="text-xs font-bold text-white">
                {isOutdoor ? "Outdoor Mode (0.1m–50m)" : "Indoor Mall Mode (0.1m–20m)"}
              </p>
              <p className="font-mono text-[9px] text-muted-foreground">
                {mode === "auto" ? "⚡ Auto-detected via GPS & BLE" : "🔒 Manually Locked"}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[9px] font-mono font-bold text-primary">
            ACTIVE
          </span>
        </div>

        {/* Proximity Radius Preference Slider */}
        <div className="mt-3.5 p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-primary font-bold">🎯 Proximity Radius:</span>
              <span className="font-mono text-white font-black text-sm">
                {proximityRadius.toFixed(1)}m
              </span>
            </div>
            <span className="font-mono text-[9px] text-muted-foreground">
              Range: 0.1m – {maxRange}m
            </span>
          </div>

          <input
            type="range"
            min={0.1}
            max={maxRange}
            step={0.1}
            value={proximityRadius}
            onChange={(e) => onSetProximityRadius(parseFloat(e.target.value))}
            className="w-full accent-primary cursor-pointer h-2 bg-white/10 rounded-lg"
          />

          {/* Quick Preset Buttons */}
          <div className="flex items-center justify-between gap-1 pt-1">
            {(isOutdoor ? [5, 15, 30, 50] : [2, 5, 12, 20]).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onSetProximityRadius(preset)}
                className={`flex-1 py-1 rounded-lg text-[9px] font-mono font-bold transition-all cursor-pointer ${
                  Math.abs(proximityRadius - preset) < 0.2
                    ? "bg-primary text-primary-foreground shadow-teal"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                }`}
              >
                {preset}m
              </button>
            ))}
          </div>
        </div>

        {/* Mobility Mode & Dynamic Pacing Controls (30s Walk / 15-20s Fast / 10s Drive + 40% Priority Filter) */}
        <div className="mt-3.5 p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">⚡</span>
              <span className="text-xs font-bold text-white">Deal Cadence & Mobility</span>
            </div>
            <span className="font-mono text-[8.5px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-md font-bold">
              {currentCadenceSec}s Interval
            </span>
          </div>

          <p className="text-[9.5px] text-muted-foreground leading-relaxed">
            Deals pop up every 30s when walking, speed up when brisk walking, and pulse every 10s
            min when driving. In fast transit, deals under 40% off route silently into your Deck to
            prevent clutter.
          </p>

          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            {/* Auto GPS Speed */}
            <button
              type="button"
              onClick={() => onSetMobilityMode?.("auto")}
              className={`p-2 rounded-xl border flex flex-col gap-0.5 text-left transition-all cursor-pointer ${
                mobilityMode === "auto"
                  ? "border-primary bg-primary/20 text-white shadow-teal ring-1 ring-primary/30"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">🛰️ Auto GPS</span>
                <span className="text-[8px] font-mono text-accent font-bold">
                  {currentSpeedKmh.toFixed(0)} km/h
                </span>
              </div>
              <span className="text-[8.5px] font-mono text-muted-foreground">Auto-adapting</span>
            </button>

            {/* Walking Default 30s */}
            <button
              type="button"
              onClick={() => onSetMobilityMode?.("walking")}
              className={`p-2 rounded-xl border flex flex-col gap-0.5 text-left transition-all cursor-pointer ${
                mobilityMode === "walking"
                  ? "border-primary bg-primary/20 text-white shadow-teal ring-1 ring-primary/30"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">🚶 Walking</span>
                <span className="text-[8px] font-mono text-primary font-bold">30s</span>
              </div>
              <span className="text-[8.5px] font-mono text-muted-foreground">Default cadence</span>
            </button>

            {/* Fast Walking Dynamic */}
            <button
              type="button"
              onClick={() => onSetMobilityMode?.("fast_walking")}
              className={`p-2 rounded-xl border flex flex-col gap-0.5 text-left transition-all cursor-pointer ${
                mobilityMode === "fast_walking"
                  ? "border-primary bg-primary/20 text-white shadow-teal ring-1 ring-primary/30"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">🏃 Fast Walk</span>
                <span className="text-[8px] font-mono text-accent font-bold">15–20s</span>
              </div>
              <span className="text-[8.5px] font-mono text-muted-foreground">Proximity tuned</span>
            </button>

            {/* Driving 10s + Priority Filter */}
            <button
              type="button"
              onClick={() => onSetMobilityMode?.("driving")}
              className={`p-2 rounded-xl border flex flex-col gap-0.5 text-left transition-all cursor-pointer ${
                mobilityMode === "driving"
                  ? "border-rose-500/80 bg-rose-500/20 text-white shadow-[0_0_12px_rgba(244,63,94,0.3)] ring-1 ring-rose-500/40"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">🚗 Driving</span>
                <span className="text-[8px] font-mono text-rose-400 font-bold">10s Min</span>
              </div>
              <span className="text-[8.5px] font-mono text-rose-300/80">40%+ Priority only</span>
            </button>
          </div>
        </div>

        {/* High-Value +50% Deal Notification Toggles */}
        <div className="mt-3.5 p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🔥</span>
              <span className="text-xs font-bold text-white">Deal Alerts (+50% Drops)</span>
            </div>
            <span className="font-mono text-[8.5px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded-md font-bold">
              SUPER DEALS
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Sound Toggle */}
            <button
              type="button"
              onClick={onToggleSound}
              className={`p-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                soundEnabled
                  ? "border-primary/60 bg-primary/20 text-white shadow-teal"
                  : "border-white/10 bg-white/5 text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>{soundEnabled ? "🔊" : "🔇"}</span>
                <span className="text-[11px] font-bold">Sound</span>
              </div>
              <span className="font-mono text-[9px] font-black">{soundEnabled ? "ON" : "OFF"}</span>
            </button>

            {/* Vibration Toggle */}
            <button
              type="button"
              onClick={onToggleVibrate}
              className={`p-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                vibrateEnabled
                  ? "border-accent/60 bg-accent/20 text-white shadow-amber"
                  : "border-white/10 bg-white/5 text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>📳</span>
                <span className="text-[11px] font-bold">Vibration</span>
              </div>
              <span className="font-mono text-[9px] font-black">
                {vibrateEnabled ? "ON" : "OFF"}
              </span>
            </button>
          </div>
        </div>

        {/* Mode Selector Options */}
        <div className="mt-3.5 space-y-2">
          {/* Option 1: Auto-Detect */}
          <button
            onClick={() => onSetMode("auto")}
            className={`w-full p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              mode === "auto"
                ? "border-primary bg-primary/15 shadow-teal ring-1 ring-primary/40"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🛰️</span>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Auto-Detect Environment</span>
                  <span className="rounded-md bg-accent/20 text-accent font-mono text-[8px] px-1 py-0.5 font-bold">
                    RECOMMENDED
                  </span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Switches indoor (0.1–20m) / outdoor (0.1–50m) via GPS & BLE
                </p>
              </div>
            </div>
            {mode === "auto" && <span className="text-primary font-bold text-xs">✓</span>}
          </button>

          {/* Option 2: Indoor Force */}
          <button
            onClick={() => onSetMode("indoor")}
            className={`w-full p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              mode === "indoor"
                ? "border-primary bg-primary/15 shadow-teal ring-1 ring-primary/40"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🏢</span>
              <div>
                <p className="text-xs font-bold text-white">Indoor Mall (0.1m–20m)</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Locks to indoor floor beacons, food courts & corridors
                </p>
              </div>
            </div>
            {mode === "indoor" && <span className="text-primary font-bold text-xs">✓</span>}
          </button>

          {/* Option 3: Outdoor Force */}
          <button
            onClick={() => onSetMode("outdoor")}
            className={`w-full p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              mode === "outdoor"
                ? "border-primary bg-primary/15 shadow-teal ring-1 ring-primary/40"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🌳</span>
              <div>
                <p className="text-xs font-bold text-white">Outdoor Street (0.1m–50m)</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Locks to high-speed GPS micro-mesh & roadside stores
                </p>
              </div>
            </div>
            {mode === "outdoor" && <span className="text-primary font-bold text-xs">✓</span>}
          </button>
        </div>

        {/* Live Hardware Telemetry */}
        <div className="mt-3.5 p-2.5 rounded-xl bg-black/40 border border-white/10 text-[9.5px] font-mono space-y-1">
          <div className="flex justify-between text-muted-foreground">
            <span>GPS Satellite Accuracy:</span>
            <span className="text-white font-bold">±{gpsAccuracy}m</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Detected BLE Beacon Nodes:</span>
            <span className="text-primary font-bold">{bleNodesCount} Nodes Active</span>
          </div>
          <div className="flex justify-between text-muted-foreground pt-1 border-t border-white/10">
            <span>Auto Sensor Inference:</span>
            <span className="text-accent font-bold uppercase">
              {autoDetectedAs === "indoor" ? "🏢 Structural Indoor" : "🌳 Open Sky Outdoor"}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-teal hover:opacity-95 transition-opacity cursor-pointer"
        >
          Confirm & Close
        </button>
      </div>
    </div>
  );
}
