import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity, Check, Crosshair, Expand, Hand, Info, Minimize2, Ruler,
  Sigma, Spline, TriangleAlert, Waves,
} from "lucide-react";
import { TeX } from "./TeX";
import {
  TSIRELSON, LOCAL_BOUND, PR_BOUND, OPTIMAL_ANGLES,
  parallelogram, sosDefect, momentMatrix, symMoment, labE, labC,
  horodeckiMax, elliptopeQ, elliptopeL, elliptopeQSlope, cirelsonCriterion,
  signalingAudit, uvec, norm2, type Angles, type LabCfg, type Vec2,
} from "../lib/chsh";
import { fmt, clamp } from "../lib/kcbs";
import { cn } from "../utils/cn";

const GOLD = "#e8b45c";
const CYAN = "#6fdcf7";
const ROSE = "#fb5c7a";
const VIOLET = "#a78bfa";
const NEON = "#7CFFB2";
const DIM = "rgba(143,141,156,0.95)";
const deg = (r: number) => (r * 180) / Math.PI;
const rad = (d: number) => (d * Math.PI) / 180;

type WinId = "vec" | "sos" | "ell" | "npa";
const ANGLE_KEYS: (keyof Angles)[] = ["a0", "a1", "b0", "b1"];
const ANGLE_COLOR: Record<string, string> = { a0: GOLD, a1: GOLD, b0: CYAN, b1: CYAN };
const ANGLE_LABEL: Record<string, string> = { a0: "α₀", a1: "α₁", b0: "β₀", b1: "β₁" };

/* ============================ atoms ============================ */
function Gauge({ label, value, tone = CYAN, note, tiny }: {
  label: string; value: string; tone?: string; note?: string; tiny?: boolean;
}) {
  return (
    <div className="rounded-lg border border-line bg-white/[0.02] px-3 py-2">
      <div className="mono text-[8.5px] tracking-[0.18em] text-faint mb-0.5 truncate">{label}</div>
      <div className="mono leading-tight" style={{ color: tone, fontSize: tiny ? 12.5 : 14.5 }}>{value}</div>
      {note && <div className="mono text-[8.5px] mt-0.5 truncate" style={{ color: tone }}>{note}</div>}
    </div>
  );
}

function Arrow({ from, to, color, width = 2, dashed, head = true, opacity = 1 }: {
  from: [number, number]; to: [number, number]; color: string; width?: number;
  dashed?: boolean; head?: boolean; opacity?: number;
}) {
  const dx = to[0] - from[0], dy = to[1] - from[1];
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L, uy = dy / L;
  const hl = Math.min(9, L * 0.3);
  const bx = to[0] - ux * hl, by = to[1] - uy * hl;
  return (
    <g opacity={opacity}>
      <line x1={from[0]} y1={from[1]} x2={head ? bx : to[0]} y2={head ? by : to[1]}
        stroke={color} strokeWidth={width} strokeDasharray={dashed ? "4 3" : undefined} strokeLinecap="round" />
      {head && L > 5 && (
        <polygon points={`${to[0]},${to[1]} ${bx - uy * hl * 0.4},${by + ux * hl * 0.4} ${bx + uy * hl * 0.4},${by - ux * hl * 0.4}`} fill={color} />
      )}
    </g>
  );
}

