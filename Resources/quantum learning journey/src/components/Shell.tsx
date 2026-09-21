import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Box, Check, Copy, Gauge, Layers, Orbit, PanelLeftClose, PanelLeftOpen,
  Pyramid, Radio, RotateCcw, Shapes, Sigma, Swords, TriangleAlert,
} from "lucide-react";
import { useCalc, type ViewId } from "../state/store";
import { MiniPentagram } from "./Pentagram";
import { DocModal } from "./DocModal";
import { DOC_REGISTRY } from "../docs";
import {
  fmt, QUANTUM_SUM, corrClassicalBound, H as H_KCBS, alphaBound, lovaszBound,
} from "../lib/kcbs";
import { TSIRELSON, LOCAL_BOUND, PR_BOUND } from "../lib/chsh";
import { cn } from "../utils/cn";

const GOLD = "#e8b45c", CYAN = "#6fdcf7", ROSE = "#fb5c7a", VIOLET = "#a78bfa", NEON = "#7CFFB2";

const NAV: { id: ViewId; label: string; hint: string; icon: ReactNode; key: string; group: string }[] = [
  { id: "console", label: "Console", hint: "live summary", icon: <Gauge size={15} />, key: "1", group: "start" },
  { id: "winding", label: "Why 4π?", hint: "pentagon vs pentagram", icon: <Orbit size={15} />, key: "2", group: "kcbs" },
  { id: "derivation", label: "Derivation", hint: "solve h step by step", icon: <Sigma size={15} />, key: "3", group: "kcbs" },
  { id: "playground", label: "Playground", hint: "N-cycle umbrellas", icon: <Box size={15} />, key: "4", group: "kcbs" },
  { id: "classical", label: "Classical game", hint: "beat the −3 floor", icon: <Swords size={15} />, key: "5", group: "kcbs" },
  { id: "polytope", label: "Polytope lab", hint: "V-rep → H-rep", icon: <Pyramid size={15} />, key: "6", group: "convex" },
  { id: "convexity", label: "Convexity", hint: "three nested worlds", icon: <Shapes size={15} />, key: "7", group: "convex" },
  { id: "chsh", label: "Tsirelson lab", hint: "CHSH · 2√2 · four windows", icon: <Radio size={15} />, key: "8", group: "bell" },
  { id: "hierarchy", label: "L ⊂ Q ⊂ NS", hint: "the hierarchy & causality", icon: <Layers size={15} />, key: "9", group: "bell" },
  { id: "theory", label: "Theory & refs", hint: "why it matters", icon: <BookOpen size={15} />, key: "0", group: "bell" },
];

const GROUP_LABEL: Record<string, string> = {
  start: "OVERVIEW",
  kcbs: "CONTEXTUALITY · KCBS",
  convex: "CONVEX GEOMETRY",
  bell: "NON-LOCALITY · BELL",
};

