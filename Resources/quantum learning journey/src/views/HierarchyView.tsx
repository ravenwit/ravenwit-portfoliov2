import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Ban, Check, Info, Layers, Radio, Shield, Zap } from "lucide-react";
import { SectionHead, Reveal } from "../components/Section";
import { TeX } from "../components/TeX";
import { useCalc } from "../state/store";
import {
  LOCAL_BOUND, TSIRELSON, PR_BOUND, sliceLayer, sliceLocalCorners,
  boxChecks, boxCorrelators, boxDistribution, PR_BOX, CLASSICAL_BOX, QUANTUM_BOX,
  type Box, type Layer,
} from "../lib/chsh";
import { fmt, clamp } from "../lib/kcbs";
import { cn } from "../utils/cn";

const GOLD = "#e8b45c";
const CYAN = "#6fdcf7";
const ROSE = "#fb5c7a";
const NEON = "#7CFFB2";

const LAYER_META: Record<Layer, { label: string; color: string; note: string }> = {
  local: { label: "LOCAL", color: GOLD, note: "reproducible by shared randomness" },
  quantum: { label: "QUANTUM", color: CYAN, note: "needs entanglement — beyond any LHV" },
  ns: { label: "POST-QUANTUM", color: NEON, note: "no-signaling holds, yet nature forbids it" },
  outside: { label: "IMPOSSIBLE", color: ROSE, note: "violates no-signaling / normalization" },
};

/* ---------------- principles ---------------- */
interface Principles { ns: boolean; qm: boolean; local: boolean }

function allowedLayer(p: Principles): "hyper" | "ns" | "quantum" | "local" {
  if (p.local) return "local";
  if (p.qm) return "quantum";
  if (p.ns) return "ns";
  return "hyper";
}

