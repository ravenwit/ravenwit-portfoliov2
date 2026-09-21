import { useMemo } from "react";
import { Dot, Radiation, Shapes, Spline } from "lucide-react";
import { SectionHead, Reveal } from "./Section";
import { TeX } from "./TeX";
import { effectiveAngles } from "./Playground";
import { useCalc } from "../state/store";
import {
  coneSpec, coneVectors, corrStats, psiFromAngles,
  alphaBound, lovaszBound, fracBound, validSteps, bestSumP,
  clamp, fmt,
} from "../lib/kcbs";
import { cn } from "../utils/cn";

/* ================================================================
   Envelope sampling in the (Σpᵢ, ρ) plane
      x = Σᵢ pᵢ           (KCBS event witness)
      ρ = RMS imbalance   √(Σ(pᵢ − p̄)²/N)
   Three nested convex sets for the cycle C_N:
      STAB  = conv{independent-set indicators}
      E(QM) ⊇ STAB ∪ {umbrella states}   (theta body)
      FRAC  = conv{independent sets ∪ ½·1}  (no-signaling)
   ================================================================ */

type Env = { min: number[]; max: number[] };
interface Envelopes {
  nx: number; xmax: number; ymax: number;
  nc: Env; qu: Env; fr: Env;
  feasible: boolean;
}

function independentSets(n: number): number[][] {
  const out: number[][] = [];
  for (let mask = 0; mask < (1 << n); mask++) {
    let ok = true;
    for (let i = 0; i < n && ok; i++) {
      const j = (i + 1) % n;
      if (mask & (1 << i) && mask & (1 << j)) ok = false;
    }
    if (ok) out.push(Array.from({ length: n }, (_, i) => (mask & (1 << i) ? 1 : 0)));
  }
  return out;
}

