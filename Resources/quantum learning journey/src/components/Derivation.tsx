import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Crosshair, Pause, Play, Target } from "lucide-react";
import { Reveal } from "./Section";
import { useCalc } from "../state/store";
import { TeX } from "./TeX";
import {
  H, COS_STAR, PHI, SQRT5, CLASSICAL_SUM,
  ray5, orthResidual, edgeExpect5, reflection, projector, matMul, matScale, matSub, maxAbs, expectation,
  windingInfo, clamp, fmt, type Vec3,
} from "../lib/kcbs";
import { WiringCircle } from "./WindingFigures";
import { cn } from "../utils/cn";

/* ================================================================== */
const STEPS = [
  {
    id: "d·01",
    title: "Put five rays on a cone",
    tex: "|v_i\\rangle = \\begin{pmatrix} r\\cos\\frac{4\\pi i}{5} \\\\[2pt] r\\sin\\frac{4\\pi i}{5} \\\\[2pt] h \\end{pmatrix},\\qquad i = 1,\\dots,5",
    note: "One free parameter only: the height h. Every ray shares it, so all five sit on a single cone around ẑ. The azimuth advances by 4π/5 each step — a pentagram, not a pentagon.",
  },
  {
    id: "d·02",
    title: "Unit length fixes the radius",
    tex: "r^2 + h^2 = 1 \\quad\\Longrightarrow\\quad r = \\sqrt{1-h^2}",
    note: "The rays are quantum states, so they must be normalized. Raise the cone and it narrows; the radius is not independent.",
  },
  {
    id: "d·03",
    title: "Split the inner product",
    tex: "\\langle v_a|v_b\\rangle = r^2\\cos(\\Delta\\phi) + h^2 \\;\\Longrightarrow\\; \\cos(\\Delta\\phi) = -\\frac{h^2}{r^2} \\le 0",
    note: "Two tips separated in azimuth by Δφ overlap by a horizontal part r²cosΔφ plus a vertical part h². Since h² ≥ 0 and r² > 0, orthogonality demands a NEGATIVE cosine — the wired neighbours must sit more than 90° apart.",
  },
  {
    id: "d·04",
    title: "So the step must be 4π/5, not 2π/5",
    tex: "\\underbrace{\\cos\\tfrac{2\\pi}{5} = +0.309}_{\\text{pentagon: impossible}} \\qquad \\underbrace{\\cos\\tfrac{4\\pi}{5} = -0.809}_{\\text{pentagram }\\{5/2\\}\\text{: works}}",
    note: "Spacing the rays 72° apart makes both terms positive — no height can cancel them (the algebra returns h² = −1/√5, an imaginary height). Stepping by 144° instead visits the same five rays in the order 1→3→5→2→4, winding twice around (5 × 144° = 720° = 4π) while keeping every wired pair obtuse.",
  },
  {
    id: "d·05",
    title: "The pentagon hands over φ",
    tex: "\\cos\\tfrac{4\\pi}{5} = -\\cos\\tfrac{\\pi}{5} = -\\frac{\\sqrt5+1}{4} = -\\frac{\\varphi}{2} \\approx -0.80902",
    note: "The star pitch angle is the pentagon's own geometry: the diagonal-to-side ratio is the golden ratio φ, and cos36° = φ/2 exactly. This single irrational number is what makes h irrational.",
  },
  {
    id: "d·06",
    title: "Solve for the height",
    tex: "(1-h^2)\\big(\\!-\\tfrac{\\varphi}{2}\\big) + h^2 = 0 \\;\\Longrightarrow\\; h^2 = \\frac{\\varphi}{2+\\varphi} = \\frac{1}{\\sqrt5} \\;\\Longrightarrow\\; h = 5^{-1/4}",
    note: "A single root. Below it the rays lean apart (obtuse); above it they close in (acute). Exactly at h = 5^−¹ᐟ⁴ ≈ 0.66874 all five neighbouring pairs become perpendicular at once.",
  },
  {
    id: "d·07",
    title: "Aim the probe down the axis",
    tex: "|\\psi\\rangle = |2\\rangle = (0,0,1)^{\\mathsf T} \\;\\Longrightarrow\\; \\langle\\psi|v_i\\rangle = h,\\quad p_i = h^2 = \\tfrac{1}{\\sqrt5}",
    note: "The cone's axis is democratic: every ray has the same overlap with it. So all five events carry identical probability 1/√5 ≈ 0.4472 — the state cannot favour any context.",
  },
  {
    id: "d·08",
    title: "Multiply the operators",
    tex: "\\hat S_i \\hat S_{i+1} = \\mathbb{I} - 2P_i - 2P_{i+1} + \\underbrace{4P_iP_{i+1}}_{=\\,0\\ \\text{when}\\ v_i \\perp v_{i+1}}",
    note: "Orthogonality kills the cross-term — that is the whole reason the height mattered. Since ψ = e₃, the expectation value is literally the bottom-right entry of the product matrix.",
  },
  {
    id: "d·09",
    title: "Add up the pentagram",
    tex: "\\sum_{i=1}^{5}\\langle \\hat S_i\\hat S_{i+1}\\rangle = 5\\big(1 - 4h^2\\big) = 5 - \\tfrac{20}{\\sqrt5} = 5 - 4\\sqrt5 \\approx -3.94427",
    note: "Five identical edges, each worth 1 − 4/√5 ≈ −0.78885. The running total crosses the classical floor of −3 on the fourth edge and keeps going.",
  },
];

/* ================================================================== */
/*  Stage scenes — every figure is driven by the live h                */
/* ================================================================== */

const GOLD = "#e8b45c";
const CYAN = "#6fdcf7";
const ROSE = "#fb5c7a";
const VIOLET = "#a78bfa";
const DIM = "rgba(143,141,156,0.9)";

