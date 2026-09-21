import { useMemo } from "react";
import { Check, CircleAlert, Crosshair, MousePointerClick, Sparkle, TriangleAlert, X } from "lucide-react";
import { UmbrellaScene } from "./UmbrellaScene";
import { Reveal } from "./Section";
import { useCalc } from "../state/store";
import { TeX } from "./TeX";
import {
  coneSpec, coneVectors, corrStats, gramMatrix, gramSpectrum, orthGraphIsCycle,
  validSteps, alphaBound, lovaszBound, fracBound, corrClassicalBound,
  bestSumP, optimalPsiDeg, h2Symbolic, sweepTable,
  clamp, fmt, gcd, type ConeSpec,
} from "../lib/kcbs";
import { cn } from "../utils/cn";

export type PsiMode = "apex" | "optimal" | "custom";

export function effectiveAngles(spec: ConeSpec, mode: PsiMode, theta: number, phi: number) {
  if (mode === "apex") return { theta: 0, phi: 0 };
  if (mode === "optimal") return optimalPsiDeg(spec);
  return { theta, phi };
}

const SUB = ["₁","₂","₃","₄","₅","₆","₇","₈","₉","₁₀","₁₁","₁₂"];

/* ------------------------------------------------ witness bar ------ */
function WitnessBar({ sumP, N }: { sumP: number; N: number }) {
  const alpha = alphaBound(N), lov = lovaszBound(N), frac = fracBound(N);
  const X = (v: number) => `${(v / frac) * 100}%`;
  return (
    <div className="relative pt-7 pb-6 select-none">
      {[alpha, lov, frac].map((v, i) => (
        <div key={i} className="absolute top-0 bottom-0 w-px" style={{ left: X(v) }}>
          <div
            className={cn(
              "h-[52px] border-l border-dashed",
              i === 0 && "border-gold/70", i === 1 && "border-quantum/70", i === 2 && "border-violet/60"
            )}
          />
          <div
            className={cn(
              "mono text-[9px] tracking-wider absolute -top-0.5 whitespace-nowrap -translate-x-1/2",
              i === 0 && "text-gold", i === 1 && "text-quantum", i === 2 && "text-violet"
            )}
          >
            {i === 0 ? `α = ${fmt(v, 1).replace(".0", "")}` : i === 1 ? `ϑ = ${fmt(v, 3)}` : `N/2 = ${fmt(v, 1).replace(".0", "")}`}
          </div>
        </div>
      ))}
      <div className="h-[10px] rounded-full bg-white/[0.06] relative overflow-visible">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
          style={{
            width: X(Math.min(sumP, frac)),
            background: "linear-gradient(90deg, rgba(232,180,92,0.75), rgba(111,220,247,0.9))",
            boxShadow: sumP > alpha + 1e-9 ? "0 0 18px rgba(111,220,247,0.55)" : undefined,
          }}
        />
      </div>
      <div className="mt-2 flex justify-between mono text-[10px] text-faint">
        <span>Σ pᵢ = {fmt(sumP, 4)} · event witness</span>
        <span>{sumP > alpha + 1e-9 ? `+${fmt(sumP - alpha, 4)} above classical α` : "inside STAB(C_N)"}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------ stat ------------- */
function Stat({ label, value, sub, tone }: { label: string; value: React.ReactNode; sub?: string; tone?: "cyan" | "gold" | "rose" }) {
  return (
    <div className="card px-3.5 py-3">
      <div className="mono text-[9px] tracking-[0.2em] text-faint mb-1">{label}</div>
      <div
        className={cn(
          "mono text-base md:text-lg leading-tight",
          tone === "cyan" && "text-quantum", tone === "gold" && "text-gold", tone === "rose" && "text-rose"
        )}
      >
        {value}
      </div>
      {sub && <div className="mono text-[9.5px] text-faint mt-1">{sub}</div>}
    </div>
  );
}

/* ------------------------------------------------ gram ------------- */
function GramPanel({ spec }: { spec: ConeSpec }) {
  const vs = useMemo(() => coneVectors(spec), [spec]);
  const gram = useMemo(() => gramMatrix(vs), [vs]);
  const isCycle = useMemo(() => orthGraphIsCycle(gram), [gram]);
  const [l1, l2] = gramSpectrum(spec);

  const cell = 22;
  const colorFor = (v: number, diag: boolean) => {
    if (diag) return "rgba(232,180,92,0.85)";
    if (Math.abs(v) < 1e-9) return "rgba(111,220,247,0.16)";
    const t = clamp((v + 0.2) / 1.2, 0, 1);
    return `rgba(236,231,219,${0.05 + t * 0.2})`;
  };

  return (
    <div>
      <div className="overflow-x-auto pb-2">
        <div
          className="grid gap-[3px] w-max"
          style={{ gridTemplateColumns: `repeat(${spec.N}, ${cell}px)` }}
        >
          {gram.map((row, i) =>
            row.map((v, j) => {
              const orth = Math.abs(v) < 1e-9 && i !== j;
              return (
                <div
                  key={`${i}-${j}`}
                  title={`⟨v${i + 1}|v${j + 1}⟩ = ${v.toFixed(5)}${orth ? "  (⊥ context)" : ""}`}
                  className={cn(
                    "rounded-[5px] flex items-center justify-center mono transition-transform hover:scale-[1.18]",
                    orth && "border border-quantum/70"
                  )}
                  style={{
                    width: cell, height: cell,
                    background: colorFor(v, i === j),
                    color: orth ? "#6fdcf7" : "rgba(143,141,156,0.0)",
                    fontSize: 9,
                  }}
                >
                  {orth ? "0" : ""}
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 mono text-[10px]">
        {isCycle ? (
          <span className="chip !text-quantum !border-quantum/40 !py-1"><Check size={11} /> orthogonality graph ≡ C₍{spec.N}₎ — exact zeros on the ring only</span>
        ) : (
          <span className="chip !text-rose !border-rose/40 !py-1"><CircleAlert size={11} /> extra orthogonal pairs detected</span>
        )}
      </div>
      <div className="mt-4">
        <div className="mono text-[9px] tracking-[0.22em] text-faint mb-2">GRAM SPECTRUM — RANK 3 ⇔ LIVES IN ℝ³ ⊂ ℂ³</div>
        {[
          { l: `λ₁ = N·h²`, v: l1, c: "#6fdcf7" },
          { l: `λ₂ = N·r²/2`, v: l2, c: "#e8b45c" },
          { l: `λ₃ = N·r²/2`, v: l2, c: "#e8b45c" },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 mb-1.5">
            <span className="mono text-[10px] text-faint w-24 shrink-0">{s.l}</span>
            <div className="h-1.5 rounded-full bg-white/[0.06] flex-1 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(s.v / spec.N) * 100}%`, background: s.c }} />
            </div>
            <span className="mono text-[10px] w-14 text-right" style={{ color: s.c }}>{fmt(s.v, 3)}</span>
          </div>
        ))}
        <div className="mono text-[9.5px] text-faint mt-1">+ (N−3) exact zeros — the umbrella is genuinely three-dimensional</div>
      </div>
    </div>
  );
}

/* ---------------------------------------------- vertex table -------- */
function VertexTable({
  P, m, e, perEdge, selected, onSelect,
}: {
  P: number[]; m: number[]; e: number[]; perEdge: number; selected: number; onSelect: (i: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full mono text-[11.5px]">
        <thead>
          <tr className="text-faint text-[9px] tracking-[0.2em]">
            <th className="text-left font-normal py-2 pr-3">RAY</th>
            <th className="text-left font-normal py-2 pr-3 min-w-[130px]">pᵢ = |⟨ψ|vᵢ⟩|²</th>
            <th className="text-right font-normal py-2 pr-3">⟨Ŝᵢ⟩</th>
            <th className="text-right font-normal py-2 pr-2">⟨ŜᵢŜᵢ₊₁⟩</th>
            <th className="text-right font-normal py-2">vs {fmt(perEdge, 2)}</th>
          </tr>
        </thead>
        <tbody>
          {P.map((pk, i) => {
            const viol = e[i] < perEdge - 1e-9;
            return (
              <tr
                key={i}
                onClick={() => onSelect(i)}
                className={cn(
                  "cursor-pointer border-t border-line/60 transition-colors",
                  selected === i ? "bg-rose/[0.07]" : "hover:bg-white/[0.03]"
                )}
              >
                <td className="py-2 pr-3 text-gold">v{SUB[i]}{selected === i && <span className="text-rose ml-1.5">◂ ctx</span>}</td>
                <td className="py-2 pr-3">
                  <div className="flex items-center gap-2">
                    <div className="h-[7px] w-full max-w-[110px] rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full bg-quantum/80 transition-all duration-300" style={{ width: `${pk * 100}%` }} />
                    </div>
                    <span className="text-ink/90">{fmt(pk, 4)}</span>
                  </div>
                </td>
                <td className={cn("py-2 pr-3 text-right", m[i] > 0 ? "text-gold" : "text-violet")}>{fmt(m[i], 4)}</td>
                <td className={cn("py-2 pr-2 text-right", viol ? "text-rose num-glow-rose" : "text-ink/70")}>{fmt(e[i], 4)}</td>
                <td className="py-2 text-right text-[10px]">{viol ? <span className="text-rose">breaks floor</span> : <span className="text-faint">—</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------- main ------------- */
export function Playground() {
  const {
    N, setN, p, setP, mode, setMode, theta, setTheta, phi, setPhi,
    spec, steps, angles, setView,
  } = useCalc();
  const { theta: thEff, phi: phEff } = angles;
  const vs = useMemo(() => coneVectors(spec), [spec]);
  const stats = useMemo(
    () => corrStats(vs, [Math.sin((thEff * Math.PI) / 180) * Math.cos((phEff * Math.PI) / 180), Math.sin((thEff * Math.PI) / 180) * Math.sin((phEff * Math.PI) / 180), Math.cos((thEff * Math.PI) / 180)]),
    [vs, thEff, phEff]
  );
  const alpha = alphaBound(N);
  const perEdge = corrClassicalBound(N) / N;
  const violating = stats.sumP > alpha + 1e-9;
  const sym = h2Symbolic(N, p);
  const sweep = useMemo(() => sweepTable(3, 12), []);
  const changeN = (n: number) => {
    const nn = clamp(n, 3, 12);
    setN(nn);
    const st = validSteps(nn);
    if (st.length && !st.includes(p)) setP(st[st.length - 1]);
  };
  const optimize = () => {
    const st = validSteps(N);
    if (!st.length) return;
    let bp = st[0], bv = -Infinity;
    for (const q of st) { const v = bestSumP(coneSpec(N, q)); if (v > bv) { bv = v; bp = q; } }
    setP(bp); setMode("optimal");
  };

  return (
    <section className="relative">
      <div className="px-5 md:px-8 py-7 max-w-[1500px]">
        <Reveal className="mb-5 max-w-3xl">
          <p className="text-muted text-[13.5px] leading-relaxed font-light">
            Take <TeX>{"N"}</TeX> rays at star pitch <TeX>{"\\Delta = 2\\pi p/N"}</TeX> on a
            latitude cone. Demanding <TeX>{"\\langle v_i|v_{i+1}\\rangle=0"}</TeX> pins the height
            exactly to <TeX>{"h^2 = \\frac{\\cos\\chi}{1+\\cos\\chi}"}</TeX>,{" "}
            <TeX>{"\\chi = \\pi(N-2p)/N"}</TeX>. Every number is computed live — change the
            polygon, rebuild the polyhedron, measure the gap.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6 items-stretch">
          {/* 3D */}
          <Reveal className="relative card overflow-hidden min-h-[500px] md:min-h-[600px]">
            <SceneWrapper spec={spec} thEff={thEff} phEff={phEff} N={N} />
            <div className="absolute top-4 left-4 pointer-events-none">
              <span className="chip !bg-void/60 backdrop-blur">
                <MousePointerClick size={11} className="text-gold" /> drag to orbit · click an edge
              </span>
            </div>
            <div className="absolute top-4 right-4 pointer-events-none">
              <span className={cn("chip backdrop-blur !bg-void/60", violating ? "!text-rose !border-rose/50" : "!text-quantum/80 !border-quantum/30")}>
                {violating ? <TriangleAlert size={11} /> : <Check size={11} />}
                {violating ? "contextual" : "non-contextual state"}
              </span>
            </div>
            {!spec.feasible && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-void/55 backdrop-blur-[2px] pointer-events-none">
                <div className="card !border-rose/45 !bg-rose/[0.07] px-6 py-5 max-w-sm text-center">
                  <TriangleAlert className="text-rose mx-auto mb-2" size={18} />
                  <div className="mono text-[11px] tracking-[0.2em] text-rose mb-2">NO UMBRELLA HERE</div>
                  <p className="text-[12.5px] text-muted leading-relaxed">
                    {spec.h2 < 0
                      ? `Δ = ${fmt(spec.deltaDeg, 1)}° is acute — orthogonality would need h² = ${fmt(spec.h2, 3)} < 0, geometrically impossible on any cone.`
                      : `gcd(${p}, ${N}) = ${gcd(p, N)} > 1 — the polygon fragments into ${gcd(p, N)} copies of a {${N / gcd(p, N)}/${p / gcd(p, N)}} star; rays repeat and the cycle of contexts breaks.`}
                  </p>
                </div>
              </div>
            )}
          </Reveal>

          {/* controls */}
          <div className="flex flex-col gap-4">
            <Reveal delay={0.04} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="mono text-[10px] tracking-[0.25em] text-faint">CYCLE SIZE N — NUMBER OF CONTEXTS</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => changeN(N - 1)} className="chip !px-3 !py-1.5 !text-ink hover:!border-quantum/50 cursor-pointer">−</button>
                  <span className="mono text-2xl text-quantum w-8 text-center">{N}</span>
                  <button onClick={() => changeN(N + 1)} className="chip !px-3 !py-1.5 !text-ink hover:!border-quantum/50 cursor-pointer">+</button>
                </div>
              </div>
              <div className="mono text-[10px] tracking-[0.25em] text-faint mb-2">
                STAR PITCH p (= WINDING k) — POLYGON {"{N/p}"}
              </div>
              {steps.length ? (
                <div className="flex flex-wrap gap-2">
                  {steps.map((q: number) => {
                    const s2 = coneSpec(N, q);
                    const isBest = bestSumP(s2) === Math.max(...steps.map((x: number) => bestSumP(coneSpec(N, x))));
                    return (
                      <button
                        key={q}
                        onClick={() => setP(q)}
                        className={cn(
                          "chip !py-2 !px-4 cursor-pointer transition-all",
                          p === q ? "!text-quantum !border-quantum/60 !bg-quantum/10" : "!text-muted hover:!text-ink hover:!border-line-bright"
                        )}
                      >
                        p = {q} · Δ = {fmt(s2.deltaDeg, 1)}°{isBest && <Sparkle size={10} className="text-gold" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="chip !text-faint !py-2"><X size={11} /> no cone exists — check N = {N} (Δ must be obtuse, p coprime with N)</div>
              )}
              <p className="text-[11.5px] text-faint mt-3 leading-relaxed mono">
                valid p: gcd(p, N) = 1 ∧ cosΔ &lt; 0 — obtuse neighbours are mandatory, so the
                orthogonality graph is provably C_N alone.{" "}
                <button onClick={() => setView("winding")} className="text-quantum hover:underline cursor-pointer">
                  why? →
                </button>
              </p>
            </Reveal>

            <Reveal delay={0.08} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="mono text-[10px] tracking-[0.25em] text-faint">PROBE STATE |ψ⟩</div>
                <div className="flex gap-1.5">
                  {(["apex", "optimal", "custom"] as PsiMode[]).map((md) => (
                    <button
                      key={md}
                      onClick={() => setMode(md)}
                      className={cn(
                        "chip !py-1.5 !px-3 cursor-pointer transition-all capitalize",
                        mode === md ? "!text-rose !border-rose/55 !bg-rose/10" : "hover:!text-ink hover:!border-line-bright"
                      )}
                    >
                      {md}
                    </button>
                  ))}
                </div>
              </div>
              {mode === "custom" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between mono text-[10px] text-faint mb-0.5"><span>θ from ẑ</span><span className="text-quantum">{fmt(thEff, 1)}°</span></div>
                    <input type="range" min={0} max={180} step={0.5} value={theta} onChange={(e) => setTheta(parseFloat(e.target.value))} className="kcbs-range" aria-label="theta" />
                  </div>
                  <div>
                    <div className="flex justify-between mono text-[10px] text-faint mb-0.5"><span>φ azimuth</span><span className="text-quantum">{fmt(phEff, 1)}°</span></div>
                    <input type="range" min={0} max={360} step={0.5} value={phi} onChange={(e) => setPhi(parseFloat(e.target.value))} className="kcbs-range" aria-label="phi" />
                  </div>
                </div>
              ) : (
                <p className="mono text-[11px] text-muted leading-relaxed">
                  {mode === "apex"
                    ? "ψ = ẑ, the umbrella handle: pᵢ = h² for every ray (perfectly democratic)."
                    : spec.h2 >= spec.r2 / 2
                      ? "ψ* = eigenvector of the frame operator Σ|vᵢ⟩⟨vᵢ| — here the handle ẑ is already optimal (λ_z ≥ λ_x = λ_y)."
                      : "ψ* = optimal frame eigenvector — for this flat cone the best state lies in the equator plane (λ_x = λ_y > λ_z)."}
                </p>
              )}
              <button onClick={optimize} className="chip !py-2 !px-4 mt-4 !text-ink hover:!text-gold hover:!border-gold/60 cursor-pointer transition-colors">
                <Crosshair size={12} /> optimize {`{p*, ψ*}`} for N = {N}
              </button>
            </Reveal>

            <Reveal delay={0.12} className="grid grid-cols-3 gap-3">
              <Stat label="PITCH Δ" value={fmt(spec.deltaDeg, 2) + "°"} sub="2πp/N" />
              <Stat label="HEIGHT h" value={spec.h2 >= 0 ? fmt(spec.h, 4) : "∄"} sub={spec.h2 >= 0 ? "" : "no real height"} tone={spec.h2 >= 0 ? "cyan" : "rose"} />
              <Stat label="h² (exact)" value={spec.h2 >= 0 ? <TeX className="!text-[13px]">{sym.tex}</TeX> : <span className="text-rose">{fmt(spec.h2, 2)} &lt; 0</span>} sub={spec.h2 >= 0 ? `= ${fmt(spec.h2, 4)}` : "cosΔ ≥ 0 — impossible"} tone={spec.h2 >= 0 ? "cyan" : "rose"} />
              <Stat label="RADIUS r" value={fmt(spec.r, 4)} sub="√(1−h²)" />
              <Stat label="HALF-ANGLE" value={fmt(spec.halfAngleDeg, 2) + "°"} sub="α = arccos h" />
              <Stat label="Σ⟨ŜᵢŜᵢ₊₁⟩" value={fmt(stats.sumE, 3)} sub={`bound ≥ ${corrClassicalBound(N)}`} tone={stats.sumE < corrClassicalBound(N) - 1e-9 ? "rose" : "gold"} />
            </Reveal>

            <Reveal delay={0.16} className="card p-5">
              <div className="mono text-[10px] tracking-[0.25em] text-faint">LIVE WITNESS — EXCLUSIVITY EVENTS pᵢ = P(Ŝᵢ = +1)</div>
              {spec.feasible ? (
                <WitnessBar sumP={stats.sumP} N={N} />
              ) : (
                <div className="mt-3 rounded-xl border border-rose/35 bg-rose/[0.05] px-4 py-6 text-center mono text-[11px] text-rose/90 tracking-wider">
                  WITNESS UNARMED — EVENTS ARE NOT EXCLUSIVE WITHOUT AN ORTHOGONAL UMBRELLA
                </div>
              )}
              {spec.feasible && (
                <div
                  className={cn(
                    "rounded-xl border px-4 py-3 mono text-[11px] tracking-wide flex items-center gap-2.5",
                    violating ? "border-rose/45 bg-rose/[0.06] text-rose" : "border-line text-muted"
                  )}
                >
                  {violating ? <TriangleAlert size={13} className="shrink-0" /> : <Check size={13} className="shrink-0 text-quantum" />}
                  {violating
                    ? `VIOLATION: Σpᵢ = ${fmt(stats.sumP, 4)} > α(C₍${N}₎) = ${fmt(alpha, 1)} — no non-contextual assignment explains this state.`
                    : N % 2 === 0
                      ? `Even cycle: α = N/2 is the quantum ceiling too — this polygon can never witness contextuality.`
                      : `Σpᵢ = ${fmt(stats.sumP, 4)} ≤ α = ${fmt(alpha, 1)} — a classical model still covers this state. Push p→p* or aim ψ closer to ẑ.`}
                </div>
              )}
            </Reveal>
          </div>
        </div>

        {/* second row */}
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6 mt-6">
          <Reveal className="card p-6">
            <div className="mono text-[10px] tracking-[0.25em] text-faint mb-3">EVERY RAY, EVERY NUMBER — ROW i SHOWS CONTEXT {"{i, i+1}"} (CLICK TO HIGHLIGHT)</div>
            <EdgeTable stats={stats} perEdge={perEdge} />
          </Reveal>
          <Reveal delay={0.06} className="card p-6">
            <div className="mono text-[10px] tracking-[0.25em] text-faint mb-3">GRAM MATRIX Gᵢⱼ = ⟨vᵢ|vⱼ⟩ — THE POLYHEDRON'S FINGERPRINT</div>
            <GramPanel spec={spec} />
          </Reveal>
        </div>

        {/* discovery */}
        <Reveal className="mt-6 card p-6 md:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-1">
            <div className="mono text-[10px] tracking-[0.25em] text-faint">DISCOVERY SWEEP — ALL SYMMETRIC CONES, N = 3…12, BEST p PER N</div>
            <div className="mono text-[10px] text-faint">click a row to load it</div>
          </div>
          <p className="text-[12.5px] text-muted leading-relaxed mb-5 max-w-3xl">
            For every N we test every coprime star pitch, build the orthogonal cone, and score its
            best state against the classical ceiling <TeX>{"\\alpha(C_N)"}</TeX>. The pattern is
            the theorem: <em>only odd cycles can violate</em>, and the maximal pitch{" "}
            <TeX>{"p=(N-1)/2"}</TeX> always reproduces the exact Lovász umbrella{" "}
            <TeX>{"\\vartheta(C_N) = N\\cos(\\pi/N)/(1+\\cos(\\pi/N))"}</TeX>.
          </p>
          <DiscoveryTable sweep={sweep} curN={N} curP={p} onLoad={(n2, p2) => { setN(n2); setP(p2); setMode("optimal"); }} />
        </Reveal>
      </div>
    </section>
  );
}

/* ------------ wrappers (isolate context-selection state) ------------ */
import { useState } from "react";

function SceneWrapper({ spec, thEff, phEff, N }: { spec: ConeSpec; thEff: number; phEff: number; N: number }) {
  const [sel, setSel] = useState(0);
  return (
    <>
      <UmbrellaScene
        spec={spec} thetaDeg={thEff} phiDeg={phEff} selected={sel % N} onSelect={setSel}
        className="absolute inset-0 [&_canvas]:!cursor-grab active:[&_canvas]:!cursor-grabbing"
      />
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-1.5 pointer-events-none">
        {Array.from({ length: N }, (_, i) => (
          <button
            key={i}
            onClick={() => setSel(i)}
            className={cn(
              "chip pointer-events-auto !px-2.5 !py-1 !text-[9.5px] transition-all hover:!border-line-bright",
              sel % N === i ? "!text-rose !border-rose/50 !bg-rose/10" : "!bg-void/60 backdrop-blur"
            )}
          >
            {"{S" + SUB[i] + ",S" + SUB[(i + 1) % N] + "}"}
          </button>
        ))}
      </div>
    </>
  );
}

function EdgeTable({ stats, perEdge }: { stats: ReturnType<typeof corrStats>; perEdge: number }) {
  const [sel, setSel] = useState(-1);
  return <VertexTable P={stats.P} m={stats.m} e={stats.e} perEdge={perEdge} selected={sel} onSelect={setSel} />;
}

function DiscoveryTable({
  sweep, curN, curP, onLoad,
}: {
  sweep: ReturnType<typeof sweepTable>;
  curN: number; curP: number;
  onLoad: (n: number, p: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full mono text-[11.5px]">
        <thead>
          <tr className="text-faint text-[9px] tracking-[0.2em] border-b border-line">
            {["N", "valid p", "best h", "h² exact", "Σpᵢ* (optimal ψ)", "α(C_N)", "ϑ(C_N)", "gap Σp−α", "verdict"].map((c) => (
              <th key={c} className="text-left font-normal py-2.5 pr-4 whitespace-nowrap">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sweep.map((row) => {
            const active = row.N === curN && row.bestP === curP;
            const viol = row.gap !== null && row.gap > 1e-9;
            const none = row.steps.length === 0;
            return (
              <tr
                key={row.N}
                onClick={() => row.bestP !== null && onLoad(row.N, row.bestP)}
                className={cn(
                  "border-b border-line/50 transition-colors",
                  row.bestP !== null && "cursor-pointer hover:bg-white/[0.03]",
                  active && "bg-quantum/[0.06]",
                  viol && "border-l-2 border-l-rose/70"
                )}
              >
                <td className={cn("py-2.5 pr-4 text-lg", row.parity === "odd" ? "text-quantum" : "text-faint")}>{row.N}</td>
                <td className="py-2.5 pr-4 text-muted">{row.steps.length ? row.steps.map((s) => `{${row.N}/${s}}`).join("  ") : "—"}</td>
                <td className="py-2.5 pr-4 text-ink/85">{row.best ? fmt(row.best.h, 4) : "—"}</td>
                <td className="py-2.5 pr-4 text-quantum/90">{row.bestP ? <TeX className="!text-[12px]">{h2Symbolic(row.N, row.bestP).tex}</TeX> : "—"}</td>
                <td className="py-2.5 pr-4 text-ink/90">{row.sumPStar !== null ? fmt(row.sumPStar, 4) : "—"}</td>
                <td className="py-2.5 pr-4 text-gold/90">{fmt(row.alpha, 1).replace(".0", "")}</td>
                <td className="py-2.5 pr-4 text-quantum/70">{fmt(row.lovasz, 4)}</td>
                <td className={cn("py-2.5 pr-4", viol ? "text-rose" : "text-faint")}>
                  {row.gap === null ? "—" : row.gap > 1e-9 ? "+" + fmt(row.gap, 4) : Math.abs(row.gap) < 1e-6 ? "0 (tight)" : fmt(row.gap, 4)}
                </td>
                <td className="py-2.5">
                  {none ? <span className="chip !py-1 !text-faint">no 3D cone</span>
                    : viol ? <span className="chip !py-1 !text-rose !border-rose/50">{row.optimal ? "VIOLATES · Lovász-optimal" : "violates"}</span>
                    : row.parity === "even" ? <span className="chip !py-1 !text-faint">even cycle — no gap exists</span>
                    : <span className="chip !py-1 !text-muted">cone exists, no violation</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