function gauss(): number {
  const u = Math.random() || 1e-9, v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function computeEnvelopes(N: number, p: number): Envelopes {
  const NX = 150;
  const xmax = fracBound(N) + 0.02 * N;
  const ymax = 0.56;
  const bin = (x: number) => Math.min(NX - 1, Math.max(0, Math.floor((x / xmax) * NX)));

  const mk = (): Env => ({ min: Array(NX).fill(Infinity), max: Array(NX).fill(-Infinity) });
  const nc = mk(), qu = mk(), fr = mk();

  const rho = (P: number[], s: number) => {
    const m = s / N;
    let a = 0;
    for (let i = 0; i < N; i++) a += (P[i] - m) * (P[i] - m);
    return Math.sqrt(a / N);
  };
  const add = (env: Env, P: number[]) => {
    const s = P.reduce((a, b) => a + b, 0);
    if (s <= 1e-12) return;
    const r = clamp(rho(P, s), 0, ymax);
    const b = bin(s);
    if (r < env.min[b]) env.min[b] = r;
    if (r > env.max[b]) env.max[b] = r;
  };

  const indep = independentSets(N);
  const feasible = validSteps(N).includes(p);
  const spec = coneSpec(N, feasible ? p : validSteps(N)[0] ?? 1);
  const vs = coneVectors(spec);

  // classical + fractional polytopes
  const frVerts = [...indep, Array(N).fill(0.5)];
  const mixSample = (verts: number[][]) => {
    if (Math.random() < 0.55) return verts[(Math.random() * verts.length) | 0];
    const k = 3;
    const idx = Array.from({ length: k }, () => (Math.random() * verts.length) | 0);
    const w = Array.from({ length: k }, () => Math.random());
    const sw = w.reduce((a, b) => a + b, 0);
    const out = Array(N).fill(0);
    idx.forEach((vi, t) => verts[vi].forEach((val, d) => (out[d] += (w[t] / sw) * val)));
    return out;
  };
  for (let i = 0; i < 42000; i++) add(nc, mixSample(indep));
  for (let i = 0; i < 42000; i++) add(fr, mixSample(frVerts));

  // quantum: pure Haar states on S² + 2-mixtures, through the umbrella
  for (let i = 0; i < 80000; i++) {
    const probe = () => {
      const g = [gauss(), gauss(), gauss()];
      const nrm = Math.hypot(g[0], g[1], g[2]);
      return [g[0] / nrm, g[1] / nrm, g[2] / nrm] as [number, number, number];
    };
    const psi = probe();
    const P1 = corrStats(vs, psi).P;
    let P = P1;
    if (Math.random() < 0.35) {
      const psi2 = probe();
      const P2 = corrStats(vs, psi2).P;
      const l = Math.random();
      P = P1.map((q, t) => l * q + (1 - l) * P2[t]);
    }
    add(qu, P);
  }
  // theorem: STAB ⊆ E ⊆ FRAC — fold the classical silhouette into E
  for (let b = 0; b < NX; b++) {
    if (nc.max[b] > qu.max[b]) qu.max[b] = nc.max[b];
    if (nc.min[b] < qu.min[b]) qu.min[b] = nc.min[b];
  }

  // gap-fill + smooth
  const fix = (env: Env) => {
    let last = -1;
    for (let b = 0; b < NX; b++) if (env.max[b] > -Infinity) last = b;
    for (let b = last - 1; b >= 0; b--) if (env.max[b] === -Infinity) { env.max[b] = env.max[b + 1]; env.min[b] = env.min[b + 1]; }
    for (let b = 0; b < NX; b++) {
      if (env.max[b] === -Infinity) { env.max[b] = 0; env.min[b] = 0; }
      env.min[b] = Math.max(0, env.min[b] === Infinity ? 0 : env.min[b]);
    }
    const sm = (arr: number[]) =>
      arr.map((_, b) => {
        let s = 0, c = 0;
        for (let k = -2; k <= 2; k++) { const t = b + k; if (t >= 0 && t < NX) { s += arr[t]; c++; } }
        return s / c;
      });
    env.max = sm(env.max); env.min = sm(env.min);
  };
  fix(nc); fix(qu); fix(fr);

  return { nx: NX, xmax, ymax, nc, qu, fr, feasible };
}

function bandPath(env: Env, nx: number, X: (x: number) => number, Y: (y: number) => number, xmax: number): string {
  const pts: string[] = [];
  const lo = env.min.map((v, b) => Math.min(v, env.max[b]));
  for (let b = 0; b < nx; b++) pts.push(`${b === 0 ? "M" : "L"}${X(((b + 0.5) / nx) * xmax).toFixed(1)},${Y(env.max[b]).toFixed(1)}`);
  for (let b = nx - 1; b >= 0; b--) pts.push(`L${X(((b + 0.5) / nx) * xmax).toFixed(1)},${Y(lo[b]).toFixed(1)}`);
  return pts.join(" ") + " Z";
}

/* ================================================================ */

export function ConvexWorlds() {
  const { N, p, mode, theta, phi } = useCalc();
  const env = useMemo(() => computeEnvelopes(N, p), [N, p]);
  const feasible = validSteps(N).includes(p);

  const marker = useMemo(() => {
    if (!feasible) return null;
    const spec = coneSpec(N, p);
    const { theta: tEff, phi: fEff } = effectiveAngles(spec, mode, theta, phi);
    const st = corrStats(coneVectors(spec), psiFromAngles(tEff, fEff));
    const m = st.sumP / N;
    const r = Math.sqrt(st.P.reduce((a, q) => a + (q - m) * (q - m), 0) / N);
    return { s: st.sumP, r };
  }, [N, p, mode, theta, phi, feasible]);

  const alpha = alphaBound(N), lov = lovaszBound(N), frac = fracBound(N);

  const W = 1000, Hh = 430;
  const mL = 60, mR = 26, mT = 30, mB = 44;
  const X = (x: number) => mL + (x / env.xmax) * (W - mL - mR);
  const Y = (y: number) => mT + (1 - y / env.ymax) * (Hh - mT - mB);

  const inCrescent = marker !== null && feasible && marker.s > alpha + 1e-6;

  // convexity-chord demo points
  const sumStar = feasible ? Math.max(bestSumP(coneSpec(N, p)), alpha) : alpha;
  const chordA = { x: Math.min(sumStar, lov), y: 0.0 };
  const rhoB = Math.sqrt((alpha * (1 - alpha / N) ** 2 + (N - alpha) * (alpha / N) ** 2) / N);
  const chordB = { x: alpha, y: Math.min(rhoB, env.ymax * 0.95) };

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute -right-40 top-40 w-[600px] h-[600px] rounded-full opacity-[0.14] blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(closest-side, rgba(167,139,250,0.4), transparent 70%)" }}
      />
      <div className="px-5 md:px-8 py-7 max-w-[1500px]">
        <SectionHead
          index="▪"
          kicker="Convexity, shaded properly"
          accent="rose"
          title={
            <>
              Three nested worlds,{" "}
              <span className="italic text-rose">and the crescent where classical dies.</span>
            </>
          }
          lede={
            <>
              Every model assigns each ray an event probability <TeX>{"p_i"}</TeX>; exclusivity
              forces <TeX>{"p_i + p_{i+1} \\le 1"}</TeX>. Map each probability vector to{" "}
              <TeX>{"(\\Sigma p_i,\\, \\rho)"}</TeX> and three convex sets appear: the
              non-contextual polytope <TeX>{"\\mathrm{STAB}(C_N)"}</TeX>, the quantum theta body,
              and the no-signaling polytope. The bands below are traced live from{" "}
              <span className="mono text-ink">{(42000*2 + 80000).toLocaleString()}</span>{" "}
              samples for the umbrella you configured in the playground.
            </>
          }
        />

        <div className="grid lg:grid-cols-[1.35fr_0.65fr] gap-6 items-start">
          <Reveal className="card p-4 md:p-6 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-2">
              <div className="mono text-[10px] tracking-[0.25em] text-faint">
                CONVEX WORLD MAP — C{`₍${N}₎`} · UMBRELLA {"{N/p}"} = {`{${N}/${p}}`}
              </div>
              <div className="flex gap-3 mono text-[9.5px]">
                <span className="flex items-center gap-1.5 text-gold"><span className="w-2.5 h-2.5 rounded-sm bg-gold/70 inline-block" /> STAB (classical)</span>
                <span className="flex items-center gap-1.5 text-quantum"><span className="w-2.5 h-2.5 rounded-sm bg-quantum/70 inline-block" /> quantum θ-body</span>
                <span className="flex items-center gap-1.5 text-violet"><span className="w-2.5 h-2.5 rounded-sm bg-violet/70 inline-block" /> FRAC (no-signaling)</span>
              </div>
            </div>

            <svg viewBox={`0 0 ${W} ${Hh}`} className="w-full">
              {/* horizontal grid */}
              {[0, 0.2, 0.4].map((y) => (
                <g key={y}>
                  <line x1={mL} x2={W - mR} y1={Y(y)} y2={Y(y)} stroke="rgba(236,231,219,0.07)" />
                  <text x={mL - 10} y={Y(y) + 3.5} textAnchor="end" fontSize="10" className="mono" fill="rgba(143,141,156,0.85)">{y.toFixed(1)}</text>
                </g>
              ))}
              <text x={20} y={Y(0.28)} fontSize="10" className="mono" fill="rgba(143,141,156,0.85)" transform={`rotate(-90 20 ${Y(0.28)})`} textAnchor="middle" letterSpacing="2">
                ρ — imbalance
              </text>

              {/* bands: FRAC, quantum, STAB */}
              <path d={bandPath(env.fr, env.nx, X, Y, env.xmax)} fill="rgba(167,139,250,0.12)" stroke="rgba(167,139,250,0.55)" strokeWidth="1.2" />
              <path d={bandPath(env.qu, env.nx, X, Y, env.xmax)} fill="rgba(111,220,247,0.14)" stroke="rgba(111,220,247,0.6)" strokeWidth="1.2" />
              <path d={bandPath(env.nc, env.nx, X, Y, env.xmax)} fill="rgba(232,180,92,0.16)" stroke="rgba(232,180,92,0.7)" strokeWidth="1.2" />

              {/* bound lines */}
              {[
                { v: alpha, c: "#e8b45c", label: `α = ${fmt(alpha, 1).replace(".0", "")}` },
                { v: lov, c: "#6fdcf7", label: `ϑ = ${fmt(lov, 4)}` },
                { v: frac, c: "#a78bfa", label: `N/2 = ${fmt(frac, 1).replace(".0", "")}` },
              ].map((b, i) => (
                <g key={i} opacity={Math.abs(b.v - (i > 0 ? [alpha, lov][i - 1] : Infinity)) < 1e-9 ? 0.55 : 1}>
                  <line x1={X(b.v)} x2={X(b.v)} y1={mT - 6} y2={Y(0)} stroke={b.c} strokeWidth="1" strokeDasharray="4 4" />
                  <text x={X(b.v)} y={mT - 12} textAnchor="middle" fontSize="10" className="mono" fill={b.c}>{b.label}</text>
                </g>
              ))}

              {/* convexity chord demo */}
              <line x1={X(chordA.x)} y1={Y(chordA.y)} x2={X(chordB.x)} y2={Y(chordB.y)} stroke="rgba(236,231,219,0.4)" strokeWidth="1" strokeDasharray="2 4" />
              <circle cx={X(chordA.x)} cy={Y(chordA.y)} r="4" fill="#6fdcf7" />
              <circle cx={X(chordB.x)} cy={Y(chordB.y)} r="4" fill="#e8b45c" />
              <circle cx={X((chordA.x + chordB.x) / 2)} cy={Y((chordA.y + chordB.y) / 2)} r="3" fill="#ece7db" />
              <text x={X((chordA.x + chordB.x) / 2) + 8} y={Y((chordA.y + chordB.y) / 2) - 5} fontSize="9" className="mono" fill="rgba(236,231,219,0.75)">
                (A+B)/2 — mixtures stay inside: convexity
              </text>
              <text x={X(chordA.x)} y={Y(chordA.y) + 16} textAnchor="middle" fontSize="9" className="mono" fill="#6fdcf7">A: ψ apex</text>
              <text x={X(chordB.x)} y={Y(chordB.y) - 8} textAnchor="middle" fontSize="9" className="mono" fill="#e8b45c">B: classical corner</text>

              {/* live marker */}
              {marker && (
                <g>
                  <circle cx={X(marker.s)} cy={Y(clamp(marker.r, 0, env.ymax))} r="11" fill="none" stroke={inCrescent ? "#fb5c7a" : "#ece7db"} strokeWidth="1.2" opacity="0.5">
                    <animate attributeName="r" values="8;14;8" dur="2.2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={X(marker.s)} cy={Y(clamp(marker.r, 0, env.ymax))} r="4.5" fill={inCrescent ? "#fb5c7a" : "#ece7db"} />
                  <text x={X(marker.s) + 12} y={Y(clamp(marker.r, 0, env.ymax)) - 8} fontSize="10" className="mono" fill={inCrescent ? "#fb5c7a" : "#ece7db"}>
                    you · Σp = {fmt(marker.s, 3)}
                  </text>
                </g>
              )}

              {/* x axis */}
              <line x1={mL} x2={W - mR} y1={Y(0)} y2={Y(0)} stroke="rgba(236,231,219,0.18)" />
              {Array.from({ length: Math.floor(env.xmax) + 1 }, (_, t) => (
                <g key={t}>
                  <line x1={X(t)} x2={X(t)} y1={Y(0)} y2={Y(0) + 5} stroke="rgba(236,231,219,0.2)" />
                  <text x={X(t)} y={Y(0) + 19} textAnchor="middle" fontSize="10" className="mono" fill="rgba(143,141,156,0.9)">{t}</text>
                </g>
              ))}
              <text x={(mL + W - mR) / 2} y={Hh - 8} textAnchor="middle" fontSize="10" className="mono" fill="rgba(143,141,156,0.9)" letterSpacing="2.5">
                Σᵢ pᵢ — KCBS EVENT WITNESS
              </text>
            </svg>
          </Reveal>

          <div className="flex flex-col gap-4">
            <Reveal delay={0.05}
              className={cn("card p-5", inCrescent && "!border-rose/40 !bg-rose/[0.05]")}
            >
              <div className="mono text-[10px] tracking-[0.25em] text-faint mb-2 flex items-center gap-2">
                <Dot size={16} className={inCrescent ? "text-rose" : "text-quantum"} /> YOUR CONFIGURATION'S ADDRESS
              </div>
              {!feasible ? (
                <p className="text-[13px] text-muted leading-relaxed">
                  This umbrella is <span className="mono text-rose">degenerate</span> — gcd(p, N) &gt; 1
                  fragments the orthogonality graph into triangles, so the marker is withheld. The
                  polytopes still stand; pick a coprime pitch.
                </p>
              ) : marker!.s > lov + 1e-6 ? (
                <p className="mono text-[12px] text-rose leading-relaxed">Σp beyond ϑ — unreachable for any quantum state with these exclusivities (a consistency check that must never fire).</p>
              ) : inCrescent ? (
                <>
                  <div className="mono text-[11px] tracking-[0.18em] text-rose mb-1.5">INSIDE THE CONTEXTUAL CRESCENT</div>
                  <p className="text-[13px] text-muted leading-relaxed">
                    <TeX>{"\\Sigma p_i > \\alpha(C_N)"}</TeX>: your point lies in the theta body but
                    outside every convex mixture of classical corners. That gap —{" "}
                    <span className="mono text-rose">+{fmt(marker!.s - alpha, 4)}</span> — is
                    contextuality, geometrically.
                  </p>
                </>
              ) : (
                <p className="text-[13px] text-muted leading-relaxed">
                  Currently inside the classical hull (<TeX>{"\\Sigma p_i \\le \\alpha"}</TeX>):
                  reproducible by tossing coins over the 11 corner assignments. Optimize the
                  umbrella in the playground to cross the gold boundary at α.
                </p>
              )}
            </Reveal>

            <Reveal delay={0.1} className="card p-5">
              <div className="mono text-[10px] tracking-[0.25em] text-faint mb-3 flex items-center gap-2">
                <Shapes size={12} className="text-gold" /> POLYTOPE / NOT-POLYTOPE
              </div>
              <ul className="space-y-3 text-[12.5px] text-muted leading-relaxed">
                <li className="flex gap-2.5">
                  <span className="w-2 h-2 rounded-sm bg-gold/70 mt-1.5 shrink-0" />
                  <span><span className="text-ink">STAB — polytope.</span> Convex hull of the {independentSets(N).length} independent-set indicators of C{`₍${N}₎`}. Membership is a linear program; vertices are sharp corners; its apex on the Σp-axis is α = {fmt(alpha, 1).replace(".0", "")}.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="w-2 h-2 rounded-sm bg-quantum/70 mt-1.5 shrink-0" />
                  <span><span className="text-ink">Quantum θ-body — convex, NOT polyhedral.</span> Its frontier is curved (no finite corner list); membership is a semidefinite program; apex exactly ϑ = {fmt(lov, 4)}.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="w-2 h-2 rounded-sm bg-violet/70 mt-1.5 shrink-0" />
                  <span><span className="text-ink">FRAC — polytope again.</span> Same corners plus the single fractional vertex ½·1; apex N/2 = {fmt(frac, 1).replace(".0", "")}. {N % 2 === 0 ? "For even N the fractional corner already lies inside STAB — all three worlds coincide." : "For odd N it sticks out past ϑ — more world than quantum can fill."}</span>
                </li>
              </ul>
            </Reveal>

            <Reveal delay={0.15} className="card p-5">
              <div className="mono text-[10px] tracking-[0.25em] text-faint mb-2 flex items-center gap-2">
                <Spline size={12} className="text-violet" /> WHY NESTING IS FORCED
              </div>
              <p className="text-[12.5px] text-muted leading-relaxed">
                Classical determinism uses only corners; classical randomness closes them under
                convex hull. Quantum mixtures are convex too, and realize every corner
                (degenerate umbrellas) — so STAB ⊆ E. Event-wise no-signaling allows anything
                consistent edge-by-edge: E ⊆ FRAC. Contextuality is precisely{" "}
                <TeX>{"E \\setminus \\mathrm{STAB}"}</TeX> — the cyan crescent wrapped around the
                gold core.
              </p>
            </Reveal>

            <Reveal delay={0.2} className="card p-5">
              <div className="mono text-[10px] tracking-[0.25em] text-faint mb-2 flex items-center gap-2">
                <Radiation size={12} className="text-quantum" /> LINKED TO THE PLAYGROUND
              </div>
              <p className="text-[12.5px] text-muted leading-relaxed">
                The bands re-sample whenever you change N or the pitch. Watch the quantum band reach
                its apex at ϑ only for the maximal odd pitch{" "}
                <TeX>{"p=(N-1)/2"}</TeX> — the same cone the discovery table crowned. For even N
                all silhouettes collapse onto one: no crescent, no contextuality, ever.
              </p>
            </Reveal>

          </div>
        </div>
      </div>
    </section>
  );
}