/* ================= the slice canvas ================= */
function SliceMap({
  c1, c2, onPick, p,
}: {
  c1: number; c2: number; onPick: (a: number, b: number) => void; p: Principles;
}) {
  const W = 560, H = 560, M = 46;
  const R = 4.6; // axis half-range
  const X = (v: number) => M + ((v + R) / (2 * R)) * (W - 2 * M);
  const Y = (v: number) => M + ((R - v) / (2 * R)) * (H - 2 * M);
  const allow = allowedLayer(p);
  const corners = sliceLocalCorners();
  const layer = sliceLayer(c1, c2);

  const show = {
    hyper: allow === "hyper",
    ns: allow === "hyper" || allow === "ns",
    q: allow === "hyper" || allow === "ns" || allow === "quantum",
    l: true,
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full cursor-crosshair"
      onClick={(e) => {
        const svg = e.currentTarget;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX; pt.y = e.clientY;
        const l = pt.matrixTransform(svg.getScreenCTM()!.inverse());
        onPick(
          clamp(((l.x - M) / (W - 2 * M)) * 2 * R - R, -R, R),
          clamp(R - ((l.y - M) / (H - 2 * M)) * 2 * R, -R, R)
        );
      }}
    >
      {/* grid */}
      {[-4, -2, 0, 2, 4].map((t) => (
        <g key={t}>
          <line x1={X(t)} x2={X(t)} y1={M} y2={H - M} stroke="rgba(236,231,219,0.05)" />
          <line x1={M} x2={W - M} y1={Y(t)} y2={Y(t)} stroke="rgba(236,231,219,0.05)" />
          <text x={X(t)} y={H - M + 17} textAnchor="middle" fontSize="9.5" className="mono" fill="rgba(143,141,156,0.85)">{t}</text>
          <text x={M - 9} y={Y(t) + 3.5} textAnchor="end" fontSize="9.5" className="mono" fill="rgba(143,141,156,0.85)">{t}</text>
        </g>
      ))}

      {/* full algebraic hypercube projection */}
      {show.hyper && (
        <rect
          x={X(-4)} y={Y(4)} width={X(4) - X(-4)} height={Y(-4) - Y(4)}
          fill="rgba(251,92,122,0.05)" stroke="rgba(251,92,122,0.35)" strokeDasharray="4 4"
        />
      )}
      {/* NS diamond |C1|+|C2| ≤ 4 */}
      {show.ns && (
        <polygon
          points={`${X(4)},${Y(0)} ${X(0)},${Y(4)} ${X(-4)},${Y(0)} ${X(0)},${Y(-4)}`}
          fill="rgba(124,255,178,0.07)" stroke={NEON} strokeWidth="1.5" strokeOpacity={0.75}
        />
      )}
      {/* Quantum disc radius 2√2 */}
      {show.q && (
        <circle
          cx={X(0)} cy={Y(0)} r={((TSIRELSON) / (2 * R)) * (W - 2 * M)}
          fill="rgba(111,220,247,0.09)" stroke={CYAN} strokeWidth="1.6"
        />
      )}
      {/* Local square */}
      <rect
        x={X(-2)} y={Y(2)} width={X(2) - X(-2)} height={Y(-2) - Y(2)}
        fill="rgba(232,180,92,0.12)" stroke={GOLD} strokeWidth="1.6"
      />

      {/* labels */}
      {show.hyper && <text x={X(-4) + 8} y={Y(4) + 16} fontSize="9.5" className="mono" fill="rgba(251,92,122,0.8)">ALGEBRAIC</text>}
      {show.ns && <text x={X(0)} y={Y(3.35)} textAnchor="middle" fontSize="10" className="mono" fill={NEON}>NO-SIGNALING</text>}
      {show.q && <text x={X(0)} y={Y(2.45)} textAnchor="middle" fontSize="10" className="mono" fill={CYAN}>QUANTUM · ϑ = 2√2</text>}
      <text x={X(0)} y={Y(1.55)} textAnchor="middle" fontSize="10" className="mono" fill={GOLD}>LOCAL</text>

      {/* deterministic corners */}
      {corners.map(([a, b], i) => (
        <g key={i}>
          <circle cx={X(a)} cy={Y(b)} r="4.5" fill={GOLD} />
          <text x={X(a) + (a > 0 ? 9 : -9)} y={Y(b) + (b > 0 ? -8 : 15)} textAnchor={a > 0 ? "start" : "end"} fontSize="8.5" className="mono" fill="rgba(232,180,92,0.8)">
            ({a},{b})
          </text>
        </g>
      ))}

      {/* PR boxes at diamond vertices */}
      {([[4, 0], [0, 4], [-4, 0], [0, -4]] as const).map(([a, b], i) => (
        <g key={i}>
          <circle cx={X(a)} cy={Y(b)} r="5" fill="none" stroke={NEON} strokeWidth="1.8" />
          <circle cx={X(a)} cy={Y(b)} r="1.8" fill={NEON} />
        </g>
      ))}
      <text x={X(4)} y={Y(0) - 14} textAnchor="middle" fontSize="9" className="mono" fill={NEON}>PR box</text>

      {/* tangency callouts */}
      <line x1={X(2)} y1={Y(2)} x2={X(2.75)} y2={Y(2.75)} stroke="rgba(236,231,219,0.3)" strokeDasharray="2 3" />
      <text x={X(2.85)} y={Y(2.9)} fontSize="8.5" className="mono" fill="rgba(236,231,219,0.6)">all three touch here</text>

      {/* axes */}
      <line x1={M} x2={W - M} y1={Y(0)} y2={Y(0)} stroke="rgba(236,231,219,0.22)" />
      <line x1={X(0)} x2={X(0)} y1={M} y2={H - M} stroke="rgba(236,231,219,0.22)" />
      <text x={W - M} y={Y(0) - 8} textAnchor="end" fontSize="10" className="mono" fill="rgba(143,141,156,0.9)">C₁ = ⟨A₀B₀⟩+⟨A₀B₁⟩+⟨A₁B₀⟩−⟨A₁B₁⟩</text>
      <text x={X(0) + 8} y={M + 4} fontSize="10" className="mono" fill="rgba(143,141,156,0.9)">C₂</text>

      {/* probe */}
      <motion.g animate={{ x: X(c1) - X(0), y: Y(c2) - Y(0) }} transition={{ type: "spring", stiffness: 220, damping: 24 }}>
        <circle cx={X(0)} cy={Y(0)} r="13" fill="none" stroke={LAYER_META[layer].color} strokeWidth="1.2" opacity="0.5">
          <animate attributeName="r" values="10;17;10" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx={X(0)} cy={Y(0)} r="6" fill={LAYER_META[layer].color} />
      </motion.g>
    </svg>
  );
}