function ConeViews({ h }: { h: number }) {
  const r = Math.sqrt(Math.max(0, 1 - h * h));
  // top view
  const cx = 168, cy = 190, RP = 118 * r;
  const pts = Array.from({ length: 5 }, (_, k) => {
    const a = (4 * Math.PI * k) / 5 - Math.PI / 2;
    return [cx + RP * Math.cos(a), cy + RP * Math.sin(a)] as [number, number];
  });
  const star = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ") + " Z";
  // side view
  const ox = 470, oy = 300, S = 175;
  const tipX = ox + r * S, tipY = oy - h * S;

  return (
    <g>
      {/* ---- top view ---- */}
      <text x={cx} y={48} textAnchor="middle" fontSize="9.5" className="mono" fill={DIM} letterSpacing="2.5">TOP VIEW ↓ ẑ</text>
      <circle cx={cx} cy={cy} r={118} fill="none" stroke="rgba(236,231,219,0.08)" strokeDasharray="2 6" />
      <motion.circle cx={cx} cy={cy} r={RP} fill="none" stroke={GOLD} strokeOpacity={0.35} strokeWidth="1" animate={{ r: RP }} transition={{ duration: 0.25 }} />
      <path d={star} fill="rgba(111,220,247,0.05)" stroke={CYAN} strokeWidth="1.3" strokeOpacity={0.75} strokeLinejoin="round" />
      {/* 144° arc between v1 and v2 */}
      <path
        d={`M ${cx + 40 * Math.cos(-Math.PI / 2)},${cy + 40 * Math.sin(-Math.PI / 2)} A 40 40 0 1 1 ${cx + 40 * Math.cos(4 * Math.PI / 5 - Math.PI / 2)},${cy + 40 * Math.sin(4 * Math.PI / 5 - Math.PI / 2)}`}
        fill="none" stroke={ROSE} strokeWidth="1.2" strokeDasharray="3 3"
      />
      <text x={cx + 6} y={cy + 62} fontSize="10" className="mono" fill={ROSE}>Δ = 144°</text>
      {pts.map(([x, y], k) => (
        <g key={k}>
          <line x1={cx} y1={cy} x2={x} y2={y} stroke={GOLD} strokeWidth="1" strokeOpacity={0.5} />
          <circle cx={x} cy={y} r="4" fill={GOLD} />
          <text x={cx + (x - cx) * 1.17} y={cy + (y - cy) * 1.17 + 4} textAnchor="middle" fontSize="10" className="mono" fill="rgba(236,231,219,0.7)">
            {k + 1}
          </text>
        </g>
      ))}
      <text x={cx} y={cy + 148} textAnchor="middle" fontSize="10" className="mono" fill={GOLD}>radius r = {fmt(r, 4)}</text>

      {/* ---- side view ---- */}
      <text x={ox} y={48} textAnchor="middle" fontSize="9.5" className="mono" fill={DIM} letterSpacing="2.5">SIDE ELEVATION</text>
      {/* cone body */}
      <path d={`M ${ox},${oy} L ${ox + r * S},${oy - h * S} L ${ox - r * S},${oy - h * S} Z`} fill="rgba(111,220,247,0.07)" stroke="rgba(111,220,247,0.35)" strokeWidth="1" />
      <ellipse cx={ox} cy={oy - h * S} rx={r * S} ry={r * S * 0.26} fill="none" stroke={GOLD} strokeWidth="1" strokeOpacity={0.55} />
      {/* axis */}
      <line x1={ox} y1={oy} x2={ox} y2={oy - S - 18} stroke={DIM} strokeWidth="1" strokeDasharray="3 4" />
      <text x={ox - 8} y={oy - S - 24} textAnchor="middle" fontSize="10" className="mono" fill={DIM}>ẑ</text>
      {/* the unit ray + its h / r legs */}
      <line x1={ox} y1={oy} x2={tipX} y2={tipY} stroke={GOLD} strokeWidth="2.4" />
      <circle cx={tipX} cy={tipY} r="4.5" fill="#f6d9a0" />
      <line x1={ox} y1={oy} x2={ox} y2={tipY} stroke={CYAN} strokeWidth="2" strokeOpacity={0.85} />
      <line x1={ox} y1={tipY} x2={tipX} y2={tipY} stroke={VIOLET} strokeWidth="2" strokeOpacity={0.85} />
      {/* right angle */}
      <path d={`M ${ox},${tipY + 11} L ${ox + 11},${tipY + 11} L ${ox + 11},${tipY}`} fill="none" stroke="rgba(236,231,219,0.4)" strokeWidth="1" />
      <text x={ox - 12} y={(oy + tipY) / 2} textAnchor="end" fontSize="11" className="mono" fill={CYAN}>h</text>
      <text x={(ox + tipX) / 2} y={tipY - 9} textAnchor="middle" fontSize="11" className="mono" fill={VIOLET}>r</text>
      <text x={(ox + tipX) / 2 + 26} y={(oy + tipY) / 2 - 4} fontSize="11" className="mono" fill={GOLD}>|v| = 1</text>
      <text x={ox} y={oy + 22} textAnchor="middle" fontSize="10" className="mono" fill={DIM}>h² + r² = {fmt(h * h + r * r, 3)}</text>
    </g>
  );
}

