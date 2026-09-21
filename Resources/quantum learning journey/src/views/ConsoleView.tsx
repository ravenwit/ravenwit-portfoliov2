import { motion } from "framer-motion";
import { ArrowRight, Crosshair, Sparkle, TriangleAlert, Zap } from "lucide-react";
import { useCalc } from "../state/store";
import { TeX } from "../components/TeX";
import { MiniPentagram } from "../components/Pentagram";
import {
  H, QUANTUM_SUM, CLASSICAL_SUM, fmt, sweepTable, corrClassicalBound,
} from "../lib/kcbs";
import { cn } from "../utils/cn";

function Metric({
  label, value, sub, tone = "plain", big,
}: {
  label: string; value: React.ReactNode; sub?: React.ReactNode;
  tone?: "plain" | "cyan" | "gold" | "rose"; big?: boolean;
}) {
  return (
    <div className="card px-5 py-4">
      <div className="mono text-[9.5px] tracking-[0.22em] text-faint mb-2">{label}</div>
      <div
        className={cn(
          "mono leading-none",
          big ? "text-3xl md:text-[34px]" : "text-xl",
          tone === "cyan" && "text-quantum num-glow-cyan",
          tone === "gold" && "text-gold num-glow-gold",
          tone === "rose" && "text-rose num-glow-rose"
        )}
      >
        {value}
      </div>
      {sub && <div className="mono text-[10px] text-faint mt-2">{sub}</div>}
    </div>
  );
}

