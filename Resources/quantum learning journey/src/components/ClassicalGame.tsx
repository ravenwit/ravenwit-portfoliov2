import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dices, RotateCcw, Swords, Target } from "lucide-react";
import { GamePentagram } from "./Pentagram";
import { SectionHead, Reveal } from "./Section";
import { TeX } from "./TeX";
import {
  CLASSICAL_SUM, QUANTUM_SUM, OPTIMAL_ASSIGNMENT,
  assignmentSum, classicalHistogram, fmt,
} from "../lib/kcbs";
import { cn } from "../utils/cn";

function Histogram({ current }: { current: number }) {
  const W = 640, Hh = 210;
  const mL = 14, mR = 14, mT = 30, mB = 34;
  const xMin = -4.8, xMax = 6;
  const X = (x: number) => mL + ((x - xMin) / (xMax - xMin)) * (W - mL - mR);
  const yMax = 22;
  const Y = (c: number) => mT + (1 - c / yMax) * (Hh - mT - mB);
  const data = classicalHistogram();
  const barW = (X(1) - X(0)) * 0.5;

  return (
    <svg viewBox={`0 0 ${W} ${Hh}`} className="w-full">
      <line x1={mL} x2={W - mR} y1={Y(0)} y2={Y(0)} stroke="rgba(236,231,219,0.14)" />

      {data.map(({ sum, count }) => {
        const isCur = current === sum;
        return (
          <g key={sum}>
            <rect
              x={X(sum) - barW / 2}
              y={Y(count)}
              width={barW}
              height={Y(0) - Y(count)}
              rx="4"
              fill={sum === CLASSICAL_SUM ? "rgba(232,180,92,0.85)" : "rgba(111,220,247,0.35)"}
              stroke={isCur ? "#fff" : "transparent"}
              strokeWidth={isCur ? 1.5 : 0}
              style={{ transition: "all .4s" }}
            />
            <text x={X(sum)} y={Y(count) - 7} textAnchor="middle" fontSize="10.5" className="mono" fill={sum === CLASSICAL_SUM ? "#f0cd8a" : "rgba(143,141,156,1)"}>
              {count}×
            </text>
            <text x={X(sum)} y={Y(0) + 17} textAnchor="middle" fontSize="11" className="mono" fill="rgba(236,231,219,0.85)">
              {sum === -3 ? "−3" : sum === -1 ? "−1" : sum > 0 ? `+${sum}` : sum}
            </text>
          </g>
        );
      })}

      {/* classical floor marker */}
      <line x1={X(CLASSICAL_SUM)} x2={X(CLASSICAL_SUM)} y1={mT - 12} y2={Y(0)} stroke="#e8b45c" strokeWidth="1" strokeDasharray="3 4" opacity={0.7} />
      <text x={X(CLASSICAL_SUM) + (X(1) - X(0)) * 0.42} y={mT - 4} textAnchor="middle" fontSize="9.5" className="mono" fill="#e8b45c" letterSpacing="1.5">
        CLASSICAL FLOOR
      </text>

      {/* quantum marker — no bar lives here */}
      <line x1={X(QUANTUM_SUM)} x2={X(QUANTUM_SUM)} y1={mT - 12} y2={Y(0)} stroke="#6fdcf7" strokeWidth="1.6" strokeDasharray="5 3" />
      <text x={X(QUANTUM_SUM)} y={Y(0) + 17} textAnchor="middle" fontSize="11" className="mono" fill="#6fdcf7">
        −3.944
      </text>
      <text x={X(QUANTUM_SUM)} y={mT - 4} textAnchor="middle" fontSize="9.5" className="mono" fill="#6fdcf7" letterSpacing="1.5">
        QUTRIT ✕ NO ASSIGNMENT
      </text>

      <text x={mL + 4} y={Y(0) + 17} fontSize="9" className="mono" fill="rgba(143,141,156,0.8)">Σ =</text>
    </svg>
  );
}

