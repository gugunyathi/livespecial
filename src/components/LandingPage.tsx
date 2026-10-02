import { useState } from "react";
import heroStoreImage from "@/assets/images/hero_autonomous_store_1790899130361.jpg";
import { type PasskeyUser, signOutPasskey } from "@/lib/passkey-auth";
import { AutoComLogo } from "@/components/AutoComLogo";

interface LandingPageProps {
  currentUser: PasskeyUser | null;
  onOpenPasskeyModal: (mode: "signin" | "signup") => void;
  onLaunchLiveMesh: () => void;
  onSignOut: () => void;
}

export function LandingPage({
  currentUser,
  onOpenPasskeyModal,
  onLaunchLiveMesh,
  onSignOut,
}: LandingPageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-[100dvh] w-full bg-background bg-aurora text-foreground select-none overflow-x-hidden pb-16 sm:pb-0">
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-3 sm:px-6 sm:py-4">
          {/* Zone 1: Single text element wordmark with Live AI Shopping Agent Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 text-left cursor-pointer group shrink-0"
          >
            <AutoComLogo size="md" />
            <span className="text-base sm:text-xl font-extrabold tracking-tight text-foreground">
              AutoCom
            </span>
          </button>

          {/* Zone 2: 4 Clean Nav Links on Desktop */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-muted-foreground">
            <a href="#protocol" className="hover:text-foreground transition-colors">
              Protocol
            </a>
            <a href="#passkey-security" className="hover:text-foreground transition-colors">
              Passkey Security
            </a>
            <a href="#capabilities" className="hover:text-foreground transition-colors">
              Capabilities
            </a>
            <a href="#network-metrics" className="hover:text-foreground transition-colors">
              Network Metrics
            </a>
          </nav>

          {/* Zone 3: 1-2 Primary Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="hidden sm:flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="truncate max-w-[110px]">{currentUser.displayName}</span>
                </div>
                <button
                  onClick={onLaunchLiveMesh}
                  className="bg-cta rounded-xl px-3 sm:px-4 py-2 text-xs font-bold text-accent-foreground shadow-amber hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap min-h-[40px] flex items-center gap-1"
                >
                  <span>Launch 3D</span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => {
                    signOutPasskey();
                    onSignOut();
                  }}
                  className="rounded-xl border border-border/80 px-2 sm:px-2.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer min-h-[40px]"
                  title="Sign out"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => onOpenPasskeyModal("signin")}
                  className="rounded-xl border border-primary/40 bg-primary/10 px-2.5 sm:px-3.5 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors flex items-center gap-1 min-h-[40px] cursor-pointer"
                >
                  <span>🔑</span>
                  <span className="hidden xs:inline sm:inline">Passkey Sign In</span>
                  <span className="inline xs:hidden sm:hidden">Sign In</span>
                </button>
                <button
                  onClick={onLaunchLiveMesh}
                  className="bg-cta hidden sm:inline-flex rounded-xl px-4 py-2 text-xs font-bold text-accent-foreground shadow-amber hover:scale-105 active:scale-95 transition-all cursor-pointer min-h-[40px] items-center"
                >
                  Explore Mesh
                </button>
              </div>
            )}

            {/* Mobile Navigation Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors shrink-0 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl px-4 py-4 text-center space-y-3 animate-fade-in">
            <a
              href="#protocol"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Protocol Overview
            </a>
            <a
              href="#passkey-security"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Passkey Biometric Security
            </a>
            <a
              href="#capabilities"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Core Capabilities
            </a>
            <a
              href="#network-metrics"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Live Network Metrics
            </a>
            <div className="pt-2 border-t border-border/40 flex justify-center">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLaunchLiveMesh();
                }}
                className="bg-cta w-full py-2.5 rounded-xl text-xs font-bold text-accent-foreground shadow-amber"
              >
                Launch 3D Proximity Mesh →
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section (Centered Layout) */}
      <section
        id="protocol"
        className="relative mx-auto max-w-5xl px-3.5 pt-8 pb-14 sm:px-6 sm:pt-16 sm:pb-24 text-center flex flex-col items-center"
      >
        {/* Unboxed Metadata Kicker */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono text-primary leading-tight">
          <span>AutoCom Mesh</span>
          <span aria-hidden="true">·</span>
          <span>WebAuthn FIDO2</span>
          <span aria-hidden="true">·</span>
          <span>50m Instant Settlement</span>
        </div>

        {/* Big Headline */}
        <h1 className="mt-4 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground text-balance leading-[1.08] sm:leading-[1.05] max-w-4xl mx-auto">
          Autonomous Realtime Commerce Network
        </h1>

        {/* Subheading */}
        <h2 className="mt-3.5 sm:mt-5 text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-accent text-balance leading-snug max-w-3xl mx-auto">
          Where your AI agent negotiates deals live within 50 meters.
        </h2>

        {/* Descriptive Body */}
        <p className="mt-4 text-xs sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Step into a living sphere of nearby storefronts. Your autonomous agent checks real-time
          inventory, counters merchant opening prices, and secures instant discount tokens—secured
          seamlessly by your device passkey.
        </p>

        {/* Responsive CTA Group (Centered) */}
        <div className="mt-6 flex flex-col xs:flex-row sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <button
            onClick={onLaunchLiveMesh}
            className="bg-cta w-full sm:w-auto rounded-2xl px-6 sm:px-8 py-3.5 text-sm sm:text-base font-bold text-accent-foreground shadow-amber hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
          >
            <span>Launch 3D Proximity Mesh</span>
            <span>→</span>
          </button>

          {!currentUser ? (
            <button
              onClick={() => onOpenPasskeyModal("signin")}
              className="rounded-2xl border border-primary/50 bg-primary/10 px-5 sm:px-6 py-3.5 text-sm sm:text-base font-semibold text-primary hover:bg-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px] w-full sm:w-auto"
            >
              <span>🔑</span>
              <span>Sign In with Passkey</span>
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3 text-xs sm:text-sm font-mono text-accent min-h-[48px] w-full sm:w-auto">
              <span>✓ Signed in via {currentUser.deviceType}</span>
            </div>
          )}
        </div>

        {/* Quick Proof Metrics adjacent to Hero CTA (Centered) */}
        <div className="mt-8 pt-5 grid grid-cols-3 gap-2 sm:gap-6 border-t border-border/40 w-full max-w-lg mx-auto text-center">
          <div className="p-1 sm:p-2">
            <p className="font-mono text-xl sm:text-3xl font-bold text-primary tabular-nums">
              20-50m
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Micro-Mesh Radius</p>
          </div>
          <div className="p-1 sm:p-2">
            <p className="font-mono text-xl sm:text-3xl font-bold text-accent tabular-nums">
              &lt;40ms
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Agent Handshake</p>
          </div>
          <div className="p-1 sm:p-2">
            <p className="font-mono text-xl sm:text-3xl font-bold text-foreground tabular-nums">
              0 Passwords
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
              FIDO2 Passkey Enclave
            </p>
          </div>
        </div>

        {/* Visual Showcase (Centered) */}
        <div className="mt-10 w-full max-w-3xl mx-auto">
          <div className="glass relative rounded-2xl sm:rounded-3xl p-2 sm:p-3 border border-border/80 shadow-2xl overflow-hidden group">
            <div className="relative aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden bg-muted/40">
              <img
                src={heroStoreImage}
                alt="AutoCom autonomous retail network storefront with holographic mesh geometry"
                referrerPolicy="no-referrer"
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50 p-6 text-center">
                  <span className="text-3xl animate-pulse">🌐</span>
                  <p className="mt-2 text-xs font-mono text-primary">
                    Loading AutoCom Mesh Visual…
                  </p>
                </div>
              )}
              {/* Floating Overlay Pill on Image */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-4 sm:right-4 glass rounded-xl p-2.5 sm:p-3 border border-border/70 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0 text-left">
                  <AutoComLogo size="sm" />
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-xs font-bold text-foreground truncate">
                      AutoCom Live Merchant Sphere
                    </p>
                    <p className="text-[9px] sm:text-[10px] font-mono text-muted-foreground truncate">
                      11 storefronts in broadcast range
                    </p>
                  </div>
                </div>
                <button
                  onClick={onLaunchLiveMesh}
                  className="rounded-lg bg-primary px-3 py-1.5 text-[10px] sm:text-[11px] font-bold text-primary-foreground hover:bg-primary/90 transition-colors shrink-0 cursor-pointer"
                >
                  Open 3D
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Passkey Security & Zero-Knowledge Architecture Section (Centered) */}
      <section
        id="passkey-security"
        className="relative border-t border-border/50 py-14 sm:py-24 bg-card/20 text-center"
      >
        <div className="mx-auto max-w-7xl px-3.5 sm:px-6 flex flex-col items-center">
          <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
            <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.3em] text-primary">
              Biometric Agent Protection
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground text-balance">
              How Passkeys Safeguard Your Autonomous Agent
            </h2>
            <p className="text-xs sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Traditional credentials leak and expose payment numbers. AutoCom pairs local WebAuthn
              cryptography with your device biometric enclave so only you can authorize deal
              settlements and spend caps.
            </p>
          </div>

          <div className="mt-10 sm:mt-14 grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
            {/* Feature 1 */}
            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-border/80 flex flex-col items-center text-center space-y-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 border border-primary/30 text-xl text-primary font-bold shadow-teal">
                🔒
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Hardware Secure Enclave
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Your private key never leaves your iPhone, Android, or Mac security chip. Every deal
                voucher is signed cryptographically on-device.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-border/80 flex flex-col items-center text-center space-y-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary/15 border border-secondary/30 text-xl text-secondary font-bold shadow-purple">
                ⚡
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Hard Budget Guardrails
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Set a firm spend ceiling in your agent profile. Merchant negotiation bots cannot
                exceed your ceiling without explicit biometric confirmation.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-border/80 flex flex-col items-center text-center space-y-3 sm:col-span-2 lg:col-span-1">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/15 border border-accent/30 text-xl text-accent font-bold shadow-amber">
                🎟️
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Zero Phishing Token Claims
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Once a deal is agreed, a tamper-proof QR token is minted with a 7-minute expiry,
                redeemable at the merchant checkout instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Protocol Pillars Bento Grid (Centered) */}
      <section id="capabilities" className="relative py-14 sm:py-24 text-center">
        <div className="mx-auto max-w-7xl px-3.5 sm:px-6 flex flex-col items-center">
          <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-14 space-y-2">
            <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.3em] text-accent">
              Core Capabilities
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              The AutoCom Protocol
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              Replacing passive retail search with active machine-to-machine negotiation on spinning
              proximity spheres.
            </p>
          </div>

          <div className="grid gap-5 sm:gap-6 md:grid-cols-3 w-full max-w-6xl">
            {/* Bento Card 1 (Span 2) */}
            <div className="glass md:col-span-2 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-border/80 flex flex-col items-center text-center space-y-3 sm:space-y-4">
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-[11px] sm:text-xs text-primary uppercase tracking-wider">
                  01. Proximity Orbital Sphere
                </span>
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-mono text-primary">
                  3D Canvas
                </span>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-foreground">
                Spinning 3D Spatial Radar for Hyper-Local Discovery
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
                Stores are mapped dynamically to a spinning orbital sphere based on real-time
                distance. Roll the sphere with fluid finger gestures or touch an orb to target an
                automated price counter-offer.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono text-foreground/80">
                <span className="rounded-xl bg-muted/60 px-3 py-1.5 border border-border/60">
                  Indoor 20m Mall Mode
                </span>
                <span className="rounded-xl bg-muted/60 px-3 py-1.5 border border-border/60">
                  Outdoor 50m Street Mode
                </span>
                <span className="rounded-xl bg-muted/60 px-3 py-1.5 border border-border/60">
                  Parking Lot & Bag
                </span>
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-border/80 flex flex-col items-center justify-between text-center space-y-4">
              <div>
                <span className="font-mono text-[11px] sm:text-xs text-secondary uppercase tracking-wider">
                  02. Intent Match
                </span>
                <h3 className="text-base sm:text-xl font-bold text-foreground mt-2">
                  Custom Intent Keywords
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                  Provide intent tags like <em>Coffee</em>, <em>Hoodies</em>, or <em>Sushi</em>.
                  Your agent monitors incoming broadcast channels and initiates handshakes
                  automatically.
                </p>
              </div>
              <div className="rounded-xl sm:rounded-2xl border border-secondary/30 bg-secondary/10 p-2.5 sm:p-3 text-[11px] sm:text-xs font-mono text-secondary w-full text-center">
                ⚡ Agent matches 3 intent tags currently
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-border/80 flex flex-col items-center justify-between text-center space-y-4">
              <div>
                <span className="font-mono text-[11px] sm:text-xs text-accent uppercase tracking-wider">
                  03. Automated Counter-Offers
                </span>
                <h3 className="text-base sm:text-xl font-bold text-foreground mt-2">
                  Dynamic 3-Step Settlements
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                  Merchant opens offer → Your agent counters with volume discount → Settlement
                  reached at optimal price point with up to 25% savings.
                </p>
              </div>
              <div className="rounded-xl sm:rounded-2xl border border-accent/30 bg-accent/10 p-2.5 sm:p-3 text-[11px] sm:text-xs font-mono text-accent w-full text-center">
                🎯 Average savings: 20-25% off open prices
              </div>
            </div>

            {/* Bento Card 4 (Span 2) */}
            <div className="glass md:col-span-2 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-border/80 flex flex-col items-center text-center space-y-3 sm:space-y-4">
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-[11px] sm:text-xs text-primary uppercase tracking-wider">
                  04. Live Activity Stream
                </span>
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-mono text-primary">
                  Telemetry
                </span>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-foreground">
                Transparent Machine-to-Machine Handshake Logs
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
                Watch every micro-transaction in real time. The live stream log displays latency
                metrics, intent matches, budget validations, and cryptographic signatures as they
                happen.
              </p>
              <div className="rounded-xl sm:rounded-2xl border border-border bg-background/80 p-3 font-mono text-[11px] sm:text-xs text-primary truncate max-w-lg w-full text-center">
                [16:48:12] ConsumerAgent pinged ZaraAgent · Latency 14ms · Handshake signed ✓
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Network Metrics & Performance (Centered) */}
      <section
        id="network-metrics"
        className="relative border-t border-border/50 py-14 sm:py-20 bg-muted/20 text-center"
      >
        <div className="mx-auto max-w-7xl px-3.5 sm:px-6 flex flex-col items-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-5xl text-center">
            <div className="p-4 sm:p-5 rounded-2xl border border-border/40 bg-muted/30 flex flex-col items-center justify-center">
              <p className="font-mono text-2xl sm:text-4xl font-extrabold text-primary tabular-nums">
                38.4ms
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Average Latency</p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl border border-border/40 bg-muted/30 flex flex-col items-center justify-center">
              <p className="font-mono text-2xl sm:text-4xl font-extrabold text-secondary tabular-nums">
                11
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Storefronts</p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl border border-border/40 bg-muted/30 flex flex-col items-center justify-center">
              <p className="font-mono text-2xl sm:text-4xl font-extrabold text-accent tabular-nums">
                R1,500
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                Median Spend Ceiling
              </p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl border border-border/40 bg-muted/30 flex flex-col items-center justify-center">
              <p className="font-mono text-2xl sm:text-4xl font-extrabold text-foreground tabular-nums">
                100%
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                Passkey Protection
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Action Callout (Centered) */}
      <section className="relative py-16 sm:py-24 text-center">
        <div className="mx-auto max-w-3xl px-3.5 sm:px-6 space-y-4 sm:space-y-6 flex flex-col items-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground text-balance">
            Ready to deploy your AutoCom shopping agent?
          </h2>
          <p className="text-xs sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Enroll your device passkey in 5 seconds and experience machine-to-machine retail
            negotiations live in your browser.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full sm:w-auto">
            <button
              onClick={onLaunchLiveMesh}
              className="bg-cta rounded-2xl px-7 py-3.5 text-sm sm:text-base font-bold text-accent-foreground shadow-amber hover:scale-105 active:scale-95 transition-all cursor-pointer min-h-[48px] flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <span>Open AutoCom Live 3D Mesh</span>
              <span>→</span>
            </button>
            {!currentUser && (
              <button
                onClick={() => onOpenPasskeyModal("signup")}
                className="rounded-2xl border border-primary/50 bg-primary/10 px-6 py-3.5 text-sm sm:text-base font-semibold text-primary hover:bg-primary/20 transition-all cursor-pointer min-h-[48px] flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <span>🔑</span>
                <span>Register Device Passkey</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Quiet Footer (Centered) */}
      <footer className="border-t border-border/50 py-8 bg-background/90 text-xs text-muted-foreground text-center">
        <div className="mx-auto max-w-7xl px-3.5 sm:px-6 flex flex-col items-center justify-center gap-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <AutoComLogo size="sm" />
            <span className="font-bold text-foreground">AutoCom</span>
            <span>·</span>
            <span>Autonomous Realtime Commerce Network</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5 pt-1">
            <a href="#protocol" className="hover:text-foreground transition-colors">
              Protocol
            </a>
            <a href="#passkey-security" className="hover:text-foreground transition-colors">
              Passkeys
            </a>
            <a href="#capabilities" className="hover:text-foreground transition-colors">
              Capabilities
            </a>
            <a href="#network-metrics" className="hover:text-foreground transition-colors">
              Metrics
            </a>
            <button
              onClick={onLaunchLiveMesh}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              3D Sphere
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
