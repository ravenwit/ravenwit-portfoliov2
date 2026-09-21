import { windingInfo } from "../lib/kcbs";

const GOLD = "#e8b45c";
const CYAN = "#6fdcf7";
const ROSE = "#fb5c7a";
const DIM = "rgba(143,141,156,0.95)";

/** fixed vertex positions — identical for every wiring (the whole point) */
export function vertexPositions(N: number, cx: number, cy: number, R: number) {
  return Array.from({ length: N }, (_, j) => {
    const a = (2 * Math.PI * j) / N - Math.PI / 2;
    return [cx + R * Math.cos(a), cy + R * Math.sin(a)] as [number, number];
  });
}

/**
 * One circle of N fixed points, wired with step k.
 * `progress` ∈ [0, N] draws the walk edge by edge (fractional = partial edge).
 */
export function WiringCircle({
  N, k, cx, cy, R, progress = N, showArc = true, dimEdges = false,
}: {
  N: number; k: number; cx: number; cy: number; R: number;
  progress?: number; showArc?: boolean; dimEdges?: boolean;
}) {
  const info = windingInfo(N, k);
  const pos = vertexPositions(N, cx, cy, R);
  const good = info.obtuse;
  const col = good ? CYAN : ROSE;

  // walk edges
  const edges: { a: [number, number]; b: [number, number]; t: number }[] = [];
  for (let e = 0; e < N; e++) {
    const t = Math.max(0, Math.min(1, progress - e));
    if (t <= 0) continue;
    const from = pos[info.visitOrder[e]];
    const to = pos[info.visitOrder[e + 1]];
    edges.push({ a: from, b: [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t], t });
  }

  // arc marking the azimuthal separation of the first wired pair
  const a0 = -Math.PI / 2;
  const a1 = a0 + info.deltaRad;
  const AR = R * 0.34;
  const arc = `M ${cx + AR * Math.cos(a0)},${cy + AR * Math.sin(a0)} A ${AR} ${AR} 0 ${info.deltaRad > Math.PI ? 1 : 0} 1 ${cx + AR * Math.cos(a1)},${cy + AR * Math.sin(a1)}`;
  const mid = a0 + info.deltaRad / 2;

  return (
    <g>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(236,231,219,0.08)" strokeDasharray="2 6" />

      {/* radii to the first wired pair — these define the angle */}
      {showArc && (
        <>
          <line x1={cx} y1={cy} x2={pos[0][0]} y2={pos[0][1]} stroke={DIM} strokeWidth="1" strokeOpacity={0.5} />
          <line x1={cx} y1={cy} x2={pos[k % N][0]} y2={pos[k % N][1]} stroke={DIM} strokeWidth="1" strokeOpacity={0.5} />
          <path d={arc} fill="none" stroke={col} strokeWidth="1.4" strokeDasharray="3 3" />
          <text
            x={cx + AR * 1.42 * Math.cos(mid)} y={cy + AR * 1.42 * Math.sin(mid) + 4}
            textAnchor="middle" fontSize="12" className="mono" fill={col}
          >
            {info.deltaDeg}°
          </text>
        </>
      )}

      {/* the wired walk */}
      {edges.map((e, i) => (
        <line
          key={i}
          x1={e.a[0]} y1={e.a[1]} x2={e.b[0]} y2={e.b[1]}
          stroke={col} strokeWidth={dimEdges ? 1.4 : 2.1} strokeOpacity={dimEdges ? 0.45 : 0.95}
          strokeLinecap="round"
          style={{ filter: good && !dimEdges ? "drop-shadow(0 0 5px rgba(111,220,247,0.4))" : undefined }}
        />
      ))}

      {/* walking head */}
      {progress > 0 && progress < N && edges.length > 0 && (
        <circle cx={edges[edges.length - 1].b[0]} cy={edges[edges.length - 1].b[1]} r="5" fill="#fff" />
      )}

      {/* the five fixed rays — same in both wirings */}
      {pos.map(([x, y], j) => (
        <g key={j}>
          <circle cx={x} cy={y} r="6.5" fill="#0b0b14" stroke={GOLD} strokeWidth="1.6" />
          <circle cx={x} cy={y} r="2.6" fill={GOLD} />
          <text
            x={cx + (x - cx) * 1.17} y={cy + (y - cy) * 1.17 + 4}
            textAnchor="middle" fontSize="11" className="mono" fill="rgba(236,231,219,0.72)"
          >
            v{j + 1}
          </text>
        </g>
      ))}
    </g>
  );
}