export function ConsoleView() {
  const c = useCalc();
  const { spec, stats, alpha, lovasz, violating, N, p } = c;
  const sweep = sweepTable(3, 12);
  const perEdgeBound = corrClassicalBound(N) / N;

  const frac = N / 2;
  const pos = (v: number) => `${Math.min(100, (v / frac) * 100)}%`;

  return (
    <div className="px-5 md:px-8 py-7 space-y-6 max-w-[1500px]">
      {/* headline strip */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card relative overflow-hidden p-6 md:p-8"
      >
        <div
          className="absolute -top-24 -right-16 w-[420px] h-[320px] blur-3xl opacity-25 pointer-events-none"
          style={{ background: "radial-gradient(closest-side, rgba(232,180,92,0.4), transparent 70%)" }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="chip !text-gold !border-gold/30">KCBS · PRL 101, 020403</span>
              <span className="chip">qutrit ℂ³</span>
            </div>
            <h2 className="display text-3xl md:text-[42px] font-light leading-[1.05] tracking-tight max-w-2xl">
              Five rays, one cone,{" "}
              <span className="italic gold-grad">a contextual world.</span>
            </h2>
            <p className="text-muted text-[13.5px] leading-relaxed mt-4 max-w-xl font-light">
              This console drives every panel in the app. Configure a cone here or in the
              playground; the derivation, convexity map and witnesses all read the same live state.
            </p>
          </div>
          <MiniPentagram className="w-20 h-20 shrink-0 opacity-70 hidden md:block" />
        </div>

        <div className="relative mt-6 pt-5 border-t border-line">
          <div className="mono text-[9.5px] tracking-[0.25em] text-faint mb-3">SUGGESTED PATH</div>
          <div className="flex flex-wrap items-center gap-2">
            {([
              ["polytope", "Stage 1 · The tetrahedron", "assignments → hull → facets"],
              ["chsh", "Stage 2 · CHSH", "local 2 → quantum 2√2"],
              ["hierarchy", "Stage 3 · L ⊂ Q ⊂ NS", "square, disc, diamond"],
              ["winding", "KCBS · Why 4π, not 2π?", "the wiring that makes it possible"],
              ["derivation", "KCBS · Solve for h", "nine steps to 5 − 4√5"],
              ["playground", "KCBS · Generalize", "every N-cycle umbrella"],
              ["convexity", "KCBS · Convexity", "the contextual crescent"],
            ] as const).map(([id, label, hint]) => (
              <button
                key={id}
                onClick={() => c.setView(id)}
                title={hint}
                className="chip !py-2 !px-4 cursor-pointer hover:!text-quantum hover:!border-quantum/55 transition-colors"
              >
                {label} <ArrowRight size={11} />
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* primary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric
          label="CURRENT CONE {N/p}"
          value={<span className="text-quantum">{`{${N}/${p}}`}</span>}
          sub={`Δ = ${fmt(spec.deltaDeg, 2)}° · ${spec.feasible ? "valid umbrella" : "degenerate"}`}
          big
        />
        <Metric
          label="EXACT HEIGHT h"
          value={spec.feasible ? fmt(spec.h, 6) : "∄"}
          tone="cyan"
          sub={<>h² = <TeX className="!text-[11px]">{c.symbolic.tex}</TeX> = {fmt(spec.h2, 6)}</>}
          big
        />
        <Metric
          label="EVENT WITNESS Σpᵢ"
          value={fmt(stats.sumP, 5)}
          tone={violating ? "rose" : "plain"}
          sub={`α = ${fmt(alpha, 1).replace(".0", "")} · ϑ = ${fmt(lovasz, 5)}`}
          big
        />
        <Metric
          label="SPIN WITNESS Σ⟨ŜᵢŜᵢ₊₁⟩"
          value={fmt(stats.sumE, 5)}
          tone={stats.sumE < corrClassicalBound(N) - 1e-9 ? "rose" : "gold"}
          sub={`classical floor ${corrClassicalBound(N)} · per edge ${fmt(perEdgeBound, 3)}`}
          big
        />
      </div>

      <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-6">
        {/* verdict + scale */}
        <div className="card p-6">
          <div className="mono text-[10px] tracking-[0.25em] text-faint mb-5">
            WHERE YOUR STATE SITS — EXCLUSIVITY SCALE FOR C{`₍${N}₎`}
          </div>

          <div className="relative pt-8 pb-7">
            {[
              { v: alpha, c: "#e8b45c", l: `α = ${fmt(alpha, 1).replace(".0", "")}`, d: "classical" },
              { v: lovasz, c: "#6fdcf7", l: `ϑ = ${fmt(lovasz, 4)}`, d: "quantum" },
              { v: frac, c: "#a78bfa", l: `N/2 = ${fmt(frac, 1).replace(".0", "")}`, d: "no-signaling" },
            ].map((b, i) => (
              <div key={i} className="absolute top-0 bottom-0" style={{ left: pos(b.v) }}>
                <div className="h-[60px] border-l border-dashed" style={{ borderColor: b.c + "99" }} />
                <div className="absolute -top-1 -translate-x-1/2 whitespace-nowrap text-center">
                  <div className="mono text-[9.5px]" style={{ color: b.c }}>{b.l}</div>
                  <div className="mono text-[8px] text-faint">{b.d}</div>
                </div>
              </div>
            ))}
            <div className="h-3 rounded-full bg-white/[0.05] relative">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                animate={{ width: pos(Math.min(stats.sumP, frac)) }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                style={{
                  background: "linear-gradient(90deg, rgba(232,180,92,0.8), rgba(111,220,247,0.95))",
                  boxShadow: violating ? "0 0 20px rgba(251,92,122,0.5)" : undefined,
                }}
              />
            </div>
          </div>

          <div
            className={cn(
              "rounded-xl border px-5 py-4 flex items-start gap-3",
              violating ? "border-rose/45 bg-rose/[0.06]" : "border-line bg-white/[0.02]"
            )}
          >
            {violating ? <TriangleAlert size={16} className="text-rose mt-0.5 shrink-0" /> : <Zap size={16} className="text-quantum mt-0.5 shrink-0" />}
            <div>
              <div className={cn("mono text-[11px] tracking-[0.2em] mb-1.5", violating ? "text-rose" : "text-quantum")}>
                {!spec.feasible ? "NO VALID UMBRELLA" : violating ? "CONTEXTUALITY WITNESSED" : "WITHIN CLASSICAL HULL"}
              </div>
              <p className="text-[13px] text-muted leading-relaxed">
                {!spec.feasible ? (
                  <>This {`{${N}/${p}}`} configuration has no orthogonal realization in ℝ³. Pick another pitch in the playground.</>
                ) : violating ? (
                  <>Σpᵢ exceeds the non-contextual ceiling by <span className="mono text-rose">+{fmt(c.gap, 5)}</span>. No assignment of pre-existing values reproduces these statistics.</>
                ) : N % 2 === 0 ? (
                  <>Even cycle: α = ϑ = N/2, so no state on this umbrella can ever witness contextuality. Try an odd N.</>
                ) : (
                  <>Currently reproducible classically. Use <span className="text-ink">optimize</span> to drive the state to the Lovász optimum.</>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-5">
            <button onClick={c.optimizeP} className="chip !py-2 !px-4 cursor-pointer !text-ink hover:!text-gold hover:!border-gold/60 transition-colors">
              <Crosshair size={12} /> optimize {`{p*, ψ*}`}
            </button>
            <button onClick={() => c.loadCone(5, 2)} className="chip !py-2 !px-4 cursor-pointer !text-ink hover:!text-quantum hover:!border-quantum/60 transition-colors">
              <Sparkle size={12} /> load canonical KCBS {`{5/2}`}
            </button>
            <button onClick={() => c.setView("playground")} className="chip !py-2 !px-4 cursor-pointer !text-quantum !border-quantum/40 hover:!bg-quantum/10 transition-colors">
              open playground <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* derivation status */}
        <div className="flex flex-col gap-4">
          <div className="card p-6">
            <div className="mono text-[10px] tracking-[0.25em] text-faint mb-4">DERIVATION SOLVER — §{"N=5"} REFERENCE</div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-2.5 mono text-[11.5px]">
              {[
                ["h (live)", fmt(c.h, 6), c.snapped],
                ["⟨v₁|v₂⟩", fmt(c.residual, 6), Math.abs(c.residual) < 4e-3],
                ["⟨ŜᵢŜᵢ₊₁⟩", fmt(c.edgeExp, 6), c.snapped],
                ["Σ 5 edges", fmt(c.sum5, 6), c.snapped],
              ].map(([k, v, good], i) => (
                <div key={i} className="flex justify-between border-b border-line/50 pb-1.5">
                  <span className="text-faint">{k as string}</span>
                  <span className={good ? "text-quantum" : "text-ink/85"}>{v as string}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={c.solveH}
                disabled={c.snapped}
                className={cn(
                  "chip !py-2 !px-4 transition-all",
                  c.snapped ? "!text-quantum !border-quantum/50 !bg-quantum/10 cursor-default" : "!text-ink hover:!text-quantum hover:!border-quantum/60 cursor-pointer"
                )}
              >
                <Crosshair size={12} /> {c.snapped ? `locked h = 5⁻¹ᐟ⁴` : "solve for h"}
              </button>
              <button onClick={() => c.setView("derivation")} className="chip !py-2 !px-4 cursor-pointer hover:!text-quantum hover:!border-quantum/50 transition-colors">
                step through <ArrowRight size={12} />
              </button>
            </div>
            <p className="text-[12px] text-muted leading-relaxed mt-4">
              Target <span className="mono text-quantum">h = 5⁻¹ᐟ⁴ = {fmt(H, 6)}</span> gives the
              textbook value <span className="mono text-rose">{fmt(QUANTUM_SUM, 5)}</span> against
              the classical floor <span className="mono text-gold">{CLASSICAL_SUM}</span>.
            </p>
          </div>

          <div className="card p-6 flex-1">
            <div className="mono text-[10px] tracking-[0.25em] text-faint mb-3">QUICK CONE INDEX — CLICK TO LOAD</div>
            <div className="space-y-1">
              {sweep.filter((r) => r.bestP !== null).map((r) => {
                const active = r.N === N;
                const viol = (r.gap ?? 0) > 1e-9;
                return (
                  <button
                    key={r.N}
                    onClick={() => c.loadCone(r.N, r.bestP!)}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 rounded-lg px-3 py-1.5 mono text-[11px] transition-colors cursor-pointer",
                      active ? "bg-quantum/[0.10] text-quantum" : "text-muted hover:bg-white/[0.04] hover:text-ink"
                    )}
                  >
                    <span className="w-16 text-left">{`{${r.N}/${r.bestP}}`}</span>
                    <span className="flex-1 text-left text-[10px] opacity-80">h = {fmt(r.best!.h, 4)}</span>
                    <span className={cn("text-[10px]", viol ? "text-rose" : "text-faint")}>
                      {viol ? `+${fmt(r.gap!, 3)}` : "no gap"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