export function ClassicalGame() {
  const [values, setValues] = useState<number[]>([1, 1, 1, 1, 1]);
  const [moves, setMoves] = useState(0);
  const sum = useMemo(() => assignmentSum(values), [values]);
  const optimal = sum === CLASSICAL_SUM;

  const toggle = (i: number) => {
    setValues((v) => v.map((x, k) => (k === i ? -x : x)));
    setMoves((m) => m + 1);
  };
  const randomize = () => {
    setValues(Array.from({ length: 5 }, () => (Math.random() < 0.5 ? 1 : -1)));
    setMoves((m) => m + 1);
  };

  return (
    <section className="relative">
      <div className="px-5 md:px-8 py-7 max-w-[1500px]">
        <SectionHead
          index="▪"
          kicker="The classical ceiling"
          title={
            <>
              Try to cheat the pentagram.{" "}
              <span className="italic gold-grad">You will bottom out at −3.</span>
            </>
          }
          lede={
            <>
              A non-contextual model must pre-commit each observable to a definite value{" "}
              <TeX>{"s_i \\in \\{+1,-1\\}"}</TeX>, shared by both contexts that contain it. Click
              the vertices to assign values; each star edge scores{" "}
              <TeX>{"s_i s_{i+1}"}</TeX>. Your goal — beat the qutrit at −3.944.
            </>
          }
        />

        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-6">
          {/* game card */}
          <Reveal className="card p-6 md:p-8 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="mono text-[10px] tracking-[0.25em] text-faint flex items-center gap-2">
                <Swords size={12} className="text-gold" /> THE ASSIGNMENT GAME
              </span>
              <span className="mono text-[10px] text-faint">{moves} moves · 32 possible worlds</span>
            </div>

            <div className="flex-1 flex items-center justify-center py-2">
              <GamePentagram values={values} onToggle={toggle} size="w-full max-w-[330px]" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2">
              <button onClick={randomize} className="chip !py-2 !px-4 !text-ink hover:!border-quantum/60 hover:!text-quantum transition-colors cursor-pointer">
                <Dices size={12} /> randomize
              </button>
              <button
                onClick={() => { setValues([...OPTIMAL_ASSIGNMENT]); setMoves((m) => m + 1); }}
                className="chip !py-2 !px-4 !text-ink hover:!border-gold/60 hover:!text-gold transition-colors cursor-pointer"
              >
                <Target size={12} /> best classical shot
              </button>
              <button
                onClick={() => setValues([1, 1, 1, 1, 1])}
                className="chip !py-2 !px-4 !text-ink hover:!border-line-bright transition-colors cursor-pointer"
              >
                <RotateCcw size={12} /> reset
              </button>
            </div>

            <div className="mt-6 pt-5 border-t border-line flex items-end justify-between gap-4">
              <div>
                <div className="mono text-[10px] tracking-[0.22em] text-faint mb-1">YOUR TOTAL Σ sᵢsᵢ₊₁</div>
                <div className={cn("mono text-4xl md:text-5xl", optimal ? "text-gold num-glow-gold" : "text-ink")}>
                  {sum > 0 ? `+${sum}` : sum === -3 ? "−3" : sum === -1 ? "−1" : sum}
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={optimal ? "opt" : sum}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-right"
                >
                  {optimal ? (
                    <>
                      <div className="mono text-[11px] text-gold tracking-wider">CLASSICAL OPTIMUM REACHED</div>
                      <div className="text-[12px] text-muted mt-1 max-w-[220px]">
                        …and a qutrit still scores{" "}
                        <span className="mono text-quantum">{fmt(QUANTUM_SUM, 4)}</span>. That is
                        the whole theorem.
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mono text-[11px] text-faint tracking-wider">
                        GAP TO FLOOR: {fmt(CLASSICAL_SUM - sum, 0).replace("−", "+")}
                      </div>
                      <div className="text-[12px] text-muted mt-1">below −3 is classically impossible</div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>

          {/* proof + census */}
          <div className="flex flex-col gap-5">
            <Reveal delay={0.05} className="card p-6 md:p-7">
              <div className="mono text-[10px] tracking-[0.25em] text-faint mb-4">WHY −3 IS A WALL — THE PARITY LEMMA</div>
              <ol className="space-y-3.5 text-[14px] text-muted leading-relaxed">
                <li className="flex gap-3">
                  <span className="mono text-gold text-[12px] mt-0.5 shrink-0">1.</span>
                  <span>
                    Multiplying the five edge products uses every variable <em>twice</em>, so it is
                    a perfect square:
                  </span>
                </li>
              </ol>
              <TeX block className="!text-base text-ink/90 my-1">
                {"\\prod_{i=1}^{5}\\big(s_i s_{i+1}\\big) = \\big(s_1 s_2 s_3 s_4 s_5\\big)^2 = +1"}
              </TeX>
              <ol start={2} className="space-y-3.5 text-[14px] text-muted leading-relaxed mt-2">
                <li className="flex gap-3">
                  <span className="mono text-gold text-[12px] mt-0.5 shrink-0">2.</span>
                  <span>
                    An <em>even</em> number of edges must therefore be −1. Flipping all −1 edges
                    costs 2 each, so the reachable sums are exactly{" "}
                    <span className="mono text-ink">5 − 2·{`{0,2,4}`} = {`{5, 1, −3}`}</span>.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mono text-gold text-[12px] mt-0.5 shrink-0">3.</span>
                  <span>
                    Hence <TeX>{"\\sum s_i s_{i+1} \\ge -3"}</TeX> for <em>every</em>{" "}
                    non-contextual model — determinism and locality never entered the argument.
                    Only the assumption that a value is <em>context-free</em> did.
                  </span>
                </li>
              </ol>
            </Reveal>

            <Reveal delay={0.1} className="card p-6 md:p-7">
              <div className="flex items-baseline justify-between mb-3">
                <div className="mono text-[10px] tracking-[0.25em] text-faint">CENSUS OF ALL 32 CLASSICAL WORLDS</div>
                <div className="mono text-[10px] text-faint">bars: #assignments</div>
              </div>
              <Histogram current={sum} />
              <p className="text-[12.5px] text-muted leading-relaxed mt-3">
                Every possible pre-committed world lands on a bar — none can sit at the dashed
                cyan line. Yet the qutrit, measured in the five commuting contexts, averages
                exactly there. The pentagon's odd cycle (<TeX>{"C_5"}</TeX>) is what makes −1-edge
                configurations uncloseable around the ring: frustration, weaponized.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