/**
 * f(h) = (1−h²)cosΔφ + h² for several wirings on one axis.
 * The pentagon curve never touches zero — that is the impossibility proof.
 */
export function OverlapCurves({
  N, ks, x0, y0, w, hgt, hMark,
}: {
  N: number; ks: number[]; x0: number; y0: number; w: number; hgt: number; hMark?: number;
}) {
  const yMin = -1, yMax = 1;
  const X = (h: number) => x0 + h * w;
  const Y = (f: number) => y0 + ((yMax - f) / (yMax - yMin)) * hgt;

  return (
    <g>
      {/* zero axis + forbidden shading below */}
      <rect x={x0} y={Y(0)} width={w} height={y0 + hgt - Y(0)} fill="rgba(251,92,122,0.05)" />
      <line x1={x0} x2={x0 + w} y1={Y(0)} y2={Y(0)} stroke="rgba(236,231,219,0.4)" strokeWidth="1.2" />
      <text x={x0 - 8} y={Y(0) + 3.5} textAnchor="end" fontSize="10" className="mono" fill="rgba(236,231,219,0.6)">0</text>
      {[-1, 1].map((v) => (
        <text key={v} x={x0 - 8} y={Y(v) + 3.5} textAnchor="end" fontSize="10" className="mono" fill={DIM}>{v > 0 ? "+1" : "−1"}</text>
      ))}

      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={t}>
          <line x1={X(t)} x2={X(t)} y1={y0} y2={y0 + hgt} stroke="rgba(236,231,219,0.05)" />
          <text x={X(t)} y={y0 + hgt + 16} textAnchor="middle" fontSize="9.5" className="mono" fill={DIM}>{t}</text>
        </g>
      ))}
      <text x={x0 + w / 2} y={y0 + hgt + 34} textAnchor="middle" fontSize="9.5" className="mono" fill={DIM} letterSpacing="2">
        cone height h
      </text>

      {ks.map((k) => {
        const info = windingInfo(N, k);
        let d = "";
        for (let i = 0; i <= 100; i++) {
          const h = i / 100;
          const f = (1 - h * h) * info.cos + h * h;
          d += `${i ? "L" : "M"}${X(h).toFixed(1)},${Y(f).toFixed(1)}`;
        }
        const col = info.obtuse ? CYAN : ROSE;
        return (
          <g key={k}>
            <path d={d} fill="none" stroke={col} strokeWidth="2.2" />
            <text x={X(0.03)} y={Y(info.cos) - 9} fontSize="10.5" className="mono" fill={col}>
              {info.deltaDeg}° wiring
            </text>
            {info.obtuse && info.h != null && (
              <>
                <circle cx={X(info.h)} cy={Y(0)} r="6" fill="#0b0b14" stroke={col} strokeWidth="2" />
                <circle cx={X(info.h)} cy={Y(0)} r="2.2" fill={col} />
                <text x={X(info.h)} y={Y(0) + 26} textAnchor="middle" fontSize="10" className="mono" fill={col}>
                  root h = {info.h.toFixed(5)}
                </text>
              </>
            )}
            {!info.obtuse && (
              <text x={X(0.52)} y={Y(0.62)} fontSize="10" className="mono" fill={ROSE}>
                stays strictly above zero — no root, ever
              </text>
            )}
          </g>
        );
      })}

      {hMark !== undefined && (
        <line x1={X(hMark)} x2={X(hMark)} y1={y0} y2={y0 + hgt} stroke={GOLD} strokeWidth="1" strokeDasharray="3 3" opacity={0.7} />
      )}
    </g>
  );
}