/* ================= correlation thermometer ================= */
function Meter({ value }: { value: number }) {
  const H = 300, W = 148;
  const top = 24, bot = H - 30;
  const Y = (v: number) => bot - (v / 4.4) * (bot - top);
  const a = Math.abs(value);
  const col = a <= LOCAL_BOUND ? GOLD : a <= TSIRELSON ? CYAN : a <= PR_BOUND ? NEON : ROSE;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[150px]">
      <rect x={30} y={Y(4.4)} width={30} height={Y(PR_BOUND) - Y(4.4)} fill="rgba(251,92,122,0.12)" />
      <rect x={30} y={Y(PR_BOUND)} width={30} height={Y(TSIRELSON) - Y(PR_BOUND)} fill="rgba(124,255,178,0.14)" />
      <rect x={30} y={Y(TSIRELSON)} width={30} height={Y(LOCAL_BOUND) - Y(TSIRELSON)} fill="rgba(111,220,247,0.16)" />
      <rect x={30} y={Y(LOCAL_BOUND)} width={30} height={Y(0) - Y(LOCAL_BOUND)} fill="rgba(232,180,92,0.18)" />
      <rect x={30} y={top} width={30} height={bot - top} fill="none" stroke="rgba(236,231,219,0.14)" rx="4" />

      {([
        [PR_BOUND, "4.00 · PR box", NEON],
        [TSIRELSON, "2√2 · Tsirelson", CYAN],
        [LOCAL_BOUND, "2.00 · Bell", GOLD],
        [0, "0", "rgba(143,141,156,0.9)"],
      ] as const).map(([v, l, c]) => (
        <g key={l}>
          <line x1={26} x2={64} y1={Y(v)} y2={Y(v)} stroke={c} strokeWidth="1.2" />
          <text x={68} y={Y(v) + 3.5} fontSize="8.5" className="mono" fill={c}>{l}</text>
        </g>
      ))}

      <motion.g animate={{ y: Y(Math.min(a, 4.4)) - Y(0) }} transition={{ type: "spring", stiffness: 180, damping: 22 }}>
        <rect x={27} y={Y(0) - 2} width={36} height={4} rx="2" fill={col} />
        <circle cx={45} cy={Y(0)} r="6" fill="#0b0b14" stroke={col} strokeWidth="2" />
      </motion.g>
      <text x={45} y={H - 8} textAnchor="middle" fontSize="11" className="mono" fill={col}>|C| = {fmt(a, 4)}</text>
    </svg>
  );
}