/* ================= draggable vector circle (the instrument) ================= */
function DragCircle({ g, setG, size, showConstruction }: {
  g: Angles; setG: (a: Angles) => void; size: number; showConstruction: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<keyof Angles | null>(null);
  const [hover, setHover] = useState<keyof Angles | null>(null);
  // keep the whole circle (plus labels) inside the viewBox at any height
  const VB = 340;
  const cx = VB / 2;
  const foot = size > 300 ? 26 : 8;
  const cy = (size - foot) / 2;
  const R = Math.min(104, cy - 26);
  const P = parallelogram(g);
  const S = (v: Vec2): [number, number] => [cx + v[0] * R, cy - v[1] * R];
  const O: [number, number] = [cx, cy];

  const locate = (e: React.PointerEvent) => {
    const svg = ref.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const l = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    return { ang: Math.atan2(l.x - cx, cy - l.y), r: Math.hypot(l.x - cx, l.y - cy) };
  };
  const nearest = (ang: number) => {
    let best: keyof Angles = "a0", bd = Infinity;
    for (const k of ANGLE_KEYS) {
      const d = Math.abs(Math.atan2(Math.sin(ang - g[k]), Math.cos(ang - g[k])));
      if (d < bd) { bd = d; best = k; }
    }
    return { key: best, d: bd };
  };

  const onDown = (e: React.PointerEvent) => {
    const loc = locate(e);
    if (!loc || loc.r < R * 0.26) return;
    const { key, d } = nearest(loc.ang);
    if (d > 0.7) return;
    e.preventDefault();
    setDrag(key);
    // capture on the SVG itself: child nodes may be re-rendered mid-drag
    ref.current?.setPointerCapture?.(e.pointerId);
    const snapped = e.shiftKey ? Math.round(loc.ang / rad(15)) * rad(15) : loc.ang;
    setG({ ...g, [key]: snapped });
  };
  const onMove = (e: React.PointerEvent) => {
    const loc = locate(e);
    if (!loc) return;
    if (!drag) {
      const { key, d } = nearest(loc.ang);
      setHover(loc.r > R * 0.26 && d < 0.7 ? key : null);
      return;
    }
    e.preventDefault();
    const snapped = e.shiftKey ? Math.round(loc.ang / rad(15)) * rad(15) : loc.ang;
    setG({ ...g, [drag]: snapped });
  };
  const onUp = (e: React.PointerEvent) => {
    if (drag) ref.current?.releasePointerCapture?.(e.pointerId);
    setDrag(null);
  };

  return (
    <div className="relative">
      <svg
        ref={ref} viewBox={`0 0 ${VB} ${size}`} className="w-full select-none"
        style={{ cursor: drag ? "grabbing" : hover ? "grab" : "default", touchAction: "none" }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
      >
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(236,231,219,0.1)" strokeDasharray="2 6" />
        <circle cx={cx} cy={cy} r={R} fill="rgba(255,255,255,0.012)" />
        <line x1={cx - R - 12} y1={cy} x2={cx + R + 12} y2={cy} stroke="rgba(236,231,219,0.06)" />
        <line x1={cx} y1={cy - R - 12} x2={cx} y2={cy + R + 12} stroke="rgba(236,231,219,0.06)" />

        {showConstruction && (
          <>
            <polygon points={[O, S(P.b0), S(P.S), S(P.b1)].map((p) => p.join(",")).join(" ")}
              fill="rgba(111,220,247,0.06)" stroke="rgba(111,220,247,0.28)" strokeWidth="1" strokeDasharray="3 3" />
            <Arrow from={O} to={S(P.S)} color={NEON} width={2.3} />
            <Arrow from={O} to={S(P.D)} color={VIOLET} width={2.3} />
            <text x={S(P.S)[0] + 7} y={S(P.S)[1] - 6} fontSize="9.5" className="mono" fill={NEON}>S</text>
            <text x={S(P.D)[0] + 7} y={S(P.D)[1] + 12} fontSize="9.5" className="mono" fill={VIOLET}>D</text>
            {[{ a: P.a0, t: P.S, n: P.u, c: NEON }, { a: P.a1, t: P.D, n: P.v, c: VIOLET }].map((o, i) => {
              if (o.n < 1e-6) return null;
              const pr = (o.a[0] * o.t[0] + o.a[1] * o.t[1]) / (o.n * o.n);
              const foot: Vec2 = [o.t[0] * pr, o.t[1] * pr];
              return (
                <g key={i}>
                  <line x1={S(o.a)[0]} y1={S(o.a)[1]} x2={S(foot)[0]} y2={S(foot)[1]} stroke={o.c} strokeWidth="1" strokeDasharray="2 3" opacity={0.6} />
                  <circle cx={S(foot)[0]} cy={S(foot)[1]} r="2.8" fill={o.c} opacity={0.85} />
                </g>
              );
            })}
          </>
        )}

        {ANGLE_KEYS.map((k) => {
          const v = uvec(g[k]);
          const act = drag === k || hover === k;
          return (
            <g key={k}>
              <Arrow from={O} to={S(v)} color={ANGLE_COLOR[k]} width={act ? 3 : 2} dashed={k[0] === "b"} />
              <circle cx={S(v)[0]} cy={S(v)[1]} r={act ? 7 : 5} fill={ANGLE_COLOR[k]} opacity={act ? 1 : 0.9} />
              {act && <circle cx={S(v)[0]} cy={S(v)[1]} r="12" fill="none" stroke={ANGLE_COLOR[k]} strokeWidth="1" opacity="0.45" />}
              <text x={cx + v[0] * (R + 20)} y={cy - v[1] * (R + 20) + 4} textAnchor="middle" fontSize="11" className="mono" fill={ANGLE_COLOR[k]}>
                {ANGLE_LABEL[k]}
              </text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="3" fill="#ece7db" />

        {size > 300 && (
          <text x={cx} y={size - 8} textAnchor="middle" fontSize="9" className="mono" fill={DIM}>
            E_xy = a_x · b_y &nbsp;·&nbsp; drag the tips &nbsp;·&nbsp; hold shift to snap 15°
          </text>
        )}
      </svg>
      {drag && (
        <div className="absolute top-2 right-2 chip !py-1 !px-2.5 !text-[9.5px] !bg-void/80 backdrop-blur" style={{ color: ANGLE_COLOR[drag], borderColor: ANGLE_COLOR[drag] + "88" }}>
          {ANGLE_LABEL[drag]} = {fmt(deg(g[drag]), 1)}°
        </div>
      )}
    </div>
  );
}

/* ======================= W1 ======================= */
function WindowVec({ cfg, setG, compact }: { cfg: LabCfg; setG: (a: Angles) => void; compact: boolean }) {
  const P = useMemo(() => parallelogram(cfg.g), [cfg.g]);
  const PW = 300, PH = 300, pm = 40, pr = 2.55;
  const PX = (t: number) => pm + (t / pr) * (PW - pm - 18);
  const PY = (t: number) => PH - pm - (t / pr) * (PH - pm - 18);
  const arc = Array.from({ length: 49 }, (_, i) => {
    const t = (i / 48) * (Math.PI / 2);
    return `${PX(2 * Math.cos(t)).toFixed(1)},${PY(2 * Math.sin(t)).toFixed(1)}`;
  }).join(" ");

  const phase = (
    <svg viewBox={`0 0 ${PW} ${PH}`} className="w-full">
      <path d={`M ${PX(0)},${PY(0)} L ${PX(2)},${PY(0)} A ${PX(2) - PX(0)} ${PY(0) - PY(2)} 0 0 0 ${PX(0)},${PY(2)} Z`} fill="rgba(111,220,247,0.06)" />
      <polyline points={arc} fill="none" stroke={CYAN} strokeWidth="2" />
      <line x1={PX(TSIRELSON)} y1={PY(0)} x2={PX(0)} y2={PY(TSIRELSON)} stroke={ROSE} strokeWidth="1.3" strokeDasharray="5 4" />
      <text x={PX(1.55)} y={PY(1.62)} fontSize="9" className="mono" fill={ROSE}>u+v = 2√2</text>
      <line x1={PX(Math.min(P.uPlusV, pr))} y1={PY(Math.max(0, P.uPlusV - pr))} x2={PX(Math.max(0, P.uPlusV - pr))} y2={PY(Math.min(P.uPlusV, pr))} stroke={GOLD} strokeWidth="1.8" />
      <circle cx={PX(Math.SQRT2)} cy={PY(Math.SQRT2)} r="4.5" fill="none" stroke={ROSE} strokeWidth="1.6" />
      <motion.circle r="5.5" fill="#0b0b14" stroke={GOLD} strokeWidth="2"
        animate={{ cx: PX(clamp(P.u, 0, pr)), cy: PY(clamp(P.v, 0, pr)) }} transition={{ type: "spring", stiffness: 240, damping: 24 }} />
      <line x1={PX(0)} y1={PY(0)} x2={PX(pr)} y2={PY(0)} stroke="rgba(236,231,219,0.25)" />
      <line x1={PX(0)} y1={PY(0)} x2={PX(0)} y2={PY(pr)} stroke="rgba(236,231,219,0.25)" />
      {[0, 1, 2].map((t) => (
        <Fragment key={t}>
          <text x={PX(t)} y={PY(0) + 15} textAnchor="middle" fontSize="8.5" className="mono" fill={DIM}>{t}</text>
          <text x={PX(0) - 8} y={PY(t) + 3.5} textAnchor="end" fontSize="8.5" className="mono" fill={DIM}>{t}</text>
        </Fragment>
      ))}
      <text x={PX(pr) - 2} y={PY(0) + 28} textAnchor="end" fontSize="8.5" className="mono" fill={DIM}>u</text>
      <text x={PX(0) - 20} y={PY(pr) + 4} textAnchor="middle" fontSize="8.5" className="mono" fill={DIM}>v</text>
    </svg>
  );

  const gauges = (
    <div className="grid grid-cols-2 gap-2">
      <Gauge label="u = ‖b₀+b₁‖" value={fmt(P.u, 5)} tone={NEON} tiny />
      <Gauge label="v = ‖b₀−b₁‖" value={fmt(P.v, 5)} tone={VIOLET} tiny />
      <Gauge label="u² + v² INVARIANT" value={fmt(P.invariant, 5)} tone={Math.abs(P.invariant - 4) < 1e-9 ? NEON : ROSE} note="≡ 4" tiny />
      <Gauge label="C ≤ u + v" value={`${fmt(P.C, 5)} ≤ ${fmt(P.uPlusV, 4)}`} tone={GOLD} tiny />
    </div>
  );

  if (compact) {
    return (
      <div className="grid grid-cols-[1.1fr_0.9fr] gap-3 items-start">
        <DragCircle g={cfg.g} setG={setG} size={250} showConstruction />
        <div className="space-y-2">{phase}{gauges}</div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_1fr] gap-5">
      <DragCircle g={cfg.g} setG={setG} size={340} showConstruction />
      <div>{phase}</div>
      <div className="lg:col-span-2 space-y-3">
        {gauges}
        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-line bg-white/[0.02] px-4 py-3">
            <div className="mono text-[9px] tracking-[0.2em] text-faint mb-1.5">THE TWO-LINE PROOF</div>
            <TeX block className="!text-[0.76rem]">{"\\mathcal{C} = \\vec a_0\\cdot(\\vec b_0+\\vec b_1) + \\vec a_1\\cdot(\\vec b_0-\\vec b_1) \\le u+v"}</TeX>
            <TeX block className="!text-[0.76rem]">{"(u+v)^2 \\le 2(u^2+v^2) = 8 \\Rightarrow \\mathcal{C}\\le2\\sqrt2"}</TeX>
          </div>
          <div className="rounded-xl border border-line bg-white/[0.02] px-4 py-3">
            <div className="mono text-[9px] tracking-[0.2em] text-faint mb-1.5">EQUALITY CONDITIONS</div>
            {([["b₀ ⊥ b₁ (u = v)", P.orthogonal], ["a₀ ∥ S", Math.abs(P.aligned0 - 1) < 1e-6], ["a₁ ∥ D", Math.abs(P.aligned1 - 1) < 1e-6]] as const).map(([l, ok], i) => (
              <div key={i} className="flex items-center justify-between border-b border-line/50 py-1">
                <span className="mono text-[10.5px] text-muted">{l}</span>
                <span className={cn("mono text-[10px]", ok ? "text-quantum" : "text-faint")}>{ok ? "✓ met" : "✗"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================= W2 ======================= */
function DefectLandscape({ cfg, px, py }: { cfg: LabCfg; px: number; py: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const N = 120;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(N, N);
    for (let j = 0; j < N; j++) {
      const b0 = (j / (N - 1)) * Math.PI - Math.PI / 2;
      for (let i = 0; i < N; i++) {
        const a1 = (i / (N - 1)) * Math.PI - Math.PI / 2;
        const d = TSIRELSON - labC({ ...cfg, g: { ...cfg.g, a1, b0 } });
        const t = clamp(d / (2 * TSIRELSON), 0, 1);
        const o = (j * N + i) * 4;
        img.data[o] = Math.round(20 + 235 * Math.pow(t, 0.75));
        img.data[o + 1] = Math.round(220 - 160 * Math.pow(t, 0.6));
        img.data[o + 2] = Math.round(247 - 110 * t);
        img.data[o + 3] = 235;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [cfg]);
  return (
    <div>
      <div className="relative rounded-lg overflow-hidden border border-line" style={{ aspectRatio: "1" }}>
        <canvas ref={ref} width={N} height={N} className="w-full h-full block" style={{ transform: "scaleY(-1)" }} />
        <div className="absolute w-3 h-3 rounded-full border-2 border-white pointer-events-none"
          style={{ left: `calc(${px}% - 6px)`, bottom: `calc(${py}% - 6px)`, boxShadow: "0 0 8px rgba(0,0,0,.8)" }} />
        <div className="absolute w-2.5 h-2.5 rotate-45 border pointer-events-none"
          style={{ left: "calc(100% - 5px)", bottom: "calc(75% - 5px)", borderColor: NEON }} />
      </div>
      <div className="mono text-[8.5px] text-faint mt-1 flex items-center justify-between">
        <span>α₁ ▸ β₀ plane</span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-10 h-1.5 rounded-full" style={{ background: "linear-gradient(90deg,#14dcf7,#a78bfa,#fb5c7a)" }} />0→5.66
        </span>
      </div>
    </div>
  );
}

function WindowSOS({ cfg, compact }: { cfg: LabCfg; compact: boolean }) {
  const D = useMemo(() => sosDefect(cfg), [cfg]);
  const cx = 130, cy = 132, R = 74;
  const S = (v: Vec2): [number, number] => [cx + v[0] * R, cy - v[1] * R];
  const O: [number, number] = [cx, cy];
  const px = ((cfg.g.a1 + Math.PI / 2) / Math.PI) * 100;
  const py = ((cfg.g.b0 + Math.PI / 2) / Math.PI) * 100;

  const panels = (
    <div className="grid grid-cols-2 gap-2">
      {([
        { t: "R₀", m: D.m0, bv: uvec(cfg.g.b0), r: D.r0, n: D.n0, lbl: "(a₀+a₁)/√2", bl: "b₀" },
        { t: "R₁", m: D.m1, bv: uvec(cfg.g.b1), r: D.r1, n: D.n1, lbl: "(a₀−a₁)/√2", bl: "b₁" },
      ] as const).map((o) => (
        <svg key={o.t} viewBox="0 0 260 250" className="w-full">
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(236,231,219,0.08)" strokeDasharray="2 6" />
          <Arrow from={O} to={S(o.m)} color={GOLD} width={2} />
          <Arrow from={O} to={S(o.bv)} color={CYAN} width={2} dashed />
          {norm2(o.r) > 0.012 && <Arrow from={S(o.bv)} to={S(o.m)} color={ROSE} width={2.6} />}
          <circle cx={cx} cy={cy} r="2.5" fill="#ece7db" />
          <text x={cx + o.m[0] * (R + 20)} y={cy - o.m[1] * (R + 20) + 4} textAnchor="middle" fontSize="8.5" className="mono" fill={GOLD}>{o.lbl}</text>
          <text x={cx + o.bv[0] * (R + 16)} y={cy - o.bv[1] * (R + 16) + 4} textAnchor="middle" fontSize="9.5" className="mono" fill={CYAN}>{o.bl}</text>
          <text x={130} y={226} textAnchor="middle" fontSize="10.5" className="mono" fill={norm2(o.r) < 1e-6 ? NEON : ROSE}>‖{o.t}‖ = {fmt(norm2(o.r), 5)}</text>
          <text x={130} y={242} textAnchor="middle" fontSize="9" className="mono" fill={DIM}>‖{o.t}|ψ⟩‖² = {fmt(o.n, 5)}</text>
        </svg>
      ))}
    </div>
  );

  const gauges = (
    <div className="grid grid-cols-3 gap-2">
      <Gauge label="DEFECT (n₀+n₁)/√2" value={fmt(D.defect, 5)} tone={D.defect < 1e-6 ? NEON : GOLD} tiny />
      <Gauge label="2√2 − C" value={fmt(D.gap, 5)} tone={D.gap < 1e-6 ? NEON : GOLD} tiny />
      <Gauge label="RESIDUAL" value={D.residual.toExponential(0)} tone={D.residual < 1e-12 ? NEON : ROSE} note="identity holds" tiny />
    </div>
  );

  if (compact) {
    return (
      <div className="grid grid-cols-[1.25fr_0.75fr] gap-3 items-start">
        <div className="space-y-2">{panels}{gauges}</div>
        <DefectLandscape cfg={cfg} px={px} py={py} />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-5">
      <div className="space-y-3">
        {panels}
        <div className="rounded-xl border px-4 py-3"
          style={{ borderColor: D.gap < 1e-6 ? NEON + "66" : "rgba(236,231,219,0.09)", background: D.gap < 1e-6 ? "rgba(124,255,178,0.06)" : "rgba(255,255,255,0.02)" }}>
          <TeX block className="!text-[0.76rem]">{"2\\sqrt2\\,\\mathbb{I}-\\hat{\\mathcal C} = \\tfrac{1}{\\sqrt2}\\hat R_0^2 + \\tfrac{1}{\\sqrt2}\\hat R_1^2 \\succeq 0"}</TeX>
          {gauges}
        </div>
      </div>
      <div className="space-y-3">
        <DefectLandscape cfg={cfg} px={px} py={py} />
        <div className="rounded-xl border border-line bg-white/[0.02] px-4 py-3">
          <div className="mono text-[9px] tracking-[0.2em] text-faint mb-2">SELF-TESTING CONDITIONS</div>
          {([["R₀|ψ⟩ = 0", D.n0 < 1e-9], ["R₁|ψ⟩ = 0", D.n1 < 1e-9], ["{A₀,A₁}|ψ⟩ = 0", Math.abs(D.a) < 1e-9]] as const).map(([l, ok], i) => (
            <div key={i} className="flex items-center justify-between border-b border-line/50 py-1">
              <span className="mono text-[10.5px] text-muted">{l}</span>
              <span className={cn("mono text-[10px]", ok ? "text-quantum" : "text-faint")}>{ok ? "✓" : "✗"}</span>
            </div>
          ))}
          <p className="text-[11.5px] text-muted leading-relaxed mt-2">
            Saturation forces the observables to <em>anticommute</em> — impossible classically, and
            it pins the whole configuration up to isometry.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ======================= W3 ======================= */
function WindowEll({ cfg, compact, witness, setWitness }: {
  cfg: LabCfg; compact: boolean; witness: number; setWitness: (v: number) => void;
}) {
  const W = 560, H = compact ? 330 : 420, m = 44;
  const X = (x: number) => m + ((x + 1.15) / 2.3) * (W - m - 22);
  const Y = (y: number) => 28 + ((1.15 - y) / 2.3) * (H - 28 - 34);
  const E = labE(cfg);
  const cir = cirelsonCriterion(E);
  const xNow = (E[0] + E[1] + E[2]) / 3, yNow = E[3];
  const tx = 1 / Math.SQRT2, ty = elliptopeQ(tx);

  const { qRegion, qLower, qUpper } = useMemo(() => {
    const lo: string[] = [], up: string[] = [];
    for (let i = 0; i <= 90; i++) { const x = 1 - (i / 90) * 0.5; lo.push(`${X(x).toFixed(1)},${Y(elliptopeQ(x)).toFixed(1)}`); }
    for (let i = 0; i <= 90; i++) { const x = -1 + (i / 90) * 0.5; up.push(`${X(x).toFixed(1)},${Y(elliptopeQ(x)).toFixed(1)}`); }
    return { qLower: "M" + lo.join("L"), qUpper: "M" + up.join("L"), qRegion: [...lo, `${X(-1)},${Y(-1)}`, ...up, `${X(1)},${Y(1)}`].join(" ") };
  }, [H]);
  const lRegion = ([[-1, -1], [1 / 3, -1], [1, 1], [-1 / 3, 1]] as const).map(([x, y]) => `${X(x)},${Y(y)}`).join(" ");

  const plot = (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <rect x={X(-1)} y={Y(1)} width={X(1) - X(-1)} height={Y(-1) - Y(1)} fill="rgba(255,255,255,0.015)" stroke="rgba(236,231,219,0.12)" strokeDasharray="3 4" />
      <polygon points={qRegion} fill="rgba(111,220,247,0.10)" />
      <path d={qLower} fill="none" stroke={CYAN} strokeWidth="2.2" />
      <path d={qUpper} fill="none" stroke={CYAN} strokeWidth="2.2" />
      <polygon points={lRegion} fill="rgba(232,180,92,0.14)" stroke={GOLD} strokeWidth="1.8" />
      {[-1, 0, 1].map((t) => (
        <Fragment key={t}>
          <text x={X(t)} y={Y(-1.15) + 15} textAnchor="middle" fontSize="8.5" className="mono" fill={DIM}>{t}</text>
          <text x={X(-1.15) - 7} y={Y(t) + 3.5} textAnchor="end" fontSize="8.5" className="mono" fill={DIM}>{t}</text>
        </Fragment>
      ))}
      <line x1={X(-1.15)} y1={Y(3 * -1.15 - witness)} x2={X(1.15)} y2={Y(3 * 1.15 - witness)} stroke={ROSE} strokeWidth="1.8" />
      <circle cx={X(tx)} cy={Y(ty)} r="6" fill="none" stroke={NEON} strokeWidth="2" />
      <circle cx={X(tx)} cy={Y(ty)} r="2.2" fill={NEON} />
      <circle cx={X(1)} cy={Y(-1)} r="5" fill="none" stroke={VIOLET} strokeWidth="2" />
      <text x={X(1) - 8} y={Y(-1) + 4} textAnchor="end" fontSize="8.5" className="mono" fill={VIOLET}>PR</text>
      <motion.g animate={{ x: X(xNow) - X(0), y: Y(yNow) - Y(0) }} transition={{ type: "spring", stiffness: 220, damping: 24 }}>
        <circle cx={X(0)} cy={Y(0)} r="6" fill={cir.ok ? GOLD : ROSE} />
        <circle cx={X(0)} cy={Y(0)} r="12" fill="none" stroke={cir.ok ? GOLD : ROSE} strokeWidth="1" opacity="0.5" />
      </motion.g>
      <text x={X(0.6)} y={Y(-0.5)} fontSize="9" className="mono" fill={CYAN}>Q curved</text>
      <text x={X(-0.28)} y={Y(0.1)} fontSize="9" className="mono" fill={GOLD}>L flat</text>
      <text x={W / 2} y={H - 5} textAnchor="middle" fontSize="8.5" className="mono" fill={DIM}>x = E₀₀=E₀₁=E₁₀ &nbsp;·&nbsp; y = E₁₁ &nbsp;·&nbsp; C = 3x − y</text>
    </svg>
  );

  const slider = (
    <div>
      <div className="flex justify-between mono text-[9.5px] mb-1">
        <span className="text-faint">witness plane 3x − y = C</span>
        <span style={{ color: witness <= LOCAL_BOUND ? GOLD : witness <= TSIRELSON ? CYAN : VIOLET }}>{fmt(witness, 4)}</span>
      </div>
      <input type="range" min={0} max={4} step={0.005} value={witness} onChange={(e) => setWitness(parseFloat(e.target.value))} className="kcbs-range" aria-label="witness" />
      <div className="flex flex-wrap gap-1.5">
        {([["2 · pierces L", LOCAL_BOUND, GOLD], ["2√2 · tangent", TSIRELSON, NEON], ["4 · PR", PR_BOUND, VIOLET]] as const).map(([l, v, c]) => (
          <button key={l} onClick={() => setWitness(v)} className="chip !py-1 !px-2.5 !text-[9px] cursor-pointer"
            style={Math.abs(witness - v) < 0.01 ? { color: c, borderColor: c + "88", background: c + "18" } : undefined}>{l}</button>
        ))}
      </div>
    </div>
  );

  if (compact) return <div className="space-y-2">{plot}{slider}</div>;

  return (
    <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-5">
      <div className="space-y-3">{plot}{slider}</div>
      <div className="space-y-3">
        <div className="rounded-xl border border-line bg-white/[0.02] px-4 py-3">
          <div className="mono text-[9px] tracking-[0.2em] text-faint mb-2">BOUNDARIES IN THIS SLICE</div>
          <div className="mono text-[9.5px] mb-1" style={{ color: GOLD }}>classical (flat)</div>
          <TeX block className="!text-[0.78rem]">{"3x-y=2 \\iff y = 3x-2"}</TeX>
          <div className="mono text-[9.5px] mb-1 mt-2" style={{ color: CYAN }}>quantum (curved)</div>
          <TeX block className="!text-[0.78rem]">{"3\\arcsin x-\\arcsin y=\\pi \\iff y = 4x^3-3x"}</TeX>
        </div>
        <div className="rounded-xl border border-line bg-white/[0.02] px-4 py-3">
          <div className="mono text-[9px] tracking-[0.2em] text-faint mb-2">TANGENCY IS EXACT</div>
          {([["slope 12x²−3 at 1/√2", fmt(elliptopeQSlope(tx), 5), true], ["witness slope", "3.00000", true],
             ["y(1/√2)", fmt(ty, 5), true], ["C = 3x−y", fmt(3 * tx - ty, 5), true],
             ["classical y at 1/√2", fmt(elliptopeL(tx), 5), false]] as const).map(([l, v, hl], i) => (
            <div key={i} className="flex justify-between gap-2 border-b border-line/50 py-1">
              <span className="mono text-[10px] text-faint">{l}</span>
              <span className={cn("mono text-[10px]", hl ? "text-quantum" : "text-gold")}>{v}</span>
            </div>
          ))}
        </div>
        <div className={cn("rounded-xl border px-4 py-3", cir.ok ? "border-quantum/40 bg-quantum/[0.05]" : "border-rose/45 bg-rose/[0.06]")}>
          <div className="mono text-[9px] tracking-[0.2em] text-faint mb-1.5">CIREL'SON CRITERION</div>
          <TeX block className="!text-[0.72rem]">{"\\left|\\sum\\arcsin E_{xy}\\right| \\le \\pi"}</TeX>
          <div className="mono text-[12px]" style={{ color: cir.ok ? CYAN : ROSE }}>
            {fmt(cir.value / Math.PI, 5)}π — {cir.ok ? "realizable" : "outside Q"}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================= W4 ======================= */
function WindowNPA({ cfg, compact, sweepE, setSweepE }: {
  cfg: LabCfg; compact: boolean; sweepE: number; setSweepE: (v: number) => void;
}) {
  const M = useMemo(() => momentMatrix(cfg), [cfg]);
  const sym = useMemo(() => symMoment(sweepE), [sweepE]);
  const labels = ["𝕀", "A₀", "A₁", "B₀", "B₁"];
  const mx = Math.max(...M.G.flat().map(Math.abs), 1);

  const bars = (
    <svg viewBox="0 0 400 200" className="w-full">
      {(() => {
        const base = 132, sc = 36;
        return (
          <>
            <rect x={26} y={base} width={366} height={44} fill="rgba(251,92,122,0.07)" />
            <line x1={26} x2={392} y1={base} y2={base} stroke="rgba(236,231,219,0.3)" />
            <text x={18} y={base + 3.5} textAnchor="end" fontSize="8.5" className="mono" fill={DIM}>0</text>
            {[1, 2].map((t) => (
              <Fragment key={t}>
                <line x1={26} x2={392} y1={base - t * sc} y2={base - t * sc} stroke="rgba(236,231,219,0.06)" />
                <text x={18} y={base - t * sc + 3.5} textAnchor="end" fontSize="8.5" className="mono" fill={DIM}>{t}</text>
              </Fragment>
            ))}
            {sym.eig.map((e, i) => {
              const w = 58, x = 48 + i * 86, h = Math.abs(e) * sc, neg = e < -1e-9;
              return (
                <g key={i}>
                  <motion.rect x={x} width={w} rx="4" animate={{ y: neg ? base : base - h, height: Math.max(1.5, h) }}
                    transition={{ type: "spring", stiffness: 200, damping: 22 }}
                    fill={neg ? "rgba(251,92,122,0.35)" : "rgba(111,220,247,0.3)"} stroke={neg ? ROSE : CYAN} strokeWidth="1.3" />
                  <motion.text x={x + w / 2} textAnchor="middle" fontSize="9.5" className="mono" fill={neg ? ROSE : CYAN}
                    animate={{ y: neg ? base + h + 14 : base - h - 6 }} transition={{ type: "spring", stiffness: 200, damping: 22 }}>
                    {fmt(e, 4)}
                  </motion.text>
                  <text x={x + w / 2} y={base + 58} textAnchor="middle" fontSize="8.5" className="mono" fill={DIM}>λ{i + 1}</text>
                </g>
              );
            })}
          </>
        );
      })()}
    </svg>
  );

  const sweep = (
    <div>
      <div className="flex justify-between mono text-[9.5px] mb-1">
        <span className="text-faint">symmetric sweep E &nbsp;(C = 4E)</span>
        <span style={{ color: sym.lambdaMin < -1e-9 ? ROSE : CYAN }}>E={fmt(sweepE, 4)} · C={fmt(sym.C, 4)}</span>
      </div>
      <input type="range" min={0} max={1} step={0.002} value={sweepE} onChange={(e) => setSweepE(parseFloat(e.target.value))} className="kcbs-range" aria-label="E" />
      <div className="flex flex-wrap gap-1.5">
        {([["½ · C=2", 0.5, GOLD], ["1/√2 · C=2√2", 1 / Math.SQRT2, NEON], ["1 · PR", 1, VIOLET]] as const).map(([l, v, c]) => (
          <button key={l} onClick={() => setSweepE(v)} className="chip !py-1 !px-2.5 !text-[9px] cursor-pointer"
            style={Math.abs(sweepE - v) < 0.003 ? { color: c, borderColor: c + "88", background: c + "18" } : undefined}>{l}</button>
        ))}
      </div>
    </div>
  );

  const verdict = (
    <div className={cn("rounded-xl border px-4 py-3", sym.lambdaMin < -1e-9 ? "border-rose/50 bg-rose/[0.07]" : "border-quantum/40 bg-quantum/[0.05]")}>
      {sym.lambdaMin < -1e-9 ? (
        <>
          <div className="mono text-[9.5px] tracking-[0.2em] text-rose mb-1 flex items-center gap-1.5"><TriangleAlert size={11} /> GRAM MATRIX NON-POSITIVE</div>
          <p className="text-[11.5px] text-muted leading-relaxed">λ_min = 1−√2E = <span className="mono text-rose">{fmt(sym.lambdaMin, 5)}</span> &lt; 0 ⟹ ‖Ô|ψ⟩‖² &lt; 0. No Hilbert space produces C = {fmt(sym.C, 4)}.</p>
        </>
      ) : (
        <>
          <div className="mono text-[9.5px] tracking-[0.2em] text-quantum mb-1 flex items-center gap-1.5"><Check size={11} /> Γ ⪰ 0 — INSIDE THE PSD CONE</div>
          <p className="text-[11.5px] text-muted leading-relaxed">λ = 1 ± √2E (doubly degenerate) ⟹ E ≤ 1/√2 ⟹ C ≤ 2√2{Math.abs(sweepE - 1 / Math.SQRT2) < 2e-3 && <span className="text-quantum"> — exactly at the wall.</span>}</p>
        </>
      )}
    </div>
  );

  const grid = (
    <div className="inline-block">
      <div className="grid" style={{ gridTemplateColumns: "22px repeat(5, 1fr)", gap: 2.5 }}>
        <div />
        {labels.map((l) => <div key={l} className="mono text-[8px] text-faint text-center pb-0.5">{l}</div>)}
        {M.G.map((row, i) => (
          <Fragment key={i}>
            <div className="mono text-[8px] text-faint flex items-center justify-end pr-1">{labels[i]}</div>
            {row.map((v, j) => {
              const t = Math.abs(v) / mx;
              return (
                <div key={j} className="rounded-[4px] flex items-center justify-center mono"
                  style={{
                    aspectRatio: "1", fontSize: 8,
                    background: Math.abs(v) < 1e-9 ? "rgba(255,255,255,0.03)" : v > 0 ? `rgba(111,220,247,${0.07 + t * 0.32})` : `rgba(251,92,122,${0.07 + t * 0.32})`,
                    border: `1px solid ${i === j ? "rgba(232,180,92,0.4)" : "rgba(236,231,219,0.07)"}`,
                    color: Math.abs(v) < 1e-9 ? "rgba(143,141,156,0.55)" : "rgba(236,231,219,0.95)",
                  }}>
                  {Math.abs(v) < 5e-4 ? "0" : v.toFixed(2).replace("-", "−")}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className="grid grid-cols-[0.8fr_1.2fr] gap-3 items-start">
        <div className="space-y-2">
          {grid}
          <Gauge label="λ_min(Γ) YOUR CONFIG" value={fmt(M.lambdaMin, 5)} tone={M.psd ? CYAN : ROSE} note={M.psd ? "PSD ✓" : "non-physical"} tiny />
        </div>
        <div className="space-y-2">{bars}{sweep}</div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-5">
      <div className="space-y-3">
        {grid}
        <div className="rounded-xl border border-line bg-white/[0.02] px-4 py-3">
          <div className="mono text-[9px] tracking-[0.2em] text-faint mb-1.5">WHY Γ ⪰ 0 IS FORCED</div>
          <TeX block className="!text-[0.74rem]">{"\\vec c^{\\,\\dagger}\\Gamma\\vec c = \\big\\|\\textstyle\\sum_j c_j\\hat O_j|\\psi\\rangle\\big\\|^2 \\ge 0"}</TeX>
          <p className="text-[11.5px] text-muted leading-relaxed mt-1.5">Γ is the Gram matrix of the vectors Ôⱼ|ψ⟩. A negative eigenvalue means a negative norm — NPA level 1 already gives the exact CHSH bound.</p>
        </div>
        <Gauge label="λ_min(Γ) YOUR CONFIG" value={fmt(M.lambdaMin, 6)} tone={M.psd ? CYAN : ROSE} note={M.psd ? "Γ ⪰ 0 realizable" : "NOT PSD"} />
      </div>
      <div className="space-y-3">{bars}{sweep}{verdict}</div>
    </div>
  );
}

/* ======================= control dock ======================= */
/* NOTE: Slider lives at module scope. Defining it inside Dock would create a
   new component type on every render, remounting the <input> mid-drag. */
function Slider({ label, value, min, max, step, onChange, color, unit }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; color: string; unit?: string;
}) {
  return (
    <div>
      <div className="flex justify-between mono text-[9px] mb-0.5">
        <span className="text-faint truncate">{label}</span>
        <span style={{ color }}>{fmt(value, unit === "°" ? 1 : 3)}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))} className="kcbs-range !h-5" aria-label={label} />
    </div>
  );
}

function Dock({ g, setG, theta, setTheta, p, setP, cfg }: {
  g: Angles; setG: (a: Angles) => void; theta: number; setTheta: (v: number) => void;
  p: number; setP: (v: number) => void; cfg: LabCfg;
}) {
  const C = labC(cfg);
  const D = sosDefect(cfg);
  const M = momentMatrix(cfg);
  const P = parallelogram(g);
  const hM = horodeckiMax(cfg);
  const atMax = Math.abs(C - TSIRELSON) < 1e-6;
  const cTone = C > TSIRELSON + 1e-9 ? ROSE : C > LOCAL_BOUND ? CYAN : GOLD;

  return (
    <div className="sticky top-0 z-20 -mx-6 px-6 pt-1 pb-3 bg-panel/92 backdrop-blur-xl border-b border-line">
      <div className="grid lg:grid-cols-[1.35fr_1fr] gap-x-6 gap-y-2 items-start">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-x-3 gap-y-1">
          <Slider label="Schmidt θ" value={deg(theta)} min={0} max={90} step={0.25} onChange={(v) => setTheta(rad(v))} color={VIOLET} unit="°" />
          <Slider label="visibility p" value={p} min={0} max={1} step={0.005} onChange={setP} color={VIOLET} />
          {ANGLE_KEYS.map((k) => (
            <Slider key={k} label={ANGLE_LABEL[k]} value={deg(g[k])} min={-180} max={180} step={0.25}
              onChange={(v) => setG({ ...g, [k]: rad(v) })} color={ANGLE_COLOR[k]} unit="°" />
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Gauge label="⟨C⟩" value={fmt(C, 5)} tone={cTone} note={atMax ? "MAX 2√2" : C > LOCAL_BOUND ? "violates" : "local"} tiny />
          <Gauge label="DEFECT" value={fmt(D.defect, 5)} tone={D.defect < 1e-6 ? NEON : GOLD} tiny />
          <Gauge label="λ_min Γ" value={fmt(M.lambdaMin, 5)} tone={M.psd ? CYAN : ROSE} tiny />
          <Gauge label="u²+v²" value={fmt(P.invariant, 4)} tone={NEON} note="≡ 4" tiny />
        </div>
      </div>

      {/* CHSH ruler */}
      <div className="mt-2 flex items-center gap-3">
        <div className="relative flex-1 h-2 rounded-full bg-white/[0.06] overflow-visible">
          {([[LOCAL_BOUND, GOLD, "2"], [TSIRELSON, NEON, "2√2"], [PR_BOUND, VIOLET, "4"]] as const).map(([v, c, l]) => (
            <div key={l} className="absolute -top-0.5 bottom-[-2px] w-px" style={{ left: `${(v / 4.3) * 100}%`, background: c }}>
              <span className="absolute -top-3.5 -translate-x-1/2 mono text-[8px]" style={{ color: c }}>{l}</span>
            </div>
          ))}
          <motion.div className="absolute inset-y-0 left-0 rounded-full"
            animate={{ width: `${(clamp(Math.abs(C), 0, 4.3) / 4.3) * 100}%` }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
            style={{ background: `linear-gradient(90deg, ${GOLD}, ${cTone})` }} />
        </div>
        <span className="mono text-[9.5px] shrink-0" style={{ color: VIOLET }}>state max {fmt(hM, 4)}</span>
        <button onClick={() => { setG(OPTIMAL_ANGLES); setTheta(Math.PI / 4); setP(1); }}
          className={cn("chip !py-1 !px-3 !text-[9.5px] shrink-0 transition-all",
            atMax && p === 1 ? "!text-quantum !border-quantum/50 !bg-quantum/10" : "!text-ink hover:!text-quantum hover:!border-quantum/60 cursor-pointer")}>
          <Crosshair size={10} /> canonical
        </button>
      </div>
    </div>
  );
}

/* ======================= the lab ======================= */
const META: Record<WinId, { n: string; label: string; sub: string; icon: React.ReactNode }> = {
  vec: { n: "W1", label: "Parallelogram law", sub: "Cauchy–Schwarz · u²+v² ≡ 4", icon: <Ruler size={12} /> },
  sos: { n: "W2", label: "SOS defect", sub: "positive squares · self-testing", icon: <Sigma size={12} /> },
  ell: { n: "W3", label: "Quantum elliptope", sub: "curved boundary · tangency", icon: <Spline size={12} /> },
  npa: { n: "W4", label: "NPA spectrum", sub: "moment matrix · PSD cone", icon: <Activity size={12} /> },
};
const ORDER: WinId[] = ["vec", "sos", "ell", "npa"];

/** Module scope on purpose — a nested definition would remount on every render. */
function Panel({
  id, focused, onToggle, badge, children,
}: {
  id: WinId; focused: boolean; onToggle: () => void;
  badge: { v: string; c: string }; children: React.ReactNode;
}) {
  const m = META[id];
  return (
    <div className={cn("rounded-2xl border bg-white/[0.015] overflow-hidden", focused ? "border-quantum/45" : "border-line")}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 border-b border-line hover:bg-white/[0.03] transition-colors cursor-pointer text-left"
      >
        <span style={{ color: focused ? CYAN : "#8f8d9c" }}>{m.icon}</span>
        <span className="min-w-0 flex-1">
          <span className="mono text-[8.5px] tracking-[0.18em] text-faint">{m.n}</span>
          <span className="block text-[12.5px] text-ink leading-tight truncate">{m.label}</span>
        </span>
        <span className="mono text-[9.5px] shrink-0 hidden sm:block" style={{ color: badge.c }}>{badge.v}</span>
        <span className="text-faint shrink-0">{focused ? <Minimize2 size={12} /> : <Expand size={12} />}</span>
      </button>
      <div className="p-3.5">{children}</div>
    </div>
  );
}

export function TsirelsonLab({ g, setG }: { g: Angles; setG: (a: Angles) => void }) {
  const [theta, setTheta] = useState(Math.PI / 4);
  const [p, setP] = useState(1);
  const [focus, setFocus] = useState<WinId | null>(null);
  const [witness, setWitness] = useState(TSIRELSON);
  const [sweepE, setSweepE] = useState(1 / Math.SQRT2);

  const cfg: LabCfg = { g, theta, p };
  const audit = signalingAudit(cfg);
  const D = sosDefect(cfg);
  const M = momentMatrix(cfg);
  const P = parallelogram(g);

  const badge = (id: WinId) => {
    if (id === "vec") return { v: `u+v = ${fmt(P.uPlusV, 4)}`, c: GOLD };
    if (id === "sos") return { v: `defect ${fmt(D.defect, 4)}`, c: D.defect < 1e-6 ? NEON : GOLD };
    if (id === "ell") return { v: `C = ${fmt(labC(cfg), 4)}`, c: CYAN };
    return { v: `λmin ${fmt(M.lambdaMin, 4)}`, c: M.psd ? CYAN : ROSE };
  };

  const render = (id: WinId, compact: boolean) => {
    if (id === "vec") return <WindowVec cfg={cfg} setG={setG} compact={compact} />;
    if (id === "sos") return <WindowSOS cfg={cfg} compact={compact} />;
    if (id === "ell") return <WindowEll cfg={cfg} compact={compact} witness={witness} setWitness={setWitness} />;
    return <WindowNPA cfg={cfg} compact={compact} sweepE={sweepE} setSweepE={setSweepE} />;
  };

  return (
    <div className="card p-6 pt-3">
      <Dock g={g} setG={setG} theta={theta} setTheta={setTheta} p={p} setP={setP} cfg={cfg} />

      <div className="flex flex-wrap items-center justify-between gap-2 mt-4 mb-3">
        <div className="mono text-[10px] tracking-[0.25em] text-faint flex items-center gap-2">
          <Waves size={12} className="text-quantum" /> FOUR INDEPENDENT ROUTES TO 2√2 — ALL LIVE
        </div>
        <div className="flex items-center gap-2">
          <span className="chip !py-1 !px-2.5 !text-[9px]"><Hand size={9} /> drag vectors in W1</span>
          <span className="chip !py-1 !px-2.5 !text-[9px]" style={{ color: audit.ok ? NEON : ROSE, borderColor: (audit.ok ? NEON : ROSE) + "55" }}>
            no-signaling {audit.ok ? "✓" : "✗"}
          </span>
          {focus && (
            <button onClick={() => setFocus(null)} className="chip !py-1 !px-2.5 !text-[9px] cursor-pointer hover:!text-ink">
              show all four
            </button>
          )}
        </div>
      </div>

      {focus ? (
        <div className="space-y-3">
          <Panel id={focus} focused onToggle={() => setFocus(null)} badge={badge(focus)}>
            {render(focus, false)}
          </Panel>
          <div className="grid md:grid-cols-3 gap-3">
            {ORDER.filter((i) => i !== focus).map((i) => (
              <Panel key={i} id={i} focused={false} onToggle={() => setFocus(i)} badge={badge(i)}>
                {render(i, true)}
              </Panel>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid xl:grid-cols-2 gap-3">
          {ORDER.map((i) => (
            <Panel key={i} id={i} focused={false} onToggle={() => setFocus(i)} badge={badge(i)}>
              {render(i, true)}
            </Panel>
          ))}
        </div>
      )}

      <div className="mt-5 rounded-xl border border-line bg-white/[0.02] px-4 py-3 flex gap-2.5">
        <Info size={13} className="text-gold shrink-0 mt-0.5" />
        <p className="text-[12px] text-muted leading-relaxed">
          Every panel reads the same state. Drag a vector tip in <span className="text-ink">W1</span>{" "}
          and watch the phase point slide along the quarter circle, the residual arrows in{" "}
          <span className="text-ink">W2</span> grow, the point in <span className="text-ink">W3</span>{" "}
          move toward the curved wall, and the Gram eigenvalues in{" "}
          <span className="text-ink">W4</span> respond — simultaneously. Click any header to enlarge
          it while the others keep running.
        </p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full mono text-[10.5px]">
          <thead>
            <tr className="text-faint text-[8.5px] tracking-[0.18em] border-b border-line">
              {["property", "classical L", "quantum Q", "no-signaling NS"].map((c) => (
                <th key={c} className="text-left font-normal py-2 pr-4 whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {([
              ["max CHSH", "2", "2√2 ≈ 2.828427", "4"],
              ["geometry", "flat facet polytope", "smooth elliptope", "affine polytope"],
              ["SOS defect", "≥ 0.8284", "≥ 0, hits 0", "< 0 — impossible"],
              ["Gram λ_min", "≥ 0", "≥ 0, = 0 at bound", "1−√2 ≈ −0.4142"],
              ["information causality", "preserved", "preserved", "violated"],
            ] as const).map((r, i) => (
              <tr key={i} className="border-b border-line/40">
                <td className="py-1.5 pr-4 text-faint">{r[0]}</td>
                <td className="py-1.5 pr-4 text-gold">{r[1]}</td>
                <td className="py-1.5 pr-4 text-quantum">{r[2]}</td>
                <td className="py-1.5 pr-4" style={{ color: VIOLET }}>{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