function SplitScene({ h }: { h: number }) {
  const r2 = 1 - h * h;
  const horiz = r2 * COS_STAR;
  const vert = h * h;
  const sum = horiz + vert;
  const x0 = 330, S = 300, y = 118, bh = 34;
  const bar = (v: number, yy: number, col: string) => (
    <motion.rect
      x={v < 0 ? x0 + v * S : x0} y={yy} width={Math.abs(v) * S} height={bh} rx="5"
      fill={col} fillOpacity={0.22} stroke={col} strokeWidth="1.2"
      animate={{ x: v < 0 ? x0 + v * S : x0, width: Math.abs(v) * S }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
    />
  );
  const zero = Math.abs(sum) < 0.004;

  return (
    <g>
      <text x={x0} y={38} textAnchor="middle" fontSize="9.5" className="mono" fill={DIM} letterSpacing="2.5">
        THE TUG-OF-WAR INSIDE ⟨vᵢ|vᵢ₊₁⟩
      </text>
      {[-1, -0.5, 0, 0.5, 1].map((t) => (
        <g key={t}>
          <line x1={x0 + t * S} x2={x0 + t * S} y1={64} y2={300} stroke={t === 0 ? "rgba(236,231,219,0.32)" : "rgba(236,231,219,0.07)"} strokeWidth={t === 0 ? 1.2 : 1} />
          <text x={x0 + t * S} y={318} textAnchor="middle" fontSize="9.5" className="mono" fill={DIM}>{t}</text>
        </g>
      ))}

      {bar(horiz, y, ROSE)}
      <text x={x0 + horiz * S - 10} y={y + 22} textAnchor="end" fontSize="11" className="mono" fill={ROSE}>
        r²·cos144° = {fmt(horiz, 4)}
      </text>

      {bar(vert, y + 56, CYAN)}
      <text x={x0 + vert * S + 10} y={y + 78} fontSize="11" className="mono" fill={CYAN}>
        h² = {fmt(vert, 4)}
      </text>

      {bar(sum, y + 122, zero ? "#7CFFB2" : GOLD)}
      <text x={x0 + (sum < 0 ? sum * S - 10 : sum * S + 10)} y={y + 144} textAnchor={sum < 0 ? "end" : "start"} fontSize="12" className="mono" fill={zero ? "#7CFFB2" : GOLD}>
        sum = {fmt(sum, 5)}
      </text>

      <text x={x0} y={y + 186} textAnchor="middle" fontSize="10.5" className="mono" fill={zero ? "#7CFFB2" : DIM} letterSpacing="1.5">
        {zero ? "◆ PERFECTLY BALANCED — THE RAYS ARE ORTHOGONAL ◆" : "not yet zero — the two pulls do not cancel"}
      </text>
      <text x={x0} y={y + 206} textAnchor="middle" fontSize="9.5" className="mono" fill="rgba(143,141,156,0.7)">
        drag the height slider and watch the gold bar shrink to nothing
      </text>
    </g>
  );
}

function WindingScene({ onOpen }: { onOpen: () => void }) {
  const pent = windingInfo(5, 1);
  const star = windingInfo(5, 2);
  return (
    <g>
      <text x={330} y={34} textAnchor="middle" fontSize="9.5" className="mono" fill={DIM} letterSpacing="2.5">
        SAME FIVE RAYS — THE WIRING DECIDES EVERYTHING
      </text>

      {[{ w: pent, cx: 168, label: "step k=1 · pentagon" }, { w: star, cx: 492, label: "step k=2 · pentagram {5/2}" }].map((o) => {
        const bad = !o.w.obtuse;
        const col = bad ? ROSE : CYAN;
        return (
          <g key={o.w.k}>
            <WiringCircle N={5} k={o.w.k} cx={o.cx} cy={158} R={86} />
            <text x={o.cx} y={44} textAnchor="middle" fontSize="10.5" className="mono" fill={col}>{o.label}</text>
            <text x={o.cx} y={272} textAnchor="middle" fontSize="11" className="mono" fill={col}>
              Δφ = {o.w.deltaDeg}° · cos = {fmt(o.w.cos, 3)}
            </text>
            <text x={o.cx} y={291} textAnchor="middle" fontSize="10.5" className="mono" fill={DIM}>
              sweeps {o.w.totalDeg}° = {o.w.turns}×2π
            </text>
            <text x={o.cx} y={312} textAnchor="middle" fontSize="11.5" className="mono" fill={col}>
              {bad ? "h² = −1/√5 → imaginary ✗" : "h² = +1/√5 → h = 5^−1/4 ✓"}
            </text>
          </g>
        );
      })}

      <g onClick={onOpen} style={{ cursor: "pointer" }}>
        <rect x={228} y={330} width={204} height={26} rx="13" fill="rgba(111,220,247,0.10)" stroke="rgba(111,220,247,0.45)" />
        <text x={330} y={347} textAnchor="middle" fontSize="10.5" className="mono" fill={CYAN}>
          open the full 2π vs 4π lab →
        </text>
      </g>
    </g>
  );
}

function GoldenScene() {
  const cx = 250, cy = 176, R = 118;
  const pen = Array.from({ length: 5 }, (_, k) => {
    const a = (2 * Math.PI * k) / 5 - Math.PI / 2;
    return [cx + R * Math.cos(a), cy + R * Math.sin(a)] as [number, number];
  });
  const side = Math.hypot(pen[1][0] - pen[0][0], pen[1][1] - pen[0][1]);
  const diag = Math.hypot(pen[2][0] - pen[0][0], pen[2][1] - pen[0][1]);
  const bx = 430, by = 120, bs = 150;

  return (
    <g>
      <text x={cx} y={42} textAnchor="middle" fontSize="9.5" className="mono" fill={DIM} letterSpacing="2.5">WHERE φ COMES FROM</text>
      <polygon points={pen.map((p) => p.join(",")).join(" ")} fill="rgba(232,180,92,0.05)" stroke={GOLD} strokeWidth="1.4" />
      {/* all diagonals = the pentagram */}
      {[0, 1, 2, 3, 4].map((k) => {
        const a = pen[k], b = pen[(k + 2) % 5];
        return <line key={k} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={CYAN} strokeWidth="1" strokeOpacity={0.45} />;
      })}
      {/* highlighted side + diagonal */}
      <line x1={pen[0][0]} y1={pen[0][1]} x2={pen[1][0]} y2={pen[1][1]} stroke={VIOLET} strokeWidth="3" />
      <line x1={pen[0][0]} y1={pen[0][1]} x2={pen[2][0]} y2={pen[2][1]} stroke={ROSE} strokeWidth="3" />
      {pen.map(([x, y], k) => <circle key={k} cx={x} cy={y} r="3.5" fill={GOLD} />)}
      <text x={cx} y={cy + 150} textAnchor="middle" fontSize="10" className="mono" fill={DIM}>
        diagonal / side = {(diag / side).toFixed(5)}
      </text>

      {/* ratio bars */}
      <text x={bx} y={by - 26} fontSize="9.5" className="mono" fill={DIM} letterSpacing="2">MEASURED RATIO</text>
      <rect x={bx} y={by} width={bs} height={20} rx="4" fill={VIOLET} fillOpacity={0.25} stroke={VIOLET} />
      <text x={bx + bs + 10} y={by + 15} fontSize="10.5" className="mono" fill={VIOLET}>side a</text>
      <rect x={bx} y={by + 34} width={bs * PHI} height={20} rx="4" fill={ROSE} fillOpacity={0.25} stroke={ROSE} />
      <text x={bx + bs * PHI + 10} y={by + 49} fontSize="10.5" className="mono" fill={ROSE}>diagonal = φ·a</text>

      <text x={bx} y={by + 96} fontSize="11" className="mono" fill="rgba(236,231,219,0.9)">φ = (1+√5)/2 = {PHI.toFixed(6)}</text>
      <text x={bx} y={by + 118} fontSize="11" className="mono" fill={GOLD}>cos 36° = φ/2 = {(PHI / 2).toFixed(6)}</text>
      <text x={bx} y={by + 140} fontSize="11" className="mono" fill={CYAN}>cos 144° = −φ/2 = {COS_STAR.toFixed(6)}</text>
      <text x={bx} y={by + 170} fontSize="9.5" className="mono" fill="rgba(143,141,156,0.75)">the only irrational input</text>
      <text x={bx} y={by + 186} fontSize="9.5" className="mono" fill="rgba(143,141,156,0.75)">to the whole construction</text>
    </g>
  );
}

function RootScene({ h, onPick }: { h: number; onPick: (h: number) => void }) {
  const x0 = 78, x1 = 610, yTop = 62, yBot = 286;
  const X = (hh: number) => x0 + hh * (x1 - x0);
  const fMin = COS_STAR, fMax = 1;
  const Y = (f: number) => yBot - ((f - fMin) / (fMax - fMin)) * (yBot - yTop);
  const path = useMemo(() => {
    let d = "";
    for (let i = 0; i <= 120; i++) {
      const hh = i / 120;
      d += `${i ? "L" : "M"}${X(hh).toFixed(1)},${Y(orthResidual(hh)).toFixed(1)}`;
    }
    return d;
  }, []);
  const f = orthResidual(h);

  return (
    <g>
      <text x={(x0 + x1) / 2} y={36} textAnchor="middle" fontSize="9.5" className="mono" fill={DIM} letterSpacing="2.5">
        ROOT FINDING — f(h) = (1−h²)cos144° + h²   · click the curve
      </text>
      <rect x={x0} y={yTop} width={x1 - x0} height={Y(0) - yTop} fill="rgba(111,220,247,0.04)" />
      <rect x={x0} y={Y(0)} width={x1 - x0} height={yBot - Y(0)} fill="rgba(251,92,122,0.05)" />
      <text x={x1 - 8} y={Y(0) - 8} textAnchor="end" fontSize="9" className="mono" fill="rgba(111,220,247,0.75)">f &gt; 0 · neighbours acute (too tall)</text>
      <text x={x1 - 8} y={Y(0) + 18} textAnchor="end" fontSize="9" className="mono" fill="rgba(251,92,122,0.75)">f &lt; 0 · neighbours obtuse (too flat)</text>

      <line x1={x0} x2={x1} y1={Y(0)} y2={Y(0)} stroke="rgba(236,231,219,0.35)" strokeWidth="1.2" />
      <line x1={x0} x2={x0} y1={yTop} y2={yBot} stroke="rgba(236,231,219,0.18)" />
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={t}>
          <line x1={X(t)} x2={X(t)} y1={yBot} y2={yBot + 5} stroke="rgba(236,231,219,0.2)" />
          <text x={X(t)} y={yBot + 19} textAnchor="middle" fontSize="9.5" className="mono" fill={DIM}>{t}</text>
        </g>
      ))}
      <text x={(x0 + x1) / 2} y={yBot + 36} textAnchor="middle" fontSize="9.5" className="mono" fill={DIM} letterSpacing="2">cone height h</text>

      <path d={path} fill="none" stroke={VIOLET} strokeWidth="2" />
      {/* click surface */}
      <rect
        x={x0} y={yTop} width={x1 - x0} height={yBot - yTop} fill="transparent" style={{ cursor: "crosshair" }}
        onClick={(e) => {
          const svg = (e.target as SVGRectElement).ownerSVGElement!;
          const pt = svg.createSVGPoint();
          pt.x = e.clientX; pt.y = e.clientY;
          const loc = pt.matrixTransform(svg.getScreenCTM()!.inverse());
          onPick(clamp((loc.x - x0) / (x1 - x0), 0.05, 0.995));
        }}
      />
      {/* exact root */}
      <line x1={X(H)} x2={X(H)} y1={yTop} y2={yBot} stroke={CYAN} strokeWidth="1" strokeDasharray="4 4" />
      <circle cx={X(H)} cy={Y(0)} r="7" fill="none" stroke={CYAN} strokeWidth="1.8" />
      <circle cx={X(H)} cy={Y(0)} r="2.5" fill={CYAN} />
      <text x={X(H) + 12} y={Y(0) - 14} fontSize="10.5" className="mono" fill={CYAN}>h★ = 5^−1/4 = {fmt(H, 5)}</text>

      {/* live pointer */}
      <motion.g animate={{ x: X(h) - X(H) }} transition={{ type: "spring", stiffness: 210, damping: 24 }}>
        <line x1={X(H)} x2={X(H)} y1={Y(0)} y2={Y(f)} stroke={GOLD} strokeWidth="1.4" strokeDasharray="2 3" />
        <circle cx={X(H)} cy={Y(f)} r="5.5" fill="#0b0b14" stroke={GOLD} strokeWidth="2" />
        <text x={X(H)} y={Y(f) - 14} textAnchor="middle" fontSize="10.5" className="mono" fill={GOLD}>f = {fmt(f, 4)}</text>
      </motion.g>
    </g>
  );
}

