import { useState } from "react";
import { usePWAInstall } from "@/lib/pwa-service";

interface PWAInstallButtonProps {
  className?: string;
  variant?: "compact" | "full";
}

export function PWAInstallButton({ className = "", variant = "compact" }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Suppress when already running standalone as installed PWA
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`glass flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs font-mono text-primary hover:text-white hover:border-primary transition-all cursor-pointer shadow-teal active:scale-95 ${className}`}
        title="Install AutoCom App"
        aria-label="Install AutoCom App"
      >
        <span>📲</span>
        <span>{variant === "full" ? "Install AutoCom App" : "Install"}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`glass flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs font-mono text-primary hover:text-white hover:border-primary transition-all cursor-pointer ${className}`}
          title="Install on iOS Home Screen"
          aria-label="Install on iOS"
        >
          <span>📲</span>
          <span>{variant === "full" ? "Add to Home Screen" : "Install"}</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-xs rounded-3xl bg-[#0c101c] border border-primary/40 p-5 shadow-2xl text-foreground text-center space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid h-12 w-12 mx-auto place-items-center rounded-2xl bg-primary/20 text-primary text-2xl font-bold">
                📲
              </div>
              <h3 className="text-base font-bold text-white">Install on iPhone / iPad</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                1. Tap the <strong className="text-white">Share</strong> button in Safari.
                <br />
                2. Select <strong className="text-white">Add to Home Screen</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-teal hover:opacity-95 transition-opacity cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
