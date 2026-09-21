import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Boxes, Check, Crosshair, Info, Radio, ShieldCheck, TriangleAlert } from "lucide-react";
import { SectionHead, Reveal } from "../components/Section";
import { TeX } from "../components/TeX";
import { useCalc } from "../state/store";
import {
  LOCAL_BOUND, TSIRELSON, PR_BOUND, OPTIMAL_ANGLES,
  lhvStrategies, lhvHistogram, chshValue, buildOps, commutatorIdentity,
  sosCertificate, prBox, prTable, classifyCHSH, corr, eigSym, mul,
  type Angles, type Mat,
} from "../lib/chsh";
import { fmt, QUANTUM_AVG } from "../lib/kcbs";
import { TsirelsonLab } from "../components/TsirelsonLab";
import { cn } from "../utils/cn";

const GOLD = "#e8b45c";
const CYAN = "#6fdcf7";
const ROSE = "#fb5c7a";
const VIOLET = "#a78bfa";
const deg = (r: number) => (r * 180) / Math.PI;
const rad = (d: number) => (d * Math.PI) / 180;

/* --------------- measurement-direction dial --------------- */
function Dial({ g }: { g: Angles }) {
  const cx = 130, cy = 130, R = 96;
  const dirs = [
    { k: "A₀", a: g.a0, c: GOLD },
    { k: "A₁", a: g.a1, c: GOLD },
    { k: "B₀", a: g.b0, c: CYAN },
    { k: "B₁", a: g.b1, c: CYAN },
  ];
  return (
    <svg viewBox="0 0 260 260" className="w-full max-w-[250px] mx-auto">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(236,231,219,0.09)" strokeDasharray="2 6" />
      <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke="rgba(236,231,219,0.08)" />
      <line x1={cx} y1={cy - R} x2={cx} y2={cy + R} stroke="rgba(236,231,219,0.08)" />
      {dirs.map((d, i) => {
        const x = cx + R * Math.sin(d.a), y = cy - R * Math.cos(d.a);
        const dashed = i >= 2;
        return (
          <g key={d.k}>
            <line
              x1={cx} y1={cy} x2={x} y2={y}
              stroke={d.c} strokeWidth={2} strokeDasharray={dashed ? "5 3" : undefined}
              strokeOpacity={0.95}
            />
            <circle cx={x} cy={y} r="4" fill={d.c} />
            <text x={cx + (R + 18) * Math.sin(d.a)} y={cy - (R + 18) * Math.cos(d.a) + 4} textAnchor="middle" fontSize="11" className="mono" fill={d.c}>
              {d.k}
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r="3" fill="#ece7db" />
      <text x={cx} y={cy + R + 40} textAnchor="middle" fontSize="9" className="mono" fill="rgba(143,141,156,0.85)" letterSpacing="1.5">
        measurement directions in the x–z plane
      </text>
    </svg>
  );
}

/* --------------- nested-bound bar --------------- */
function BoundBar({ value }: { value: number }) {
  const W = 700, Hh = 108;
  const mL = 30, mR = 30;
  const X = (v: number) => mL + (v / 4.4) * (W - mL - mR);
  const cls = classifyCHSH(value);
  const col = cls === "local" ? GOLD : cls === "quantum" ? CYAN : VIOLET;

  return (
    <svg viewBox={`0 0 ${W} ${Hh}`} className="w-full">
      {/* zones */}
      <rect x={X(0)} y={34} width={X(LOCAL_BOUND) - X(0)} height={26} rx="4" fill="rgba(232,180,92,0.18)" />
      <rect x={X(LOCAL_BOUND)} y={34} width={X(TSIRELSON) - X(LOCAL_BOUND)} height={26} rx="0" fill="rgba(111,220,247,0.18)" />
      <rect x={X(TSIRELSON)} y={34} width={X(PR_BOUND) - X(TSIRELSON)} height={26} rx="0" fill="rgba(167,139,250,0.18)" />
      <rect x={X(PR_BOUND)} y={34} width={X(4.4) - X(PR_BOUND)} height={26} fill="rgba(251,92,122,0.12)" />

      {[
        { v: LOCAL_BOUND, l: "2 · local", c: GOLD },
        { v: TSIRELSON, l: "2√2 · Tsirelson", c: CYAN },
        { v: PR_BOUND, l: "4 · PR / algebraic", c: VIOLET },
      ].map((b) => (
        <g key={b.v}>
          <line x1={X(b.v)} x2={X(b.v)} y1={26} y2={68} stroke={b.c} strokeWidth="1.5" />
          <text x={X(b.v)} y={20} textAnchor="middle" fontSize="10" className="mono" fill={b.c}>{b.l}</text>
        </g>
      ))}

      <text x={X(1)} y={51} textAnchor="middle" fontSize="9.5" className="mono" fill="rgba(232,180,92,0.9)">LOCAL (LHV)</text>
      <text x={(X(LOCAL_BOUND) + X(TSIRELSON)) / 2} y={51} textAnchor="middle" fontSize="9.5" className="mono" fill="rgba(111,220,247,0.9)">QUANTUM</text>
      <text x={(X(TSIRELSON) + X(PR_BOUND)) / 2} y={51} textAnchor="middle" fontSize="8.5" className="mono" fill="rgba(167,139,250,0.9)">POST-QUANTUM</text>

      {/* cursor */}
      <motion.g animate={{ x: X(Math.min(Math.abs(value), 4.4)) - X(0) }} transition={{ type: "spring", stiffness: 160, damping: 22 }}>
        <path d={`M ${X(0)} 74 l 6 10 h -12 z`} fill={col} />
        <circle cx={X(0)} cy={47} r="6" fill="#0b0b14" stroke={col} strokeWidth="2" />
        <text x={X(0)} y={100} textAnchor="middle" fontSize="11.5" className="mono" fill={col}>
          |C| = {fmt(Math.abs(value), 5)}
        </text>
      </motion.g>
    </svg>
  );
}

/* --------------- matrix grid --------------- */
function MatGrid({ M, label, tone = "#6fdcf7" }: { M: Mat; label: string; tone?: string }) {
  return (
    <div>
      <div className="mono text-[9px] tracking-[0.18em] text-faint mb-1.5">{label}</div>
      <div className="grid gap-[3px]" style={{ gridTemplateColumns: "repeat(4, 1fr)", maxWidth: 190 }}>
        {M.flat().map((v, i) => {
          const t = Math.min(1, Math.abs(v) / 3);
          return (
            <div
              key={i}
              className="rounded-[4px] flex items-center justify-center mono"
              style={{
                aspectRatio: "1", fontSize: 8.5,
                background: Math.abs(v) < 1e-9 ? "rgba(255,255,255,0.03)" : v > 0 ? `${tone}${Math.round(20 + t * 45).toString(16)}` : `rgba(251,92,122,${0.08 + t * 0.3})`,
                color: Math.abs(v) < 1e-9 ? "rgba(143,141,156,0.5)" : "rgba(236,231,219,0.92)",
                border: "1px solid rgba(236,231,219,0.07)",
              }}
            >
              {Math.abs(v) < 5e-4 ? "0" : v.toFixed(2).replace("-", "−")}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================ */
export function CHSHView() {
  const { setView } = useCalc();
  const [g, setG] = useState<Angles>(OPTIMAL_ANGLES);
  const [strat, setStrat] = useState(0);

  const C = chshValue(g);
  const ops = useMemo(() => buildOps(g), [g]);
  const ident = useMemo(() => commutatorIdentity(g), [g]);
  const sos = useMemo(() => sosCertificate(g), [g]);
  const lhv = useMemo(() => lhvStrategies(), []);
  const hist = useMemo(() => lhvHistogram(), []);
  const pr = prBox();
  const s = lhv[strat];
  const optimal = Math.abs(C - TSIRELSON) < 1e-6;

  const setAngle = (k: keyof Angles, d: number) => setG((q) => ({ ...q, [k]: rad(d) }));

  return (
    <div className="px-5 md:px-8 py-7 max-w-[1500px] space-y-6">
      <SectionHead
        index="▪"
        kicker="Non-locality — CHSH, Tsirelson, PR boxes"
        accent="rose"
        title={
          <>
            The other way to break classicality:{" "}
            <span className="italic text-rose">two boxes, one entangled state.</span>
          </>
        }
        lede={
          <>
            KCBS corners a classical model with a single qutrit and compatibility. CHSH does it
            with two separated parties and locality. Same convex-geometry skeleton — local
            polytope <TeX>{"\\subset"}</TeX> quantum set <TeX>{"\\subset"}</TeX> no-signaling
            polytope — with the famous bounds <TeX>{"2 < 2\\sqrt2 < 4"}</TeX>. Every operator
            identity below is verified numerically at render time.
          </>
        }
      />

      {/* scenario + live value */}
      <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-6">
        <Reveal className="card p-6">
          <div className="mono text-[10px] tracking-[0.25em] text-faint mb-4">THE SCENARIO</div>
          <div className="flex items-center justify-between gap-3 mb-5">
            {[
              { n: "ALICE", inp: "x ∈ {0,1}", out: "a = ±1", c: GOLD },
              { n: "BOB", inp: "y ∈ {0,1}", out: "b = ±1", c: CYAN },
            ].map((p, i) => (
              <div key={p.n} className="flex-1 rounded-xl border px-3 py-3 text-center" style={{ borderColor: p.c + "55", background: p.c + "0e" }}>
                <div className="mono text-[10px] tracking-[0.2em]" style={{ color: p.c }}>{p.n}</div>
                <div className="mono text-[10px] text-faint mt-1.5">{p.inp}</div>
                <div className="mono text-[10px] text-muted">{p.out}</div>
                {i === 0 && <div className="mono text-[9px] text-faint mt-2">A₀ , A₁</div>}
                {i === 1 && <div className="mono text-[9px] text-faint mt-2">B₀ , B₁</div>}
              </div>
            ))}
          </div>
          <TeX block className="!text-[0.82rem]">
            {"C = \\langle A_0B_0\\rangle + \\langle A_0B_1\\rangle + \\langle A_1B_0\\rangle - \\langle A_1B_1\\rangle"}
          </TeX>
          <Dial g={g} />
          <div className="space-y-2 mt-2">
            {(["a0", "a1", "b0", "b1"] as (keyof Angles)[]).map((k) => (
              <div key={k}>
                <div className="flex justify-between mono text-[10px] mb-0.5">
                  <span className="text-faint">{k.toUpperCase()}</span>
                  <span className={k[0] === "a" ? "text-gold" : "text-quantum"}>{fmt(deg(g[k]), 1)}°</span>
                </div>
                <input
                  type="range" min={-180} max={180} step={0.5} value={deg(g[k])}
                  onChange={(e) => setAngle(k, parseFloat(e.target.value))}
                  className="kcbs-range" aria-label={k}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setG(OPTIMAL_ANGLES)}
              disabled={optimal}
              className={cn("chip !py-2 !px-4 transition-all", optimal ? "!text-quantum !border-quantum/50 !bg-quantum/10 cursor-default" : "!text-ink hover:!text-quantum hover:!border-quantum/60 cursor-pointer")}
            >
              <Crosshair size={11} /> {optimal ? "at Tsirelson" : "snap to optimal"}
            </button>
            <button onClick={() => setG({ a0: 0, a1: 0, b0: 0, b1: 0 })} className="chip !py-2 !px-4 cursor-pointer hover:!text-ink transition-colors">
              all aligned
            </button>
          </div>
        </Reveal>

        <div className="flex flex-col gap-6">
          <Reveal delay={0.05} className="card p-6">
            <div className="mono text-[10px] tracking-[0.25em] text-faint mb-2">WHERE YOUR CORRELATIONS LIVE</div>
            <BoundBar value={C} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              {([
                ["⟨A₀B₀⟩", corr(g.a0, g.b0)],
                ["⟨A₀B₁⟩", corr(g.a0, g.b1)],
                ["⟨A₁B₀⟩", corr(g.a1, g.b0)],
                ["−⟨A₁B₁⟩", -corr(g.a1, g.b1)],
              ] as const).map(([l, v]) => (
                <div key={l} className="rounded-xl border border-line bg-white/[0.02] px-3 py-2.5">
                  <div className="mono text-[9px] text-faint mb-1">{l}</div>
                  <div className={cn("mono text-[14px]", v >= 0 ? "text-quantum" : "text-rose")}>{fmt(v, 4)}</div>
                </div>
              ))}
            </div>
            <div className={cn("rounded-xl border px-4 py-3 mt-3 flex items-center gap-2.5", Math.abs(C) > LOCAL_BOUND + 1e-9 ? "border-rose/45 bg-rose/[0.06]" : "border-line")}>
              {Math.abs(C) > LOCAL_BOUND + 1e-9 ? <TriangleAlert size={14} className="text-rose shrink-0" /> : <Check size={14} className="text-quantum shrink-0" />}
              <span className="mono text-[11.5px]">
                <span className={Math.abs(C) > LOCAL_BOUND + 1e-9 ? "text-rose" : "text-muted"}>
                  C = {fmt(C, 6)} — {classifyCHSH(C).toUpperCase()}
                </span>
                {optimal && <span className="text-quantum"> · = 2√2 exactly, the quantum maximum</span>}
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="card p-6">
            <div className="mono text-[10px] tracking-[0.25em] text-faint mb-3">LOCAL REALISM — WHY |C| ≤ 2, IN ONE LINE</div>
            <TeX block className="!text-[0.84rem]">
              {"C(\\lambda) = A_0\\big[B_0 + B_1\\big] + A_1\\big[B_0 - B_1\\big]"}
            </TeX>
            <p className="text-[12.5px] text-muted leading-relaxed mt-2 mb-4">
              With <TeX>{"B_0,B_1 \\in \\{\\pm1\\}"}</TeX> one bracket is always{" "}
              <span className="mono text-gold">±2</span> and the other exactly{" "}
              <span className="mono text-quantum">0</span>. Click a strategy:
            </p>
            <div className="flex flex-wrap gap-1 mb-4">
              {lhv.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStrat(i)}
                  className={cn("w-7 h-7 rounded-md mono text-[9px] transition-all cursor-pointer border", strat === i ? "border-rose/70 bg-rose/15 text-rose" : "border-line text-faint hover:text-ink hover:border-line-bright")}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-line bg-white/[0.02] px-4 py-3.5">
              <div className="grid grid-cols-4 gap-2 mb-3">
                {([["A₀", s.A0], ["A₁", s.A1], ["B₀", s.B0], ["B₁", s.B1]] as const).map(([l, v]) => (
                  <div key={l} className="text-center">
                    <div className="mono text-[9px] text-faint">{l}</div>
                    <div className={cn("mono text-[15px]", v > 0 ? "text-gold" : "text-violet")}>{v > 0 ? "+1" : "−1"}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className={cn("rounded-lg px-3 py-2 border", s.sumB === 0 ? "border-quantum/40 bg-quantum/[0.06]" : "border-gold/40 bg-gold/[0.06]")}>
                  <div className="mono text-[9px] text-faint">B₀ + B₁</div>
                  <div className={cn("mono text-[15px]", s.sumB === 0 ? "text-quantum" : "text-gold")}>{s.sumB > 0 ? "+" : ""}{s.sumB}</div>
                </div>
                <div className={cn("rounded-lg px-3 py-2 border", s.diffB === 0 ? "border-quantum/40 bg-quantum/[0.06]" : "border-gold/40 bg-gold/[0.06]")}>
                  <div className="mono text-[9px] text-faint">B₀ − B₁</div>
                  <div className={cn("mono text-[15px]", s.diffB === 0 ? "text-quantum" : "text-gold")}>{s.diffB > 0 ? "+" : ""}{s.diffB}</div>
                </div>
              </div>
              <div className="mono text-[12px] text-center mt-3 text-rose">
                C = {s.A0}·({s.sumB}) + {s.A1}·({s.diffB}) = {s.chsh > 0 ? "+" : ""}{s.chsh}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
              {hist.map((h) => (
                <div key={h.value} className="flex-1">
                  <div className="flex justify-between mono text-[10px] mb-1">
                    <span className="text-faint">C = {h.value > 0 ? "+" : ""}{h.value}</span>
                    <span className="text-gold">{h.count}/16</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-gold/70" style={{ width: `${(h.count / 16) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mono text-[10.5px] text-faint mt-3">
              all 16 deterministic strategies land on ±2 — the local polytope's CHSH facet
            </p>
          </Reveal>
        </div>
      </div>

      {/* ===== THE TSIRELSON LABORATORY ===== */}
      <Reveal>
        <TsirelsonLab g={g} setG={setG} />
      </Reveal>

      {/* Tsirelson: commutator proof */}
      <Reveal className="card p-6">
        <div className="mono text-[10px] tracking-[0.25em] text-faint mb-4">
          TSIRELSON VIA THE COMMUTATOR NORM — LIVE 4×4 OPERATORS
        </div>
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6">
          <div>
            <TeX block className="!text-[0.84rem]">
              {"\\hat{\\mathcal C}^2 = 4\\mathbb{I} - [\\hat A_0,\\hat A_1][\\hat B_0,\\hat B_1]"}
            </TeX>
            <p className="text-[12.5px] text-muted leading-relaxed mt-2 mb-4">
              Because <TeX>{"\\hat A_x^2 = \\hat B_y^2 = \\mathbb{I}"}</TeX> and Alice commutes with
              Bob, the square collapses to <TeX>{"4\\mathbb{I}"}</TeX> plus one commutator product.
              Each commutator of ±1 observables has norm at most 2, so{" "}
              <TeX>{"\\|\\hat{\\mathcal C}^2\\| \\le 4 + 4 = 8"}</TeX> and{" "}
              <TeX>{"\\|\\hat{\\mathcal C}\\| \\le 2\\sqrt2"}</TeX>.
            </p>
            <div className="space-y-1.5 mono text-[11px]">
              {([
                ["residual ‖Ĉ² − (4𝕀 − [A₀,A₁][B₀,B₁])‖", ident.residual.toExponential(2), true],
                ["‖[A₀,A₁]‖ (≤ 2)", fmt(ident.normCA, 6), ident.normCA <= 2 + 1e-9],
                ["‖[B₀,B₁]‖ (≤ 2)", fmt(ident.normCB, 6), ident.normCB <= 2 + 1e-9],
                ["bound 4 + ‖·‖‖·‖ (≤ 8)", fmt(ident.bound, 6), ident.bound <= 8 + 1e-9],
                ["‖Ĉ²‖", fmt(ident.normC2, 6), true],
                ["‖Ĉ‖ (≤ 2√2 = 2.828427)", fmt(ident.normC, 6), ident.normC <= TSIRELSON + 1e-9],
              ] as const).map(([l, v, ok], i) => (
                <div key={i} className="flex justify-between gap-3 border-b border-line/50 pb-1.5">
                  <span className="text-faint">{l}</span>
                  <span className={ok ? "text-quantum" : "text-rose"}>{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl border border-line bg-white/[0.02] px-4 py-3">
              <div className="mono text-[9px] tracking-[0.2em] text-faint mb-1.5">SPECTRUM OF Ĉ</div>
              <div className="flex flex-wrap gap-2">
                {eigSym(ops.C).map((e, i) => (
                  <span key={i} className={cn("chip !py-1 !px-2.5 !text-[10px]", Math.abs(Math.abs(e) - TSIRELSON) < 1e-6 ? "!text-quantum !border-quantum/50" : "!text-muted")}>
                    {fmt(e, 5)}
                  </span>
                ))}
              </div>
              <p className="text-[11.5px] text-muted leading-relaxed mt-2">
                The extreme eigenvalues never exceed <TeX>{"\\pm2\\sqrt2"}</TeX>, whatever angles
                you dial. At the optimum they touch it exactly.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <MatGrid M={ops.A0} label="Â₀ = obs(a₀) ⊗ 𝕀" tone={GOLD} />
            <MatGrid M={ops.B0} label="B̂₀ = 𝕀 ⊗ obs(b₀)" tone={CYAN} />
            <MatGrid M={ops.C} label="Ĉ (CHSH operator)" tone={ROSE} />
            <MatGrid M={mul(ops.C, ops.C)} label="Ĉ² (→ 8·𝕀 at optimum)" tone={VIOLET} />
          </div>
        </div>
      </Reveal>

      {/* SOS */}
      <Reveal className="card p-6">
        <div className="mono text-[10px] tracking-[0.25em] text-faint mb-3 flex items-center gap-2">
          <ShieldCheck size={12} className="text-quantum" /> SUM-OF-SQUARES CERTIFICATE & SELF-TESTING
        </div>
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <div>
            <TeX block className="!text-[0.8rem]">
              {"2\\sqrt2\\,\\mathbb{I} - \\hat{\\mathcal C} = \\tfrac{1}{\\sqrt2}\\Big(\\tfrac{\\hat A_0+\\hat A_1}{\\sqrt2} - \\hat B_0\\Big)^{2} + \\tfrac{1}{\\sqrt2}\\Big(\\tfrac{\\hat A_0-\\hat A_1}{\\sqrt2} - \\hat B_1\\Big)^{2}"}
            </TeX>
            <p className="text-[12.5px] text-muted leading-relaxed mt-3">
              A square <TeX>{"M^2"}</TeX> is positive semi-definite, so the right side has
              non-negative expectation in <em>every</em> state — which instantly gives{" "}
              <TeX>{"\\langle\\hat{\\mathcal C}\\rangle \\le 2\\sqrt2"}</TeX> with no optimisation
              at all. Equality forces both squares to annihilate the state, which pins the
              measurements and the state up to isometry: <em>self-testing</em>.
            </p>

            <div className="rounded-xl border border-gold/35 bg-gold/[0.05] px-4 py-3.5 mt-4 flex gap-2.5">
              <Info size={13} className="text-gold shrink-0 mt-0.5" />
              <div>
                <div className="mono text-[10px] tracking-[0.2em] text-gold mb-1.5">MIND THE √2 WHEN EXPANDING</div>
                <p className="text-[12px] text-muted leading-relaxed">
                  Expanding the brackets gives{" "}
                  <TeX>{"M^2+N^2 = 4\\mathbb{I} - \\sqrt2\\,\\hat{\\mathcal C}"}</TeX>, not{" "}
                  <TeX>{"4\\mathbb{I}-\\hat{\\mathcal C}"}</TeX> — the cross terms carry{" "}
                  <TeX>{"2/\\sqrt2 = \\sqrt2"}</TeX>. Multiplying by{" "}
                  <TeX>{"1/\\sqrt2"}</TeX> then lands exactly on{" "}
                  <TeX>{"2\\sqrt2\\,\\mathbb{I}-\\hat{\\mathcal C}"}</TeX>. Both residuals are
                  measured live below.
                </p>
              </div>
            </div>

            <div className="space-y-1.5 mono text-[11px] mt-4">
              {([
                ["‖(M²+N²) − (4𝕀 − √2·Ĉ)‖", sos.innerResidual.toExponential(2), sos.innerResidual < 1e-12],
                ["‖(2√2·𝕀 − Ĉ) − (M²+N²)/√2‖", sos.residual.toExponential(2), sos.residual < 1e-12],
                ["λ_min(M²) ≥ 0", fmt(sos.eigM2, 8), sos.eigM2 >= -1e-9],
                ["λ_min(N²) ≥ 0", fmt(sos.eigN2, 8), sos.eigN2 >= -1e-9],
                ["λ_min(2√2·𝕀 − Ĉ) ≥ 0", fmt(sos.minEigLHS, 8), sos.minEigLHS >= -1e-9],
              ] as const).map(([l, v, ok], i) => (
                <div key={i} className="flex justify-between gap-3 border-b border-line/50 pb-1.5">
                  <span className="text-faint">{l}</span>
                  <span className={ok ? "text-quantum" : "text-rose"}>{v}</span>
                </div>
              ))}
            </div>

            <div className={cn("rounded-xl border px-4 py-3 mt-3", sos.saturated ? "border-quantum/45 bg-quantum/[0.06]" : "border-line")}>
              <p className="text-[12.5px] text-muted leading-relaxed">
                {sos.saturated ? (
                  <>
                    <span className="text-quantum">λ_min = 0 — the certificate is saturated.</span>{" "}
                    Your angles achieve Tsirelson's bound exactly, and the state annihilated by both
                    squares is the maximally entangled one. This is the self-testing condition.
                  </>
                ) : (
                  <>
                    λ_min = <span className="mono text-ink">{fmt(sos.minEigLHS, 5)}</span> &gt; 0 —
                    the inequality is strict, so these angles cannot reach 2√2. Snap to optimal to
                    drive it to zero.
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 content-start">
            <MatGrid M={sos.M} label="M = (A₀+A₁)/√2 − B₀" tone={GOLD} />
            <MatGrid M={sos.N} label="N = (A₀−A₁)/√2 − B₁" tone={CYAN} />
            <MatGrid M={sos.M2} label="M² ⪰ 0" tone={VIOLET} />
            <MatGrid M={sos.N2} label="N² ⪰ 0" tone={VIOLET} />
          </div>
        </div>
      </Reveal>

      {/* PR box + comparison */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Reveal className="card p-6">
          <div className="mono text-[10px] tracking-[0.25em] text-faint mb-3 flex items-center gap-2">
            <Boxes size={12} className="text-violet" /> THE PR BOX — NO-SIGNALING BUT NOT QUANTUM
          </div>
          <TeX block className="!text-[0.86rem]">{"a \\oplus b = x \\cdot y"}</TeX>
          <p className="text-[12.5px] text-muted leading-relaxed mt-2 mb-4">
            Popescu–Rohrlich boxes satisfy this rule perfectly with uniform marginals. They
            transmit nothing (no-signaling holds), yet reach the algebraic maximum{" "}
            <span className="mono text-violet">C = 4</span>. Nature declines to supply them —
            Tsirelson's bound is a genuine physical restriction, not a logical one.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full mono text-[11px]">
              <thead>
                <tr className="text-faint text-[9px] tracking-[0.18em] border-b border-line">
                  {["x", "y", "rule", "⟨A_xB_y⟩"].map((c) => (
                    <th key={c} className="text-left font-normal py-2 pr-4">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prTable().map((r, i) => (
                  <tr key={i} className="border-b border-line/40">
                    <td className="py-2 pr-4 text-ink/80">{r.x}</td>
                    <td className="py-2 pr-4 text-ink/80">{r.y}</td>
                    <td className="py-2 pr-4 text-muted">{r.rule}</td>
                    <td className={cn("py-2 pr-4", r.E > 0 ? "text-quantum" : "text-rose")}>{r.E > 0 ? "+1" : "−1"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-violet/40 bg-violet/[0.06] px-4 py-3 mt-4 mono text-[12px] text-violet">
            C = (+1) + (+1) + (+1) − (−1) = {pr.chsh} &nbsp;
            <span className="text-faint">· the algebraic ceiling</span>
          </div>
        </Reveal>

        <Reveal delay={0.05} className="card p-6">
          <div className="mono text-[10px] tracking-[0.25em] text-faint mb-3 flex items-center gap-2">
            <Radio size={12} className="text-quantum" /> TWO ROUTES OUT OF THE CLASSICAL POLYTOPE
          </div>
          <div className="overflow-x-auto">
            <table className="w-full mono text-[11px]">
              <thead>
                <tr className="text-faint text-[9px] tracking-[0.18em] border-b border-line">
                  {["", "CHSH", "KCBS"].map((c) => (
                    <th key={c} className="text-left font-normal py-2 pr-4">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {([
                  ["assumption broken", "locality", "non-contextuality"],
                  ["systems needed", "2 separated", "1 qutrit"],
                  ["entanglement", "required", "none"],
                  ["classical bound", "2", "−3  (Σ⟨SᵢSᵢ₊₁⟩)"],
                  ["quantum bound", "2√2 ≈ 2.8284", "5−4√5 ≈ −3.9443"],
                  ["post-quantum", "4 (PR box)", "−5 (algebraic)"],
                  ["graph", "CHSH facet", "C₅ / ϑ = √5"],
                  ["per-edge value", "0.7071", fmt(QUANTUM_AVG, 4)],
                ] as const).map(([l, a, b], i) => (
                  <tr key={i} className="border-b border-line/40">
                    <td className="py-2 pr-4 text-faint">{l}</td>
                    <td className="py-2 pr-4 text-quantum">{a}</td>
                    <td className="py-2 pr-4 text-gold">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12.5px] text-muted leading-relaxed mt-4">
            Both are the <em>same</em> convex-geometry story: a polytope of deterministic
            strategies, a curved quantum body bulging past one of its facets, and an outer
            no-signaling polytope that quantum theory refuses to fill. Bell needs distance; KCBS
            needs only incompatibility.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <button onClick={() => setView("convexity")} className="chip !py-2 !px-4 cursor-pointer !text-ink hover:!text-quantum hover:!border-quantum/60 transition-colors">
              compare with the KCBS convex map <ArrowRight size={11} />
            </button>
            <button onClick={() => setView("polytope")} className="chip !py-2 !px-4 cursor-pointer hover:!text-ink hover:!border-line-bright transition-colors">
              back to the tetrahedron <ArrowRight size={11} />
            </button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