function ProbeScene({ h }: { h: number }) {
  const r = Math.sqrt(Math.max(0, 1 - h * h));
  const ox = 250, oy = 290, S = 205;
  const tipX = ox + r * S, tipY = oy - h * S;
  const p = h * h;
  const bx = 470, byTop = 96, bw = 130, bh = 168;

  return (
    <g>
      <text x={ox} y={40} textAnchor="middle" fontSize="9.5" className="mono" fill={DIM} letterSpacing="2.5">OVERLAP OF |ψ⟩ = ẑ WITH EVERY RAY</text>
      {/* unit circle guide */}
      <path d={`M ${ox - S},${oy} A ${S} ${S} 0 0 1 ${ox + S},${oy}`} fill="none" stroke="rgba(236,231,219,0.09)" strokeDasharray="2 6" />
      {/* probe */}
      <line x1={ox} y1={oy} x2={ox} y2={oy - S} stroke={CYAN} strokeWidth="2.6" />
      <circle cx={ox} cy={oy - S} r="4.5" fill={CYAN} />
      <text x={ox - 12} y={oy - S - 10} textAnchor="middle" fontSize="11" className="mono" fill={CYAN}>|ψ⟩</text>
      {/* ray + projection */}
      <line x1={ox} y1={oy} x2={tipX} y2={tipY} stroke={GOLD} strokeWidth="2.4" />
      <circle cx={tipX} cy={tipY} r="4.5" fill="#f6d9a0" />
      <text x={tipX + 12} y={tipY + 4} fontSize="11" className="mono" fill={GOLD}>|vᵢ⟩</text>
      {/* projection shadow onto axis */}
      <line x1={tipX} y1={tipY} x2={ox} y2={tipY} stroke="rgba(236,231,219,0.28)" strokeWidth="1" strokeDasharray="3 3" />
      <line x1={ox} y1={oy} x2={ox} y2={tipY} stroke={ROSE} strokeWidth="5" strokeOpacity={0.55} strokeLinecap="round" />
      <text x={ox - 16} y={(oy + tipY) / 2 + 4} textAnchor="end" fontSize="11" className="mono" fill={ROSE}>⟨ψ|vᵢ⟩ = h = {fmt(h, 4)}</text>
      <text x={ox} y={oy + 24} textAnchor="middle" fontSize="9.5" className="mono" fill={DIM}>same for all 5 rays — the axis is symmetric</text>

      {/* probability column */}
      <text x={bx + bw / 2} y={byTop - 22} textAnchor="middle" fontSize="9.5" className="mono" fill={DIM} letterSpacing="2">EVENT PROBABILITY</text>
      <rect x={bx} y={byTop} width={bw} height={bh} rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(236,231,219,0.12)" />
      <motion.rect
        x={bx} width={bw} rx="8" fill={CYAN} fillOpacity={0.3} stroke={CYAN}
        animate={{ y: byTop + bh * (1 - p), height: bh * p }}
        transition={{ type: "spring", stiffness: 170, damping: 22 }}
      />
      <motion.text
        x={bx + bw / 2} textAnchor="middle" fontSize="15" className="mono" fill="#d8f6ff"
        animate={{ y: byTop + bh * (1 - p) + 26 }}
        transition={{ type: "spring", stiffness: 170, damping: 22 }}
      >
        {fmt(p, 4)}
      </motion.text>
      <text x={bx + bw / 2} y={byTop + bh + 20} textAnchor="middle" fontSize="10.5" className="mono" fill={DIM}>pᵢ = |⟨ψ|vᵢ⟩|² = h²</text>
      <text x={bx + bw / 2} y={byTop + bh + 38} textAnchor="middle" fontSize="10.5" className="mono" fill={Math.abs(p - 1 / SQRT5) < 0.002 ? "#7CFFB2" : DIM}>
        {Math.abs(p - 1 / SQRT5) < 0.002 ? "= 1/√5 ✓" : `target 1/√5 = ${fmt(1 / SQRT5, 4)}`}
      </text>
    </g>
  );
}

