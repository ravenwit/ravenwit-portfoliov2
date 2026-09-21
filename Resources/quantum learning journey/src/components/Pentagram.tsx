import { motion } from "framer-motion";
import { cn } from "../utils/cn";

/** star polygon {5/2}: vertex k sits at angle 4πk/5 − π/2 (k = 0 at top) */
export function pentPoints(R: number, cx = 200, cy = 200): [number, number][] {
  return Array.from({ length: 5 }, (_, k) => {
    const a = (4 * Math.PI * k) / 5 - Math.PI / 2;
    return [cx + R * Math.cos(a), cy + R * Math.sin(a)] as [number, number];
  });
}

export const SUB = ["₁", "₂", "₃", "₄", "₅"];

export function HeroPentagram({ className }: { className?: string }) {
  const pts = pentPoints(168);
  const path =
    pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ") + " Z";

  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden>
      <defs>
        <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8b45c" />
          <stop offset="55%" stopColor="#c89245" />
          <stop offset="100%" stopColor="#6fdcf7" />
        </linearGradient>
        <radialGradient id="nodeGrad" cx="50%" cy="35%" r="80%">
          <stop offset="0%" stopColor="#ffe9c2" />
          <stop offset="100%" stopColor="#b07417" />
        </radialGradient>
      </defs>

      {/* faint construction circle */}
      <motion.circle
        cx="200" cy="200" r="168" fill="none"
        stroke="rgba(236,231,219,0.10)" strokeWidth="1" strokeDasharray="2 7"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 1 }}
      />

      {/* the star — every edge is an orthogonal, jointly-measurable pair */}
      <motion.path
        d={path}
        fill="none"
        stroke="url(#edgeGrad)"
        strokeWidth="1.6"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2.4, ease: "easeInOut", delay: 0.5 }}
        style={{ filter: "drop-shadow(0 0 10px rgba(232,180,92,0.35))" }}
      />

      {pts.map(([x, y], k) => (
        <motion.g
          key={k}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55 + 0.42 * k, type: "spring", stiffness: 260, damping: 16 }}
        >
          <circle cx={x} cy={y} r="15" fill="#0b0b14" stroke="rgba(232,180,92,0.5)" strokeWidth="1" />
          <circle cx={x} cy={y} r="4.5" fill="url(#nodeGrad)" />
          <text
            x={x} y={y + (y < 200 ? -26 : 32)}
            textAnchor="middle"
            className="mono"
            fill="rgba(236,231,219,0.75)"
            fontSize="12"
          >
            v{SUB[k]}
          </text>
        </motion.g>
      ))}

      <motion.text
        x="200" y="206" textAnchor="middle" className="mono" fontSize="10"
        fill="rgba(111,220,247,0.75)" letterSpacing="3"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6 }}
      >
        C₅
      </motion.text>
    </svg>
  );
}

export function GamePentagram({
  values,
  onToggle,
  size = "w-full max-w-[340px]",
}: {
  values: number[];
  onToggle: (i: number) => void;
  size?: string;
}) {
  const R = 158;
  const pts = pentPoints(R);
  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 0],
  ];

  return (
    <svg viewBox="0 0 400 400" className={size}>
      {/* edges */}
      {edges.map(([a, b], e) => {
        const p = values[a] * values[b];
        const neg = p < 0;
        const [x1, y1] = pts[a];
        const [x2, y2] = pts[b];
        return (
          <g key={e} style={{ transition: "opacity .3s" }}>
            <line
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={neg ? "#fb5c7a" : "rgba(111,220,247,0.55)"}
              strokeWidth={neg ? 2.4 : 1.4}
              strokeLinecap="round"
              style={{
                transition: "stroke .35s, stroke-width .35s",
                filter: neg ? "drop-shadow(0 0 8px rgba(251,92,122,0.55))" : undefined,
              }}
            />
            <text
              x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 7}
              textAnchor="middle" fontSize="13" className="mono"
              fill={neg ? "#fb5c7a" : "rgba(111,220,247,0.8)"}
              style={{ transition: "fill .3s" }}
            >
              {neg ? "−1" : "+1"}
            </text>
          </g>
        );
      })}

      {/* nodes */}
      {pts.map(([x, y], k) => {
        const pos = values[k] > 0;
        return (
          <g
            key={k}
            onClick={() => onToggle(k)}
            style={{ cursor: "pointer" }}
            role="button"
            aria-label={`toggle v${k + 1}`}
          >
            <circle cx={x} cy={y} r="30" fill="transparent" />
            <circle
              cx={x} cy={y} r="21"
              fill={pos ? "rgba(232,180,92,0.12)" : "rgba(167,139,250,0.10)"}
              stroke={pos ? "#e8b45c" : "#a78bfa"}
              strokeWidth="1.6"
              style={{ transition: "all .3s" }}
            />
            <text
              x={x} y={y + 6.5} textAnchor="middle"
              fontSize="17" fontWeight={500}
              className="mono"
              fill={pos ? "#f0cd8a" : "#c4b5fd"}
              style={{ transition: "fill .3s" }}
            >
              {pos ? "+1" : "−1"}
            </text>
            <text
              x={x} y={y + (y < 200 ? -32 : 42)} textAnchor="middle"
              fontSize="12" className="mono" fill="rgba(143,141,156,0.9)"
            >
              s{SUB[k]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function MiniPentagram({ className, stroke = "#e8b45c" }: { className?: string; stroke?: string }) {
  const pts = pentPoints(46, 50, 50);
  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ") + " Z";
  return (
    <svg viewBox="0 0 100 100" className={cn("shrink-0", className)} aria-hidden>
      <path d={path} fill="none" stroke={stroke} strokeWidth="3.2" strokeLinejoin="round" />
    </svg>
  );
}
