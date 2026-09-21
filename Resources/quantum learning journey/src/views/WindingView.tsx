import { useEffect, useMemo, useState } from "react";
import { animate, motion } from "framer-motion";
import { ArrowRight, Ban, Check, Info, Play, RotateCcw, TriangleAlert } from "lucide-react";
import { SectionHead, Reveal } from "../components/Section";
import { TeX } from "../components/TeX";
import { WiringCircle, OverlapCurves } from "../components/WindingFigures";
import { useCalc } from "../state/store";
import {
  windingInfo, requiredH2, PENTAGON_COSINES, H, fmt, clamp,
} from "../lib/kcbs";
import { cn } from "../utils/cn";

/* ------------------------------------------------------------------ */
function WiringPanel({
  N, k, progress, title,
}: {
  N: number; k: number; progress: number; title: string;
}) {
  const info = windingInfo(N, k);
  const ok = info.obtuse;
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 relative overflow-hidden",
        ok ? "border-quantum/35 bg-quantum/[0.035]" : "border-rose/35 bg-rose/[0.035]"
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="mono text-[10px] tracking-[0.18em] text-faint">{title}</span>
        <span className={cn("chip !py-1 !px-2.5 !text-[9px]", ok ? "!text-quantum !border-quantum/50" : "!text-rose !border-rose/50")}>
          {ok ? <Check size={10} /> : <Ban size={10} />}
          {ok ? "works" : "impossible"}
        </span>
      </div>

      <svg viewBox="0 0 260 250" className="w-full">
        <WiringCircle N={N} k={k} cx={130} cy={118} R={88} progress={progress} />
        <text x={130} y={232} textAnchor="middle" fontSize="11" className="mono" fill="rgba(236,231,219,0.8)">
          visit order {info.visitOrder.slice(0, N + 1).map((v) => v + 1).join("→")}
        </text>
      </svg>

      <div className="space-y-1.5 mono text-[11px] mt-1">
        <Row l="step Δφ = 2πk/N" v={`${info.deltaDeg}°`} />
        <Row l="cos Δφ" v={fmt(info.cos, 5)} tone={ok ? "cyan" : "rose"} />
        <Row l="total swept = N·Δφ" v={`${info.totalDeg}° = ${info.turns}·2π`} tone="gold" />
        <Row
          l="required h² = cosΔφ/(cosΔφ−1)"
          v={info.h2 > 0 ? fmt(info.h2, 5) : fmt(info.h2, 5)}
          tone={ok ? "cyan" : "rose"}
        />
        <Row
          l="height h"
          v={info.h != null ? fmt(info.h, 5) : "imaginary"}
          tone={ok ? "cyan" : "rose"}
        />
      </div>
    </div>
  );
}

function Row({ l, v, tone }: { l: string; v: string; tone?: "cyan" | "rose" | "gold" }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line/50 pb-1">
      <span className="text-faint text-[10px]">{l}</span>
      <span
        className={cn(
          tone === "cyan" && "text-quantum",
          tone === "rose" && "text-rose",
          tone === "gold" && "text-gold",
          !tone && "text-ink/85"
        )}
      >
        {v}
      </span>
    </div>
  );
}