/* ================= view ================= */
export function HierarchyView() {
  const { setView } = useCalc();
  const [c1, setC1] = useState(2 * Math.SQRT2);
  const [c2, setC2] = useState(0);
  const [p, setP] = useState<Principles>({ ns: true, qm: true, local: false });
  const [box, setBox] = useState<Box>(QUANTUM_BOX);

  const layer = sliceLayer(c1, c2);
  const meta = LAYER_META[layer];
  const checks = useMemo(() => boxChecks(box), [box]);
  const E = boxCorrelators(box);
  const allow = allowedLayer(p);

  const setAgree = (x: 0 | 1, y: 0 | 1, v: number) =>
    setBox((b) => ({ agree: b.agree.map((r, i) => r.map((q, j) => (i === x && j === y ? v : q))) as Box["agree"] }));

  return (
    <div className="px-5 md:px-8 py-7 max-w-[1500px] space-y-6">
      <SectionHead
        index="STAGE 3"
        kicker="The hierarchy"
        accent="rose"
        title={<>Local <span className="italic text-gold">⊂</span> Quantum <span className="italic text-quantum">⊂</span> <span className="italic" style={{ color: NEON }}>No-signaling</span></>}
        lede={
          <>
            Project the four CHSH correlators onto two Bell expressions,{" "}
            <TeX>{"C_1 = E_{00}+E_{01}+E_{10}-E_{11}"}</TeX> and{" "}
            <TeX>{"C_2 = E_{00}+E_{01}-E_{10}+E_{11}"}</TeX>. The three worlds become a{" "}
            <span className="text-gold">square</span>, a <span className="text-quantum">disc</span>{" "}
            and a <span style={{ color: NEON }}>diamond</span> — each inscribed in the next,
            all three kissing at the four points <TeX>{"(\\pm2,\\pm2)"}</TeX>.
          </>
        }
      />

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <Reveal className="card p-5">
          <div className="mono text-[10px] tracking-[0.25em] text-faint mb-1 px-1">
            CORRELATION SPACE — CLICK ANYWHERE TO MOVE THE PROBE
          </div>
          <SliceMap c1={c1} c2={c2} p={p} onPick={(a, b) => { setC1(a); setC2(b); }} />
        </Reveal>

        <div className="flex flex-col gap-4">
          <Reveal delay={0.04} className="card p-6">
            <div className="grid grid-cols-[1fr_auto] gap-5">
              <div>
                <div className="mono text-[10px] tracking-[0.25em] text-faint mb-3">PROBE VERDICT</div>
                <div className="mono text-2xl mb-1" style={{ color: meta.color }}>{meta.label}</div>
                <div className="mono text-[11px] text-faint mb-4">{meta.note}</div>
                {(["C₁", "C₂"] as const).map((l, i) => (
                  <div key={l} className="mb-2.5">
                    <div className="flex justify-between mono text-[10px] mb-0.5">
                      <span className="text-faint">{l}</span>
                      <span className="text-ink/85">{fmt(i === 0 ? c1 : c2, 4)}</span>
                    </div>
                    <input
                      type="range" min={-4.4} max={4.4} step={0.01}
                      value={i === 0 ? c1 : c2}
                      onChange={(e) => (i === 0 ? setC1 : setC2)(parseFloat(e.target.value))}
                      className="kcbs-range" aria-label={l}
                    />
                  </div>
                ))}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <button onClick={() => { setC1(2); setC2(2); }} className="chip !py-1.5 !px-3 cursor-pointer !text-gold !border-gold/40">corner (2,2)</button>
                  <button onClick={() => { setC1(TSIRELSON); setC2(0); }} className="chip !py-1.5 !px-3 cursor-pointer !text-quantum !border-quantum/40">Tsirelson</button>
                  <button onClick={() => { setC1(4); setC2(0); }} className="chip !py-1.5 !px-3 cursor-pointer" style={{ color: NEON, borderColor: NEON + "66" }}>PR box</button>
                </div>
              </div>
              <Meter value={c1} />
            </div>
          </Reveal>

          <Reveal delay={0.08} className="card p-6">
            <div className="mono text-[10px] tracking-[0.25em] text-faint mb-3 flex items-center gap-2">
              <Shield size={12} className="text-quantum" /> WHICH PRINCIPLES ARE IN FORCE?
            </div>
            <div className="space-y-2">
              {([
                ["ns", "No superluminal signaling", "marginals independent of the distant setting", NEON],
                ["qm", "Quantum mechanics", "correlations from states & observables on ℋ_A ⊗ ℋ_B", CYAN],
                ["local", "Local realism / hidden variables", "outcomes pre-determined by shared λ", GOLD],
              ] as const).map(([k, label, hint, col]) => (
                <button
                  key={k}
                  onClick={() => setP((q) => ({ ...q, [k]: !q[k] }))}
                  className={cn(
                    "w-full flex items-start gap-3 rounded-xl border px-4 py-2.5 text-left transition-all cursor-pointer",
                    p[k] ? "bg-white/[0.04]" : "opacity-50"
                  )}
                  style={{ borderColor: p[k] ? col + "66" : "rgba(236,231,219,0.09)" }}
                >
                  <span
                    className="w-4 h-4 rounded-[5px] shrink-0 mt-0.5 flex items-center justify-center"
                    style={{ background: p[k] ? col : "transparent", border: `1px solid ${col}88` }}
                  >
                    {p[k] && <Check size={10} className="text-void" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[12.5px] text-ink">{label}</span>
                    <span className="block mono text-[9.5px] text-faint mt-0.5">{hint}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-line bg-white/[0.02] px-4 py-3 mt-3">
              <div className="mono text-[10px] text-faint mb-1">ALLOWED REGION</div>
              <div className="mono text-[13px]" style={{ color: allow === "local" ? GOLD : allow === "quantum" ? CYAN : allow === "ns" ? NEON : ROSE }}>
                {allow === "local" ? "square |C₁|,|C₂| ≤ 2"
                  : allow === "quantum" ? "disc C₁² + C₂² ≤ 8"
                  : allow === "ns" ? "diamond |C₁| + |C₂| ≤ 4"
                  : "full algebraic box |Cᵢ| ≤ 4"}
              </div>
              <p className="text-[12px] text-muted leading-relaxed mt-2">
                {allow === "local" ? "Assuming pre-existing values collapses the world to the smallest shape — and 8 of its 16 strategies sit on each corner."
                  : allow === "quantum" ? "Dropping local realism inflates the square into a disc: entanglement buys exactly the factor √2, no more."
                  : allow === "ns" ? "Keep only relativistic causality and the diamond appears. Its corners are PR boxes — logically consistent, physically absent."
                  : "With nothing assumed, only arithmetic restricts you. Even here |C| ≤ 4."}
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* PR box editor */}
      <Reveal className="card p-6">
        <div className="mono text-[10px] tracking-[0.25em] text-faint mb-2 flex items-center gap-2">
          <Radio size={12} style={{ color: NEON }} /> BOX EDITOR — BUILD A BEHAVIOUR P(a,b|x,y) AND AUDIT IT
        </div>
        <p className="text-[12.5px] text-muted leading-relaxed mb-5 max-w-3xl">
          Set the agreement probability <TeX>{"P(a=b\\,|\\,x,y)"}</TeX> for each of the four
          settings. Marginals stay uniform by construction, so no-signaling is structurally
          guaranteed — which is exactly what makes the PR box so unsettling.
        </p>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
          <div>
            <div className="grid grid-cols-2 gap-3">
              {([0, 1] as const).flatMap((x) =>
                ([0, 1] as const).map((y) => {
                  const q = box.agree[x][y];
                  const d = boxDistribution(box, x, y);
                  return (
                    <div key={`${x}${y}`} className="rounded-xl border border-line bg-white/[0.02] px-4 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="mono text-[10px] text-faint">x={x}, y={y}</span>
                        <span className="mono text-[10px] text-quantum">E = {fmt(2 * q - 1, 3)}</span>
                      </div>
                      <div className="mono text-[9px] text-faint mb-1">P(a=b) = {fmt(q, 3)}</div>
                      <input
                        type="range" min={0} max={1} step={0.005} value={q}
                        onChange={(e) => setAgree(x, y, parseFloat(e.target.value))}
                        className="kcbs-range" aria-label={`agree ${x}${y}`}
                      />
                      <div className="grid grid-cols-4 gap-1 mt-1">
                        {([["++", d.pp], ["+−", d.pm], ["−+", d.mp], ["−−", d.mm]] as const).map(([l, v]) => (
                          <div key={l} className="text-center">
                            <div className="mono text-[8px] text-faint">{l}</div>
                            <div className="mono text-[9.5px] text-ink/80">{fmt(v, 2)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <button onClick={() => setBox(CLASSICAL_BOX)} className="chip !py-2 !px-4 cursor-pointer !text-gold !border-gold/40">load classical</button>
              <button onClick={() => setBox(QUANTUM_BOX)} className="chip !py-2 !px-4 cursor-pointer !text-quantum !border-quantum/40">load quantum (2√2)</button>
              <button onClick={() => setBox(PR_BOX)} className="chip !py-2 !px-4 cursor-pointer" style={{ color: NEON, borderColor: NEON + "66" }}>load PR box (4)</button>
            </div>
          </div>

          <div>
            <div className="mono text-[9px] tracking-[0.2em] text-faint mb-2">AUDIT</div>
            <div className="space-y-1.5 mb-4">
              {([
                ["normalization  Σ P = 1", checks.normalized],
                ["positivity  P ≥ 0", checks.positive],
                ["no-signaling  P(a|x) ⊥ y", checks.noSignal],
                ["local  |C₁| ≤ 2", checks.local],
                ["quantum  |C₁| ≤ 2√2", checks.quantum],
              ] as const).map(([l, ok], i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-line bg-white/[0.02] px-3.5 py-2">
                  <span className="mono text-[11px] text-muted">{l}</span>
                  {ok ? (
                    <span className="flex items-center gap-1.5 mono text-[10px] text-quantum"><Check size={11} /> holds</span>
                  ) : (
                    <span className="flex items-center gap-1.5 mono text-[10px] text-rose"><Ban size={11} /> violated</span>
                  )}
                </div>
              ))}
            </div>

            <div className="rounded-xl border px-4 py-3.5" style={{ borderColor: LAYER_META[checks.layer].color + "66", background: LAYER_META[checks.layer].color + "10" }}>
              <div className="mono text-[10px] tracking-[0.2em] mb-2" style={{ color: LAYER_META[checks.layer].color }}>
                {LAYER_META[checks.layer].label}
              </div>
              <div className="mono text-[11.5px] text-ink/85">
                E = ({E.map((v) => fmt(v, 3)).join(", ")})
              </div>
              <div className="mono text-[13px] mt-1.5" style={{ color: LAYER_META[checks.layer].color }}>
                C₁ = {fmt(checks.c1, 5)} &nbsp;·&nbsp; C₂ = {fmt(checks.c2, 5)}
              </div>
              <button
                onClick={() => { setC1(checks.c1); setC2(checks.c2); }}
                className="chip !py-1.5 !px-3.5 mt-3 cursor-pointer hover:!text-ink hover:!border-line-bright transition-colors"
              >
                plot this box on the map <ArrowRight size={11} />
              </button>
            </div>

            <div className="rounded-xl border border-line bg-white/[0.02] px-4 py-3 mt-3 flex gap-2.5">
              <Info size={13} className="text-gold shrink-0 mt-0.5" />
              <p className="text-[12px] text-muted leading-relaxed">
                Try to build a box with <TeX>{"C_1 > 4"}</TeX> while keeping the audit green — you
                cannot: <TeX>{"C_1 = 2(E_{00}+E_{01}) - \\dots"}</TeX> is capped at 4 by
                normalization alone. And every value in{" "}
                <TeX>{"(2\\sqrt2,\\,4]"}</TeX> passes <em>all</em> the structural checks yet has
                no quantum realization. That gap is the mystery Tsirelson's bound names.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* synthesis */}
      <div className="grid md:grid-cols-3 gap-5">
        {([
          {
            icon: <Layers size={15} />, t: "Why the square", c: GOLD,
            b: <>Deterministic strategies are finite, so their hull is a <em>polytope</em> with flat facets. In this slice all 16 land on just four corners — the Bell inequality is the statement that you cannot leave their convex hull, no matter how cleverly you randomize.</>,
          },
          {
            icon: <Zap size={15} />, t: "Why the disc", c: CYAN,
            b: <>Quantum correlations come from vectors and inner products, so the boundary is <em>curved</em>: <TeX>{"C_1^2 + C_2^2 \\le 8"}</TeX>. It bulges past every facet of the square but is inscribed in the diamond, touching only at the classical corners.</>,
          },
          {
            icon: <Shield size={15} />, t: "Why the diamond", c: NEON,
            b: <>Relativistic causality only forbids signaling — it says nothing about Hilbert spaces. That leaves a bigger polytope whose extreme points are PR boxes. Nature obeys a stricter law than causality alone requires, and nobody fully knows why.</>,
          },
        ] as const).map((k, i) => (
          <Reveal key={i} delay={i * 0.06} className="card p-6">
            <span className="w-9 h-9 rounded-full border border-line flex items-center justify-center mb-4" style={{ color: k.c }}>{k.icon}</span>
            <h3 className="display text-xl font-light mb-2.5">{k.t}</h3>
            <p className="text-[13px] text-muted leading-relaxed">{k.b}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className="card !border-gold/30 p-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[13px] text-muted leading-relaxed max-w-3xl">
          <span className="text-ink">The same skeleton runs through the whole app:</span> a
          polytope of deterministic strategies, a curved quantum body bulging past one facet, and
          an outer no-signaling polytope nature declines to fill. KCBS is this picture for{" "}
          <em>compatibility</em>; CHSH is this picture for <em>locality</em>.
        </p>
        <div className="flex gap-2">
          <button onClick={() => setView("convexity")} className="chip !py-2 !px-4 cursor-pointer !text-quantum !border-quantum/45 hover:!bg-quantum/10 transition-colors">
            the KCBS crescent <ArrowRight size={11} />
          </button>
          <button onClick={() => setView("polytope")} className="chip !py-2 !px-4 cursor-pointer hover:!text-ink transition-colors">
            back to stage 1 <ArrowRight size={11} />
          </button>
        </div>
      </Reveal>
    </div>
  );
}