/* ================= sidebar ================= */
function Sidebar({ open, setOpen }: { open: boolean; setOpen: (b: boolean) => void }) {
  const { view, setView, reset } = useCalc();
  let lastGroup = "";

  return (
    <aside
      className={cn(
        "fixed z-40 inset-y-0 left-0 border-r border-line bg-panel/85 backdrop-blur-xl flex flex-col transition-[width] duration-300",
        open ? "w-[236px]" : "w-[68px]"
      )}
    >
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-line shrink-0">
        <MiniPentagram className="w-6 h-6 shrink-0 spin-slow" />
        {open && (
          <div className="min-w-0">
            <div className="mono text-[10.5px] tracking-[0.2em] text-ink truncate">KCBS LAB</div>
            <div className="mono text-[8.5px] text-faint tracking-wider truncate">contextuality calculator</div>
          </div>
        )}
      </div>

      <nav className="flex-1 py-3 px-2.5 space-y-0.5 overflow-y-auto">
        {NAV.map((n) => {
          const active = view === n.id;
          const newGroup = n.group !== lastGroup;
          lastGroup = n.group;
          return (
            <div key={n.id}>
              {newGroup && open && (
                <div className="mono text-[8px] tracking-[0.22em] text-faint/70 px-3 pt-3 pb-1.5">
                  {GROUP_LABEL[n.group]}
                </div>
              )}
              {newGroup && !open && <div className="h-px bg-line mx-2 my-2" />}
              <button
                onClick={() => setView(n.id)}
                title={open ? undefined : n.label}
                className={cn(
                  "w-full group relative flex items-center gap-3 rounded-xl px-3 py-2 transition-all cursor-pointer text-left",
                  active ? "bg-quantum/[0.10] text-quantum" : "text-muted hover:text-ink hover:bg-white/[0.04]"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="navpill"
                    className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] rounded-full bg-quantum"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="shrink-0">{n.icon}</span>
                {open && (
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] leading-tight">{n.label}</span>
                    <span className="block mono text-[9px] text-faint tracking-wider truncate mt-0.5">{n.hint}</span>
                  </span>
                )}
                {open && <span className="mono text-[9px] text-faint shrink-0">{n.key}</span>}
              </button>
            </div>
          );
        })}
      </nav>

      <div className="p-2.5 border-t border-line space-y-1">
        <button
          onClick={reset}
          title="reset all parameters"
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted hover:text-gold hover:bg-white/[0.04] transition-all cursor-pointer"
        >
          <RotateCcw size={15} className="shrink-0" />
          {open && <span className="text-[13px]">Reset state</span>}
        </button>
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted hover:text-ink hover:bg-white/[0.04] transition-all cursor-pointer"
        >
          {open ? <PanelLeftClose size={15} className="shrink-0" /> : <PanelLeftOpen size={15} className="shrink-0" />}
          {open && <span className="text-[13px]">Collapse</span>}
        </button>
        {open && (
          <div className="mono text-[9px] text-faint px-3 pt-1 leading-relaxed">
            <span className="text-ink">D</span> derivation · <span className="text-ink">[</span> collapse
          </div>
        )}
      </div>
    </aside>
  );
}

/* ============ per-view context chips & rail metrics ============ */
type Chip = { k: string; v: string; c?: string; title?: string };

function useViewContext() {
  const c = useCalc();
  const { view, spec, stats, alpha, lovasz, violating, N, p, h, snapped, residual, sum5 } = c;

  return useMemo<{ chips: Chip[]; rail: Chip[]; note: string }>(() => {
    const kcbsRail: Chip[] = [
      { k: "Σpᵢ", v: fmt(stats.sumP, 5), c: violating ? ROSE : undefined },
      { k: "α", v: fmt(alpha, 1).replace(".0", ""), c: GOLD },
      { k: "ϑ", v: fmt(lovasz, 5), c: CYAN },
      { k: "Σ⟨ŜŜ⟩", v: fmt(stats.sumE, 5), c: stats.sumE < corrClassicalBound(N) - 1e-9 ? ROSE : undefined },
    ];

    switch (view) {
      case "console":
        return {
          chips: [
            { k: "cone", v: `{${N}/${p}}` },
            { k: "h", v: fmt(spec.h, 5), c: CYAN },
            { k: "Σpᵢ", v: fmt(stats.sumP, 4), c: violating ? ROSE : undefined },
          ],
          rail: [...kcbsRail, { k: "h", v: fmt(spec.h, 6), c: CYAN }, { k: "KCBS ref", v: fmt(QUANTUM_SUM, 5) }],
          note: violating ? "contextual" : "classical",
        };
      case "winding":
        return {
          chips: [
            { k: "N", v: `${N}` },
            { k: "Δφ", v: `${fmt(spec.deltaDeg, 1)}°` },
            { k: "cos Δφ", v: fmt(Math.cos(spec.delta), 4), c: Math.cos(spec.delta) < 0 ? CYAN : ROSE },
          ],
          rail: [
            { k: "cos 72°", v: "+0.309017", c: ROSE },
            { k: "cos 144°", v: "−0.809017", c: CYAN },
            { k: "h²(72°)", v: "−1/√5 · imaginary", c: ROSE },
            { k: "h²(144°)", v: "+1/√5 = 0.447214", c: CYAN },
            { k: "rule", v: "N/4 < k < N/2, gcd(k,N)=1" },
          ],
          note: "obtuse neighbours required",
        };
      case "derivation":
        return {
          chips: [
            { k: "h", v: fmt(h, 5), c: snapped ? NEON : undefined },
            { k: "⟨v₁|v₂⟩", v: fmt(residual, 5), c: Math.abs(residual) < 4e-3 ? NEON : ROSE },
            { k: "Σ", v: fmt(sum5, 4), c: snapped ? ROSE : undefined },
          ],
          rail: [
            { k: "h", v: fmt(h, 6), c: snapped ? NEON : CYAN },
            { k: "h²", v: fmt(h * h, 6) },
            { k: "⟨v₁|v₂⟩", v: fmt(residual, 6), c: Math.abs(residual) < 4e-3 ? NEON : ROSE },
            { k: "target h", v: `5⁻¹ᐟ⁴ = ${fmt(H_KCBS, 6)}`, c: CYAN },
            { k: "Σ₅", v: fmt(sum5, 6), c: snapped ? ROSE : undefined },
            { k: "floor", v: "−3", c: GOLD },
          ],
          note: snapped ? "at the root" : "off root — not armed",
        };
      case "playground":
        return {
          chips: [
            { k: "cone", v: `{${N}/${p}}` },
            { k: "h", v: fmt(spec.h, 5), c: CYAN },
            { k: "gap", v: (c.gap > 0 ? "+" : "") + fmt(c.gap, 4), c: violating ? ROSE : undefined },
          ],
          rail: [
            ...kcbsRail,
            { k: "h²", v: fmt(spec.h2, 6), c: CYAN },
            { k: "r", v: fmt(spec.r, 6) },
            { k: "Δ", v: `${fmt(spec.deltaDeg, 3)}°` },
            { k: "α*", v: fmt(N / 2, 1), c: VIOLET },
          ],
          note: spec.feasible ? (violating ? "contextual" : "no violation") : "no valid umbrella",
        };
      case "classical":
        return {
          chips: [{ k: "N", v: "5" }, { k: "worlds", v: "32" }, { k: "floor", v: "−3", c: GOLD }],
          rail: [
            { k: "reachable Σ", v: "{+5, +1, −3}", c: GOLD },
            { k: "counts", v: "2 / 20 / 10" },
            { k: "parity", v: "# of −1 edges is even" },
            { k: "α(C₅)", v: "2", c: GOLD },
            { k: "quantum", v: fmt(QUANTUM_SUM, 6), c: ROSE },
          ],
          note: "parity lemma",
        };
      case "polytope":
        return {
          chips: [{ k: "vertices", v: "4" }, { k: "facets", v: "4" }, { k: "type", v: "3-simplex", c: GOLD }],
          rail: [
            { k: "V,E,F", v: "4, 6, 4", c: GOLD },
            { k: "V−E+F", v: "2" },
            { k: "edge", v: "2√2 = 2.828427", c: CYAN },
            { k: "volume", v: "8/3 = 2.666667", c: VIOLET },
            { k: "N=3 quantum", v: "(−⅓,−⅓,−⅓) · slack 0", c: NEON },
          ],
          note: "quantum touches, never crosses",
        };
      case "convexity":
        return {
          chips: [
            { k: "α", v: fmt(alphaBound(N), 1).replace(".0", ""), c: GOLD },
            { k: "ϑ", v: fmt(lovaszBound(N), 4), c: CYAN },
            { k: "α*", v: fmt(N / 2, 1), c: VIOLET },
          ],
          rail: [
            { k: "STAB", v: `α = ${fmt(alphaBound(N), 1).replace(".0", "")}`, c: GOLD },
            { k: "TH", v: `ϑ = ${fmt(lovaszBound(N), 6)}`, c: CYAN },
            { k: "QSTAB", v: `α* = ${fmt(N / 2, 1)}`, c: VIOLET },
            { k: "your Σp", v: fmt(stats.sumP, 6), c: violating ? ROSE : undefined },
            { k: "sandwich", v: "STAB ⊆ TH ⊆ QSTAB" },
          ],
          note: violating ? "in the crescent" : "inside STAB",
        };
      case "chsh":
        return {
          chips: [
            { k: "local", v: "2", c: GOLD },
            { k: "Tsirelson", v: "2√2", c: CYAN },
            { k: "PR", v: "4", c: VIOLET },
          ],
          rail: [
            { k: "local", v: `${LOCAL_BOUND}`, c: GOLD },
            { k: "Tsirelson", v: fmt(TSIRELSON, 7), c: CYAN },
            { k: "PR / algebraic", v: `${PR_BOUND}`, c: VIOLET },
            { k: "optimal E", v: `1/√2 = ${fmt(Math.SQRT1_2, 7)}`, c: NEON },
            { k: "spec(Ĉ)", v: "{−2√2, 0, 0, +2√2}" },
          ],
          note: "four independent proofs",
        };
      case "hierarchy":
        return {
          chips: [
            { k: "L", v: "square", c: GOLD },
            { k: "Q", v: "disc", c: CYAN },
            { k: "NS", v: "diamond", c: NEON },
          ],
          rail: [
            { k: "L", v: "|C₁|,|C₂| ≤ 2", c: GOLD },
            { k: "Q", v: "C₁²+C₂² ≤ 8", c: CYAN },
            { k: "NS", v: "|C₁|+|C₂| ≤ 4", c: NEON },
            { k: "all three meet at", v: "(±2, ±2)" },
            { k: "PR boxes at", v: "(±4,0), (0,±4)", c: VIOLET },
          ],
          note: "square ⊂ disc ⊂ diamond",
        };
      default:
        return {
          chips: [{ k: "refs", v: "13" }],
          rail: [
            { k: "KCBS", v: fmt(QUANTUM_SUM, 6), c: ROSE },
            { k: "Tsirelson", v: fmt(TSIRELSON, 6), c: CYAN },
            { k: "ϑ(C₅)", v: "√5 = 2.236068", c: CYAN },
            { k: "h", v: `5⁻¹ᐟ⁴ = ${fmt(H_KCBS, 6)}` },
          ],
          note: "background & sources",
        };
    }
  }, [view, spec, stats, alpha, lovasz, violating, N, p, h, snapped, residual, sum5, c.gap]);
}

/* ================= topbar ================= */
function TopBar({ onOpenDoc }: { onOpenDoc: () => void }) {
  const { view, N, p, spec, stats, violating, snapped, h } = useCalc();
  const { chips, note } = useViewContext();
  const [copied, setCopied] = useState(false);
  const title = NAV.find((n) => n.id === view)!;
  const docLabel = DOC_REGISTRY[view].label;

  const copy = () => {
    const txt = [
      `KCBS lab — ${title.label} — ${new Date().toISOString()}`,
      `cone {N/p} = {${N}/${p}}   Δ = ${fmt(spec.deltaDeg, 4)}°`,
      `h = ${fmt(spec.h, 8)}   h² = ${fmt(spec.h2, 8)}   r = ${fmt(spec.r, 8)}`,
      `Σp = ${fmt(stats.sumP, 8)}   Σ⟨SS⟩ = ${fmt(stats.sumE, 8)}`,
      `derivation h = ${fmt(h, 8)} (${snapped ? "at root" : "off root"})`,
      `verdict: ${violating ? "CONTEXTUAL" : "non-contextual"}`,
    ].join("\n");
    navigator.clipboard?.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <header className="h-14 shrink-0 border-b border-line bg-void/70 backdrop-blur-xl flex items-center justify-between gap-4 px-5 md:px-7">
      <div className="flex items-baseline gap-3 min-w-0">
        <h1 className="display text-lg md:text-xl font-light tracking-tight truncate">{title.label}</h1>
        <span className="mono text-[10px] text-faint tracking-[0.18em] hidden lg:block truncate">{note}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {chips.map((ch) => (
          <span key={ch.k} className="chip hidden md:inline-flex !gap-1.5" title={ch.title}>
            <span className="text-faint">{ch.k}</span>
            <span style={{ color: ch.c }}>{ch.v}</span>
          </span>
        ))}
        <button
          onClick={onOpenDoc}
          title={`open the ${docLabel} derivation (D)`}
          className="chip !py-1.5 cursor-pointer hover:!text-quantum hover:!border-quantum/50 transition-colors"
        >
          <BookOpen size={11} />
          <span className="hidden md:inline">{docLabel} math</span>
        </button>
        <button
          onClick={copy}
          title="copy current results"
          className="chip !py-1.5 cursor-pointer hover:!text-quantum hover:!border-quantum/50 transition-colors"
        >
          {copied ? <Check size={11} className="text-quantum" /> : <Copy size={11} />}
        </button>
      </div>
    </header>
  );
}

/* ================= status rail ================= */
function StatusRail() {
  const { view, violating, spec } = useCalc();
  const { rail } = useViewContext();
  const flag =
    view === "chsh" || view === "hierarchy" || view === "polytope"
      ? null
      : !spec.feasible
        ? { t: "no umbrella", c: ROSE }
        : violating
          ? { t: "contextual", c: ROSE }
          : { t: "classical", c: GOLD };

  return (
    <footer className="h-9 shrink-0 border-t border-line bg-panel/70 backdrop-blur-xl flex items-center gap-5 px-5 md:px-7 overflow-x-auto">
      {rail.map((r, i) => (
        <span key={i} className="mono text-[10px] whitespace-nowrap shrink-0">
          <span className="text-faint">{r.k} </span>
          <span style={{ color: r.c }}>{r.v}</span>
        </span>
      ))}
      {flag && (
        <span className="mono text-[10px] whitespace-nowrap shrink-0 ml-auto flex items-center gap-1.5" style={{ color: flag.c }}>
          {flag.c === ROSE ? <TriangleAlert size={10} /> : <Check size={10} />}
          {flag.t}
        </span>
      )}
    </footer>
  );
}

/* ================= shell ================= */
export function Shell({ children }: { children: ReactNode }) {
  const { setView, view } = useCalc();
  const [open, setOpen] = useState(() => (typeof window === "undefined" ? true : window.innerWidth >= 1024));
  const [doc, setDoc] = useState(false);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth < 1024) setOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const hit = NAV.find((n) => n.key === e.key);
      if (hit) { setView(hit.id); e.preventDefault(); }
      if (e.key === "[") setOpen((o) => !o);
      if (e.key === "d" || e.key === "D") setDoc((d) => !d);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setView]);

  return (
    <div className="noise h-svh w-full bg-void text-ink flex overflow-hidden">
      <Sidebar open={open} setOpen={setOpen} />
      <div className={cn("flex-1 flex flex-col min-w-0 transition-[margin] duration-300", open ? "ml-[236px]" : "ml-[68px]")}>
        <TopBar onOpenDoc={() => setDoc(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="min-h-full">{children}</div>
        </main>
        <StatusRail />
      </div>
      <DocModal open={doc} onClose={() => setDoc(false)} spec={DOC_REGISTRY[view].spec} />
    </div>
  );
}