/* ---------------- interactive Δφ sweep ---------------------------- */
function SweepLab() {
  const [deg, setDeg] = useState(144);
  const rad = (deg * Math.PI) / 180;
  const c = Math.cos(rad);
  const h2 = requiredH2(c);
  const ok = c < -1e-9;

  const W = 620, Hh = 250;
  const mL = 54, mR = 20, mT = 22, mB = 40;
  const X = (d: number) => mL + (d / 180) * (W - mL - mR);
  const yMin = -1.1, yMax = 0.62;
  const Y = (v: number) => mT + ((yMax - clamp(v, yMin, yMax)) / (yMax - yMin)) * (Hh - mT - mB);

  const curve = useMemo(() => {
    let d = "";
    let started = false;
    for (let i = 0; i <= 360; i++) {
      const dd = (i / 360) * 180;
      const v = requiredH2(Math.cos((dd * Math.PI) / 180));
      if (v < yMin) { started = false; continue; }
      d += `${started ? "L" : "M"}${X(dd).toFixed(1)},${Y(v).toFixed(1)}`;
      started = true;
    }
    return d;
  }, []);

  return (
    <div className="card p-5">
      <div className="mono text-[10px] tracking-[0.25em] text-faint mb-1">
        SWEEP THE NEIGHBOUR SEPARATION — REQUIRED h² = cosΔφ / (cosΔφ − 1)
      </div>
      <svg viewBox={`0 0 ${W} ${Hh}`} className="w-full">
        {/* impossible band */}
        <rect x={mL} y={Y(0)} width={W - mL - mR} height={Hh - mB - Y(0)} fill="rgba(251,92,122,0.07)" />
        <text x={mL + 10} y={Y(0) + 20} fontSize="9.5" className="mono" fill="rgba(251,92,122,0.85)" letterSpacing="1.5">
          h² &lt; 0 — NO REAL HEIGHT EXISTS
        </text>
        <rect x={mL} y={mT} width={X(90) - mL} height={Hh - mB - mT} fill="rgba(251,92,122,0.05)" />
        <text x={(mL + X(90)) / 2} y={mT + 16} textAnchor="middle" fontSize="9.5" className="mono" fill="rgba(251,92,122,0.8)" letterSpacing="1.5">
          ACUTE — cos Δφ &gt; 0
        </text>
        <text x={(X(90) + W - mR) / 2} y={mT + 16} textAnchor="middle" fontSize="9.5" className="mono" fill="rgba(111,220,247,0.8)" letterSpacing="1.5">
          OBTUSE — cos Δφ &lt; 0 · solutions live here
        </text>

        <line x1={mL} x2={W - mR} y1={Y(0)} y2={Y(0)} stroke="rgba(236,231,219,0.35)" />
        <line x1={X(90)} x2={X(90)} y1={mT} y2={Hh - mB} stroke="rgba(236,231,219,0.28)" strokeDasharray="4 4" />
        <text x={X(90)} y={Hh - mB + 15} textAnchor="middle" fontSize="9.5" className="mono" fill="rgba(236,231,219,0.65)">90°</text>

        {[0, 45, 135, 180].map((t) => (
          <text key={t} x={X(t)} y={Hh - mB + 15} textAnchor="middle" fontSize="9.5" className="mono" fill="rgba(143,141,156,0.9)">{t}°</text>
        ))}
        {[-1, -0.5, 0, 0.5].map((v) => (
          <text key={v} x={mL - 8} y={Y(v) + 3.5} textAnchor="end" fontSize="9.5" className="mono" fill="rgba(143,141,156,0.9)">{v}</text>
        ))}

        <path d={curve} fill="none" stroke="#a78bfa" strokeWidth="2.2" />

        {/* pentagon / pentagram markers */}
        {[
          { d: 72, col: "#fb5c7a", l: "72° pentagon" },
          { d: 144, col: "#6fdcf7", l: "144° pentagram" },
        ].map((m) => {
          const v = requiredH2(Math.cos((m.d * Math.PI) / 180));
          return (
            <g key={m.d}>
              <line x1={X(m.d)} x2={X(m.d)} y1={mT} y2={Hh - mB} stroke={m.col} strokeWidth="1" strokeDasharray="3 4" opacity={0.6} />
              <circle cx={X(m.d)} cy={Y(v)} r="5" fill="#0b0b14" stroke={m.col} strokeWidth="2" />
              <text x={X(m.d) + (m.d === 72 ? -8 : 8)} y={Y(v) + (m.d === 72 ? 18 : -10)} textAnchor={m.d === 72 ? "end" : "start"} fontSize="10" className="mono" fill={m.col}>
                {m.l}: h² = {v > 0 ? "+" : "−"}1/√5
              </text>
            </g>
          );
        })}

        {/* live cursor */}
        <motion.g animate={{ x: X(deg) - X(144) }} transition={{ type: "spring", stiffness: 260, damping: 26 }}>
          <line x1={X(144)} x2={X(144)} y1={mT} y2={Hh - mB} stroke="#e8b45c" strokeWidth="1.4" />
          <circle cx={X(144)} cy={Y(h2)} r="6" fill="#0b0b14" stroke="#e8b45c" strokeWidth="2" />
        </motion.g>
      </svg>

      <input
        type="range" min={2} max={178} step={0.5} value={deg}
        onChange={(e) => setDeg(parseFloat(e.target.value))}
        className="kcbs-range mt-1" aria-label="neighbour separation"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
        {[
          ["Δφ", `${deg.toFixed(1)}°`, "gold"],
          ["cos Δφ", fmt(c, 5), ok ? "cyan" : "rose"],
          ["required h²", fmt(h2, 5), ok ? "cyan" : "rose"],
          ["height h", h2 > 0 ? fmt(Math.sqrt(h2), 5) : "imaginary", ok ? "cyan" : "rose"],
        ].map(([l, v, t], i) => (
          <div key={i} className="rounded-xl border border-line bg-white/[0.02] px-3 py-2.5">
            <div className="mono text-[9px] tracking-[0.2em] text-faint mb-1">{l}</div>
            <div className={cn("mono text-[15px]", t === "cyan" && "text-quantum", t === "rose" && "text-rose", t === "gold" && "text-gold")}>{v}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {[72, 90, 120, 144, 150].map((d) => (
          <button
            key={d}
            onClick={() => setDeg(d)}
            className={cn("chip !py-1.5 cursor-pointer transition-all", Math.abs(deg - d) < 0.6 ? "!text-quantum !border-quantum/55 !bg-quantum/10" : "hover:!text-ink hover:!border-line-bright")}
          >
            {d}°
          </button>
        ))}
        <span className="mono text-[10px] text-faint self-center ml-1">
          {ok ? "obtuse — the horizontal overlap can cancel h²" : "acute — both terms positive, cancellation impossible"}
        </span>
      </div>
    </div>
  );
}

/* ================================================================== */
export function WindingView() {
  const { setView, N } = useCalc();
  const [prog, setProg] = useState(5);
  const [playing, setPlaying] = useState(false);

  const trace = () => {
    setPlaying(true);
    setProg(0);
    const c = animate(0, 5, {
      duration: 3.4,
      ease: "linear",
      onUpdate: (v) => setProg(v),
      onComplete: () => setPlaying(false),
    });
    return c;
  };

  useEffect(() => {
    const t = setTimeout(() => trace(), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="px-5 md:px-8 py-7 max-w-[1500px] space-y-6">
      <SectionHead
        index="▪"
        kicker="The winding question"
        accent="cyan"
        title={
          <>
            Why <span className="italic text-rose">4π</span> and never{" "}
            <span className="italic text-quantum">2π</span>?
          </>
        }
        lede={
          <>
            The five rays are placed at azimuths <TeX>{"\\phi_a = 2\\pi k a/N"}</TeX>. Choosing the
            winding number <TeX>{"k"}</TeX> is <em>not</em> cosmetic: it decides whether the whole
            construction exists at all. Here is the complete argument, computed live.
          </>
        }
      />

      {/* ---------- the chain of logic ---------- */}
      <Reveal className="card p-6">
        <div className="mono text-[10px] tracking-[0.25em] text-faint mb-4">WHY ORTHOGONALITY IS FORCED — AND WHY THAT FORCES A CONE</div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              n: "1",
              t: "Joint measurability",
              body: (
                <>
                  Neighbouring observables must be measurable together, and projective measurements
                  are jointly measurable exactly when they commute:
                  <TeX block className="!text-[0.86rem] mt-2">{"[\\hat S_i, \\hat S_{i+1}] = 0"}</TeX>
                </>
              ),
            },
            {
              n: "2",
              t: "Commutator ⇒ orthogonality",
              body: (
                <>
                  For reflections <TeX>{"\\hat S_i = 2|v_i\\rangle\\langle v_i| - \\mathbb{I}"}</TeX>:
                  <TeX block className="!text-[0.78rem] mt-2">{"[\\hat S_i,\\hat S_{i+1}] = 4\\big(|v_i\\rangle\\langle v_i|v_{i+1}\\rangle\\langle v_{i+1}| - \\text{h.c.}\\big)"}</TeX>
                  which vanishes iff <TeX>{"\\langle v_i|v_{i+1}\\rangle = 0"}</TeX>.
                </>
              ),
            },
            {
              n: "3",
              t: "Symmetry ⇒ a cone",
              body: (
                <>
                  ℝ³ holds at most 3 mutually orthogonal rays — but we only need{" "}
                  <em>adjacent</em> pairs orthogonal. Demanding identical statistics for all five
                  forces 5-fold symmetry about an axis: every tip sits on one circle at height{" "}
                  <TeX>{"h"}</TeX>, radius <TeX>{"r=\\sqrt{1-h^2}"}</TeX>. A cone.
                </>
              ),
            },
          ].map((s) => (
            <div key={s.n} className="relative pl-4 border-l border-line">
              <span className="absolute -left-[7px] top-1 w-3.5 h-3.5 rounded-full bg-void border border-quantum/60 mono text-[8px] flex items-center justify-center text-quantum">
                {s.n}
              </span>
              <div className="text-[13px] text-ink mb-1.5">{s.t}</div>
              <div className="text-[12.5px] text-muted leading-relaxed">{s.body}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-quantum/30 bg-quantum/[0.05] px-5 py-4">
          <div className="mono text-[10px] tracking-[0.2em] text-quantum mb-2">THE MASTER CONDITION</div>
          <TeX block>
            {"\\langle v_a|v_b\\rangle = r^2\\cos(\\Delta\\phi) + h^2 = 0 \\;\\Longleftrightarrow\\; \\cos(\\Delta\\phi) = -\\frac{h^2}{r^2} \\;\\le\\; 0"}
          </TeX>
          <p className="text-[13px] text-muted leading-relaxed mt-2">
            Since <TeX>{"h^2 \\ge 0"}</TeX> and <TeX>{"r^2 > 0"}</TeX>, the right-hand side can
            never be positive. <span className="text-ink">The angular step between wired
            neighbours must be obtuse.</span> Everything below is a consequence of this one
            inequality.
          </p>
        </div>
      </Reveal>

      {/* ---------- same points, two wirings ---------- */}
      <Reveal className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="mono text-[10px] tracking-[0.25em] text-faint">
            SAME FIVE RAYS — TWO DIFFERENT WIRINGS OF THE MEASUREMENT CYCLE
          </div>
          <button
            onClick={trace}
            disabled={playing}
            className={cn("chip !py-1.5 !px-3.5 transition-all", playing ? "!text-faint cursor-default" : "!text-ink hover:!text-quantum hover:!border-quantum/60 cursor-pointer")}
          >
            {playing ? <RotateCcw size={11} className="animate-spin" /> : <Play size={11} />}
            {playing ? "tracing…" : "trace the walk"}
          </button>
        </div>
        <p className="text-[13px] text-muted leading-relaxed mb-5 max-w-3xl">
          The gold dots never move. What changes is <em>which pairs the cycle calls
          neighbours</em> — and therefore which pairs are required to commute. Step by 1 and you
          wire the pentagon; step by 2 and you wire the pentagram{" "}
          <TeX>{"\\{5/2\\}"}</TeX>, visiting all five rays but looping the circle twice.
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          <WiringPanel N={5} k={1} progress={prog} title="k = 1 · PENTAGON · Δφ = 2π/5" />
          <WiringPanel N={5} k={2} progress={prog} title="k = 2 · PENTAGRAM {5/2} · Δφ = 4π/5" />
        </div>

        <div className="grid md:grid-cols-2 gap-5 mt-4">
          <div className="rounded-xl border border-rose/35 bg-rose/[0.05] px-5 py-4">
            <div className="mono text-[10px] tracking-[0.2em] text-rose mb-2 flex items-center gap-2">
              <Ban size={12} /> WHY 2π FAILS
            </div>
            <TeX block className="!text-[0.85rem]">
              {"\\cos\\tfrac{2\\pi}{5} = \\tfrac{\\sqrt5-1}{4} \\approx +0.309"}
            </TeX>
            <p className="text-[12.5px] text-muted leading-relaxed mt-2">
              Both terms in <TeX>{"r^2(+0.309) + h^2"}</TeX> are positive, so the overlap is
              strictly positive for <em>every</em> height. Formally solving anyway returns{" "}
              <span className="mono text-rose">h² = −1/√5</span> — exactly minus the pentagram's
              answer, i.e. an imaginary height <TeX>{"h = i\\,5^{-1/4}"}</TeX>. Two adjacent
              vertices of a regular pentagon on a cone are never orthogonal.
            </p>
          </div>
          <div className="rounded-xl border border-quantum/35 bg-quantum/[0.05] px-5 py-4">
            <div className="mono text-[10px] tracking-[0.2em] text-quantum mb-2 flex items-center gap-2">
              <Check size={12} /> WHY 4π WORKS
            </div>
            <TeX block className="!text-[0.85rem]">
              {"\\cos\\tfrac{4\\pi}{5} = -\\tfrac{1+\\sqrt5}{4} \\approx -0.809"}
            </TeX>
            <p className="text-[12.5px] text-muted leading-relaxed mt-2">
              Now the horizontal overlap is <em>negative</em> and can cancel the positive{" "}
              <TeX>{"h^2"}</TeX>. The balance point is{" "}
              <span className="mono text-quantum">h² = 1/√5</span>, i.e.{" "}
              <span className="mono text-quantum">h = 5⁻¹ᐟ⁴ ≈ {fmt(H, 5)}</span>. Winding twice
              around keeps the 5-fold symmetry while making neighbours obtuse.
            </p>
          </div>
        </div>
      </Reveal>

      {/* ---------- the impossibility plot ---------- */}
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <Reveal className="card p-6">
          <div className="mono text-[10px] tracking-[0.25em] text-faint mb-1">
            THE IMPOSSIBILITY, PLOTTED — f(h) = (1−h²)·cos Δφ + h²
          </div>
          <svg viewBox="0 0 560 300" className="w-full">
            <OverlapCurves N={5} ks={[1, 2]} x0={60} y0={40} w={470} hgt={200} />
          </svg>
          <p className="text-[12.5px] text-muted leading-relaxed mt-1">
            Sweep the height across its entire physical range. The{" "}
            <span className="text-quantum">144° curve</span> starts negative and crosses zero —
            that crossing <em>is</em> the KCBS cone. The <span className="text-rose">72° curve</span>{" "}
            starts at +0.309 and only climbs; it never touches the axis, so no pentagon cone
            exists at any height. This is a proof by exhaustion over all of ℝ³, drawn in one
            picture.
          </p>
        </Reveal>

        <Reveal delay={0.05} className="card p-6">
          <div className="mono text-[10px] tracking-[0.25em] text-faint mb-3 flex items-center gap-2">
            <Info size={12} className="text-gold" /> EXACT PENTAGON COSINES — CHECK YOUR SIGNS
          </div>
          <p className="text-[12.5px] text-muted leading-relaxed mb-4">
            These four values are easy to mix up, and one wrong sign silently destroys the
            derivation. Note that <span className="mono text-gold">−0.309</span> is cos 108°,{" "}
            <em>not</em> cos 144°.
          </p>
          <div className="space-y-2">
            {PENTAGON_COSINES.map((c) => {
              const isStar = c.deg === 144;
              const isPent = c.deg === 72;
              return (
                <div
                  key={c.deg}
                  className={cn(
                    "rounded-xl border px-4 py-2.5 flex items-center justify-between gap-3",
                    isStar ? "border-quantum/45 bg-quantum/[0.06]" : isPent ? "border-rose/45 bg-rose/[0.06]" : "border-line bg-white/[0.02]"
                  )}
                >
                  <TeX className="!text-[12px]">{c.tex}</TeX>
                  <div className="text-right shrink-0">
                    <div className={cn("mono text-[13px]", isStar ? "text-quantum" : isPent ? "text-rose" : "text-ink/80")}>
                      {fmt(c.value, 5)}
                    </div>
                    <div className="mono text-[9px] text-faint">{c.note}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>

      {/* ---------- sweep lab ---------- */}
      <Reveal><SweepLab /></Reveal>

      {/* ---------- every wiring of C5 ---------- */}
      <Reveal className="card p-6">
        <div className="mono text-[10px] tracking-[0.25em] text-faint mb-3">EVERY WIRING OF FIVE RAYS</div>
        <div className="overflow-x-auto">
          <table className="w-full mono text-[11.5px]">
            <thead>
              <tr className="text-faint text-[9px] tracking-[0.2em] border-b border-line">
                {["k", "Δφ = 2πk/5", "total swept", "cos Δφ", "required h²", "h", "verdict"].map((c) => (
                  <th key={c} className="text-left font-normal py-2.5 pr-4 whitespace-nowrap">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((k) => {
                const w = windingInfo(5, k);
                const dup = k > 2;
                return (
                  <tr key={k} className={cn("border-b border-line/50", w.obtuse ? "border-l-2 border-l-quantum/70" : "border-l-2 border-l-rose/50")}>
                    <td className="py-2.5 pr-4 text-lg text-ink/90">{k}</td>
                    <td className="py-2.5 pr-4 text-muted">{w.deltaDeg}°</td>
                    <td className="py-2.5 pr-4 text-gold/90">{w.totalDeg}° = {w.turns}×2π</td>
                    <td className={cn("py-2.5 pr-4", w.obtuse ? "text-quantum" : "text-rose")}>{fmt(w.cos, 5)}</td>
                    <td className={cn("py-2.5 pr-4", w.obtuse ? "text-quantum" : "text-rose")}>{fmt(w.h2, 5)}</td>
                    <td className={cn("py-2.5 pr-4", w.obtuse ? "text-quantum" : "text-rose")}>
                      {w.h != null ? fmt(w.h, 5) : "imaginary"}
                    </td>
                    <td className="py-2.5 text-[10px]">
                      {w.obtuse ? (
                        <span className="chip !py-1 !text-quantum !border-quantum/50">
                          valid{dup && " · mirror of k=" + (5 - k)}
                        </span>
                      ) : (
                        <span className="chip !py-1 !text-rose !border-rose/50">
                          acute{dup && " · mirror of k=" + (5 - k)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-5">
          <div className="rounded-xl border border-line bg-white/[0.02] px-5 py-4">
            <div className="mono text-[10px] tracking-[0.2em] text-faint mb-2">THE GENERAL RULE</div>
            <TeX block className="!text-[0.9rem]">
              {"\\cos\\tfrac{2\\pi k}{N} < 0 \\iff \\tfrac{N}{4} < k < \\tfrac{N}{2}"}
            </TeX>
            <p className="text-[12.5px] text-muted leading-relaxed mt-2">
              Together with <TeX>{"\\gcd(k,N)=1"}</TeX> (so the walk visits every ray before
              closing), this is the entire admissibility test. For{" "}
              <TeX>{"N=5"}</TeX> the window <TeX>{"1.25 < k < 2.5"}</TeX> admits exactly{" "}
              <span className="mono text-quantum">k = 2</span> — the pentagram is not a choice,
              it is the only option.
            </p>
          </div>
          <div className="rounded-xl border border-line bg-white/[0.02] px-5 py-4">
            <div className="mono text-[10px] tracking-[0.2em] text-faint mb-2">WHY k = (N−1)/2 IN THE LITERATURE</div>
            <p className="text-[12.5px] text-muted leading-relaxed">
              For odd <TeX>{"N"}</TeX> the largest admissible winding{" "}
              <TeX>{"k=(N-1)/2"}</TeX> pushes <TeX>{"\\Delta\\phi"}</TeX> closest to 180°, which
              maximises the violation — it is exactly the cone that attains the Lovász bound{" "}
              <TeX>{"\\vartheta(C_N)"}</TeX>. For <TeX>{"N=5"}</TeX> that gives{" "}
              <TeX>{"k=2,\\ \\Delta\\phi = 4\\pi/5"}</TeX>, and the star notation{" "}
              <TeX>{"\\{5/2\\}"}</TeX>.
            </p>
            <button
              onClick={() => setView("playground")}
              className="chip !py-1.5 !px-3.5 mt-3 cursor-pointer !text-quantum !border-quantum/40 hover:!bg-quantum/10 transition-colors"
            >
              test other N in the playground <ArrowRight size={11} />
            </button>
          </div>
        </div>
      </Reveal>

      {/* ---------- takeaway ---------- */}
      <Reveal className="card !border-gold/30 p-6">
        <div className="flex items-start gap-3">
          <TriangleAlert size={16} className="text-gold mt-0.5 shrink-0" />
          <div>
            <div className="mono text-[10px] tracking-[0.2em] text-gold mb-2">THE ONE-SENTENCE RESOLUTION</div>
            <p className="text-[13.5px] text-muted leading-relaxed max-w-4xl">
              <span className="text-ink">2π/5 describes how the five rays are spaced around the
              cone; 4π/5 describes how far apart two rays are that must commute.</span> The
              pentagram wiring walks the same five rays in the order 1→3→5→2→4→1, so it sweeps{" "}
              <span className="mono text-gold">5 × 144° = 720° = 4π</span> — twice around the
              circle — while keeping every wired neighbour at an obtuse{" "}
              <span className="mono text-quantum">144°</span>, the only way{" "}
              <TeX>{"r^2\\cos\\Delta\\phi + h^2"}</TeX> can ever vanish.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={() => setView("derivation")} className="chip !py-2 !px-4 cursor-pointer !text-ink hover:!text-quantum hover:!border-quantum/60 transition-colors">
                continue to the derivation <ArrowRight size={11} />
              </button>
              <span className="chip !py-2 !text-faint">current cone in memory: N = {N}</span>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
