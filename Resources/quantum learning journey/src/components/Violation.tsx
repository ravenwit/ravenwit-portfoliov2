import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { FlaskConical, Gem, Infinity as InfinityIcon } from "lucide-react";
import { SectionHead, Reveal } from "./Section";
import { TeX } from "./TeX";
import { fmt, QUANTUM_SUM, QUANTUM_AVG, CLASSICAL_SUM, SQRT5 } from "../lib/kcbs";

function CountUp({ to, digits = 5, className }: { to: number; digits?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => fmt(v, digits));

  useEffect(() => {
    if (inView) {
      const c = animate(mv, to, { duration: 2.2, ease: [0.16, 1, 0.3, 1] });
      return c.stop;
    }
  }, [inView, mv, to]);

  return <motion.span ref={ref} className={className}>{text}</motion.span>;
}

function Gauge() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  const W = 1040, Hh = 230;
  const mL = 40, mR = 40;
  const xMin = -5.5, xMax = 5.5;
  const X = (x: number) => mL + ((x - xMin) / (xMax - xMin)) * (W - mL - mR);
  const axisY = 132;

  const ticks = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];

  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${W} ${Hh}`} className="w-full">
        {/* forbidden region */}
        <rect x={X(xMin)} y={34} width={X(CLASSICAL_SUM) - X(xMin)} height={axisY + 44 - 34} fill="rgba(251,92,122,0.06)" />
        <line x1={X(CLASSICAL_SUM)} x2={X(CLASSICAL_SUM)} y1={30} y2={axisY + 46} stroke="#fb5c7a" strokeWidth="1.4" strokeDasharray="5 4" />
        <text x={X(CLASSICAL_SUM) - 10} y={50} textAnchor="end" fontSize="10.5" className="mono" fill="rgba(251,92,122,0.9)" letterSpacing="2.5">
          CLASSICALLY FORBIDDEN
        </text>

        {/* axis + ticks */}
        <line x1={X(xMin)} x2={X(xMax)} y1={axisY} y2={axisY} stroke="rgba(236,231,219,0.2)" />
        {ticks.map((t) => (
          <g key={t}>
            <line x1={X(t)} x2={X(t)} y1={axisY - 5} y2={axisY + 5} stroke="rgba(236,231,219,0.25)" />
            <text x={X(t)} y={axisY + 24} textAnchor="middle" fontSize="11" className="mono" fill="rgba(143,141,156,0.95)">
              {t === 0 ? "0" : t > 0 ? `+${t}` : `−${Math.abs(t)}`}
            </text>
          </g>
        ))}

        {/* algebraic floor */}
        <line x1={X(-5)} x2={X(-5)} y1={axisY - 26} y2={axisY - 6} stroke="rgba(167,139,250,0.8)" strokeWidth="2" />
        <text x={X(-5) + 6} y={axisY - 30} fontSize="10" className="mono" fill="rgba(167,139,250,0.9)">
          −5 · algebraic floor (all edges −1 — no theory reaches it)
        </text>

        {/* classical bound marker */}
        <g>
          <path d={`M ${X(CLASSICAL_SUM)} ${axisY - 14} l 9 10 h -18 z`} fill="#e8b45c" />
          <text x={X(CLASSICAL_SUM) + 14} y={axisY - 12} fontSize="11.5" className="mono" fill="#f0cd8a">
            −3 · non-contextual bound
          </text>
        </g>

        {/* quantum marker — animates in from the classical side */}
        <motion.g
          initial={{ x: X(CLASSICAL_SUM) - X(QUANTUM_SUM) - 200, opacity: 0 }}
          animate={inView ? { x: 0, opacity: 1 } : {}}
          transition={{ type: "spring", stiffness: 42, damping: 13, delay: 0.5 }}
        >
          <circle cx={X(QUANTUM_SUM)} cy={axisY} r="30" fill="none" stroke="rgba(111,220,247,0.25)" strokeWidth="1.4" />
          <circle cx={X(QUANTUM_SUM)} cy={axisY} r="13" fill="none" stroke="rgba(111,220,247,0.5)" strokeWidth="1.4" />
          <circle cx={X(QUANTUM_SUM)} cy={axisY} r="5.5" fill="#6fdcf7" />
          <text x={X(QUANTUM_SUM)} y={axisY + 58} textAnchor="middle" fontSize="13" className="mono" fill="#9be9fb" fontWeight="600">
            5 − 4√5 ≈ −3.94427
          </text>
          <text x={X(QUANTUM_SUM)} y={axisY + 76} textAnchor="middle" fontSize="9.5" className="mono" fill="rgba(111,220,247,0.75)" letterSpacing="2">
            THE QUTRIT LANDS HERE
          </text>
        </motion.g>

        {/* violation depth bracket */}
        <motion.g initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 1.6, duration: 0.8 }}>
          <line x1={X(QUANTUM_SUM)} x2={X(CLASSICAL_SUM)} y1={axisY - 44} y2={axisY - 44} stroke="#fb5c7a" strokeWidth="1.3" />
          <line x1={X(QUANTUM_SUM)} x2={X(QUANTUM_SUM)} y1={axisY - 49} y2={axisY - 39} stroke="#fb5c7a" strokeWidth="1.3" />
          <line x1={X(CLASSICAL_SUM)} x2={X(CLASSICAL_SUM)} y1={axisY - 49} y2={axisY - 39} stroke="#fb5c7a" strokeWidth="1.3" />
          <text x={(X(QUANTUM_SUM) + X(CLASSICAL_SUM)) / 2} y={axisY - 52} textAnchor="middle" fontSize="11" className="mono" fill="#fb5c7a">
            violation ≈ 0.9443 below the floor
          </text>
        </motion.g>
      </svg>
    </div>
  );
}

function WhyCard({
  icon,
  n,
  title,
  children,
}: {
  icon: React.ReactNode;
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-6 md:p-7 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-quantum">{icon}</span>
        <span className="mono text-[10px] tracking-[0.3em] text-faint">{n}</span>
      </div>
      <h3 className="display text-xl md:text-[22px] font-light leading-snug">{title}</h3>
      <div className="text-[13.5px] text-muted leading-relaxed">{children}</div>
    </div>
  );
}

export function Violation() {
  const pBars = [
    { label: "classical  α(C₅)", v: 2, exact: "2", tone: "#e8b45c" },
    { label: "quantum  ϑ(C₅)", v: SQRT5, exact: "√5 ≈ 2.23607", tone: "#6fdcf7" },
    { label: "fractional  α*(C₅)", v: 2.5, exact: "5/2", tone: "#a78bfa" },
  ];
  const max = 2.5;

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute left-1/2 -translate-x-1/2 top-0 w-[900px] h-[420px] opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(closest-side, rgba(251,92,122,0.28), transparent 70%)" }}
      />
      <div className="px-5 md:px-8 py-7 max-w-[1500px]">
        <SectionHead
          index="▪"
          kicker="The verdict"
          accent="rose"
          title={
            <>
              Quantum theory parks{" "}
              <span className="italic text-rose">0.9443 inside forbidden territory.</span>
            </>
          }
          lede={
            <>
              No signalling assumptions, no spatial separation, no hidden-variable fine print — a
              single three-level system, five commuting pairs, and a geometry no assignment of
              pre-existing values can imitate.
            </>
          }
        />

        {/* number plates */}
        <Reveal className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="card p-7 md:p-9 relative overflow-hidden">
            <div className="mono text-[10px] tracking-[0.25em] text-gold mb-4">NON-CONTEXTUAL MODELS</div>
            <div className="display font-light text-6xl md:text-7xl text-gold num-glow-gold">
              <CountUp to={-3} digits={1} />
            </div>
            <div className="mono text-[12px] text-faint mt-3">Σ sᵢsᵢ₊₁ ≥ −3 · per-edge ≥ −0.6 · a floor, forever</div>
          </div>
          <div className="card p-7 md:p-9 relative overflow-hidden !border-quantum/30">
            <div className="mono text-[10px] tracking-[0.25em] text-quantum mb-4">ONE QUTRIT, FIVE CONTEXTS</div>
            <div className="display font-light text-6xl md:text-7xl text-quantum num-glow-cyan">
              <CountUp to={QUANTUM_SUM} digits={4} />
            </div>
            <div className="mono text-[12px] text-faint mt-3">
              = 5 − 4√5 · per-edge <CountUp to={QUANTUM_AVG} digits={5} className="text-quantum" /> — and it is the optimum
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.05} className="card p-4 md:p-8 mb-14">
          <div className="mono text-[10px] tracking-[0.25em] text-faint px-2 md:px-4 pt-2">THE SUM Σ⟨SᵢSᵢ₊₁⟩ — WHERE THEORIES LIVE</div>
          <Gauge />
        </Reveal>

        {/* why it matters */}
        <div className="grid md:grid-cols-3 gap-5">
          <Reveal>
            <WhyCard icon={<Gem size={16} />} n="W·01" title="Kochen–Specker, pocket-sized">
              Bell inequalities need entanglement and space-like separation to corner classical
              models. KCBS needs none: <em>non-contextuality</em> alone — the idea that a
              measurement outcome exists independent of which compatible questions accompany it —
              is falsified by one qutrit and five vectors. It is the state-dependent shadow of the
              Kochen–Specker theorem, in the smallest dimension where it can live.
            </WhyCard>
          </Reveal>
          <Reveal delay={0.08}>
            <WhyCard icon={<InfinityIcon size={16} />} n="W·02" title="The exclusivity graph says √5">
              Each “<TeX>{"S_i = +1"}</TeX>” event has probability{" "}
              <TeX>{"|\\langle\\psi|v_i\\rangle|^2 = 1/\\sqrt5"}</TeX>, and adjacent events are
              exclusive — <TeX>{"p(+,+)=0"}</TeX>. Packing such events on the C₅ graph is
              bounded by its graph invariants:
              <div className="mt-4 space-y-2.5">
                {pBars.map((b) => (
                  <div key={b.label}>
                    <div className="flex justify-between mono text-[10px] text-faint mb-1">
                      <span>{b.label}</span>
                      <span style={{ color: b.tone }}>{b.exact}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: b.tone }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(b.v / max) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-[12px] text-faint">
                2 &lt; √5 &lt; 5/2 — C₅ was Lovász's own example: the quantum world fits
                <em> between</em> the classical and fractional packings.
              </div>
            </WhyCard>
          </Reveal>
          <Reveal delay={0.16}>
            <WhyCard icon={<FlaskConical size={16} />} n="W·03" title="Measured, and put to work">
              The KCBS value has been observed in photonic qutrits, trapped ions, and NMR
              registers, with loophole analyses paralleling Bell tests. Beyond metaphysics,
              contextuality is now understood as a <em>resource</em>: state-independent
              contextuality underlies magic-state quantum computation, and KCBS-type witnesses
              certify quantumness of devices that are far too small to entangle anything.
            </WhyCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