function MatrixGrid({
  M, x, y, label, cell = 40, highlight,
}: {
  M: number[][]; x: number; y: number; label: string; cell?: number; highlight?: [number, number];
}) {
  const col = (v: number) => {
    const t = clamp(Math.abs(v), 0, 1);
    return v >= 0 ? `rgba(111,220,247,${0.06 + t * 0.30})` : `rgba(251,92,122,${0.06 + t * 0.30})`;
  };
  return (
    <g>
      <text x={x + (cell * 3) / 2} y={y - 12} textAnchor="middle" fontSize="10.5" className="mono" fill="rgba(236,231,219,0.85)">{label}</text>
      {M.map((row, i) =>
        row.map((v, j) => {
          const hi = highlight && highlight[0] === i && highlight[1] === j;
          return (
            <g key={`${i}-${j}`}>
              <rect
                x={x + j * cell} y={y + i * cell} width={cell - 3} height={cell - 3} rx="4"
                fill={col(v)} stroke={hi ? GOLD : "rgba(236,231,219,0.10)"} strokeWidth={hi ? 2 : 1}
              />
              <text
                x={x + j * cell + (cell - 3) / 2} y={y + i * cell + (cell - 3) / 2 + 3.5}
                textAnchor="middle" fontSize="9" className="mono"
                fill={hi ? GOLD : "rgba(236,231,219,0.8)"}
              >
                {Math.abs(v) < 5e-4 ? "0" : v.toFixed(2).replace("-", "−")}
              </text>
            </g>
          );
        })
      )}
    </g>
  );
}

