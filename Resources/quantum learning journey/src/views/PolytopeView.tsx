import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import { motion } from "framer-motion";
import {
  ArrowRight, Check, ChevronRight, Info, PartyPopper, Ruler, Shuffle, X,
} from "lucide-react";
import { SectionHead, Reveal } from "../components/Section";
import { TeX } from "../components/TeX";
import { useCalc } from "../state/store";
import {
  monolithAssignments, computeFacets, slack, insidePolytope, signFlipAction,
  applyAction, sameFacet, edgeTable, simplexVolume, facetTeX, facetCorrTeX,
  monolithQuantumPoint, barycentric, mixVertices, cross, dot, type V3, type Facet,
} from "../lib/polytope";
import { fmt, clamp } from "../lib/kcbs";
import { cn } from "../utils/cn";

const GOLD = "#e8b45c";
const CYAN = "#6fdcf7";
const ROSE = "#fb5c7a";
const VIOLET = "#a78bfa";
const VC = ["#6fdcf7", "#e8b45c", "#a78bfa", "#fb5c7a"];

/* ======================= 3D ======================= */
function Tetra({
  vertices, facets, point, selected, onSelect, included, showPlane,
}: {
  vertices: V3[]; facets: Facet[]; point: V3; selected: number;
  onSelect: (i: number) => void; included: boolean[]; showPlane: boolean;
}) {
  const S = 1.15;
  const t3 = (v: V3): [number, number, number] => [v[0] * S, v[2] * S, v[1] * S];
  const inc = vertices.map((_, i) => i).filter((i) => included[i]);
  const inside = insidePolytope(facets, point);

  const cubeEdges = useMemo(() => {
    const c: [number, number, number][][] = [];
    for (const a of [-1, 1]) for (const b of [-1, 1]) {
      c.push([[-S, a * S, b * S], [S, a * S, b * S]]);
      c.push([[a * S, -S, b * S], [a * S, S, b * S]]);
      c.push([[a * S, b * S, -S], [a * S, b * S, S]]);
    }
    return c;
  }, [S]);

  const f = facets[selected];
  // big square patch lying in the selected facet's plane
  const planeQuad = useMemo(() => {
    const n = f.n as V3;
    const nn = Math.hypot(...n);
    const u: V3 = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    const e1 = cross(n, u), l1 = Math.hypot(...e1);
    const a1 = e1.map((v) => v / l1) as V3;
    const e2 = cross(n, a1), l2 = Math.hypot(...e2);
    const a2 = e2.map((v) => v / l2) as V3;
    const c0 = n.map((v) => (v * f.rhs) / (nn * nn)) as V3;
    const R = 2.0;
    return [
      [1, 1], [-1, 1], [-1, -1], [1, 1], [-1, -1], [1, -1],
    ].map(([s, t]) =>
      t3(c0.map((v, k) => v + s * R * a1[k] + t * R * a2[k]) as V3)
    );
  }, [f, S]);

  return (
    <group>
      {cubeEdges.map((e, i) => (
        <Line key={i} points={e} color="#ffffff" lineWidth={1} transparent opacity={0.07} />
      ))}
      {([["x₁", [1, 0, 0]], ["x₃", [0, 1, 0]], ["x₂", [0, 0, 1]]] as const).map(([l, d]) => (
        <group key={l}>
          <Line points={[[0, 0, 0], [d[0] * 1.65, d[1] * 1.65, d[2] * 1.65]]} color="#8f8d9c" lineWidth={1} transparent opacity={0.4} />
          <Html position={[d[0] * 1.8, d[1] * 1.8, d[2] * 1.8]} center distanceFactor={9} zIndexRange={[10, 0]}>
            <span className="mono text-[9px] text-faint">{l}</span>
          </Html>
        </group>
      ))}

      {/* extended facet plane */}
      {showPlane && (
        <mesh>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[new Float32Array(planeQuad.flat()), 3]} />
          </bufferGeometry>
          <meshBasicMaterial color={VC[selected]} transparent opacity={0.13} side={2} depthWrite={false} />
        </mesh>
      )}

      {/* hull faces — only when all 4 vertices present */}
      {inc.length === 4 &&
        facets.map((g, i) => (
          <mesh key={g.id} onPointerDown={(e) => { e.stopPropagation(); onSelect(i); }}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[new Float32Array(g.on.map((vi) => t3(vertices[vi])).flat()), 3]} />
            </bufferGeometry>
            <meshBasicMaterial color={VC[i]} transparent opacity={selected === i ? 0.3 : 0.09} side={2} depthWrite={false} />
          </mesh>
        ))}
      {inc.length === 3 && (
        <mesh>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[new Float32Array(inc.map((vi) => t3(vertices[vi])).flat()), 3]} />
          </bufferGeometry>
          <meshBasicMaterial color={CYAN} transparent opacity={0.2} side={2} depthWrite={false} />
        </mesh>
      )}

      {/* hull edges among included vertices */}
      {inc.map((i, a) =>
        inc.slice(a + 1).map((j) => (
          <Line key={`${i}-${j}`} points={[t3(vertices[i]), t3(vertices[j])]} color={GOLD} lineWidth={1.9} transparent opacity={0.9} />
        ))
      )}

      {vertices.map((v, i) => (
        <group key={i}>
          <mesh position={t3(v)}>
            <sphereGeometry args={[included[i] ? 0.058 : 0.03, 20, 20]} />
            <meshBasicMaterial color={included[i] ? VC[i] : "#3a3849"} />
          </mesh>
          <Html position={[t3(v)[0] * 1.22, t3(v)[1] * 1.22 + 0.05, t3(v)[2] * 1.22]} center distanceFactor={11} zIndexRange={[20, 0]}>
            <div className="mono whitespace-nowrap text-[9.5px]" style={{ color: included[i] ? VC[i] : "#5b5967" }}>
              v{i + 1}
            </div>
          </Html>
        </group>
      ))}

      <mesh position={t3(point)}>
        <sphereGeometry args={[0.075, 20, 20]} />
        <meshBasicMaterial color={inside ? "#7CFFB2" : ROSE} />
      </mesh>
      <mesh position={t3(point)}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={inside ? "#7CFFB2" : ROSE} transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ======================= view ======================= */
