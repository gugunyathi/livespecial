import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { INDOOR, OUTDOOR, TICKS, fill, hueVar, type Store } from "@/lib/acn-data";
import { LandingPage } from "@/components/LandingPage";
import { PasskeyModal } from "@/components/PasskeyModal";
import { ParkingLotModal, type ParkedOffer } from "@/components/ParkingLotModal";
import { BoughtItemsModal, type BoughtItem } from "@/components/BoughtItemsModal";
import { AutoComLogo } from "@/components/AutoComLogo";
import { InteractiveDealCard } from "@/components/InteractiveDealCard";
import { FloatingDeckCard } from "@/components/FloatingDeckCard";
import { type PasskeyUser, getCurrentUser, signOutPasskey } from "@/lib/passkey-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AutoCom - Autonomous Realtime Commerce Network" },
      {
        name: "description",
        content:
          "Where your live AI shopping agent negotiates deals within 50 meters on a spinning proximity sphere, protected by biometric passkeys.",
      },
      { property: "og:title", content: "AutoCom - Autonomous Realtime Commerce Network" },
      {
        property: "og:description",
        content:
          "Where your live AI shopping agent negotiates deals within 50 meters on a spinning proximity sphere.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});

type Deal = { store: Store; price: number; counter: number; expires: number; total: number };
type Log = { t: string; msg: string; id: number };

const now = () => new Date().toTimeString().slice(0, 8);
let logId = 0;

const SUGGESTED_TAGS = ["Coffee", "Hoodies", "Sushi", "Sneakers", "Tech", "Skincare", "Books"];
const STORAGE_PARKED_KEY = "acn_parked_offers_v1";
const STORAGE_BOUGHT_KEY = "acn_bought_items_v1";

export function App() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<"landing" | "mesh">("landing");
  const [currentUser, setCurrentUser] = useState<PasskeyUser | null>(null);
  const [passkeyModalOpen, setPasskeyModalOpen] = useState(false);
  const [passkeyModalMode, setPasskeyModalMode] = useState<"signin" | "signup">("signin");

  // Parking Lot & Bought Bag Modals
  const [parkingLotOpen, setParkingLotOpen] = useState(false);
  const [boughtModalOpen, setBoughtModalOpen] = useState(false);
  const [parkedOffers, setParkedOffers] = useState<ParkedOffer[]>([]);
  const [boughtItems, setBoughtItems] = useState<BoughtItem[]>([]);

  const [outdoor, setOutdoor] = useState(false);
  const stores = outdoor ? OUTDOOR : INDOOR;
  const [rot, setRot] = useState(0);
  const rotRef = useRef(0);
  const vel = useRef(0.0025);
  const target = useRef<number | null>(null);
  const drag = useRef<{ x: number; r: number; moved: boolean } | null>(null);
  const [radius, setRadius] = useState(170);
  const [ticks, setTicks] = useState<Record<string, string>>({});
  const [deal, setDeal] = useState<Deal | null>(null);
  const [claimed, setClaimed] = useState<string[]>([]);
  const [drawer, setDrawer] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"profile" | "logs">("profile");
  const [tags, setTags] = useState(["Coffee", "Hoodies", "Sushi"]);
  const [budget, setBudget] = useState(1500);
  const [logs, setLogs] = useState<Log[]>([]);
  const [left, setLeft] = useState(0);
  const [viewport, setViewport] = useState({ w: 1000, h: 800 });

  // Pulled-out cards placed anywhere on canvas
  const [pulledCards, setPulledCards] = useState<
    Array<{ store: Store; pos: { x: number; y: number } }>
  >([]);
  // Currently expanded/enlarged card ID ('deal' | store.id | null)
  const [expandedCardId, setExpandedCardId] = useState<string | null>("deal");
  // Deck alignment mode ('none' | 'right' | 'left')
  const [deckMode, setDeckMode] = useState<"none" | "right" | "left">("none");

  useEffect(() => {
    setMounted(true);
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      if (user.agentBudget) setBudget(user.agentBudget);
      if (user.intentTags?.length) setTags(user.intentTags);
    }

    try {
      const storedParked = localStorage.getItem(STORAGE_PARKED_KEY);
      if (storedParked) setParkedOffers(JSON.parse(storedParked));
      const storedBought = localStorage.getItem(STORAGE_BOUGHT_KEY);
      if (storedBought) {
        const parsed = JSON.parse(storedBought) as BoughtItem[];
        setBoughtItems(parsed);
        setClaimed(parsed.map((b) => b.store.id));
      }
    } catch {
      // ignore storage errors
    }

    const updateSize = () => {
      setViewport({
        w: window.innerWidth,
        h: window.innerHeight,
      });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    window.addEventListener("orientationchange", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("orientationchange", updateSize);
    };
  }, []);

  // Save Parked Offers and Bought Items to storage
  const saveParked = (updated: ParkedOffer[]) => {
    setParkedOffers(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_PARKED_KEY, JSON.stringify(updated));
    }
  };

  const saveBought = (updated: BoughtItem[]) => {
    setBoughtItems(updated);
    setClaimed(updated.map((b) => b.store.id));
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_BOUGHT_KEY, JSON.stringify(updated));
    }
  };

  const isMobile = viewport.w < 640;
  const isSmallMobile = viewport.w < 380;
  const isTablet = viewport.w >= 640 && viewport.w < 1024;

  // Responsive scale dynamically computed from both width and height constraints
  const scale = useMemo(() => {
    const widthFactor = viewport.w / 760;
    const heightFactor = (viewport.h - 180) / 600;
    const minFactor = Math.min(widthFactor, heightFactor);
    if (isSmallMobile) return Math.min(0.72, Math.max(0.55, minFactor * 0.98));
    if (isMobile) return Math.min(0.82, Math.max(0.65, minFactor * 0.98));
    if (isTablet) return Math.min(0.92, Math.max(0.78, minFactor));
    return Math.min(1.15, Math.max(0.9, widthFactor));
  }, [viewport.w, viewport.h, isMobile, isSmallMobile, isTablet]);

  useEffect(() => {
    setRadius(outdoor ? (isMobile ? 220 : 300) : isMobile ? 140 : 175);
  }, [outdoor, isMobile]);

  // Animation loop with smooth inertia
  const radRef = useRef(radius);
  const [radAnim, setRadAnim] = useState(radius);
  useEffect(() => {
    let f = 0;
    const loop = () => {
      if (target.current !== null) {
        const d = target.current - rotRef.current;
        rotRef.current += d * 0.08;
        if (Math.abs(d) < 0.001) target.current = null;
      } else if (!drag.current) {
        rotRef.current += vel.current;
        vel.current += (0.0025 - vel.current) * 0.02;
      }
      radRef.current += (radius - radRef.current) * 0.07;
      setRot(rotRef.current);
      setRadAnim(radRef.current);
      f = requestAnimationFrame(loop);
    };
    f = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(f);
  }, [radius]);

  // Live tickers and mesh telemetry logs
  useEffect(() => {
    const id = setInterval(() => {
      const s = stores[Math.floor(Math.random() * stores.length)]!;
      setTicks((t) => ({
        ...t,
        [s.id]: fill(TICKS[Math.floor(Math.random() * TICKS.length)]!, s),
      }));
      const agent = s.name.replace(/[^A-Za-z]/g, "") + "Agent";
      const msgs = [
        `ConsumerAgent pinged ${agent}… Checking stock…`,
        `${agent} ACK · latency ${8 + Math.floor(Math.random() * 30)}ms`,
        `Intent match [${tags.join("|")}] → ${s.tag}`,
        `Budget guard ≤ R${budget} · ${agent} quote R${Math.round(s.open * 0.85)}`,
        `Handshake ${Math.random().toString(16).slice(2, 10)} signed with ${agent}`,
      ];
      setLogs((l) =>
        [
          { t: now(), msg: msgs[Math.floor(Math.random() * msgs.length)]!, id: logId++ },
          ...l,
        ].slice(0, 60),
      );
    }, 1400);
    return () => clearInterval(id);
  }, [stores, tags, budget]);

  // Deals trigger with auto rotation to store
  const n = stores.length;
  const trigger = useCallback(
    (s?: Store) => {
      const idx = s ? stores.indexOf(s) : Math.floor(Math.random() * n);
      const store = stores[idx]!;
      const base = (idx / n) * Math.PI * 2;
      let tgt = -base;
      while (tgt < rotRef.current - Math.PI) tgt += Math.PI * 2;
      while (tgt > rotRef.current + Math.PI) tgt -= Math.PI * 2;
      target.current = tgt;
      const price = Math.round(store.open * 0.8);
      setDeal({
        store,
        price,
        counter: Math.round(store.open * 0.76),
        expires: Date.now() + 465000,
        total: 465,
      });
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.([50, 30, 80]);
      }
    },
    [stores, n],
  );

  useEffect(() => {
    if (deal) return;
    const id = setTimeout(() => trigger(), 9000);
    return () => clearTimeout(id);
  }, [deal, trigger]);

  useEffect(() => {
    if (!deal) return;
    const id = setInterval(() => {
      const l = Math.max(0, Math.round((deal.expires - Date.now()) / 1000));
      setLeft(l);
      if (!l) setDeal(null);
    }, 250);
    return () => clearInterval(id);
  }, [deal]);

  // Calculate 3D spherical orbital coordinates
  const nodes = useMemo(
    () =>
      stores.map((s, i) => {
        const a = (i / n) * Math.PI * 2 + rot;
        const lat = Math.sin(i * 2.3) * (isMobile ? 0.38 : 0.45);
        const R = radAnim * scale;
        const x = Math.sin(a) * Math.cos(lat) * R * (isMobile ? 1.25 : 1.35);
        const z = Math.cos(a) * Math.cos(lat);
        const y = Math.sin(lat) * R * (isMobile ? 0.8 : 0.9) + Math.sin(rot * 3 + i) * 5;
        return { s, x, y, z };
      }),
    [stores, rot, radAnim, scale, n, isMobile],
  );

  // Touch and pointer gestures for fluid mobile rotation
  const down = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, r: rotRef.current, moved: false };
    target.current = null;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const move = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const deltaX = e.clientX - drag.current.x;
    if (Math.abs(deltaX) > 4) {
      drag.current.moved = true;
    }
    const speed = isMobile ? 0.0075 : 0.006;
    const nr = drag.current.r + deltaX * speed;
    vel.current = (nr - rotRef.current) * 0.8;
    rotRef.current = nr;
  };

  const up = () => {
    drag.current = null;
  };

  // Handle pulling out a card from the carousel
  const handlePullOutCard = (s: Store, screenX?: number, screenY?: number) => {
    if (pulledCards.some((p) => p.store.id === s.id)) {
      setExpandedCardId(s.id);
      return;
    }
    const defaultX = screenX ?? (isMobile ? 18 : 36 + pulledCards.length * 35);
    const defaultY =
      screenY ?? (isMobile ? 110 + pulledCards.length * 45 : 130 + pulledCards.length * 35);
    setPulledCards((prev) => [...prev, { store: s, pos: { x: defaultX, y: defaultY } }]);
    setExpandedCardId(s.id); // Auto focus pulled card and make deal card small
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([30, 45, 60]);
    }
  };

  // Handle releasing a pulled card back to carousel
  const handleReleaseCard = (storeId: string) => {
    setPulledCards((prev) => prev.filter((p) => p.store.id !== storeId));
    if (expandedCardId === storeId) {
      setExpandedCardId(null);
    }
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([30, 40]);
    }
  };

  // Handle releasing/dismissing active deal
  const handleReleaseDeal = () => {
    setDeal(null);
    if (expandedCardId === "deal") {
      setExpandedCardId(null);
    }
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([30, 40]);
    }
  };

  // Calculate cascading deck position for cards
  const getDeckAlignment = (cardId: string) => {
    if (deckMode === "none") return null;
    const allIds = [deal ? "deal" : null, ...pulledCards.map((p) => p.store.id)].filter(
      Boolean,
    ) as string[];
    const idx = allIds.indexOf(cardId);
    if (idx === -1) return null;

    const isRight = deckMode === "right";
    const startX = isRight ? Math.max(16, viewport.w - (isMobile ? 320 : 380)) : 16;
    const startY = 85 + idx * (isMobile ? 50 : 60);
    return { x: startX, y: startY, zIndex: 50 + idx };
  };

  const handleCardClick = (s: Store) => {
    if (drag.current?.moved) return;
    // Enlarge clicked card and auto make deal match card small!
    setExpandedCardId(s.id);
    trigger(s);
  };

  const mm =
    String(Math.floor(left / 60)).padStart(2, "0") + ":" + String(left % 60).padStart(2, "0");

  const addTag = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
  };

  const openPasskeyModal = (mode: "signin" | "signup") => {
    setPasskeyModalMode(mode);
    setPasskeyModalOpen(true);
  };

  const handlePasskeySuccess = (user: PasskeyUser) => {
    setCurrentUser(user);
    if (user.agentBudget) setBudget(user.agentBudget);
    if (user.intentTags?.length) setTags(user.intentTags);
  };

  // Park the active deal
  const handleParkDeal = () => {
    if (!deal) return;
    const newParked: ParkedOffer = {
      id: `park_${Date.now()}_${deal.store.id}`,
      store: deal.store,
      price: deal.price,
      counter: deal.counter,
      open: deal.store.open,
      expires: deal.expires,
      parkedAt: Date.now(),
    };

    const updated = [newParked, ...parkedOffers.filter((p) => p.store.id !== deal.store.id)];
    saveParked(updated);
    setLogs((l) => [
      {
        t: now(),
        msg: `PARKED ${deal.store.item} @ R${deal.price} into Parking Lot`,
        id: logId++,
      },
      ...l,
    ]);

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([40, 60]);
    }

    setDeal(null);
  };

  // Accept and buy deal directly
  const handleBuyDeal = () => {
    if (!deal) return;
    const token = `AUTOCOM-${deal.store.name.slice(0, 4).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${new Date().getFullYear()}`;
    const newBought: BoughtItem = {
      id: `bought_${Date.now()}_${deal.store.id}`,
      store: deal.store,
      item: deal.store.item,
      price: deal.price,
      open: deal.store.open,
      boughtAt: Date.now(),
      qrToken: token,
    };

    saveBought([newBought, ...boughtItems]);
    setLogs((l) => [
      {
        t: now(),
        msg: `CLAIMED & BOUGHT ${deal.store.item} @ R${deal.price} · Voucher ${token} issued`,
        id: logId++,
      },
      ...l,
    ]);

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([60, 40, 100]);
    }

    setDeal(null);
    setBoughtModalOpen(true);
  };

  // Claim and buy from Parking Lot
  const handleClaimFromParkingLot = (offer: ParkedOffer) => {
    const token = `AUTOCOM-${offer.store.name.slice(0, 4).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${new Date().getFullYear()}`;
    const newBought: BoughtItem = {
      id: `bought_${Date.now()}_${offer.store.id}`,
      store: offer.store,
      item: offer.store.item,
      price: offer.price,
      open: offer.open,
      boughtAt: Date.now(),
      qrToken: token,
    };

    saveBought([newBought, ...boughtItems]);
    saveParked(parkedOffers.filter((p) => p.id !== offer.id));

    setLogs((l) => [
      {
        t: now(),
        msg: `CONVERTED FROM LOT: ${offer.store.item} @ R${offer.price} · Voucher ${token} issued`,
        id: logId++,
      },
      ...l,
    ]);

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([60, 40, 100]);
    }

    setParkingLotOpen(false);
    setBoughtModalOpen(true);
  };

  const handleRemoveParkedOffer = (id: string) => {
    saveParked(parkedOffers.filter((p) => p.id !== id));
  };

  const handleClearBoughtReceipt = (id: string) => {
    saveBought(boughtItems.filter((b) => b.id !== id));
  };

  if (view === "landing") {
    return (
      <>
        <LandingPage
          currentUser={currentUser}
          onOpenPasskeyModal={openPasskeyModal}
          onLaunchLiveMesh={() => setView("mesh")}
          onSignOut={() => setCurrentUser(null)}
        />
        <PasskeyModal
          isOpen={passkeyModalOpen}
          onClose={() => setPasskeyModalOpen(false)}
          onSuccess={handlePasskeySuccess}
          initialMode={passkeyModalMode}
        />
      </>
    );
  }

  return (
    <main className="relative min-h-[100dvh] w-full overflow-hidden bg-background bg-aurora select-none flex flex-col justify-between">
      {/* Dynamic Header */}
      <header className="relative z-30 flex flex-col gap-3 px-4 pt-3.5 sm:px-6 sm:pt-5 md:px-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setView("landing")}
              className="glass px-2.5 py-1.5 rounded-xl font-mono text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              title="Return to Landing Page"
            >
              <span>←</span>
              <span className="hidden sm:inline">Overview</span>
            </button>
            <div className="flex items-center gap-2.5 min-w-0">
              <AutoComLogo size="sm" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.25em] sm:tracking-[0.35em] text-primary truncate">
                    AUTOCOM · LIVE MESH
                  </p>
                </div>
                <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-foreground truncate">
                  AutoCom
                </h1>
              </div>
            </div>
          </div>

          {/* Quick Actions on Mobile */}
          <div className="flex items-center gap-1.5 md:hidden shrink-0">
            {currentUser ? (
              <button
                onClick={() => openPasskeyModal("signin")}
                className="glass rounded-full px-2.5 py-1.5 text-[10px] font-mono text-primary flex items-center gap-1"
                title="Passkey verified"
              >
                <span>🔑</span>
                <span className="truncate max-w-[60px]">{currentUser.name}</span>
              </button>
            ) : (
              <button
                onClick={() => openPasskeyModal("signin")}
                className="glass rounded-full px-2.5 py-1.5 text-[10px] font-mono text-primary flex items-center gap-1"
              >
                <span>🔑</span>
                <span>Sign In</span>
              </button>
            )}
            <button
              onClick={() => trigger()}
              className="glass items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-mono text-accent hover:border-accent transition-colors shrink-0"
              aria-label="Discover deal"
              title="Discover deal"
            >
              <span>⚡ Scan</span>
            </button>
          </div>
        </div>

        {/* Header Right: Segmented Mode Selector, Auto Deck controls & Passkey Badge */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-2.5">
          {/* Auto Deck Alignment Controls */}
          <div className="glass flex items-center rounded-full p-0.5 font-mono text-[10px]">
            <button
              onClick={() => setDeckMode(deckMode === "left" ? "none" : "left")}
              className={`px-2.5 py-1.5 rounded-full transition-all cursor-pointer ${
                deckMode === "left"
                  ? "bg-primary text-primary-foreground font-bold shadow-teal"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Align pulled cards to left deck stack"
            >
              ⊟ Deck L
            </button>
            <button
              onClick={() => setDeckMode(deckMode === "right" ? "none" : "right")}
              className={`px-2.5 py-1.5 rounded-full transition-all cursor-pointer ${
                deckMode === "right"
                  ? "bg-primary text-primary-foreground font-bold shadow-teal"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Align pulled cards to right deck stack"
            >
              ⊞ Deck R
            </button>
            {deckMode !== "none" && (
              <button
                onClick={() => setDeckMode("none")}
                className="px-2 py-1.5 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
                title="Freeform movement"
              >
                ✕ Free
              </button>
            )}
          </div>

          <button
            onClick={() => setOutdoor((o) => !o)}
            className="glass relative flex w-full sm:w-auto rounded-full p-1 font-mono text-[11px] sm:text-xs shrink-0 touch-manipulation cursor-pointer"
            aria-label="Toggle mesh radius mode"
          >
            <span
              className="absolute inset-y-1 w-[48%] rounded-full bg-primary shadow-teal transition-transform duration-500 ease-[cubic-bezier(.3,1.4,.4,1)]"
              style={{ transform: `translateX(${outdoor ? "102%" : "2%"})` }}
            />
            <span
              className={`relative z-10 flex-1 sm:flex-none text-center px-3 sm:px-4 py-1.5 transition-colors ${
                !outdoor ? "text-primary-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              Indoor · 20m
            </span>
            <span
              className={`relative z-10 flex-1 sm:flex-none text-center px-3 sm:px-4 py-1.5 transition-colors ${
                outdoor ? "text-primary-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              Outdoor · 50m
            </span>
          </button>

          {/* Desktop discover & passkey controls */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => trigger()}
              className="glass flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-mono text-accent hover:border-accent transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
            >
              <span>⚡ Discover Deal</span>
            </button>
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openPasskeyModal("signin")}
                  className="glass flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-mono text-primary hover:border-primary transition-colors cursor-pointer"
                >
                  <span>🔑</span>
                  <span>{currentUser.displayName}</span>
                </button>
                <button
                  onClick={() => {
                    signOutPasskey();
                    setCurrentUser(null);
                  }}
                  className="glass text-[11px] text-muted-foreground hover:text-foreground px-2.5 py-2 rounded-full cursor-pointer"
                  title="Sign out"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => openPasskeyModal("signin")}
                className="glass flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-mono text-primary hover:border-primary transition-all cursor-pointer"
              >
                <span>🔑 Passkey Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3D Sphere Interactive Canvas */}
      <section
        className="relative z-10 flex-1 w-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none overflow-hidden my-auto"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
        style={{ minHeight: isMobile ? "55dvh" : "65dvh" }}
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-0 h-0">
          {/* Breathing Radial Orbit Rings */}
          {mounted && (
            <>
              {[1, 0.72, 0.45].map((k) => (
                <div
                  key={k}
                  className="absolute rounded-full border border-primary/15 animate-breathe pointer-events-none"
                  style={{
                    width: radAnim * scale * (isMobile ? 2.5 : 2.9) * k,
                    height: radAnim * scale * (isMobile ? 1.6 : 1.9) * k,
                    left: -radAnim * scale * (isMobile ? 1.25 : 1.45) * k,
                    top: -radAnim * scale * (isMobile ? 0.8 : 0.95) * k,
                  }}
                />
              ))}
            </>
          )}

          {/* Ambient Glow */}
          <div className="absolute -left-12 -top-12 h-24 w-24 sm:-left-16 sm:-top-16 sm:h-32 sm:w-32 rounded-full bg-secondary/25 blur-3xl animate-breathe pointer-events-none" />

          {/* Center Observer Beacon */}
          <div className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <div className="mx-auto h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-primary shadow-teal ring-4 ring-primary/20 animate-pulse" />
            <p className="mt-1.5 font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">
              You · {outdoor ? "50m" : "20m"}
            </p>
          </div>

          {/* Active Negotiation Sonar Ripples */}
          {deal && (
            <>
              {[0, 0.8, 1.6].map((d) => (
                <div
                  key={d}
                  className="absolute left-0 top-0 h-32 w-32 sm:h-44 sm:w-44 rounded-full border-2 border-accent animate-sonar pointer-events-none"
                  style={{ animationDelay: `${d}s` }}
                />
              ))}
            </>
          )}

          {/* 3D Floating Node Cards (Enlarged, Click to expand & Pull to Deck) */}
          {mounted &&
            [...nodes]
              .sort((a, b) => a.z - b.z)
              .map(({ s, x, y, z }) => {
                const p = (z + 1) / 2;
                const hot = deal?.store.id === s.id;
                const isExpanded = expandedCardId === s.id;
                const isPulled = pulledCards.some((pc) => pc.store.id === s.id);
                const isParked = parkedOffers.some((o) => o.store.id === s.id);
                const isBought = boughtItems.some((b) => b.store.id === s.id);
                const c = hueVar[s.hue];

                // Increased scale floor + expansion multiplier
                const cardScale =
                  (0.55 + p * 0.55) *
                  (hot ? 1.15 : 1) *
                  (isExpanded ? 1.25 : 1) *
                  Math.max(scale * 1.12, isSmallMobile ? 0.78 : isMobile ? 0.88 : 0.98);

                return (
                  <div
                    key={s.id}
                    className="absolute left-0 top-0 pointer-events-auto select-none"
                    style={{
                      transform: `translate(-50%,-50%) translate(${x}px, ${y}px) scale(${cardScale})`,
                      zIndex: isExpanded ? 80 : Math.round(p * 100),
                      opacity: isPulled ? 0.4 : 0.18 + p * 0.82,
                    }}
                  >
                    <button
                      onClick={() => handleCardClick(s)}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handlePullOutCard(s);
                      }}
                      className={`glass relative rounded-2xl p-3 sm:p-3.5 text-left transition-all duration-300 touch-manipulation cursor-pointer w-full block ${
                        isExpanded
                          ? "ring-2 ring-primary border-primary shadow-teal bg-background/95"
                          : ""
                      }`}
                      style={{
                        width: isSmallMobile ? "11.5rem" : isMobile ? "12.5rem" : "13.5rem",
                        filter: `blur(${(1 - p) * 1.8}px)`,
                        boxShadow: hot
                          ? "var(--glow-amber)"
                          : isExpanded
                            ? "var(--glow-teal)"
                            : `0 0 ${p * 22}px color-mix(in oklab, ${c} 40%, transparent)`,
                        borderColor: hot
                          ? "var(--accent)"
                          : isBought
                            ? "oklch(0.7 0.2 150)"
                            : isParked
                              ? "var(--primary)"
                              : isExpanded
                                ? "var(--primary)"
                                : `color-mix(in oklab, ${c} 40%, transparent)`,
                        pointerEvents: p < 0.28 ? "none" : "auto",
                      }}
                    >
                      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                        <span
                          className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-2xl text-base sm:text-lg shrink-0"
                          style={{
                            background: `color-mix(in oklab, ${c} 25%, transparent)`,
                            boxShadow: `inset 0 0 10px ${c}`,
                          }}
                        >
                          {s.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs sm:text-sm font-bold leading-tight text-foreground">
                            {s.name}
                          </p>
                          <p className="font-mono text-[10px] sm:text-[11px] text-muted-foreground truncate">
                            {s.cat} · {s.dist}m
                          </p>
                        </div>
                      </div>

                      <div
                        className="mt-2 flex items-center justify-between font-mono text-[9px] sm:text-[10px] uppercase tracking-wider"
                        style={{ color: c }}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="relative flex h-2 w-2 shrink-0">
                            <span
                              className="absolute inset-0 animate-ping rounded-full"
                              style={{ background: c }}
                            />
                            <span
                              className="relative h-2 w-2 rounded-full"
                              style={{ background: c }}
                            />
                          </span>
                          <span className="truncate font-semibold">
                            {isBought
                              ? "Purchased ✓"
                              : isParked
                                ? "Parked in Lot 🅿️"
                                : "Live Agent"}
                          </span>
                        </div>
                        <span className="font-bold text-foreground shrink-0">R{s.open}</span>
                      </div>

                      <div className="mt-1.5 h-4 sm:h-4.5 overflow-hidden font-mono text-[10px] sm:text-[11px] text-foreground/90 bg-muted/30 rounded-md px-1.5 py-0.5">
                        <p key={ticks[s.id]} className="animate-ticker truncate">
                          {ticks[s.id] ?? "Opening channel…"}
                        </p>
                      </div>

                      {/* Pull out button overlay on card */}
                      <div className="mt-2 pt-1 border-t border-border/40 flex items-center justify-between text-[9px] font-mono">
                        <span className="text-muted-foreground">Tap: Enlarge</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePullOutCard(s);
                          }}
                          className="rounded-lg bg-primary/15 px-2 py-0.5 text-primary hover:bg-primary/25 transition-colors cursor-pointer"
                          title="Pull this card out to float freely or deck stack"
                        >
                          + Pull 📑
                        </span>
                      </div>
                    </button>
                  </div>
                );
              })}
        </div>

        {/* Mobile drag gesture prompt */}
        <div className="pointer-events-none absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 px-3.5 py-1.5 glass rounded-full flex items-center gap-2 shadow-lg">
          <span className="text-xs text-primary animate-pulse">●</span>
          <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap">
            Swipe to roll · Tap store to enlarge · Pull 📑 to deck
          </p>
        </div>
      </section>

      {/* Floating Pulled Deck Cards (Draggable, Swipable, Cascade Deck) */}
      {pulledCards.map((p) => (
        <FloatingDeckCard
          key={p.store.id}
          store={p.store}
          liveTick={ticks[p.store.id] ?? "Opening channel…"}
          isBought={boughtItems.some((b) => b.store.id === p.store.id)}
          isParked={parkedOffers.some((o) => o.store.id === p.store.id)}
          initialPos={p.pos}
          deckAlignment={getDeckAlignment(p.store.id)}
          isExpanded={expandedCardId === p.store.id}
          onToggleExpand={() => {
            setExpandedCardId(expandedCardId === p.store.id ? null : p.store.id);
          }}
          onNegotiate={(store) => {
            setExpandedCardId(store.id);
            trigger(store);
          }}
          onPark={(store) => {
            const newParked: ParkedOffer = {
              id: `park_${Date.now()}_${store.id}`,
              store,
              price: Math.round(store.open * 0.8),
              counter: Math.round(store.open * 0.76),
              open: store.open,
              expires: Date.now() + 465000,
              parkedAt: Date.now(),
            };
            saveParked([newParked, ...parkedOffers.filter((o) => o.store.id !== store.id)]);
            handleReleaseCard(store.id);
          }}
          onBuy={(store) => {
            trigger(store);
          }}
          onRelease={handleReleaseCard}
        />
      ))}

      {/* Interactive Floating Deal Negotiation Alert Card (Moveable, Swipable, Auto-Collapsible, Deck-Stackable) */}
      {deal && (
        <InteractiveDealCard
          key={deal.store.id + deal.expires}
          deal={deal}
          timeLeft={left}
          isExpanded={expandedCardId === "deal"}
          onToggleExpand={() => {
            setExpandedCardId(expandedCardId === "deal" ? null : "deal");
          }}
          deckAlignment={getDeckAlignment("deal")}
          onPark={handleParkDeal}
          onBuy={handleBuyDeal}
          onRelease={handleReleaseDeal}
          onDismiss={() => setDeal(null)}
        />
      )}

      {/* Floating Action HUD Controls: Bottom Left (Parking Lot) & Bottom Right (Bought Bag) */}
      <div className="fixed bottom-3.5 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
        {/* Bottom Left: Parking Lot Button */}
        <button
          onClick={() => setParkingLotOpen(true)}
          className="glass pointer-events-auto flex items-center gap-2 rounded-2xl px-3.5 py-2.5 shadow-teal border border-primary/40 hover:border-primary hover:scale-105 active:scale-95 transition-all cursor-pointer bg-card/90 backdrop-blur-lg"
          aria-label="Open Parking Lot"
        >
          <span className="text-lg">🅿️</span>
          <div className="text-left hidden sm:block">
            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground leading-none">
              Holding Lot
            </p>
            <p className="text-xs font-bold text-foreground">
              {parkedOffers.length} {parkedOffers.length === 1 ? "Offer" : "Offers"}
            </p>
          </div>
          {parkedOffers.length > 0 && (
            <span className="rounded-full bg-primary text-primary-foreground font-mono text-[10px] font-extrabold h-5 min-w-5 px-1.5 flex items-center justify-center shadow-sm">
              {parkedOffers.length}
            </span>
          )}
        </button>

        {/* Bottom Right: Bought Bag Button */}
        <button
          onClick={() => setBoughtModalOpen(true)}
          className="glass pointer-events-auto flex items-center gap-2 rounded-2xl px-3.5 py-2.5 shadow-amber border border-accent/40 hover:border-accent hover:scale-105 active:scale-95 transition-all cursor-pointer bg-card/90 backdrop-blur-lg"
          aria-label="Open Bought Items"
        >
          <span className="text-lg">🛍️</span>
          <div className="text-left hidden sm:block">
            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground leading-none">
              Claimed Bag
            </p>
            <p className="text-xs font-bold text-foreground">
              {boughtItems.length} {boughtItems.length === 1 ? "Item" : "Items"}
            </p>
          </div>
          {boughtItems.length > 0 && (
            <span className="rounded-full bg-accent text-accent-foreground font-mono text-[10px] font-extrabold h-5 min-w-5 px-1.5 flex items-center justify-center shadow-sm">
              {boughtItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Mobile-Optimized Agent Control Bottom Sheet */}
      <div
        className={`glass fixed inset-x-0 bottom-0 z-50 mx-auto max-w-4xl rounded-t-3xl border-t border-primary/20 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(.25,1.2,.4,1)] ${
          drawer ? "translate-y-0" : "translate-y-[calc(100%-3.75rem)]"
        }`}
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        {/* Drawer Grab Bar */}
        <button
          onClick={() => setDrawer((d) => !d)}
          className="flex h-15 w-full items-center justify-between px-4 sm:px-6 cursor-pointer touch-manipulation focus:outline-none"
          aria-expanded={drawer}
          aria-label="Toggle agent control drawer"
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary font-bold">
              Agent Control
            </span>
            <span className="hidden sm:inline-block rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[9px] text-primary">
              {currentUser ? `@${currentUser.name}` : "Guest Pilot"}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="h-1 w-10 sm:w-12 rounded-full bg-muted-foreground/40 transition-colors hover:bg-primary" />
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[10px] text-accent font-medium">
              {boughtItems.length} bought · {parkedOffers.length} parked
            </span>
            <span className="text-muted-foreground font-mono text-xs">{drawer ? "▾" : "▴"}</span>
          </div>
        </button>

        {/* Mobile Tab Switcher */}
        {drawer && (
          <div className="flex md:hidden border-b border-border/50 px-4 mb-3">
            <button
              onClick={() => setDrawerTab("profile")}
              className={`flex-1 py-2 text-xs font-mono font-medium border-b-2 transition-colors ${
                drawerTab === "profile"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              Preferences & Budget
            </button>
            <button
              onClick={() => setDrawerTab("logs")}
              className={`flex-1 py-2 text-xs font-mono font-medium border-b-2 transition-colors ${
                drawerTab === "logs"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              Activity Stream ({logs.length})
            </button>
          </div>
        )}

        {/* Drawer Body */}
        <div
          className="px-4 sm:px-6 pb-4 overflow-y-auto max-h-[65dvh] md:max-h-[50dvh]"
          style={{ overscrollBehavior: "contain" }}
        >
          <div className="grid gap-5 md:grid-cols-2">
            {/* Agent Profile & Budget Section */}
            <div
              className={
                !drawer || (isMobile && drawerTab !== "profile") ? "hidden md:block" : "block"
              }
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  My Agent Intent & Guardrails
                </h3>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {tags.length} active tags
                </span>
              </div>

              {/* Active Intent Tags */}
              <p className="mt-2.5 text-[11px] sm:text-xs text-muted-foreground">
                Active Intent Keywords
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTags(tags.filter((x) => x !== t))}
                    className="group rounded-full border border-secondary/50 bg-secondary/15 px-2.5 py-1 text-[11px] shadow-purple flex items-center gap-1.5 transition-all hover:bg-destructive/20 hover:border-destructive active:scale-95"
                    title="Tap to remove"
                  >
                    <span>{t}</span>
                    <span className="text-muted-foreground group-hover:text-destructive">✕</span>
                  </button>
                ))}
                {tags.length === 0 && (
                  <p className="text-[11px] text-muted-foreground italic">
                    No active intent tags. Add some below to guide your agent.
                  </p>
                )}
              </div>

              {/* Suggested Quick Add Tags */}
              <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Quick add:
                </span>
                {SUGGESTED_TAGS.filter((s) => !tags.includes(s)).map((suggested) => (
                  <button
                    key={suggested}
                    onClick={() => addTag(suggested)}
                    className="rounded-full border border-border/80 bg-muted/40 px-2 py-0.5 text-[10px] text-foreground/80 hover:border-primary hover:text-primary transition-colors whitespace-nowrap active:scale-95 cursor-pointer"
                  >
                    + {suggested}
                  </button>
                ))}
              </div>

              {/* Add Custom Tag Form */}
              <form
                className="mt-3 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const f = new FormData(form).get("t")?.toString();
                  if (f) addTag(f);
                  form.reset();
                }}
              >
                <input
                  name="t"
                  placeholder="Add custom intent (e.g. Sneakers, Ramen)…"
                  className="flex-1 rounded-xl border border-input bg-muted/70 px-3 py-2 text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shrink-0 cursor-pointer"
                >
                  Add
                </button>
              </form>

              {/* Hard Budget Ceiling Slider */}
              <div className="mt-4 rounded-xl border border-border/60 bg-muted/30 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Hard Budget Ceiling</span>
                  <span className="font-mono font-bold text-accent text-sm sm:text-base">
                    R{budget.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={10000}
                  step={50}
                  value={budget}
                  onChange={(e) => setBudget(+e.target.value)}
                  className="mt-2 w-full accent-[var(--accent)] cursor-pointer h-2 bg-muted rounded-lg"
                />
                <div className="mt-2 flex justify-between gap-1">
                  {[500, 1500, 3000, 6000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBudget(preset)}
                      className={`flex-1 rounded-lg py-1 font-mono text-[9px] sm:text-[10px] transition-colors cursor-pointer ${
                        budget === preset
                          ? "bg-accent/20 text-accent font-bold border border-accent/40"
                          : "bg-muted/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      R{preset >= 1000 ? `${preset / 1000}k` : preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Activity Stream Section */}
            <div
              className={
                !drawer || (isMobile && drawerTab !== "logs") ? "hidden md:block" : "block"
              }
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Live Autonomous Agent Activity
                </h3>
                <span className="font-mono text-[9px] uppercase tracking-wider text-primary">
                  Mesh Connected
                </span>
              </div>
              <div className="mt-2.5 h-48 sm:h-60 overflow-y-auto rounded-xl border border-border bg-background/80 p-3 font-mono text-[10px] sm:text-[11px] leading-relaxed space-y-1.5">
                {logs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">
                    Connecting to local autonomous mesh…
                  </p>
                ) : (
                  logs.map((l) => (
                    <p key={l.id} className="animate-ticker leading-snug break-words">
                      <span className="text-muted-foreground/70">[{l.t}]</span>{" "}
                      <span
                        className={
                          l.msg.startsWith("CLAIMED")
                            ? "text-accent font-bold"
                            : l.msg.startsWith("PARKED")
                              ? "text-primary font-bold"
                              : l.msg.includes("ACK")
                                ? "text-primary"
                                : "text-foreground/90"
                        }
                      >
                        {l.msg}
                      </span>
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Passkey Authentication Modal */}
      <PasskeyModal
        isOpen={passkeyModalOpen}
        onClose={() => setPasskeyModalOpen(false)}
        onSuccess={handlePasskeySuccess}
        initialMode={passkeyModalMode}
      />

      {/* Parking Lot Modal */}
      <ParkingLotModal
        isOpen={parkingLotOpen}
        onClose={() => setParkingLotOpen(false)}
        parkedOffers={parkedOffers}
        onClaimAndBuy={handleClaimFromParkingLot}
        onRemoveOffer={handleRemoveParkedOffer}
      />

      {/* Bought Items / Claimed Bag Modal */}
      <BoughtItemsModal
        isOpen={boughtModalOpen}
        onClose={() => setBoughtModalOpen(false)}
        boughtItems={boughtItems}
        onClearReceipt={handleClearBoughtReceipt}
      />
    </main>
  );
}