function OperatorScene({ h }: { h: number }) {
  const v1 = ray5(1, h), v2 = ray5(2, h);
  const S1 = reflection(v1), S2 = reflection(v2);
  const prod = matMul(S1, S2);
  const cross = matScale(matMul(projector(v1), projector(v2)), 4);
  const e3: Vec3 = [0, 0, 1];
  const val = expectation(prod, e3);
  const crossMax = maxAbs(cross);
  const clean = crossMax < 0.01;
  const approx = matSub(matSub([[1, 0, 0], [0, 1, 0], [0, 0, 1]], matScale(projector(v1), 2)), matScale(projector(v2), 2));

  return (
    <g>
      <text x={330} y={34} textAnchor="middle" fontSize="9.5" className="mono" fill={DIM} letterSpacing="2.5">
        LIVE 3×3 OPERATORS — COMPUTED FROM YOUR h
      </text>
      <MatrixGrid M={S1} x={48} y={86} label="Ŝ₁ = 2P₁ − 𝕀" />
      <text x={186} y={148} fontSize="16" className="mono" fill={DIM}>×</text>
      <MatrixGrid M={S2} x={210} y={86} label="Ŝ₂" />
      <text x={348} y={148} fontSize="16" className="mono" fill={DIM}>=</text>
      <MatrixGrid M={prod} x={372} y={86} label="Ŝ₁Ŝ₂" highlight={[2, 2]} />

      <line x1={40} y1={236} x2={620} y2={236} stroke="rgba(236,231,219,0.1)" />

      {/* cross term */}
      <MatrixGrid M={cross} x={48} y={276} label="cross term 4P₁P₂" cell={30} />
      <text x={166} y={300} fontSize="10.5" className="mono" fill={clean ? "#7CFFB2" : ROSE}>
        max |entry| = {fmt(crossMax, 4)}
      </text>
      <text x={166} y={318} fontSize="10" className="mono" fill={clean ? "#7CFFB2" : ROSE}>
        {clean ? "vanishes ⇒ Ŝ₁Ŝ₂ = 𝕀 − 2P₁ − 2P₂" : "non-zero ⇒ the simplification is invalid"}
      </text>
      <text x={166} y={340} fontSize="10" className="mono" fill={DIM}>
        ‖Ŝ₁Ŝ₂ − (𝕀−2P₁−2P₂)‖max = {fmt(maxAbs(matSub(prod, approx)), 4)}
      </text>

      {/* the expectation readout */}
      <rect x={382} y={266} width={230} height={82} rx="10" fill="rgba(232,180,92,0.07)" stroke="rgba(232,180,92,0.4)" />
      <text x={497} y={288} textAnchor="middle" fontSize="9.5" className="mono" fill={DIM} letterSpacing="1.5">⟨ψ|Ŝ₁Ŝ₂|ψ⟩ = entry (3,3)</text>
      <text x={497} y={318} textAnchor="middle" fontSize="20" className="mono" fill={GOLD}>{fmt(val, 5)}</text>
      <text x={497} y={338} textAnchor="middle" fontSize="9.5" className="mono" fill={clean ? "#7CFFB2" : ROSE}>
        {clean ? "= 1 − 4h² = 1 − 4/√5 ✓" : `≠ 1 − 4h² (= ${fmt(1 - 4 * h * h, 3)}) — cross-term alive`}
      </text>
    </g>
  );
}

function SumScene({ h }: { h: number }) {
  const e = edgeExpect5(h); // exact — equals 1 − 4h² only on the root
  const x0 = 96, S = 96, yBase = 92, rowH = 40;
  const total = 5 * e;
  return (
    <g>
      <text x={330} y={38} textAnchor="middle" fontSize="9.5" className="mono" fill={DIM} letterSpacing="2.5">
        ACCUMULATING THE FIVE EDGES
      </text>
      {/* zero line */}
      <line x1={x0} x2={x0} y1={yBase - 16} y2={yBase + rowH * 5 + 42} stroke="rgba(236,231,219,0.3)" />
      <text x={x0} y={yBase - 24} textAnchor="middle" fontSize="9.5" className="mono" fill={DIM}>0</text>
      {/* classical floor */}
      <line x1={x0 + CLASSICAL_SUM * S} x2={x0 + CLASSICAL_SUM * S} y1={yBase - 16} y2={yBase + rowH * 5 + 42} stroke={GOLD} strokeWidth="1.3" strokeDasharray="5 4" />
      <text x={x0 + CLASSICAL_SUM * S} y={yBase - 24} textAnchor="middle" fontSize="10" className="mono" fill={GOLD}>classical floor −3</text>

      {[0, 1, 2, 3, 4].map((k) => {
        const run = (k + 1) * e;
        const crossed = run < CLASSICAL_SUM;
        return (
          <g key={k}>
            <motion.rect
              y={yBase + k * rowH} height={rowH - 12} rx="4"
              fill={crossed ? ROSE : CYAN} fillOpacity={0.22} stroke={crossed ? ROSE : CYAN} strokeWidth="1.1"
              animate={{ x: x0 + Math.min(run, 0) * S, width: Math.abs(run) * S }}
              transition={{ type: "spring", stiffness: 150, damping: 20, delay: k * 0.07 }}
            />
            <motion.text
              y={yBase + k * rowH + 18} fontSize="10.5" className="mono" fill={crossed ? ROSE : "rgba(236,231,219,0.85)"}
              textAnchor="end"
              animate={{ x: x0 + Math.min(run, 0) * S - 10 }}
              transition={{ type: "spring", stiffness: 150, damping: 20, delay: k * 0.07 }}
            >
              {fmt(run, 4)}
            </motion.text>
            <text x={x0 + 10} y={yBase + k * rowH + 18} fontSize="10" className="mono" fill="rgba(143,141,156,0.85)">
              + edge {k + 1} ({fmt(e, 4)})
            </text>
          </g>
        );
      })}

      <text x={x0 + total * S - 10} y={yBase + rowH * 5 + 30} textAnchor="end" fontSize="13" className="mono" fill={ROSE}>
        Σ = {fmt(total, 5)} {Math.abs(h - H) < 1e-6 ? "= 5 − 4√5" : ""}
      </text>
      <text x={x0 + 10} y={yBase + rowH * 5 + 30} fontSize="10.5" className="mono" fill={total < CLASSICAL_SUM ? ROSE : DIM}>
        {total < CLASSICAL_SUM ? `violation depth ${fmt(CLASSICAL_SUM - total, 4)}` : "still inside the classical range"}
      </text>
    </g>
  );
}

