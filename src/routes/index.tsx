import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { INDOOR, OUTDOOR, TICKS, fill, hueVar, type Store } from "@/lib/acn-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Autonomous Commerce Network" },
      { name: "description", content: "A living sphere of nearby shops where your AI agent negotiates deals in real time." },
      { property: "og:title", content: "The Autonomous Commerce Network" },
      { property: "og:description", content: "Your AI agent negotiates with nearby stores, live, on a spinning proximity sphere." },
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

function App() {
  const [outdoor, setOutdoor] = useState(false);
  const stores = outdoor ? OUTDOOR : INDOOR;
  const [rot, setRot] = useState(0);
  const rotRef = useRef(0);
  const vel = useRef(0.0025);
  const target = useRef<number | null>(null);
  const drag = useRef<{ x: number; r: number } | null>(null);
  const [radius, setRadius] = useState(170);
  const [ticks, setTicks] = useState<Record<string, string>>({});
  const [deal, setDeal] = useState<Deal | null>(null);
  const [claimed, setClaimed] = useState<string[]>([]);
  const [drawer, setDrawer] = useState(false);
  const [tags, setTags] = useState(["Coffee", "Hoodies", "Sushi"]);
  const [budget, setBudget] = useState(1500);
  const [logs, setLogs] = useState<Log[]>([]);
  const [left, setLeft] = useState(0);
  const [w, setW] = useState(1000);
  const [h, setH] = useState(800);

  useEffect(() => {
    const on = () => { setW(window.innerWidth); setH(window.innerHeight); };
    on(); window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  const watch = w < 320 || h < 320;
  const mobile = w < 640;
  const scale = Math.max(0.3, Math.min(1, w / 760, (h - 160) / 640));
  const cardHalf = watch ? 22 : mobile ? 64 : 88;
  useEffect(() => setRadius(outdoor ? 300 : 175), [outdoor]);

  // animation loop
  const radRef = useRef(radius);
  const [radAnim, setRadAnim] = useState(radius);
  useEffect(() => {
    let f = 0;
    const loop = () => {
      if (target.current !== null) {
        const d = target.current - rotRef.current;
        rotRef.current += d * 0.07;
        if (Math.abs(d) < 0.001) target.current = null;
      } else if (!drag.current) {
        rotRef.current += vel.current;
        vel.current += (0.0025 - vel.current) * 0.02;
      }
      radRef.current += (radius - radRef.current) * 0.06;
      setRot(rotRef.current); setRadAnim(radRef.current);
      f = requestAnimationFrame(loop);
    };
    f = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(f);
  }, [radius]);

  // tickers + logs
  useEffect(() => {
    const id = setInterval(() => {
      const s = stores[Math.floor(Math.random() * stores.length)]!;
      setTicks((t) => ({ ...t, [s.id]: fill(TICKS[Math.floor(Math.random() * TICKS.length)]!, s) }));
      const agent = s.name.replace(/[^A-Za-z]/g, "") + "Agent";
      const msgs = [`ConsumerAgent pinged ${agent}… Checking stock…`, `${agent} ACK · latency ${8 + Math.floor(Math.random() * 30)}ms`, `Intent match [${tags.join("|")}] → ${s.tag}`, `Budget guard ≤ R${budget} · ${agent} quote R${Math.round(s.open * 0.85)}`, `Handshake ${Math.random().toString(16).slice(2, 10)} signed with ${agent}`];
      setLogs((l) => [{ t: now(), msg: msgs[Math.floor(Math.random() * msgs.length)]!, id: logId++ }, ...l].slice(0, 60));
    }, 1300);
    return () => clearInterval(id);
  }, [stores, tags, budget]);

  // deals
  const n = stores.length;
  const trigger = (s?: Store) => {
    const idx = s ? stores.indexOf(s) : Math.floor(Math.random() * n);
    const store = stores[idx]!;
    const base = (idx / n) * Math.PI * 2;
    let tgt = -base;
    while (tgt < rotRef.current - Math.PI) tgt += Math.PI * 2;
    while (tgt > rotRef.current + Math.PI) tgt -= Math.PI * 2;
    target.current = tgt;
    const price = Math.round(store.open * 0.8);
    setDeal({ store, price, counter: Math.round(store.open * 0.76), expires: Date.now() + 465000, total: 465 });
    if ("vibrate" in navigator) navigator.vibrate?.([60, 40, 120]);
  };
  useEffect(() => {
    if (deal) return;
    const id = setTimeout(() => trigger(), 9000);
    return () => clearTimeout(id);
  }, [deal, stores]);
  useEffect(() => {
    if (!deal) return;
    const id = setInterval(() => {
      const l = Math.max(0, Math.round((deal.expires - Date.now()) / 1000));
      setLeft(l); if (!l) setDeal(null);
    }, 250);
    return () => clearInterval(id);
  }, [deal]);

  const nodes = useMemo(() => stores.map((s, i) => {
    const a = (i / n) * Math.PI * 2 + rot;
    const lat = Math.sin(i * 2.3) * 0.45;
    const R = radAnim * scale;
    const x = Math.sin(a) * Math.cos(lat) * Math.min(R * 1.35, w / 2 - cardHalf * 0.7);
    const z = Math.cos(a) * Math.cos(lat);
    const y = Math.sin(lat) * R * 0.9 + Math.sin(rot * 3 + i) * 6;
    return { s, x, y, z };
  }), [stores, rot, radAnim, scale, n, w, cardHalf]);

  const down = (e: React.PointerEvent) => { drag.current = { x: e.clientX, r: rotRef.current }; target.current = null; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); };
  const move = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const nr = drag.current.r + (e.clientX - drag.current.x) * 0.006;
    vel.current = nr - rotRef.current; rotRef.current = nr;
  };
  const up = () => { drag.current = null; };

  const mm = String(Math.floor(left / 60)).padStart(2, "0") + ":" + String(left % 60).padStart(2, "0");

  return (
    <main className="relative h-dvh overflow-hidden bg-background bg-aurora select-none">
      {/* header */}
      <header className={`relative z-20 grid items-center gap-2 px-3 pt-3 sm:flex sm:justify-between sm:gap-4 sm:px-6 sm:pt-5 lg:px-10 ${watch ? "justify-items-center" : "grid-cols-[minmax(0,1fr)_auto]"}`}>
        {!watch && <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-primary sm:text-[10px]">ACN · live mesh</p>
          <h1 className="truncate text-sm font-semibold tracking-tight sm:text-lg lg:text-2xl"><span className="sm:hidden">Autonomous Commerce</span><span className="hidden sm:inline">The Autonomous Commerce Network</span></h1>
        </div>}
        <button onClick={() => setOutdoor((o) => !o)} className="glass relative flex shrink-0 rounded-full p-1 font-mono text-[10px] sm:text-xs" aria-label="Toggle radius mode">
          <span className="absolute inset-y-1 w-1/2 rounded-full bg-primary shadow-teal transition-transform duration-700 ease-[cubic-bezier(.3,1.4,.4,1)]" style={{ transform: `translateX(${outdoor ? "100%" : "0"})` }} />
          <span className={`relative z-10 w-1/2 px-2.5 py-1.5 text-center transition-colors sm:px-4 sm:py-2 ${!outdoor ? "text-primary-foreground" : "text-muted-foreground"}`}>{mobile ? "In·20m" : "Indoor · 20m"}</span>
          <span className={`relative z-10 w-1/2 px-2.5 py-1.5 text-center transition-colors sm:px-4 sm:py-2 ${outdoor ? "text-primary-foreground" : "text-muted-foreground"}`}>{mobile ? "Out·50m" : "Outdoor · 50m"}</span>
        </button>
      </header>

      {/* sphere */}
      <section className="relative z-10 h-[calc(100dvh-7.5rem)] cursor-grab sm:h-[calc(100dvh-9rem)] touch-pan-y active:cursor-grabbing" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}>
        <div className="absolute left-1/2 top-1/2">
          {[1, 0.72, 0.45].map((k) => (
            <div key={k} className="absolute rounded-full border border-primary/15 animate-breathe" style={{ width: radAnim * scale * 2.9 * k, height: radAnim * scale * 1.9 * k, left: -radAnim * scale * 1.45 * k, top: -radAnim * scale * 0.95 * k }} />
          ))}
          <div className="absolute -left-14 -top-14 h-28 w-28 rounded-full bg-secondary/30 blur-2xl animate-breathe" />
          <div className="absolute -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="mx-auto h-4 w-4 rounded-full bg-primary shadow-teal" />
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">You · {outdoor ? "50m" : "20m"}</p>
          </div>
          {deal && <>{[0, 0.8, 1.6].map((d) => <div key={d} className="absolute left-0 top-0 h-40 w-40 rounded-full border-2 border-accent animate-sonar" style={{ animationDelay: `${d}s` }} />)}</>}

          {[...nodes].sort((a, b) => a.z - b.z).map(({ s, x, y, z }) => {
            const p = (z + 1) / 2;
            const hot = deal?.store.id === s.id;
            const c = hueVar[s.hue];
            return (
              <button key={s.id} onClick={() => trigger(s)}
                aria-label={`${s.name}, ${s.dist} metres`}
                className={`glass absolute left-0 top-0 text-left ${watch ? "grid h-11 w-11 place-items-center rounded-full p-0" : mobile ? "w-32 rounded-xl p-2" : "w-44 rounded-2xl p-3"}`} transition-[box-shadow,border-color] duration-500"
                style={{
                  transform: `translate(-50%,-50%) translate(${x}px, ${y}px) scale(${(0.45 + p * 0.65) * (hot ? 1.18 : 1) * (watch ? 1 : Math.max(scale, 0.8))})`,
                  opacity: 0.12 + p * 0.88, zIndex: Math.round(p * 100), filter: `blur(${(1 - p) * 2.5}px)`,
                  boxShadow: hot ? "var(--glow-amber)" : `0 0 ${p * 22}px color-mix(in oklab, ${c} 40%, transparent)`,
                  borderColor: hot ? "var(--accent)" : `color-mix(in oklab, ${c} 35%, transparent)`,
                  pointerEvents: p < 0.35 ? "none" : "auto",
                }}>
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-full text-lg" style={{ background: `color-mix(in oklab, ${c} 25%, transparent)`, boxShadow: `inset 0 0 12px ${c}` }}>{s.icon}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{s.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{s.cat} · {s.dist}m</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider" style={{ color: c }}>
                  <span className="relative flex h-2 w-2"><span className="absolute inset-0 animate-ping rounded-full" style={{ background: c }} /><span className="relative h-2 w-2 rounded-full" style={{ background: c }} /></span>
                  {claimed.includes(s.id) ? "Deal claimed ✓" : "AI agent synchronizing"}
                </div>
                <div className="mt-1.5 h-4 overflow-hidden font-mono text-[10px] text-foreground/80">
                  <p key={ticks[s.id]} className="animate-ticker truncate">{ticks[s.id] ?? "Opening channel…"}</p>
                </div>
              </button>
            );
          })}
        </div>
        <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Drag to roll the sphere · tap an orb to negotiate</p>
      </section>

      {/* deal card */}
      {deal && (
        <aside key={deal.store.id + deal.expires} className="glass animate-slideup fixed bottom-24 right-4 z-40 w-[min(380px,calc(100vw-2rem))] rounded-3xl p-5 shadow-amber md:right-8 md:top-28 md:bottom-auto">
          <div className="flex items-start justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">⚡ Deal matched</p>
            <button onClick={() => setDeal(null)} className="text-muted-foreground hover:text-foreground" aria-label="Dismiss">✕</button>
          </div>
          <h2 className="mt-2 text-xl font-semibold">{deal.store.item}</h2>
          <p className="text-sm text-muted-foreground">{deal.store.icon} {deal.store.name} · {deal.store.dist}m away</p>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-4xl font-bold text-accent">R{deal.price}</span>
            <span className="pb-1 text-sm text-muted-foreground line-through">R{deal.store.open}</span>
            <span className="ml-auto pb-1 font-mono text-xs text-primary">-{Math.round((1 - deal.price / deal.store.open) * 100)}%</span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between font-mono text-[10px] text-muted-foreground"><span>Expires in</span><span className="text-foreground">{mm}</span></div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-cta transition-[width] duration-300" style={{ width: `${(left / deal.total) * 100}%` }} /></div>
          </div>
          <ol className="mt-4 space-y-1.5 border-l border-border pl-3 font-mono text-[11px]">
            <li className="text-muted-foreground">Shop opened at <span className="text-foreground">R{deal.store.open}</span></li>
            <li className="text-muted-foreground">Your agent counter-offered <span className="text-primary">R{deal.counter}</span></li>
            <li className="text-muted-foreground">Settlement reached at <span className="text-accent">R{deal.price}!</span></li>
          </ol>
          <button onClick={() => { setClaimed((c) => [...c, deal.store.id]); setLogs((l) => [{ t: now(), msg: `CLAIMED ${deal.store.item} @ R${deal.price} · QR token issued`, id: logId++ }, ...l]); setDeal(null); }}
            className="bg-cta mt-5 w-full rounded-2xl py-3 font-semibold text-accent-foreground shadow-amber transition-transform hover:scale-[1.02] active:scale-95">
            Accept & Claim
          </button>
        </aside>
      )}

      {/* drawer */}
      <div className={`glass fixed inset-x-0 bottom-0 z-50 mx-auto max-w-4xl rounded-t-3xl transition-transform duration-700 ease-[cubic-bezier(.25,1.3,.4,1)] ${drawer ? "translate-y-0" : "translate-y-[calc(100%-4rem)]"}`}>
        <button onClick={() => setDrawer((d) => !d)} className="flex h-16 w-full items-center justify-between px-6">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Agent control</span>
          <span className="mx-auto h-1 w-10 rounded-full bg-muted-foreground/50" />
          <span className="font-mono text-[10px] text-muted-foreground">{claimed.length} claimed {drawer ? "▾" : "▴"}</span>
        </button>
        <div className="grid gap-6 px-6 pb-6 md:grid-cols-2">
          <div>
            <h3 className="font-semibold">My Agent Profile</h3>
            <p className="mt-3 text-xs text-muted-foreground">Intent tags</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((t) => (
                <button key={t} onClick={() => setTags(tags.filter((x) => x !== t))} className="rounded-full border border-secondary/50 bg-secondary/15 px-3 py-1 text-xs shadow-purple">{t} ✕</button>
              ))}
            </div>
            <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget).get("t")?.toString().trim(); if (f && !tags.includes(f)) setTags([...tags, f]); e.currentTarget.reset(); }}>
              <input name="t" placeholder="Add intent, e.g. Sneakers" className="flex-1 rounded-xl border border-input bg-muted px-3 py-2 text-sm outline-none focus:border-primary" />
              <button className="rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Add</button>
            </form>
            <div className="mt-5 flex justify-between text-xs"><span className="text-muted-foreground">Hard budget ceiling</span><span className="font-mono text-accent">R{budget}</span></div>
            <input type="range" min={50} max={10000} step={50} value={budget} onChange={(e) => setBudget(+e.target.value)} className="mt-2 w-full accent-[var(--accent)]" />
          </div>
          <div>
            <h3 className="font-semibold">Live Stream Activity Log</h3>
            <div className="mt-3 h-56 overflow-hidden rounded-xl border border-border bg-background/70 p-3 font-mono text-[11px] leading-relaxed">
              {logs.map((l) => (
                <p key={l.id} className="animate-ticker truncate"><span className="text-muted-foreground">[{l.t}]</span> <span className={l.msg.startsWith("CLAIMED") ? "text-accent" : "text-primary"}>{l.msg}</span></p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
