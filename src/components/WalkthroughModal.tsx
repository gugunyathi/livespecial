import { useState } from "react";

export interface WalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

interface Step {
  title: string;
  badge: string;
  icon: string;
  description: string;
  details: string[];
}

const STEPS: Step[] = [
  {
    title: "Swipe to Roll the 3D Sphere",
    badge: "Navigation",
    icon: "🌐",
    description:
      "Swipe or drag across the screen to rotate through nearby autonomous stores mapped in your physical perimeter.",
    details: [
      "Natural touch and mouse inertia tracking",
      "Real-time BLE & GPS proximity range (20m Indoor · 50m Outdoor)",
      "Device compass auto-aligns as you physically turn",
    ],
  },
  {
    title: "Tap Store to Enlarge",
    badge: "Inspection",
    icon: "🔍",
    description:
      "Tap any store node to focus on its live inventory, current agent negotiation status, and active specials.",
    details: [
      "Face any store directly to trigger instant spatial focus 🎯",
      "Inspect live product images, price discounts, and stock",
      "Real-time latency and agent handshake tickers",
    ],
  },
  {
    title: "Pull 📑 to Workspace Deck",
    badge: "Organization",
    icon: "📑",
    description:
      "Double-tap any card or click '+ Pull 📑' to detach it and keep it floating on your screen or neatly stacked in your deck.",
    details: [
      "Drag pulled cards anywhere on the canvas",
      "Switch between Freeform and Left/Right Deck alignments",
      "Compare multiple vendor quotes simultaneously",
    ],
  },
  {
    title: "2-Second Deal Match & Matched Deck",
    badge: "Autonomous Agent",
    icon: "⚡",
    description:
      "When your agent discovers a deal, it pops up for 2 seconds, then smoothly auto-saves into your Matched Deck at the bottom.",
    details: [
      "Tap the ⚡ Deck icon to browse your active matched deals",
      "Swipe Right to 🛍️ Buy Now with biometric passkey",
      "Swipe Left to 🅿️ Park in Holding Lot, or Down to 🗑️ Discard",
      "Dynamic countdown progress bars show time before specials expire",
    ],
  },
  {
    title: "Perimeter Auto-Detection & Guardrails",
    badge: "Proximity & Budget",
    icon: "🏢",
    description:
      "AutoCom uses real-time satellite accuracy to switch between Indoor 20m and Outdoor 50m meshes automatically.",
    details: [
      "Tap the bottom Environment icon to switch or lock modes",
      "Set your hard budget ceiling and intent keywords in Agent Control",
      "Claimed vouchers saved securely with encrypted cryptographic tokens",
    ],
  },
];

export function WalkthroughModal({ isOpen, onClose, onComplete }: WalkthroughModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = STEPS[currentStep]!;
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete?.();
      onClose();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleFinish = () => {
    onComplete?.();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="walkthrough-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={handleFinish}
    >
      <div
        className="glass relative w-full max-w-md rounded-3xl border border-primary/40 bg-[#0c101c]/98 shadow-2xl overflow-hidden text-foreground animate-scale-up p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow backdrop */}
        <div className="absolute -top-14 -right-14 h-36 w-36 rounded-full bg-primary/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-14 -left-14 h-36 w-36 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-primary">
              AutoCom Guide · {currentStep + 1} of {STEPS.length}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              {step.badge}
            </span>
          </div>

          <button
            onClick={handleFinish}
            className="text-muted-foreground hover:text-white text-xs font-mono px-2 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            Skip ✕
          </button>
        </div>

        {/* Step Visual & Info */}
        <div className="py-5 text-center space-y-3">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-primary/30 to-accent/20 border border-primary/40 shadow-teal text-3xl">
            {step.icon}
          </div>

          <h2 id="walkthrough-title" className="text-lg sm:text-xl font-extrabold text-white">
            {step.title}
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {step.description}
          </p>

          {/* Key Bullet Highlights */}
          <div className="mt-4 rounded-2xl bg-black/40 border border-white/10 p-3 text-left space-y-2">
            {step.details.map((detail) => (
              <div key={detail} className="flex items-start gap-2 text-[11px] text-white/90">
                <span className="text-accent shrink-0">✦</span>
                <span className="leading-tight">{detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-1.5 pb-4">
          {STEPS.map((s, idx) => (
            <button
              key={s.title}
              onClick={() => setCurrentStep(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentStep
                  ? "w-6 bg-primary shadow-[0_0_8px_var(--primary)]"
                  : "w-2 bg-white/20 hover:bg-white/40"
              }`}
              title={`Go to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10 font-mono text-xs">
          <button
            disabled={isFirst}
            onClick={handlePrev}
            className="px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 text-muted-foreground hover:text-white disabled:opacity-25 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            ◀ Back
          </button>

          <button
            onClick={handleNext}
            className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-teal hover:opacity-90 active:scale-95 transition-all cursor-pointer text-center"
          >
            {isLast ? "Ready to Explore! 🚀" : "Next Step ▶"}
          </button>
        </div>
      </div>
    </div>
  );
}