/* ================================================================== */
export function Derivation() {
  const { h, setH, step, setStep, setView } = useCalc();
  const [playing, setPlaying] = useState(false);
  const hRef = useRef(h);
  hRef.current = h;

  // autoplay through the derivation
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setStep((s: number) => (s + 1) % STEPS.length), 4200);
    return () => clearInterval(t);
  }, [playing]);

  // when the story reaches the solve step, drive h to the exact root
  useEffect(() => {
    if (step >= 5 && Math.abs(hRef.current - H) > 1e-4) {
      const c = animate(hRef.current, H, {
        duration: 1.1,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (v) => setH(v),
      });
      return () => c.stop();
    }
  }, [step]);

  const snapped = Math.abs(h - H) < 1e-4;
  const residual = orthResidual(h);
  const st = STEPS[step];

  const solve = () => {
    const c = animate(h, H, { duration: 0.9, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setH(v) });
    return c;
  };

  const scene = () => {
    switch (step) {
      case 0:
      case 1: return <ConeViews h={h} />;
      case 2: return <SplitScene h={h} />;
      case 3: return <WindingScene onOpen={() => setView("winding")} />;
      case 4: return <GoldenScene />;
      case 5: return <RootScene h={h} onPick={setH} />;
      case 6: return <ProbeScene h={h} />;
      case 7: return <OperatorScene h={h} />;
      default: return <SumScene h={h} />;
    }
  };

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute right-[-220px] top-10 w-[600px] h-[600px] rounded-full opacity-[0.14] blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(closest-side, rgba(111,220,247,0.4), transparent 70%)" }}
      />
      <div className="px-5 md:px-8 py-7 max-w-[1500px]">
        <Reveal className="mb-5 max-w-3xl">
          <p className="text-muted text-[13.5px] leading-relaxed font-light">
            Eight moves take you from “five vectors somewhere on a cone” to the exact number{" "}
            <TeX>{"5-4\\sqrt5"}</TeX>. Every figure is redrawn live from the height{" "}
            <TeX>{"h"}</TeX> — drag it off the root to watch the geometry fail, then hit{" "}
            <em>solve</em> and watch it lock.
          </p>
        </Reveal>

        {/* step rail */}
        <Reveal className="flex flex-wrap items-center gap-2 mb-5">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => { setStep(i); setPlaying(false); }}
              className={cn(
                "chip !py-1.5 cursor-pointer transition-all",
                i === step
                  ? "!text-quantum !border-quantum/60 !bg-quantum/10"
                  : i < step ? "!text-muted hover:!text-ink" : "!text-faint hover:!text-muted"
              )}
            >
              {s.id}
            </button>
          ))}
          <button
            onClick={() => setPlaying((p) => !p)}
            className={cn("chip !py-1.5 cursor-pointer ml-1 transition-all", playing ? "!text-rose !border-rose/50" : "!text-ink hover:!border-quantum/50")}
          >
            {playing ? <Pause size={11} /> : <Play size={11} />} {playing ? "pause" : "autoplay"}
          </button>
        </Reveal>

        <div className="grid lg:grid-cols-[1.28fr_0.72fr] gap-6 items-stretch">
          {/* ---------------- stage ---------------- */}
          <Reveal className="card relative overflow-hidden">
            <div className="absolute top-4 left-5 z-10 mono text-[10px] tracking-[0.25em] text-faint">
              {st.id} — {st.title.toUpperCase()}
            </div>
            <svg viewBox="0 0 660 370" className="w-full block pt-6">
              <AnimatePresence mode="wait">
                <motion.g
                  key={step}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  {scene()}
                </motion.g>
              </AnimatePresence>
            </svg>

            {/* live height control — shared by every scene */}
            <div className="border-t border-line px-5 py-4">
              <div className="flex items-baseline justify-between mb-1">
                <span className="mono text-[10px] tracking-[0.22em] text-faint">LIVE HEIGHT h — DRIVES EVERY FIGURE</span>
                <span className="mono text-[12px]">
                  <span className={snapped ? "text-quantum" : "text-ink"}>h = {fmt(h, 5)}</span>
                  <span className="text-faint ml-3">⟨v₁|v₂⟩ = </span>
                  <span className={Math.abs(residual) < 0.004 ? "text-[#7CFFB2]" : "text-rose"}>{fmt(residual, 5)}</span>
                </span>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range" min={0.08} max={0.985} step={0.0005} value={h}
                  onChange={(e) => { setH(parseFloat(e.target.value)); setPlaying(false); }}
                  className="kcbs-range flex-1" aria-label="cone height"
                />
                <button
                  onClick={() => solve()}
                  disabled={snapped}
                  className={cn(
                    "chip !py-2 !px-4 shrink-0 transition-all",
                    snapped ? "!text-quantum !border-quantum/50 !bg-quantum/10 cursor-default" : "!text-ink hover:!text-quantum hover:!border-quantum/60 cursor-pointer"
                  )}
                >
                  {snapped ? <Target size={12} /> : <Crosshair size={12} />}
                  {snapped ? "locked at 5^−1/4" : "solve"}
                </button>
              </div>
            </div>
          </Reveal>

          {/* ---------------- narration ---------------- */}
          <div className="flex flex-col gap-4">
            <Reveal delay={0.05} className="card p-6 flex-1 flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.35 }}
                  className="flex-1"
                >
                  <div className="mono text-[10px] tracking-[0.3em] text-quantum mb-3">
                    STEP {step + 1} / {STEPS.length}
                  </div>
                  <h3 className="display text-2xl md:text-3xl font-light leading-snug mb-5">{st.title}</h3>
                  <div className="rounded-xl border border-line bg-white/[0.02] px-4 py-4 mb-5">
                    <TeX block>{st.tex}</TeX>
                  </div>
                  <p className="text-[13.5px] text-muted leading-relaxed">{st.note}</p>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between gap-3 mt-6 pt-5 border-t border-line">
                <button
                  onClick={() => { setStep((s: number) => Math.max(0, s - 1)); setPlaying(false); }}
                  disabled={step === 0}
                  className={cn("chip !py-2 !px-4 transition-all", step === 0 ? "!text-faint/40 cursor-default" : "!text-ink hover:!border-line-bright cursor-pointer")}
                >
                  <ChevronLeft size={12} /> back
                </button>
                <div className="flex gap-1.5">
                  {STEPS.map((_, i) => (
                    <span key={i} className={cn("h-1 rounded-full transition-all", i === step ? "w-6 bg-quantum" : "w-1.5 bg-white/15")} />
                  ))}
                </div>
                <button
                  onClick={() => { setStep((s: number) => Math.min(STEPS.length - 1, s + 1)); setPlaying(false); }}
                  disabled={step === STEPS.length - 1}
                  className={cn("chip !py-2 !px-4 transition-all", step === STEPS.length - 1 ? "!text-faint/40 cursor-default" : "!text-ink hover:!text-quantum hover:!border-quantum/60 cursor-pointer")}
                >
                  next <ChevronRight size={12} />
                </button>
              </div>
            </Reveal>

            {/* live numbers that matter at every step */}
            <Reveal delay={0.1} className="card p-5">
              <div className="mono text-[10px] tracking-[0.25em] text-faint mb-3">LIVE LEDGER</div>
              <div className="grid grid-cols-2 gap-x-5 gap-y-2.5 mono text-[11.5px]">
                {[
                  ["h", fmt(h, 5), snapped],
                  ["h²", fmt(h * h, 5), snapped],
                  ["r = √(1−h²)", fmt(Math.sqrt(1 - h * h), 5), false],
                  ["cos 144°", fmt(COS_STAR, 5), false],
                  ["⟨v₁|v₂⟩", fmt(residual, 5), Math.abs(residual) < 0.004],
                  ["angle(v₁,v₂)", fmt((Math.acos(clamp(residual, -1, 1)) * 180) / Math.PI, 2) + "°", Math.abs(residual) < 0.004],
                  ["pᵢ = h²", fmt(h * h, 5), snapped],
                  ["⟨ŜᵢŜᵢ₊₁⟩ exact", fmt(edgeExpect5(h), 5), snapped],
                ].map(([k, v, good], i) => (
                  <div key={i} className="flex justify-between gap-2 border-b border-line/50 pb-1.5">
                    <span className="text-faint">{k as string}</span>
                    <span className={good ? "text-quantum" : "text-ink/85"}>{v as string}</span>
                  </div>
                ))}
                <div className="flex justify-between gap-2 col-span-2 pt-1">
                  <span className="text-faint">Σ over 5 edges</span>
                  <span className={snapped ? "text-rose num-glow-rose" : "text-ink/85"}>
                    {fmt(5 * edgeExpect5(h), 5)} {snapped && <span className="text-faint">= 5 − 4√5</span>}
                  </span>
                </div>
                {!snapped && (
                  <div className="col-span-2 mono text-[10px] text-rose/85 leading-relaxed pt-1">
                    ⚠ off the root the contexts do not commute — these correlators are only formal
                    operator products and KCBS does not apply.
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </div>

        {/* closing context cards */}
        <div className="grid md:grid-cols-3 gap-5 mt-6">
          <Reveal className="card p-6">
            <div className="mono text-[10px] tracking-[0.25em] text-faint mb-3">THE GOLDEN CONE</div>
            <TeX block className="!text-[0.92rem] text-ink/90">
              {"h^2 = \\frac{1}{\\sqrt5} = \\frac{1}{2\\varphi-1},\\qquad h = 5^{-1/4}"}
            </TeX>
            <p className="text-[12.5px] text-muted leading-relaxed mt-2">
              The pentagram is the golden ratio made drawable, and the cone inherits it: there is
              no rational height in ℝ³ with five cyclically orthogonal star rays.
            </p>
          </Reveal>
          <Reveal delay={0.06} className="card p-6">
            <div className="mono text-[10px] tracking-[0.25em] text-faint mb-3">WHY NOT A QUBIT?</div>
            <p className="text-[12.5px] text-muted leading-relaxed">
              Contextuality needs dimension ≥ 3. In ℂ² any two distinct rays can be rotated into
              alignment, so you can never chain five measurements into a ring where each
              neighbouring pair commutes but the whole is incompatible. The qutrit is the smallest
              honest stage — and C₅ the smallest odd cycle.
            </p>
          </Reveal>
          <Reveal delay={0.12} className="card p-6">
            <div className="mono text-[10px] tracking-[0.25em] text-faint mb-3">CHECK IT YOURSELF</div>
            <p className="text-[12.5px] text-muted leading-relaxed">
              Every matrix on this stage is computed at render time from your slider — nothing is
              hard-coded. Move <TeX>{"h"}</TeX> off the root and the cross-term{" "}
              <TeX>{"4P_1P_2"}</TeX> lights up red, the identity{" "}
              <TeX>{"\\hat S_1\\hat S_2 = \\mathbb{I}-2P_1-2P_2"}</TeX> breaks, and the whole KCBS
              argument loses its licence.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