export function PolytopeView() {
  const { setView } = useCalc();
  const { rows, vertices } = useMemo(() => monolithAssignments(), []);
  const facets = useMemo(() => computeFacets(vertices), [vertices]);
  const edges = useMemo(() => edgeTable(vertices), [vertices]);
  const vol = useMemo(() => simplexVolume(vertices), [vertices]);
  const qp = monolithQuantumPoint();

  /* Panel A */
  const [sig, setSig] = useState<[number, number, number]>([1, 1, 1]);
  const [found, setFound] = useState<Set<number>>(new Set([0]));
  const xA: V3 = [sig[0] * sig[1], sig[1] * sig[2], sig[2] * sig[0]];
  const vIdx = vertices.findIndex((v) => v.every((c, i) => c === xA[i]));
  const partner = rows.find((r) => r.s.every((c, i) => c === -sig[i]))!;

  const toggle = (i: number) => {
    const next = sig.map((v, k) => (k === i ? -v : v)) as [number, number, number];
    setSig(next);
    const x: V3 = [next[0] * next[1], next[1] * next[2], next[2] * next[0]];
    const vi = vertices.findIndex((v) => v.every((c, k) => c === x[k]));
    setFound((s) => new Set(s).add(vi));
  };

  /* Panel B */
  const [included, setIncluded] = useState([true, true, true, true]);
  const [w, setW] = useState([0.25, 0.25, 0.25, 0.25]);
  const [useWeights, setUseWeights] = useState(true);
  const [pt, setPt] = useState<V3>([-1 / 3, -1 / 3, -1 / 3]);
  const activePt = useWeights ? mixVertices(vertices, w.map((v, i) => (included[i] ? v : 0))) : pt;
  const lam = barycentric(vertices, facets, activePt);
  const inside = insidePolytope(facets, activePt);

  /* Panel C */
  const [sel, setSel] = useState(0);
  const [stepC, setStepC] = useState(5);
  const [push, setPush] = useState(0);
  const [showPlane, setShowPlane] = useState(true);
  const f = facets[sel];
  const tri = f.on;
  const a0 = vertices[tri[0]];
  const u = vertices[tri[1]].map((v, i) => v - a0[i]) as V3;
  const ww = vertices[tri[2]].map((v, i) => v - a0[i]) as V3;
  const rawN = cross(u, ww);
  const centroid = [0, 1, 2].map((k) => tri.reduce((s, vi) => s + vertices[vi][k], 0) / 3) as V3;
  const probe = centroid.map((c, k) => c * (1 + push) + 0 * k) as V3;
  const probeSlack = slack(f, probe);

  /* Panel D */
  const [flip, setFlip] = useState<0 | 1 | 2 | null>(null);
  const action = flip === null ? null : signFlipAction(flip);
  const mapped = action ? applyAction(action, facets[0]) : null;
  const mappedTo = mapped ? facets.find((g) => sameFacet(mapped.n, mapped.rhs, g)) : null;

  const hullName = ["nothing", "a point", "an edge", "a triangle", "the tetrahedron"][
    included.filter(Boolean).length
  ];

  const STEPS_C = [
    { t: "pick three vertices", tex: `\\vec v_${tri[0] + 1}=(${vertices[tri[0]]}),\\; \\vec v_${tri[1] + 1}=(${vertices[tri[1]]}),\\; \\vec v_${tri[2] + 1}=(${vertices[tri[2]]})` },
    { t: "edge vectors", tex: `\\vec u = \\vec v_${tri[1] + 1}-\\vec v_${tri[0] + 1} = (${u}),\\quad \\vec w = \\vec v_${tri[2] + 1}-\\vec v_${tri[0] + 1} = (${ww})` },
    { t: "cross product, component by component", tex: `\\vec n = \\vec u\\times\\vec w = \\begin{pmatrix}(${u[1]})(${ww[2]})-(${u[2]})(${ww[1]}) \\\\ (${u[2]})(${ww[0]})-(${u[0]})(${ww[2]}) \\\\ (${u[0]})(${ww[1]})-(${u[1]})(${ww[0]})\\end{pmatrix} = (${rawN})` },
    { t: "scale to primitive integers, orient outward-in", tex: `(${rawN}) \\;\\propto\\; (${f.n})${f.flipped ? "\\quad(\\text{sign flipped})" : ""}` },
    { t: "find d by substituting a vertex on the plane", tex: `d = \\vec n\\cdot\\vec v_${tri[0] + 1} = ${f.rhs}` },
    { t: "check the excluded vertex satisfies ≥", tex: `\\vec n\\cdot\\vec v_${f.opposite + 1} = ${dot(f.n, vertices[f.opposite])} \\;\\ge\\; ${f.rhs}\\;\\checkmark` },
  ];

  return (
    <div className="px-5 md:px-8 py-7 max-w-[1500px] space-y-6">
      <SectionHead
        index="STAGE 1"
        kicker="The tetrahedron explorer"
        accent="gold"
        title={<>What can <span className="italic gold-grad">three coins</span> do?</>}
        lede={
          <>
            Three <TeX>{"\\pm1"}</TeX> observables, measured pairwise. Every classical strategy is
            a point <TeX>{"\\vec x = (\\langle S_1S_2\\rangle,\\langle S_2S_3\\rangle,\\langle S_3S_1\\rangle)"}</TeX>,
            and the set of <em>all</em> of them is a convex body whose boundaries are the laws of
            classical reality. Build it yourself: assignments → hull → facets → symmetry.
          </>
        }
      />

      {/* ============ A + 3D ============ */}
      <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-6">
        <Reveal className="card p-6">
          <div className="mono text-[10px] tracking-[0.25em] text-faint mb-4">
            PANEL A — DETERMINISTIC ASSIGNMENT BUILDER
          </div>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {sig.map((v, i) => (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={cn(
                  "rounded-xl border py-4 transition-all cursor-pointer active:scale-95",
                  v > 0 ? "border-gold/60 bg-gold/[0.10]" : "border-violet/60 bg-violet/[0.10]"
                )}
              >
                <div className="mono text-[10px] text-faint mb-1">S{i + 1}</div>
                <div className={cn("mono text-2xl", v > 0 ? "text-gold" : "text-violet")}>
                  {v > 0 ? "+1" : "−1"}
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-2 mono text-[11.5px] mb-4">
            {([["x₁ = S₁S₂", xA[0]], ["x₂ = S₂S₃", xA[1]], ["x₃ = S₃S₁", xA[2]]] as const).map(([l, v]) => (
              <div key={l} className="flex items-center justify-between border-b border-line/50 pb-1.5">
                <span className="text-faint">{l}</span>
                <span className={v > 0 ? "text-quantum" : "text-rose"}>{v > 0 ? "+1" : "−1"}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border px-4 py-3" style={{ borderColor: VC[vIdx] + "66", background: VC[vIdx] + "12" }}>
            <div className="mono text-[10px] text-faint mb-1">MAPS TO VERTEX</div>
            <div className="mono text-lg" style={{ color: VC[vIdx] }}>
              v{vIdx + 1} = ({xA.map((c) => (c > 0 ? "+1" : "−1")).join(", ")})
            </div>
            <div className="mono text-[10px] text-faint mt-2">
              so does ({partner.s.map((c) => (c > 0 ? "+" : "−")).join(",")}) — the global flip
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mono text-[10px] text-faint mb-2">
              <span>VERTICES DISCOVERED</span>
              <span className={found.size === 4 ? "text-quantum" : ""}>{found.size} / 4</span>
            </div>
            <div className="flex gap-2">
              {vertices.map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-1.5 rounded-full transition-all"
                  style={{ background: found.has(i) ? VC[i] : "rgba(255,255,255,0.07)" }}
                />
              ))}
            </div>
            {found.size === 4 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-quantum/45 bg-quantum/[0.07] px-4 py-3 mt-3 flex gap-2.5"
              >
                <PartyPopper size={14} className="text-quantum shrink-0 mt-0.5" />
                <p className="text-[12.5px] text-muted leading-relaxed">
                  All four found — and there are <span className="text-ink">no more</span>. Eight
                  assignments collapse to four points because only <em>relative</em> signs matter:{" "}
                  <TeX>{"(s_i)\\mapsto(-s_i)"}</TeX> leaves every product{" "}
                  <TeX>{"s_is_j"}</TeX> fixed.
                </p>
              </motion.div>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.05} className="card relative overflow-hidden min-h-[480px]">
          <div className="absolute inset-0">
            <Canvas camera={{ position: [3.2, 2.4, 3.2], fov: 42 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
              <Suspense fallback={null}>
                <Tetra
                  vertices={vertices} facets={facets} point={activePt}
                  selected={sel} onSelect={setSel} included={included} showPlane={showPlane}
                />
              </Suspense>
              <OrbitControls makeDefault enablePan={false} minDistance={2.6} maxDistance={9} autoRotate autoRotateSpeed={0.45} enableDamping />
            </Canvas>
          </div>
          <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-2">
            <span className="chip !bg-void/60 backdrop-blur">hull of {included.filter(Boolean).length} vertices = {hullName}</span>
            <span className={cn("chip !bg-void/60 backdrop-blur", inside ? "!text-[#7CFFB2] !border-[#7CFFB2]/40" : "!text-rose !border-rose/50")}>
              {inside ? <Check size={11} /> : <X size={11} />} point is {inside ? "inside" : "outside"}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-1.5">
            {facets.map((g, i) => (
              <button
                key={g.id} onClick={() => setSel(i)}
                className="chip !py-1 !px-2.5 !text-[9.5px] cursor-pointer backdrop-blur !bg-void/60"
                style={sel === i ? { color: VC[i], borderColor: VC[i] + "88" } : undefined}
              >
                {g.id}
              </button>
            ))}
            <button
              onClick={() => setShowPlane((s) => !s)}
              className={cn("chip !py-1 !px-2.5 !text-[9.5px] cursor-pointer backdrop-blur !bg-void/60 ml-auto", showPlane && "!text-quantum !border-quantum/50")}
            >
              extend plane
            </button>
          </div>
        </Reveal>
      </div>

      {/* ============ B ============ */}
      <Reveal className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="mono text-[10px] tracking-[0.25em] text-faint">
            PANEL B — CONVEX HULL BUILDER · MIXING = PROBABILISTIC STRATEGIES
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => setUseWeights(true)} className={cn("chip !py-1.5 !px-3 cursor-pointer", useWeights && "!text-quantum !border-quantum/55 !bg-quantum/10")}>weights λ</button>
            <button onClick={() => { setUseWeights(false); setPt(activePt); }} className={cn("chip !py-1.5 !px-3 cursor-pointer", !useWeights && "!text-quantum !border-quantum/55 !bg-quantum/10")}>free point</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-4">
          <div>
            <div className="mono text-[9px] tracking-[0.2em] text-faint mb-2">INCLUDE VERTICES IN THE HULL</div>
            {vertices.map((v, i) => (
              <button
                key={i}
                onClick={() => setIncluded((s) => s.map((b, k) => (k === i ? !b : b)))}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg px-3 py-2 mb-1.5 transition-all cursor-pointer border",
                  included[i] ? "border-line-bright bg-white/[0.04]" : "border-line opacity-45"
                )}
              >
                <span
                  className="w-3.5 h-3.5 rounded-[4px] shrink-0 flex items-center justify-center"
                  style={{ background: included[i] ? VC[i] : "transparent", border: `1px solid ${VC[i]}88` }}
                >
                  {included[i] && <Check size={9} className="text-void" />}
                </span>
                <span className="mono text-[11px]" style={{ color: included[i] ? VC[i] : "#5b5967" }}>
                  v{i + 1}
                </span>
                <span className="mono text-[10px] text-faint">({v.map((c) => (c > 0 ? "+" : "−")).join("")})</span>
              </button>
            ))}
            <p className="text-[11.5px] text-muted leading-relaxed mt-3">
              1 vertex → a point · 2 → an edge · 3 → a triangle · 4 → the full tetrahedron. The
              hull <em>is</em> the set of all classical mixtures.
            </p>
          </div>

          <div>
            <div className="mono text-[9px] tracking-[0.2em] text-faint mb-2">
              {useWeights ? "MIXING WEIGHTS (auto-normalized, Σλ = 1)" : "FREE COORDINATES"}
            </div>
            {useWeights
              ? w.map((v, i) => (
                  <div key={i} className={cn("mb-2", !included[i] && "opacity-40 pointer-events-none")}>
                    <div className="flex justify-between mono text-[10px] mb-0.5">
                      <span style={{ color: VC[i] }}>λ{i + 1}</span>
                      <span className="text-ink/80">{fmt(v / (w.reduce((a, b, k) => a + (included[k] ? b : 0), 0) || 1), 3)}</span>
                    </div>
                    <input
                      type="range" min={0} max={1} step={0.01} value={v}
                      onChange={(e) => { const q = parseFloat(e.target.value); setW((s) => s.map((x, k) => (k === i ? q : x))); }}
                      className="kcbs-range" aria-label={`weight ${i}`}
                    />
                  </div>
                ))
              : (["x₁", "x₂", "x₃"] as const).map((l, i) => (
                  <div key={l} className="mb-2">
                    <div className="flex justify-between mono text-[10px] mb-0.5">
                      <span className="text-faint">{l}</span>
                      <span className="text-quantum">{fmt(pt[i], 3)}</span>
                    </div>
                    <input
                      type="range" min={-1} max={1} step={0.01} value={pt[i]}
                      onChange={(e) => { const q = parseFloat(e.target.value); setPt((s) => s.map((x, k) => (k === i ? q : x)) as V3); }}
                      className="kcbs-range" aria-label={l}
                    />
                  </div>
                ))}
            <div className="flex flex-wrap gap-1.5 mt-3">
              <button onClick={() => { setUseWeights(true); setW([1, 1, 1, 1]); }} className="chip !py-1.5 !px-3 cursor-pointer hover:!text-ink">centre (0,0,0)</button>
              <button onClick={() => { setUseWeights(false); setPt(qp.x); }} className="chip !py-1.5 !px-3 cursor-pointer !text-quantum !border-quantum/40">quantum N=3</button>
              <button onClick={() => { setUseWeights(false); setPt([-1, -1, -1]); }} className="chip !py-1.5 !px-3 cursor-pointer hover:!text-rose">(−1,−1,−1)</button>
            </div>
          </div>

          <div>
            <div className="mono text-[9px] tracking-[0.2em] text-faint mb-2">CONVEX DECOMPOSITION — UNIQUE IN A SIMPLEX</div>
            <div className="mono text-[11px] mb-2 text-ink/85">
              x = ({activePt.map((v) => fmt(v, 3)).join(", ")})
            </div>
            {lam.map((l, i) => (
              <div key={i} className="flex items-center gap-2.5 mb-1.5">
                <span className="mono text-[10px] w-6" style={{ color: VC[i] }}>λ{i + 1}</span>
                <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.abs(l) * 100}%`, background: l < -1e-9 ? ROSE : VC[i] }}
                  />
                </div>
                <span className={cn("mono text-[10.5px] w-16 text-right", l < -1e-9 ? "text-rose" : "text-ink/85")}>
                  {fmt(l, 4)}
                </span>
              </div>
            ))}
            <div className="mono text-[10px] text-faint mt-2">Σλ = {fmt(lam.reduce((a, b) => a + b, 0), 6)}</div>
            <div className={cn("rounded-xl border px-4 py-3 mt-3", inside ? "border-[#7CFFB2]/40 bg-[#7CFFB2]/[0.06]" : "border-rose/45 bg-rose/[0.06]")}>
              <p className="text-[12px] text-muted leading-relaxed">
                {inside ? (
                  <>All weights ≥ 0 — this is a genuine <span className="text-[#7CFFB2]">probability distribution</span> over deterministic assignments. Classically reproducible.</>
                ) : (
                  <>A negative weight appears — no probability distribution reproduces this point. <span className="text-rose">Outside classical reality.</span></>
                )}
              </p>
            </div>
            <div className="rounded-xl border border-line bg-white/[0.02] px-4 py-2.5 mt-2">
              <p className="mono text-[10px] text-faint leading-relaxed">
                λᵢ = slack(Fᵢ, x) / 4 — the barycentric weight IS the normalized facet slack.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ============ C ============ */}
      <Reveal className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="mono text-[10px] tracking-[0.25em] text-faint">
            PANEL C — FACET INSPECTOR · CROSS-PRODUCT CALCULATOR
          </div>
          <div className="flex gap-1.5">
            {facets.map((g, i) => (
              <button
                key={g.id} onClick={() => { setSel(i); setStepC(5); }}
                className="chip !py-1 !px-2.5 !text-[9.5px] cursor-pointer"
                style={sel === i ? { color: VC[i], borderColor: VC[i] + "88", background: VC[i] + "18" } : undefined}
              >
                {g.id}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <div className="space-y-2">
              {STEPS_C.slice(0, stepC + 1).map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  className="rounded-xl border border-line bg-white/[0.02] px-4 py-3"
                >
                  <div className="mono text-[9px] tracking-[0.2em] text-faint mb-1.5">{i + 1}. {s.t.toUpperCase()}</div>
                  <TeX block className="!text-[0.8rem]">{s.tex}</TeX>
                </motion.div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setStepC((s) => Math.min(STEPS_C.length - 1, s + 1))}
                disabled={stepC >= STEPS_C.length - 1}
                className={cn("chip !py-2 !px-4 transition-all", stepC >= STEPS_C.length - 1 ? "!text-faint/40 cursor-default" : "!text-ink hover:!text-quantum hover:!border-quantum/60 cursor-pointer")}
              >
                next step <ChevronRight size={11} />
              </button>
              <button onClick={() => setStepC(0)} className="chip !py-2 !px-4 cursor-pointer hover:!text-ink">restart</button>
            </div>
            {stepC >= STEPS_C.length - 1 && (
              <div className="rounded-xl border px-4 py-3.5 mt-3" style={{ borderColor: VC[sel] + "66", background: VC[sel] + "12" }}>
                <div className="mono text-[9px] tracking-[0.2em] mb-1.5" style={{ color: VC[sel] }}>FACET INEQUALITY</div>
                <TeX block className="!text-[0.95rem]">{facetTeX(f)}</TeX>
                <TeX block className="!text-[0.78rem] text-muted">{facetCorrTeX(f)}</TeX>
              </div>
            )}
          </div>

          <div>
            <div className="mono text-[9px] tracking-[0.2em] text-faint mb-2">
              PUSH A TEST POINT THROUGH {f.id}
            </div>
            <input
              type="range" min={-0.6} max={1.4} step={0.01} value={push}
              onChange={(e) => setPush(parseFloat(e.target.value))}
              className="kcbs-range" aria-label="push"
            />
            <div
              className="rounded-xl border px-5 py-4 mt-2 transition-colors"
              style={{
                borderColor: probeSlack > 0.25 ? "#7CFFB233" : probeSlack > -1e-9 ? GOLD + "66" : ROSE + "88",
                background: probeSlack > 0.25 ? "rgba(124,255,178,0.05)" : probeSlack > -1e-9 ? "rgba(232,180,92,0.07)" : "rgba(251,92,122,0.08)",
              }}
            >
              <div className="mono text-[10px] text-faint mb-1">n·x − d</div>
              <div
                className="mono text-3xl"
                style={{ color: probeSlack > 0.25 ? "#7CFFB2" : probeSlack > -1e-9 ? GOLD : ROSE }}
              >
                {probeSlack >= 0 ? "+" : ""}{fmt(probeSlack, 4)}
              </div>
              <div className="mono text-[11px] mt-2" style={{ color: probeSlack > 0.25 ? "#7CFFB2" : probeSlack > -1e-9 ? GOLD : ROSE }}>
                {probeSlack > 0.25 ? "INSIDE — inequality satisfied" : probeSlack > -1e-9 ? "ON THE FACET — tight, saturating" : "OUTSIDE — classically impossible"}
              </div>
              <div className="h-2 rounded-full bg-white/[0.06] mt-3 relative overflow-hidden">
                <div
                  className="absolute inset-y-0 rounded-full transition-all"
                  style={{
                    left: "50%",
                    width: `${Math.min(50, Math.abs(probeSlack) * 22)}%`,
                    transform: probeSlack < 0 ? "translateX(-100%)" : undefined,
                    background: probeSlack > 0.25 ? "#7CFFB2" : probeSlack > -1e-9 ? GOLD : ROSE,
                  }}
                />
                <div className="absolute left-1/2 inset-y-0 w-px bg-white/30" />
              </div>
            </div>

            <div className="mono text-[9px] tracking-[0.2em] text-faint mt-5 mb-2">ALL FOUR FACETS · SLACK AT CURRENT HULL POINT</div>
            {facets.map((g, i) => {
              const s = slack(g, activePt);
              return (
                <div key={g.id} className="flex items-center gap-2.5 mb-1.5">
                  <span className="mono text-[10px] w-6" style={{ color: VC[i] }}>{g.id}</span>
                  <span className="mono text-[9.5px] text-faint flex-1 truncate">
                    ({g.n.map((c) => (c > 0 ? "+" : "−")).join("")})·x ≥ {g.rhs}
                  </span>
                  <div className="w-20 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${clamp((s / 4) * 100, 2, 100)}%`, background: s >= -1e-9 ? VC[i] : ROSE }} />
                  </div>
                  <span className={cn("mono text-[10px] w-14 text-right", s >= -1e-9 ? "text-ink/80" : "text-rose")}>
                    {s >= 0 ? "+" : ""}{fmt(s, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* ============ D + classification ============ */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Reveal className="card p-6">
          <div className="mono text-[10px] tracking-[0.25em] text-faint mb-3 flex items-center gap-2">
            <Shuffle size={12} className="text-violet" /> PANEL D — SYMMETRY DEMONSTRATOR
          </div>
          <p className="text-[12.5px] text-muted leading-relaxed mb-4">
            Flipping one physical variable <TeX>{"S_i\\mapsto-S_i"}</TeX> negates exactly the two
            correlators containing it. All four facets are one facet in disguise.
          </p>
          <div className="flex gap-2 mb-4">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                onClick={() => setFlip(flip === i ? null : (i as 0 | 1 | 2))}
                className={cn("chip !py-2 !px-4 cursor-pointer transition-all", flip === i ? "!text-violet !border-violet/60 !bg-violet/10" : "hover:!text-ink hover:!border-line-bright")}
              >
                flip S{i + 1}
              </button>
            ))}
          </div>
          {action && mapped ? (
            <div className="rounded-xl border border-violet/35 bg-violet/[0.05] px-4 py-3.5">
              <div className="mono text-[10px] text-faint mb-2">
                (x₁,x₂,x₃) → ({action.map((v, i) => `${v > 0 ? "+" : "−"}x${i + 1}`).join(", ")})
              </div>
              <TeX block className="!text-[0.84rem]">
                {`${facetTeX(facets[0])} \\;\\longmapsto\\; ${mapped.n.map((c, i) => `${c > 0 ? "+" : "-"}x_${i + 1}`).join(" ")} \\ge ${mapped.rhs}`}
              </TeX>
              <div className="mono text-[12px] mt-1" style={{ color: mappedTo ? VC[facets.indexOf(mappedTo)] : undefined }}>
                F₁ ⟶ {mappedTo ? mappedTo.id : "—"} ✓
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-line bg-white/[0.02] px-4 py-3 mono text-[11px] text-faint">
              pick a flip to see where F₁ lands
            </div>
          )}
          <p className="text-[12px] text-muted leading-relaxed mt-3">
            With the <TeX>{"S_3"}</TeX> coordinate permutations these generate a group of order 24
            — the tetrahedron's full rotation symmetry — acting <em>transitively</em> on facets.
          </p>
        </Reveal>

        <Reveal delay={0.05} className="card p-6">
          <div className="mono text-[10px] tracking-[0.25em] text-faint mb-3 flex items-center gap-2">
            <Ruler size={12} className="text-gold" /> CLASSIFICATION — COMPUTED INVARIANTS
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {([
              ["vertices", `${vertices.length}`, GOLD],
              ["edges", `${edges.length}`, GOLD],
              ["facets", `${facets.length}`, CYAN],
              ["V−E+F", `${vertices.length - edges.length + facets.length}`, VIOLET],
              ["edge len", fmt(edges[0].d, 4), CYAN],
              ["volume", fmt(vol, 4), VIOLET],
            ] as const).map(([l, v, c], i) => (
              <div key={i} className="rounded-xl border border-line bg-white/[0.02] px-3 py-2.5">
                <div className="mono text-[9px] tracking-[0.18em] text-faint mb-1">{l}</div>
                <div className="mono text-[14px]" style={{ color: c }}>{v}</div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-gold/30 bg-gold/[0.05] px-4 py-3 mb-3">
            <p className="text-[12.5px] text-muted leading-relaxed">
              All six distances equal <TeX>{"2\\sqrt2"}</TeX> ⟹ a <span className="text-gold">regular
              tetrahedron</span> — the alternating demicube inscribed in <TeX>{"[-1,1]^3"}</TeX>.
            </p>
          </div>
          <div className="rounded-xl border border-quantum/35 bg-quantum/[0.06] px-4 py-3.5">
            <div className="mono text-[10px] tracking-[0.2em] text-quantum mb-2">AND QUANTUM? IT CANNOT ESCAPE</div>
            <p className="text-[12.5px] text-muted leading-relaxed">
              For <TeX>{"N=3"}</TeX> orthogonality of all neighbouring pairs forces a full
              orthonormal basis, so the three observables commute. The best quantum point is{" "}
              <TeX>{"(-\\tfrac13,-\\tfrac13,-\\tfrac13)"}</TeX> — the exact centroid of facet{" "}
              <TeX>{"F_1"}</TeX>, slack{" "}
              <span className="mono text-quantum">{fmt(slack(facets[0], qp.x), 9)}</span>. It
              touches the wall and stops. You need an odd cycle with a gap:{" "}
              <TeX>{"N=5"}</TeX>.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <button onClick={() => setView("chsh")} className="chip !py-2 !px-4 cursor-pointer !text-ink hover:!text-quantum hover:!border-quantum/60 transition-colors">
                stage 2 · CHSH <ArrowRight size={11} />
              </button>
              <button onClick={() => setView("hierarchy")} className="chip !py-2 !px-4 cursor-pointer hover:!text-ink hover:!border-line-bright transition-colors">
                stage 3 · L ⊂ Q ⊂ NS <ArrowRight size={11} />
              </button>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal className="card !border-line px-6 py-4 flex items-start gap-3">
        <Info size={14} className="text-gold shrink-0 mt-0.5" />
        <p className="text-[12.5px] text-muted leading-relaxed">
          <span className="text-ink">Fixed by the physics, not by you:</span> the number of
          variables, the pairwise-product structure <TeX>{"x_k = \\langle S_iS_j\\rangle"}</TeX>,
          and the four vertices themselves. Those <em>are</em> the scenario — everything you can
          move above is a state, a mixture, or a viewpoint.
        </p>
      </Reveal>
    </div>
  );
}
