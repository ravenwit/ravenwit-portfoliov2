import { Suspense, useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Crosshair,
  Eye,
  EyeOff,
  Info,
  Layers,
  Move3d,
  PartyPopper,
  Ruler,
  ShieldAlert,
  Shuffle,
  Sparkles,
  X,
} from "lucide-react";
import { SectionHead, Reveal } from "../components/Section";
import { TeX } from "../components/TeX";
import { useCalc } from "../state/store";
import {
  monolithAssignments,
  computeFacets,
  slack,
  insidePolytope,
  signFlipAction,
  applyAction,
  sameFacet,
  edgeTable,
  simplexVolume,
  facetTeX,
  facetCorrTeX,
  monolithQuantumPoint,
  barycentric,
  mixVertices,
  cross,
  dot,
  allCubeCorners,
  computeOddInequalities,
  slackOdd,
  classifyPointRegion,
  type V3,
  type Facet,
  type CubeCorner,
  type OddInequality,
} from "../lib/polytope";
import { fmt, clamp } from "../lib/kcbs";
import { cn } from "../utils/cn";

const GOLD = "#e8b45c";
const CYAN = "#6fdcf7";
const ROSE = "#fb5c7a";
const VIOLET = "#a78bfa";
const VC = ["#6fdcf7", "#e8b45c", "#a78bfa", "#fb5c7a"];

/* ======================= DRAGGABLE PROBE POINT ======================= */
function DraggablePoint({
  point,
  S,
  inside,
  dragConstraint,
  onPointDrag,
  setIsDraggingPoint,
}: {
  point: V3;
  S: number;
  inside: boolean;
  dragConstraint: "camera" | "xy" | "xz" | "yz";
  onPointDrag: (pt: V3) => void;
  setIsDraggingPoint: (dragging: boolean) => void;
}) {
  const { camera, raycaster, gl } = useThree();
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Position in Three.js scene coordinates: [X, Y, Z] = [x1*S, x3*S, x2*S]
  const pos3D: [number, number, number] = [point[0] * S, point[2] * S, point[1] * S];

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setDragging(true);
    setIsDraggingPoint(true);
    gl.domElement.style.cursor = "grabbing";

    // Setup drag plane
    const plane = new THREE.Plane();
    const currentPos = new THREE.Vector3(pos3D[0], pos3D[1], pos3D[2]);

    if (dragConstraint === "xy") {
      // Math x1-x2 plane => in 3D (X, Z) with Y (x3) fixed
      plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), currentPos);
    } else if (dragConstraint === "xz") {
      // Math x1-x3 plane => in 3D (X, Y) with Z (x2) fixed
      plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1), currentPos);
    } else if (dragConstraint === "yz") {
      // Math x2-x3 plane => in 3D (Z, Y) with X (x1) fixed
      plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(1, 0, 0), currentPos);
    } else {
      // Camera facing plane
      const camDir = new THREE.Vector3();
      camera.getWorldDirection(camDir);
      plane.setFromNormalAndCoplanarPoint(camDir.negate(), currentPos);
    }

    const onPointerMove = (evt: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const intersection = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(plane, intersection)) {
        // Invert from 3D scene coordinates back to math coordinates:
        // scene X = x1 * S  => x1 = X / S
        // scene Y = x3 * S  => x3 = Y / S
        // scene Z = x2 * S  => x2 = Z / S
        const newX1 = clamp(intersection.x / S, -1.35, 1.35);
        const newX2 = clamp(intersection.z / S, -1.35, 1.35);
        const newX3 = clamp(intersection.y / S, -1.35, 1.35);
        onPointDrag([newX1, newX2, newX3]);
      }
    };

    const onPointerUp = () => {
      setDragging(false);
      setIsDraggingPoint(false);
      gl.domElement.style.cursor = hovered ? "grab" : "auto";
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  return (
    <group position={pos3D}>
      {/* Invisible enlarged hit target for effortless grab */}
      <mesh
        onPointerDown={handlePointerDown}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          gl.domElement.style.cursor = "grab";
        }}
        onPointerOut={() => {
          setHovered(false);
          if (!dragging) gl.domElement.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Core sphere */}
      <mesh>
        <sphereGeometry args={[0.078, 24, 24]} />
        <meshBasicMaterial color={inside ? "#7CFFB2" : ROSE} />
      </mesh>

      {/* Pulsing halo */}
      <mesh>
        <sphereGeometry args={[dragging ? 0.22 : hovered ? 0.17 : 0.14, 16, 16]} />
        <meshBasicMaterial
          color={inside ? "#7CFFB2" : ROSE}
          transparent
          opacity={dragging ? 0.45 : hovered ? 0.35 : 0.2}
          depthWrite={false}
        />
      </mesh>

      {/* Active dragging ring */}
      {(hovered || dragging) && (
        <group rotation={[Math.PI / 2, 0, 0]}>
          <Line
            points={Array.from({ length: 33 }).map((_, i) => {
              const a = (i / 32) * Math.PI * 2;
              return [Math.cos(a) * 0.24, Math.sin(a) * 0.24, 0];
            })}
            color={dragging ? "#e8b45c" : "#6fdcf7"}
            lineWidth={2}
          />
        </group>
      )}

      {/* 3D Coordinate Badge while dragging or hovering */}
      {(dragging || hovered) && (
        <Html position={[0, 0.3, 0]} center distanceFactor={8} zIndexRange={[50, 0]}>
          <div className="mono text-[10px] px-2.5 py-1 rounded-md bg-void/90 border border-line-bright backdrop-blur whitespace-nowrap text-ink shadow-2xl flex items-center gap-2 pointer-events-none">
            <span className={inside ? "text-[#7CFFB2]" : "text-rose"}>
              ({fmt(point[0], 3)}, {fmt(point[1], 3)}, {fmt(point[2], 3)})
            </span>
            <span className="text-faint text-[8.5px] uppercase font-semibold">
              {dragging ? "DRAGGING" : "MOUSE DRAG"}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ======================= 3D SCENE ======================= */
function Tetra({
  vertices,
  facets,
  odds,
  corners,
  point,
  selectedClassical,
  selectedOdd,
  activeFamily,
  onSelectClassical,
  onSelectOdd,
  included,
  showPlane,
  showDualCorners,
  showDualPolytope,
  selectedCorner,
  onSelectCorner,
  dragConstraint,
  onPointDrag,
  setIsDraggingPoint,
}: {
  vertices: V3[];
  facets: Facet[];
  odds: OddInequality[];
  corners: CubeCorner[];
  point: V3;
  selectedClassical: number;
  selectedOdd: number;
  activeFamily: "classical" | "odd";
  onSelectClassical: (i: number) => void;
  onSelectOdd: (i: number) => void;
  included: boolean[];
  showPlane: boolean;
  showDualCorners: boolean;
  showDualPolytope: boolean;
  selectedCorner: CubeCorner | null;
  onSelectCorner: (c: CubeCorner) => void;
  dragConstraint: "camera" | "xy" | "xz" | "yz";
  onPointDrag: (pt: V3) => void;
  setIsDraggingPoint: (dragging: boolean) => void;
}) {
  const { gl } = useThree();
  const S = 1.15;
  const t3 = (v: V3): [number, number, number] => [v[0] * S, v[2] * S, v[1] * S];
  const inc = vertices.map((_, i) => i).filter((i) => included[i]);
  const inside = insidePolytope(facets, point);

  // Hypercube [-1, 1]³ wireframe edges
  const cubeEdges = useMemo(() => {
    const c: [number, number, number][][] = [];
    for (const a of [-1, 1])
      for (const b of [-1, 1]) {
        c.push([[-S, a * S, b * S], [S, a * S, b * S]]);
        c.push([[a * S, -S, b * S], [a * S, S, b * S]]);
        c.push([[a * S, b * S, -S], [a * S, b * S, S]]);
      }
    return c;
  }, [S]);

  // Dual tetrahedron (T_odd) edges among c1..c4
  const dualEdges = useMemo(() => {
    const dualCorners = corners.filter((c) => !c.isClassical);
    const edges: [number, number, number][][] = [];
    for (let i = 0; i < dualCorners.length; i++) {
      for (let j = i + 1; j < dualCorners.length; j++) {
        edges.push([t3(dualCorners[i].x), t3(dualCorners[j].x)]);
      }
    }
    return edges;
  }, [corners, S]);

  // Plane quad for the active supporting hyperplane (classical facet or odd inequality)
  const planeQuad = useMemo(() => {
    const n = (activeFamily === "classical" ? facets[selectedClassical].n : odds[selectedOdd].n) as V3;
    const rhs = activeFamily === "classical" ? facets[selectedClassical].rhs : odds[selectedOdd].rhs;
    const nn = Math.hypot(...n);
    const u: V3 = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    const e1 = cross(n, u),
      l1 = Math.hypot(...e1);
    const a1 = e1.map((v) => v / l1) as V3;
    const e2 = cross(n, a1),
      l2 = Math.hypot(...e2);
    const a2 = e2.map((v) => v / l2) as V3;
    const c0 = n.map((v) => (v * rhs) / (nn * nn)) as V3;
    const R = 2.0;
    return [
      [1, 1],
      [-1, 1],
      [-1, -1],
      [1, 1],
      [-1, -1],
      [1, -1],
    ].map(([s, t]) => t3(c0.map((v, k) => v + s * R * a1[k] + t * R * a2[k]) as V3));
  }, [activeFamily, selectedClassical, selectedOdd, facets, odds, S]);

  // For odd inequality: line showing the classical vertex that violates it
  const violationLine = useMemo(() => {
    if (activeFamily !== "odd") return null;
    const odd = odds[selectedOdd];
    const vk = vertices[odd.violatingClassicalIdx];
    const n = odd.n;
    // Projection of vk onto plane: vk + (2/3) * n
    const proj: V3 = [
      vk[0] + (2 / 3) * n[0],
      vk[1] + (2 / 3) * n[1],
      vk[2] + (2 / 3) * n[2],
    ];
    return {
      vkPos: t3(vk),
      projPos: t3(proj),
      midPos: t3([(vk[0] + proj[0]) / 2, (vk[1] + proj[1]) / 2, (vk[2] + proj[2]) / 2]),
      vertexIdx: odd.violatingClassicalIdx,
      slackVal: odd.violationSlack,
    };
  }, [activeFamily, selectedOdd, odds, vertices, S]);

  return (
    <group>
      {/* Hypercube [-1, 1]³ boundary wireframe */}
      {cubeEdges.map((e, i) => (
        <Line key={`cube-${i}`} points={e} color="#ffffff" lineWidth={1} transparent opacity={0.07} />
      ))}

      {/* Dual frustrated tetrahedron T_odd wireframe */}
      {showDualPolytope &&
        dualEdges.map((e, i) => (
          <Line key={`dual-${i}`} points={e} color="#fb5c7a" lineWidth={1.4} transparent opacity={0.45} dashed dashScale={15} />
        ))}

      {/* Coordinate axes x₁, x₂, x₃ */}
      {([["x₁", [1, 0, 0]], ["x₃", [0, 1, 0]], ["x₂", [0, 0, 1]]] as const).map(([l, d]) => (
        <group key={l}>
          <Line points={[[0, 0, 0], [d[0] * 1.65, d[1] * 1.65, d[2] * 1.65]]} color="#8f8d9c" lineWidth={1} transparent opacity={0.35} />
          <Html position={[d[0] * 1.8, d[1] * 1.8, d[2] * 1.8]} center distanceFactor={9} zIndexRange={[10, 0]}>
            <span className="mono text-[9px] text-faint">{l}</span>
          </Html>
        </group>
      ))}

      {/* Supporting hyperplane (Classical Facet or Odd-Parity Inequality) */}
      {showPlane && (
        <mesh>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[new Float32Array(planeQuad.flat()), 3]} />
          </bufferGeometry>
          <meshBasicMaterial
            color={activeFamily === "classical" ? VC[selectedClassical] : ROSE}
            transparent
            opacity={activeFamily === "classical" ? 0.15 : 0.22}
            side={2}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Violation Line when inspecting an Odd-Parity Inequality */}
      {showPlane && violationLine && (
        <group>
          <Line
            points={[violationLine.vkPos, violationLine.projPos]}
            color={ROSE}
            lineWidth={2.5}
            dashed
            dashSize={0.06}
            gapSize={0.04}
          />
          <mesh position={violationLine.vkPos}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshBasicMaterial color={ROSE} transparent opacity={0.4} depthWrite={false} />
          </mesh>
          <Html position={violationLine.midPos} center distanceFactor={8} zIndexRange={[30, 0]}>
            <div className="mono text-[9px] bg-rose/90 text-white px-2 py-0.5 rounded shadow-lg border border-white/20 whitespace-nowrap">
              violation: {fmt(violationLine.slackVal, 1)} (forbidden)
            </div>
          </Html>
        </group>
      )}

      {/* Dual frustrated faces (when showDualPolytope or activeFamily === 'odd') */}
      {(showDualPolytope || activeFamily === "odd") &&
        odds.map((od, i) => {
          const dualCorners = corners.filter((c) => !c.isClassical);
          const facePts = od.onDual.map((idx) => t3(dualCorners[idx].x));
          return (
            <mesh
              key={`dual-face-${od.id}`}
              onPointerDown={(e) => {
                e.stopPropagation();
                onSelectOdd(i);
              }}
            >
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[new Float32Array(facePts.flat()), 3]}
                />
              </bufferGeometry>
              <meshBasicMaterial
                color={ROSE}
                transparent
                opacity={activeFamily === "odd" && selectedOdd === i ? 0.32 : 0.08}
                side={2}
                depthWrite={false}
              />
            </mesh>
          );
        })}

      {/* Classical hull faces — only when 4 vertices included */}
      {inc.length === 4 &&
        facets.map((g, i) => (
          <mesh
            key={g.id}
            onPointerDown={(e) => {
              e.stopPropagation();
              onSelectClassical(i);
            }}
          >
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[new Float32Array(g.on.map((vi) => t3(vertices[vi])).flat()), 3]} />
            </bufferGeometry>
            <meshBasicMaterial
              color={VC[i]}
              transparent
              opacity={activeFamily === "classical" && selectedClassical === i ? 0.32 : 0.08}
              side={2}
              depthWrite={false}
            />
          </mesh>
        ))}

      {/* Classical 3-vertex triangle slice */}
      {inc.length === 3 && (
        <mesh>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[new Float32Array(inc.map((vi) => t3(vertices[vi])).flat()), 3]} />
          </bufferGeometry>
          <meshBasicMaterial color={CYAN} transparent opacity={0.2} side={2} depthWrite={false} />
        </mesh>
      )}

      {/* Classical hull edges among included vertices */}
      {inc.map((i, a) =>
        inc.slice(a + 1).map((j) => (
          <Line key={`edge-${i}-${j}`} points={[t3(vertices[i]), t3(vertices[j])]} color={GOLD} lineWidth={2} transparent opacity={0.9} />
        ))
      )}

      {/* ALL 8 CUBE CORNERS (4 Classical v1..v4 + 4 Frustrated c1..c4) */}
      {corners.map((c) => {
        const isClassical = c.isClassical;
        if (!isClassical && !showDualCorners) return null;

        const classIdx = isClassical ? parseInt(c.id.replace("v", "")) - 1 : -1;
        const isIncludedInHull = isClassical ? included[classIdx] : false;
        const isSelected = selectedCorner?.id === c.id;
        const pos = t3(c.x);
        const col = isClassical ? VC[classIdx] : "#fb923c";

        return (
          <group key={c.id}>
            {/* Selection indicator halo */}
            {isSelected && (
              <mesh position={pos}>
                <sphereGeometry args={[0.13, 20, 20]} />
                <meshBasicMaterial color={col} transparent opacity={0.35} depthWrite={false} />
              </mesh>
            )}

            {/* Corner Sphere with interactive Click & Hover */}
            <mesh
              position={pos}
              onClick={(e) => {
                e.stopPropagation();
                onSelectCorner(c);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                gl.domElement.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                gl.domElement.style.cursor = "auto";
              }}
            >
              <sphereGeometry args={[isClassical ? (isIncludedInHull ? 0.065 : 0.035) : 0.052, 20, 20]} />
              <meshBasicMaterial color={isClassical ? (isIncludedInHull ? col : "#3a3849") : "#f97316"} wireframe={!isClassical} />
            </mesh>

            {/* Non-classical internal core */}
            {!isClassical && (
              <mesh position={pos}>
                <sphereGeometry args={[0.026, 16, 16]} />
                <meshBasicMaterial color={ROSE} />
              </mesh>
            )}

            {/* Interactive 3D Label Badge */}
            <Html position={[pos[0] * 1.25, pos[1] * 1.25 + 0.06, pos[2] * 1.25]} center distanceFactor={11} zIndexRange={[20, 0]}>
              <button
                onClick={() => onSelectCorner(c)}
                className={cn(
                  "mono whitespace-nowrap text-[9px] px-1.5 py-0.5 rounded cursor-pointer transition-all flex items-center gap-1 shadow-md",
                  isSelected ? "font-bold scale-110" : "opacity-85 hover:opacity-100",
                  isClassical ? "bg-void/85 border border-line" : "bg-void/85 border border-dashed border-rose/70 text-rose"
                )}
                style={{
                  color: isSelected ? "#ffffff" : isClassical ? (isIncludedInHull ? col : "#5b5967") : ROSE,
                  borderColor: isSelected ? col : undefined,
                  backgroundColor: isSelected ? col + "33" : undefined,
                }}
              >
                <span>{c.label}</span>
                {isSelected && <span className="w-1 h-1 rounded-full bg-quantum" />}
              </button>
            </Html>
          </group>
        );
      })}

      {/* Interactive Draggable Probe Point */}
      <DraggablePoint
        point={point}
        S={S}
        inside={inside}
        dragConstraint={dragConstraint}
        onPointDrag={onPointDrag}
        setIsDraggingPoint={setIsDraggingPoint}
      />
    </group>
  );
}

/* ======================= MAIN VIEW ======================= */
export function PolytopeView() {
  const { setView } = useCalc();
  const { rows, vertices } = useMemo(() => monolithAssignments(), []);
  const facets = useMemo(() => computeFacets(vertices), [vertices]);
  const odds = useMemo(() => computeOddInequalities(vertices), [vertices]);
  const corners = useMemo(() => allCubeCorners(vertices), [vertices]);
  const edges = useMemo(() => edgeTable(vertices), [vertices]);
  const vol = useMemo(() => simplexVolume(vertices), [vertices]);
  const qp = monolithQuantumPoint();

  /* Panel A: Spin Assignment Builder */
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

  /* Panel B: Convex Hull & Probe Point */
  const [included, setIncluded] = useState([true, true, true, true]);
  const [w, setW] = useState([0.25, 0.25, 0.25, 0.25]);
  const [useWeights, setUseWeights] = useState(true);
  const [pt, setPt] = useState<V3>([-1 / 3, -1 / 3, -1 / 3]);
  const [dragConstraint, setDragConstraint] = useState<"camera" | "xy" | "xz" | "yz">("camera");
  const [isDraggingPoint, setIsDraggingPoint] = useState(false);

  // Active Point coordinates
  const activePt: V3 = useWeights
    ? mixVertices(vertices, w.map((v, i) => (included[i] ? v : 0)))
    : pt;

  // Mathematical classification
  const lam = barycentric(vertices, facets, activePt);
  const inside = insidePolytope(facets, activePt);
  const pointRegion = classifyPointRegion(facets, odds, activePt);

  /* 3D Interactive Corner Inspector */
  const [selectedCorner, setSelectedCorner] = useState<CubeCorner | null>(null);
  const [showDualCorners, setShowDualCorners] = useState(true);
  const [showDualPolytope, setShowDualPolytope] = useState(false);

  /* Panel C: Inequality Explorer (Classical Facets vs Forbidden Odd-Parity) */
  const [activeFamily, setActiveFamily] = useState<"classical" | "odd">("classical");
  const [selClassical, setSelClassical] = useState(0);
  const [selOdd, setSelOdd] = useState(0);
  const [stepC, setStepC] = useState(5);
  const [push, setPush] = useState(0);
  const [showPlane, setShowPlane] = useState(true);

  // Classical facet data
  const f = facets[selClassical];
  const tri = f.on;
  const a0 = vertices[tri[0]];
  const u = vertices[tri[1]].map((v, i) => v - a0[i]) as V3;
  const ww = vertices[tri[2]].map((v, i) => v - a0[i]) as V3;
  const rawN = cross(u, ww);
  const centroid = [0, 1, 2].map((k) => tri.reduce((s, vi) => s + vertices[vi][k], 0) / 3) as V3;
  const probeClassical = centroid.map((c) => c * (1 + push)) as V3;
  const probeClassicalSlack = slack(f, probeClassical);

  // Odd inequality data
  const odd = odds[selOdd];
  const probeOddSlack = slackOdd(odd, activePt);

  /* Panel D: Symmetry Action */
  const [flip, setFlip] = useState<0 | 1 | 2 | null>(null);
  const action = flip === null ? null : signFlipAction(flip);
  const mapped = action ? applyAction(action, facets[0]) : null;
  const mappedTo = mapped ? facets.find((g) => sameFacet(mapped.n, mapped.rhs, g)) : null;

  const hullName = ["nothing", "a point", "an edge", "a triangle", "the tetrahedron"][
    included.filter(Boolean).length
  ];

  const STEPS_C = [
    {
      t: "pick three vertices",
      tex: `\\vec v_${tri[0] + 1}=(${vertices[tri[0]]}),\\; \\vec v_${tri[1] + 1}=(${vertices[tri[1]]}),\\; \\vec v_${tri[2] + 1}=(${vertices[tri[2]]})`,
    },
    {
      t: "edge vectors",
      tex: `\\vec u = \\vec v_${tri[1] + 1}-\\vec v_${tri[0] + 1} = (${u}),\\quad \\vec w = \\vec v_${tri[2] + 1}-\\vec v_${tri[0] + 1} = (${ww})`,
    },
    {
      t: "cross product, component by component",
      tex: `\\vec n = \\vec u\\times\\vec w = \\begin{pmatrix}(${u[1]})(${ww[2]})-(${u[2]})(${ww[1]}) \\\\ (${u[2]})(${ww[0]})-(${u[0]})(${ww[2]}) \\\\ (${u[0]})(${ww[1]})-(${u[1]})(${ww[0]})\\end{pmatrix} = (${rawN})`,
    },
    {
      t: "scale to primitive integers, orient outward-in",
      tex: `(${rawN}) \\;\\propto\\; (${f.n})${f.flipped ? "\\quad(\\text{sign flipped})" : ""}`,
    },
    {
      t: "find d by substituting a vertex on the plane",
      tex: `d = \\vec n\\cdot\\vec v_${tri[0] + 1} = ${f.rhs}`,
    },
    {
      t: "check the excluded vertex satisfies ≥",
      tex: `\\vec n\\cdot\\vec v_${f.opposite + 1} = ${dot(f.n, vertices[f.opposite])} \\;\\ge\\; ${f.rhs}\\;\\checkmark`,
    },
  ];

  // Odd-parity step explanation
  const STEPS_ODD = [
    {
      t: "parity invariance of classical observables",
      tex: `S_1, S_2, S_3 \\in \\{\\pm1\\} \\implies (S_1S_2)(S_2S_3)(S_3S_1) = S_1^2 S_2^2 S_3^2 \\equiv +1`,
    },
    {
      t: "the odd-parity normal vector",
      tex: `\\vec n = (${odd.n.join(",\\;")}) \\quad [${odd.minusCount}\\text{ minus sign}${odd.minusCount > 1 ? "s" : ""}, \\; \\prod n_i = -1]`,
    },
    {
      t: "evaluate against the opposing classical vertex",
      tex: `\\vec n \\cdot \\vec v_${odd.violatingClassicalIdx + 1} = (${odd.n.join(",")})\\cdot(${vertices[odd.violatingClassicalIdx].join(",")}) = -3 < -1`,
    },
    {
      t: "strict classical violation",
      tex: `\\text{Slack} = \\vec n \\cdot \\vec v_${odd.violatingClassicalIdx + 1} - (-1) = -3 - (-1) = -2.000 < 0 \\quad (\\text{FORBIDDEN})`,
    },
    {
      t: "dual facet interpretation",
      tex: `${odd.tex} \\iff ${odd.dualTex} \\quad [\\text{Facet of dual frustrated polytope } T_{\\text{odd}}]`,
    },
  ];

  return (
    <div className="px-5 md:px-8 py-7 max-w-[1550px] space-y-6">
      <SectionHead
        index="STAGE 1"
        kicker="The tetrahedron & correlation cube explorer"
        accent="gold"
        title={<>What can <span className="italic gold-grad">three coins</span> do?</>}
        lede={
          <>
            Three <TeX>{"\\pm1"}</TeX> observables, measured pairwise. Every classical strategy is
            a point <TeX>{"\\vec x = (\\langle S_1S_2\\rangle,\\langle S_2S_3\\rangle,\\langle S_3S_1\\rangle) \\in [-1, 1]^3"}</TeX>.
            Explore the 8 corners of the correlation cube, drag the probe point directly with your mouse in 3D, and inspect the boundary between classical reality (even parity) and forbidden frustrated inequalities (odd parity).
          </>
        }
      />

      {/* ============ A + 3D VIEWPORT ============ */}
      <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-6">
        {/* PANEL A */}
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
                <div className={cn("mono text-2xl font-semibold", v > 0 ? "text-gold" : "text-violet")}>
                  {v > 0 ? "+1" : "−1"}
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-2 mono text-[11.5px] mb-4">
            {([
              ["x₁ = S₁S₂", xA[0]],
              ["x₂ = S₂S₃", xA[1]],
              ["x₃ = S₃S₁", xA[2]],
            ] as const).map(([l, v]) => (
              <div key={l} className="flex items-center justify-between border-b border-line/50 pb-1.5">
                <span className="text-faint">{l}</span>
                <span className={v > 0 ? "text-quantum font-semibold" : "text-rose font-semibold"}>
                  {v > 0 ? "+1" : "−1"}
                </span>
              </div>
            ))}
          </div>

          <div
            className="rounded-xl border px-4 py-3"
            style={{ borderColor: VC[vIdx] + "66", background: VC[vIdx] + "12" }}
          >
            <div className="mono text-[10px] text-faint mb-1">MAPS TO CLASSICAL VERTEX</div>
            <div className="mono text-lg font-bold" style={{ color: VC[vIdx] }}>
              v{vIdx + 1} = ({xA.map((c) => (c > 0 ? "+1" : "−1")).join(", ")})
            </div>
            <div className="mono text-[10px] text-faint mt-2">
              so does ({partner.s.map((c) => (c > 0 ? "+" : "−")).join(",")}) — the global sign flip
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mono text-[10px] text-faint mb-2">
              <span>CLASSICAL VERTICES DISCOVERED</span>
              <span className={found.size === 4 ? "text-quantum font-bold" : ""}>
                {found.size} / 4
              </span>
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
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-quantum/45 bg-quantum/[0.07] px-4 py-3 mt-3 flex gap-2.5"
              >
                <PartyPopper size={14} className="text-quantum shrink-0 mt-0.5" />
                <p className="text-[12.5px] text-muted leading-relaxed">
                  All 4 classical vertices discovered. Notice that the product of coordinates is always{" "}
                  <span className="mono text-ink font-semibold">x₁x₂x₃ = +1</span>. The other 4 corners
                  of the cube have product <span className="mono text-rose font-semibold">−1</span> (odd parity)
                  and cannot be produced by any local hidden variable model.
                </p>
              </motion.div>
            )}
          </div>
        </Reveal>

        {/* 3D INTERACTIVE CANVAS */}
        <Reveal delay={0.05} className="card relative overflow-hidden min-h-[520px] flex flex-col justify-between">
          {/* Canvas Background */}
          <div className="absolute inset-0">
            <Canvas
              camera={{ position: [3.4, 2.6, 3.4], fov: 42 }}
              dpr={[1, 2]}
              gl={{ antialias: true, alpha: true }}
            >
              <Suspense fallback={null}>
                <Tetra
                  vertices={vertices}
                  facets={facets}
                  odds={odds}
                  corners={corners}
                  point={activePt}
                  selectedClassical={selClassical}
                  selectedOdd={selOdd}
                  activeFamily={activeFamily}
                  onSelectClassical={(i) => {
                    setActiveFamily("classical");
                    setSelClassical(i);
                  }}
                  onSelectOdd={(i) => {
                    setActiveFamily("odd");
                    setSelOdd(i);
                  }}
                  included={included}
                  showPlane={showPlane}
                  showDualCorners={showDualCorners}
                  showDualPolytope={showDualPolytope}
                  selectedCorner={selectedCorner}
                  onSelectCorner={setSelectedCorner}
                  dragConstraint={dragConstraint}
                  onPointDrag={(newP) => {
                    setUseWeights(false);
                    setPt(newP);
                  }}
                  setIsDraggingPoint={setIsDraggingPoint}
                />
              </Suspense>
              <OrbitControls
                makeDefault
                enabled={!isDraggingPoint}
                enablePan={false}
                minDistance={2.4}
                maxDistance={9.5}
                autoRotate={!isDraggingPoint && selectedCorner === null}
                autoRotateSpeed={0.35}
                enableDamping
              />
            </Canvas>
          </div>

          {/* Top Overlay Badges */}
          <div className="relative top-4 left-4 right-4 pointer-events-none flex flex-wrap items-center justify-between gap-2 z-10">
            <div className="flex flex-col gap-1.5 pointer-events-auto">
              <span className="chip !bg-void/80 backdrop-blur border-line">
                hull of {included.filter(Boolean).length} vertices = {hullName}
              </span>
              <span
                className="chip !bg-void/80 backdrop-blur font-semibold"
                style={{ color: pointRegion.badgeColor, borderColor: pointRegion.badgeColor + "66" }}
              >
                {pointRegion.label}
              </span>
            </div>

            <div className="flex flex-col items-end gap-1 pointer-events-auto">
              <div className="chip !bg-void/80 backdrop-blur mono text-[10px] text-faint">
                Probe: ({fmt(activePt[0], 2)}, {fmt(activePt[1], 2)}, {fmt(activePt[2], 2)})
              </div>
              <div className="chip !bg-void/80 backdrop-blur text-[9.5px] text-quantum/90 flex items-center gap-1">
                <Move3d size={10} /> Mouse drag enabled in 3D
              </div>
            </div>
          </div>

          {/* Interactive Corner Inspector Overlay (Modal / Popover when a corner is clicked) */}
          <AnimatePresence>
            {selectedCorner && (
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="relative mx-4 mb-2 bg-void/95 backdrop-blur-md border border-line-bright rounded-2xl p-4 shadow-2xl z-20 space-y-3 pointer-events-auto"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: selectedCorner.isClassical ? "#7CFFB2" : ROSE }}
                    />
                    <span className="mono text-xs font-bold text-ink">
                      {selectedCorner.name}
                    </span>
                    <span
                      className={cn(
                        "mono text-[8.5px] px-2 py-0.5 rounded uppercase font-semibold",
                        selectedCorner.isClassical
                          ? "bg-quantum/15 text-quantum border border-quantum/30"
                          : "bg-rose/15 text-rose border border-rose/30"
                      )}
                    >
                      {selectedCorner.isClassical ? "Classical (Even Parity)" : "Frustrated (Odd Parity)"}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedCorner(null)}
                    className="text-faint hover:text-ink cursor-pointer p-1 rounded-md transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/[0.03] border border-line/60 rounded-xl p-2.5 mono">
                    <div className="text-[9px] text-faint mb-0.5">COORDINATES (x₁, x₂, x₃)</div>
                    <div className="text-sm font-semibold text-ink">
                      ({selectedCorner.x.map((c) => (c > 0 ? "+1" : "−1")).join(", ")})
                    </div>
                  </div>
                  <div className="bg-white/[0.03] border border-line/60 rounded-xl p-2.5 mono">
                    <div className="text-[9px] text-faint mb-0.5">PARITY PRODUCT x₁·x₂·x₃</div>
                    <div
                      className={cn(
                        "text-sm font-semibold font-mono",
                        selectedCorner.parity > 0 ? "text-quantum" : "text-rose"
                      )}
                    >
                      {selectedCorner.parity > 0 ? "+1 (Classical)" : "−1 (Forbidden Classically)"}
                    </div>
                  </div>
                </div>

                <p className="text-[11.5px] text-muted leading-relaxed">
                  {selectedCorner.physicalMeaning}
                </p>

                {selectedCorner.isClassical && selectedCorner.assignments.length > 0 && (
                  <div className="bg-white/[0.02] border border-line/40 rounded-xl p-2 text-[11px] mono flex items-center justify-between">
                    <span className="text-faint">Deterministic spins (S₁,S₂,S₃):</span>
                    <span className="text-ink font-semibold">
                      {selectedCorner.assignments
                        .map((s) => `(${s.map((c) => (c > 0 ? "+" : "−")).join("")})`)
                        .join(" or ")}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="mono text-[10px] text-faint">
                    Antipodal dual: {selectedCorner.oppositeCornerId}
                  </span>
                  <button
                    onClick={() => {
                      setUseWeights(false);
                      setPt(selectedCorner.x);
                    }}
                    className="chip !py-1.5 !px-3 cursor-pointer !text-quantum !border-quantum/50 hover:!bg-quantum/10 flex items-center gap-1.5 transition-colors"
                  >
                    <Crosshair size={11} /> Set Probe Point Here
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Toolbar */}
          <div className="relative bottom-4 left-4 right-4 flex flex-wrap items-center gap-1.5 z-10 pointer-events-auto">
            {/* Quick Facet / Inequality Chips */}
            {activeFamily === "classical"
              ? facets.map((g, i) => (
                  <button
                    key={g.id}
                    onClick={() => setSelClassical(i)}
                    className="chip !py-1 !px-2.5 !text-[9.5px] cursor-pointer backdrop-blur !bg-void/80"
                    style={
                      selClassical === i
                        ? { color: VC[i], borderColor: VC[i] + "99", background: VC[i] + "1a" }
                        : undefined
                    }
                  >
                    {g.id}
                  </button>
                ))
              : odds.map((o, i) => (
                  <button
                    key={o.id}
                    onClick={() => setSelOdd(i)}
                    className="chip !py-1 !px-2.5 !text-[9.5px] cursor-pointer backdrop-blur !bg-void/80"
                    style={
                      selOdd === i
                        ? { color: ROSE, borderColor: ROSE + "99", background: ROSE + "1a" }
                        : undefined
                    }
                  >
                    {o.id}
                  </button>
                ))}

            <button
              onClick={() => setShowPlane((s) => !s)}
              className={cn(
                "chip !py-1 !px-2.5 !text-[9.5px] cursor-pointer backdrop-blur !bg-void/80 ml-auto",
                showPlane && "!text-quantum !border-quantum/50"
              )}
            >
              {showPlane ? "plane ON" : "plane OFF"}
            </button>

            <button
              onClick={() => setShowDualCorners((s) => !s)}
              className={cn(
                "chip !py-1 !px-2.5 !text-[9.5px] cursor-pointer backdrop-blur !bg-void/80",
                showDualCorners && "!text-gold !border-gold/50"
              )}
            >
              {showDualCorners ? "8 corners ON" : "8 corners OFF"}
            </button>

            <button
              onClick={() => setShowDualPolytope((s) => !s)}
              className={cn(
                "chip !py-1 !px-2.5 !text-[9.5px] cursor-pointer backdrop-blur !bg-void/80",
                showDualPolytope && "!text-rose !border-rose/50"
              )}
            >
              {showDualPolytope ? "dual T_odd ON" : "dual T_odd OFF"}
            </button>
          </div>
        </Reveal>
      </div>

      {/* ============ B: CONVEX HULL & POINT CONTROLS ============ */}
      <Reveal className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="mono text-[10px] tracking-[0.25em] text-faint flex items-center gap-2">
            <Sparkles size={12} className="text-quantum" />
            PANEL B — CONVEX HULL BUILDER & INTERACTIVE 3D PROBE POINT
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mono text-[9px] text-faint mr-1">INPUT MODE:</span>
            <button
              onClick={() => setUseWeights(true)}
              className={cn(
                "chip !py-1.5 !px-3 cursor-pointer",
                useWeights && "!text-quantum !border-quantum/55 !bg-quantum/10"
              )}
            >
              weights λ
            </button>
            <button
              onClick={() => {
                setUseWeights(false);
                setPt(activePt);
              }}
              className={cn(
                "chip !py-1.5 !px-3 cursor-pointer",
                !useWeights && "!text-quantum !border-quantum/55 !bg-quantum/10"
              )}
            >
              free coordinates
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-4">
          {/* Column 1: Hull Vertices Selector */}
          <div>
            <div className="mono text-[9px] tracking-[0.2em] text-faint mb-2">
              INCLUDE VERTICES IN THE HULL
            </div>
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
                  style={{
                    background: included[i] ? VC[i] : "transparent",
                    border: `1px solid ${VC[i]}88`,
                  }}
                >
                  {included[i] && <Check size={9} className="text-void font-bold" />}
                </span>
                <span className="mono text-[11px] font-semibold" style={{ color: included[i] ? VC[i] : "#5b5967" }}>
                  v{i + 1}
                </span>
                <span className="mono text-[10px] text-faint">
                  ({v.map((c) => (c > 0 ? "+" : "−")).join("")})
                </span>
                <span className="mono text-[9px] text-faint ml-auto">
                  {v.every((c) => c === 1) ? "all +1" : "2 anti-pairs"}
                </span>
              </button>
            ))}
            <p className="text-[11.5px] text-muted leading-relaxed mt-3">
              1 vertex → point · 2 → edge · 3 → triangle · 4 → regular tetrahedron. The classical
              hull <em>is</em> the set of all randomized probabilistic strategies.
            </p>
          </div>

          {/* Column 2: Sliders & 3D Drag Constraints */}
          <div>
            <div className="flex items-center justify-between mono text-[9px] tracking-[0.2em] text-faint mb-2">
              <span>{useWeights ? "MIXING WEIGHTS (Σλ = 1)" : "FREE COORDINATES (DRAG OR SLIDER)"}</span>
              {!useWeights && (
                <span className="text-quantum font-semibold">3D DRAG ACTIVE</span>
              )}
            </div>

            {useWeights
              ? w.map((v, i) => (
                  <div key={i} className={cn("mb-2", !included[i] && "opacity-40 pointer-events-none")}>
                    <div className="flex justify-between mono text-[10px] mb-0.5">
                      <span style={{ color: VC[i] }}>λ{i + 1}</span>
                      <span className="text-ink/80 font-mono">
                        {fmt(v / (w.reduce((a, b, k) => a + (included[k] ? b : 0), 0) || 1), 3)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={v}
                      onChange={(e) => {
                        const q = parseFloat(e.target.value);
                        setW((s) => s.map((x, k) => (k === i ? q : x)));
                      }}
                      className="kcbs-range"
                      aria-label={`weight ${i}`}
                    />
                  </div>
                ))
              : (["x₁", "x₂", "x₃"] as const).map((l, i) => (
                  <div key={l} className="mb-2">
                    <div className="flex justify-between mono text-[10px] mb-0.5">
                      <span className="text-faint">{l}</span>
                      <span className="text-quantum font-mono">{fmt(pt[i], 3)}</span>
                    </div>
                    <input
                      type="range"
                      min={-1.25}
                      max={1.25}
                      step={0.01}
                      value={pt[i]}
                      onChange={(e) => {
                        const q = parseFloat(e.target.value);
                        setPt((s) => s.map((x, k) => (k === i ? q : x)) as V3);
                      }}
                      className="kcbs-range"
                      aria-label={l}
                    />
                  </div>
                ))}

            {/* Mouse Drag Constraint Selector */}
            <div className="mt-3 pt-3 border-t border-line/50">
              <div className="mono text-[9px] text-faint mb-1.5 flex items-center justify-between">
                <span>3D MOUSE DRAG PLANE CONSTRAINT</span>
                <span className="text-quantum">{dragConstraint}</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {(["camera", "xy", "xz", "yz"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setDragConstraint(mode)}
                    className={cn(
                      "chip !py-1 !px-1.5 !text-[9px] cursor-pointer text-center",
                      dragConstraint === mode && "!text-quantum !border-quantum/60 !bg-quantum/10"
                    )}
                  >
                    {mode === "camera" ? "view" : mode.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mono text-[9px] text-faint mt-3 mb-1">PRESET LOCATIONS</div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => {
                  setUseWeights(true);
                  setW([1, 1, 1, 1]);
                }}
                className="chip !py-1 !px-2.5 !text-[9.5px] cursor-pointer hover:!text-ink"
              >
                centre (0,0,0)
              </button>
              <button
                onClick={() => {
                  setUseWeights(false);
                  setPt(qp.x);
                }}
                className="chip !py-1 !px-2.5 !text-[9.5px] cursor-pointer !text-quantum !border-quantum/40 hover:!bg-quantum/10"
              >
                quantum N=3
              </button>
              <button
                onClick={() => {
                  setUseWeights(false);
                  setPt([-1, -1, -1]);
                }}
                className="chip !py-1 !px-2.5 !text-[9.5px] cursor-pointer hover:!text-rose hover:!border-rose/40"
              >
                c₁ (−1,−1,−1)
              </button>
              <button
                onClick={() => {
                  setUseWeights(false);
                  setPt([1, 1, 1]);
                }}
                className="chip !py-1 !px-2.5 !text-[9.5px] cursor-pointer hover:!text-gold hover:!border-gold/40"
              >
                v₁ (+1,+1,+1)
              </button>
            </div>
          </div>

          {/* Column 3: Convex Decomposition & Geometry Status */}
          <div>
            <div className="mono text-[9px] tracking-[0.2em] text-faint mb-2">
              CONVEX DECOMPOSITION IN SIMPLEX
            </div>
            <div className="mono text-[11px] mb-2 text-ink/85 flex items-center justify-between">
              <span>x = ({activePt.map((v) => fmt(v, 3)).join(", ")})</span>
              <span className="text-[10px] text-faint">
                x₁x₂x₃ = {fmt(activePt[0] * activePt[1] * activePt[2], 2)}
              </span>
            </div>

            {lam.map((l, i) => (
              <div key={i} className="flex items-center gap-2.5 mb-1.5">
                <span className="mono text-[10px] w-6" style={{ color: VC[i] }}>
                  λ{i + 1}
                </span>
                <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.abs(l) * 100)}%`, background: l < -1e-9 ? ROSE : VC[i] }}
                  />
                </div>
                <span
                  className={cn(
                    "mono text-[10.5px] w-16 text-right font-mono",
                    l < -1e-9 ? "text-rose font-bold" : "text-ink/85"
                  )}
                >
                  {fmt(l, 4)}
                </span>
              </div>
            ))}
            <div className="mono text-[10px] text-faint mt-1 mb-2">
              Σλ = {fmt(lam.reduce((a, b) => a + b, 0), 5)}
            </div>

            <div
              className="rounded-xl border px-4 py-3 transition-colors"
              style={{
                borderColor: pointRegion.badgeColor + "55",
                background: pointRegion.badgeColor + "0f",
              }}
            >
              <div
                className="mono text-[10px] font-bold uppercase mb-1"
                style={{ color: pointRegion.badgeColor }}
              >
                {pointRegion.label}
              </div>
              <p className="text-[12px] text-muted leading-relaxed">
                {inside ? (
                  <>
                    All barycentric weights <TeX>{"\\lambda_i \\ge 0"}</TeX>. This point is a genuine{" "}
                    <span className="text-[#7CFFB2] font-medium">probability mixture</span> of local
                    deterministic assignments.
                  </>
                ) : (
                  <>
                    Negative barycentric weight appears (<span className="text-rose font-mono">λ &lt; 0</span>).
                    No classical probability distribution over coin tosses can generate this point.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ============ C: INEQUALITY EXPLORER ============ */}
      <Reveal className="card p-6">
        {/* Family Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="mono text-[10px] tracking-[0.25em] text-faint">
            PANEL C — INEQUALITY & FACET EXPLORER · CLASSICAL VS FORBIDDEN ODYSSEY
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveFamily("classical");
                setStepC(5);
              }}
              className={cn(
                "chip !py-1.5 !px-3 text-xs cursor-pointer flex items-center gap-1.5 transition-all",
                activeFamily === "classical" && "!text-gold !border-gold/60 !bg-gold/10 font-bold"
              )}
            >
              <Layers size={12} /> Classical Facets (F₁–F₄)
            </button>
            <button
              onClick={() => {
                setActiveFamily("odd");
                setStepC(4);
              }}
              className={cn(
                "chip !py-1.5 !px-3 text-xs cursor-pointer flex items-center gap-1.5 transition-all",
                activeFamily === "odd" && "!text-rose !border-rose/60 !bg-rose/10 font-bold"
              )}
            >
              <ShieldAlert size={12} /> Forbidden Odd-Parity (O₁–O₄)
            </button>
          </div>
        </div>

        {/* Inequality Selector Buttons */}
        <div className="flex items-center gap-2 mb-5">
          <span className="mono text-[10px] text-faint">SELECT INEQUALITY:</span>
          {activeFamily === "classical"
            ? facets.map((g, i) => (
                <button
                  key={g.id}
                  onClick={() => {
                    setSelClassical(i);
                    setStepC(5);
                  }}
                  className="chip !py-1 !px-3 !text-[10px] cursor-pointer"
                  style={
                    selClassical === i
                      ? { color: VC[i], borderColor: VC[i] + "88", background: VC[i] + "18", fontWeight: "bold" }
                      : undefined
                  }
                >
                  {g.id}: ({g.n.map((c) => (c > 0 ? "+" : "−")).join("")})·x ≥ {g.rhs}
                </button>
              ))
            : odds.map((o, i) => (
                <button
                  key={o.id}
                  onClick={() => {
                    setSelOdd(i);
                    setStepC(4);
                  }}
                  className="chip !py-1 !px-3 !text-[10px] cursor-pointer"
                  style={
                    selOdd === i
                      ? { color: ROSE, borderColor: ROSE + "88", background: ROSE + "18", fontWeight: "bold" }
                      : undefined
                  }
                >
                  {o.id}: {o.tex}
                </button>
              ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column: Derivation Steps */}
          <div>
            <div className="space-y-2">
              {(activeFamily === "classical" ? STEPS_C : STEPS_ODD)
                .slice(0, stepC + 1)
                .map((s, i) => (
                  <motion.div
                    key={`${activeFamily}-${i}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-xl border border-line bg-white/[0.02] px-4 py-3"
                  >
                    <div className="mono text-[9px] tracking-[0.2em] text-faint mb-1.5">
                      {i + 1}. {s.t.toUpperCase()}
                    </div>
                    <TeX block className="!text-[0.82rem]">
                      {s.tex}
                    </TeX>
                  </motion.div>
                ))}
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() =>
                  setStepC((s) =>
                    Math.min(
                      (activeFamily === "classical" ? STEPS_C : STEPS_ODD).length - 1,
                      s + 1
                    )
                  )
                }
                disabled={
                  stepC >= (activeFamily === "classical" ? STEPS_C : STEPS_ODD).length - 1
                }
                className={cn(
                  "chip !py-2 !px-4 transition-all",
                  stepC >= (activeFamily === "classical" ? STEPS_C : STEPS_ODD).length - 1
                    ? "!text-faint/40 cursor-default"
                    : "!text-ink hover:!text-quantum hover:!border-quantum/60 cursor-pointer"
                )}
              >
                next step <ChevronRight size={11} />
              </button>
              <button
                onClick={() => setStepC(0)}
                className="chip !py-2 !px-4 cursor-pointer hover:!text-ink"
              >
                restart derivation
              </button>
            </div>

            {/* Final Statement Card */}
            {activeFamily === "classical" ? (
              <div
                className="rounded-xl border px-4 py-3.5 mt-3"
                style={{ borderColor: VC[selClassical] + "66", background: VC[selClassical] + "12" }}
              >
                <div className="mono text-[9px] tracking-[0.2em] mb-1.5" style={{ color: VC[selClassical] }}>
                  CLASSICAL FACET INEQUALITY (EVEN PARITY)
                </div>
                <TeX block className="!text-[0.95rem]">
                  {facetTeX(f)}
                </TeX>
                <TeX block className="!text-[0.78rem] text-muted">
                  {facetCorrTeX(f)}
                </TeX>
              </div>
            ) : (
              <div className="rounded-xl border border-rose/50 bg-rose/[0.08] px-4 py-3.5 mt-3 space-y-1.5">
                <div className="mono text-[9px] tracking-[0.2em] text-rose font-bold">
                  FORBIDDEN ODD-PARITY INEQUALITY ({odd.minusCount} MINUS SIGN{odd.minusCount > 1 ? "S" : ""})
                </div>
                <TeX block className="!text-[0.95rem]">
                  {`${odd.tex} \\iff ${odd.dualTex}`}
                </TeX>
                <TeX block className="!text-[0.78rem] text-muted">
                  {odd.corrTex}
                </TeX>
                <p className="text-[11.5px] text-muted leading-relaxed pt-1">
                  {odd.reason}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Slack Meter & Inequality Matrix */}
          <div>
            {activeFamily === "classical" ? (
              <div>
                <div className="mono text-[9px] tracking-[0.2em] text-faint mb-2">
                  PUSH A TEST POINT THROUGH CLASSICAL {f.id}
                </div>
                <input
                  type="range"
                  min={-0.6}
                  max={1.4}
                  step={0.01}
                  value={push}
                  onChange={(e) => setPush(parseFloat(e.target.value))}
                  className="kcbs-range"
                  aria-label="push"
                />
                <div
                  className="rounded-xl border px-5 py-4 mt-2 transition-colors"
                  style={{
                    borderColor:
                      probeClassicalSlack > 0.25
                        ? "#7CFFB233"
                        : probeClassicalSlack > -1e-9
                        ? GOLD + "66"
                        : ROSE + "88",
                    background:
                      probeClassicalSlack > 0.25
                        ? "rgba(124,255,178,0.05)"
                        : probeClassicalSlack > -1e-9
                        ? "rgba(232,180,92,0.07)"
                        : "rgba(251,92,122,0.08)",
                  }}
                >
                  <div className="mono text-[10px] text-faint mb-1">n·x − d</div>
                  <div
                    className="mono text-3xl font-bold"
                    style={{
                      color:
                        probeClassicalSlack > 0.25
                          ? "#7CFFB2"
                          : probeClassicalSlack > -1e-9
                          ? GOLD
                          : ROSE,
                    }}
                  >
                    {probeClassicalSlack >= 0 ? "+" : ""}
                    {fmt(probeClassicalSlack, 4)}
                  </div>
                  <div
                    className="mono text-[11px] mt-2 font-medium"
                    style={{
                      color:
                        probeClassicalSlack > 0.25
                          ? "#7CFFB2"
                          : probeClassicalSlack > -1e-9
                          ? GOLD
                          : ROSE,
                    }}
                  >
                    {probeClassicalSlack > 0.25
                      ? "INSIDE — classical inequality satisfied"
                      : probeClassicalSlack > -1e-9
                      ? "ON THE FACET — tight boundary (saturating)"
                      : "OUTSIDE — classically impossible correlation"}
                  </div>
                </div>

                <div className="mono text-[9px] tracking-[0.2em] text-faint mt-5 mb-2">
                  ALL 4 CLASSICAL FACETS · SLACK AT CURRENT PROBE POINT
                </div>
                {facets.map((g, i) => {
                  const s = slack(g, activePt);
                  return (
                    <div key={g.id} className="flex items-center gap-2.5 mb-1.5">
                      <span className="mono text-[10px] w-6" style={{ color: VC[i] }}>
                        {g.id}
                      </span>
                      <span className="mono text-[9.5px] text-faint flex-1 truncate">
                        ({g.n.map((c) => (c > 0 ? "+" : "−")).join("")})·x ≥ {g.rhs}
                      </span>
                      <div className="w-20 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${clamp((s / 4) * 100, 2, 100)}%`,
                            background: s >= -1e-9 ? VC[i] : ROSE,
                          }}
                        />
                      </div>
                      <span
                        className={cn(
                          "mono text-[10px] w-14 text-right font-mono",
                          s >= -1e-9 ? "text-ink/80" : "text-rose font-bold"
                        )}
                      >
                        {s >= 0 ? "+" : ""}
                        {fmt(s, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                <div className="mono text-[9px] tracking-[0.2em] text-faint mb-2">
                  ODD INEQUALITY {odd.id} · SLACK AT CURRENT PROBE POINT
                </div>
                <div
                  className="rounded-xl border px-5 py-4 transition-colors"
                  style={{
                    borderColor: probeOddSlack >= -1e-9 ? ROSE + "66" : "#7CFFB244",
                    background: probeOddSlack >= -1e-9 ? "rgba(251,92,122,0.08)" : "rgba(124,255,178,0.05)",
                  }}
                >
                  <div className="mono text-[10px] text-faint mb-1">
                    n·x − rhs = ({odd.n.join(",")})·x − ({odd.rhs})
                  </div>
                  <div
                    className="mono text-3xl font-bold font-mono"
                    style={{ color: probeOddSlack >= -1e-9 ? ROSE : "#7CFFB2" }}
                  >
                    {probeOddSlack >= 0 ? "+" : ""}
                    {fmt(probeOddSlack, 4)}
                  </div>
                  <div
                    className="mono text-[11px] mt-2 font-medium"
                    style={{ color: probeOddSlack >= -1e-9 ? ROSE : "#7CFFB2" }}
                  >
                    {probeOddSlack >= -1e-9
                      ? "SATISFIED BY DUAL FRUSTRATED POLYTOPE (Odd-parity region)"
                      : "VIOLATED BY THIS POINT (Classical region penetrating through)"}
                  </div>
                  <p className="text-[11px] text-muted mt-2 leading-relaxed">
                    Classical vertex <span className="mono text-gold font-bold">v{odd.violatingClassicalIdx + 1}</span>{" "}
                    penetrates this hyperplane by <span className="mono text-rose font-bold">-2.000</span>.
                    Notice the dashed red violation vector in the 3D scene!
                  </p>
                </div>

                <div className="mono text-[9px] tracking-[0.2em] text-faint mt-5 mb-2">
                  ALL 4 ODD-PARITY INEQUALITIES · SLACK AT CURRENT PROBE POINT
                </div>
                {odds.map((o) => {
                  const s = slackOdd(o, activePt);
                  return (
                    <div key={o.id} className="flex items-center gap-2.5 mb-1.5">
                      <span className="mono text-[10px] w-6 text-rose font-bold">{o.id}</span>
                      <span className="mono text-[9.5px] text-faint flex-1 truncate">
                        {o.tex}
                      </span>
                      <div className="w-20 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${clamp(((s + 2) / 4) * 100, 2, 100)}%`,
                            background: s >= -1e-9 ? ROSE : "#7CFFB2",
                          }}
                        />
                      </div>
                      <span
                        className={cn(
                          "mono text-[10px] w-14 text-right font-mono",
                          s >= -1e-9 ? "text-rose font-bold" : "text-[#7CFFB2]"
                        )}
                      >
                        {s >= 0 ? "+" : ""}
                        {fmt(s, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {/* ============ D + CLASSIFICATION ============ */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* PANEL D */}
        <Reveal className="card p-6">
          <div className="mono text-[10px] tracking-[0.25em] text-faint mb-3 flex items-center gap-2">
            <Shuffle size={12} className="text-violet" /> PANEL D — SYMMETRY DEMONSTRATOR
          </div>
          <p className="text-[12.5px] text-muted leading-relaxed mb-4">
            Flipping one physical variable <TeX>{"S_i\\mapsto-S_i"}</TeX> negates exactly the two
            correlators containing it. All 4 classical facets are one facet in disguise, and all 4
            odd-parity inequalities form their dual orbit.
          </p>
          <div className="flex gap-2 mb-4">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                onClick={() => setFlip(flip === i ? null : (i as 0 | 1 | 2))}
                className={cn(
                  "chip !py-2 !px-4 cursor-pointer transition-all",
                  flip === i
                    ? "!text-violet !border-violet/60 !bg-violet/10 font-bold"
                    : "hover:!text-ink hover:!border-line-bright"
                )}
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
                {`${facetTeX(facets[0])} \\;\\longmapsto\\; ${mapped.n
                  .map((c, i) => `${c > 0 ? "+" : "-"}x_${i + 1}`)
                  .join(" ")} \\ge ${mapped.rhs}`}
              </TeX>
              <div
                className="mono text-[12px] mt-1 font-bold"
                style={{ color: mappedTo ? VC[facets.indexOf(mappedTo)] : undefined }}
              >
                F₁ ⟶ {mappedTo ? mappedTo.id : "—"} ✓
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-line bg-white/[0.02] px-4 py-3 mono text-[11px] text-faint">
              pick a flip to see where F₁ lands under local spin inversion
            </div>
          )}
          <p className="text-[12px] text-muted leading-relaxed mt-3">
            With the <TeX>{"S_3"}</TeX> coordinate permutations these generate a group of order 24
            — the tetrahedron's full rotational symmetry — acting <em>transitively</em> on facets.
          </p>
        </Reveal>

        {/* CLASSIFICATION */}
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
                <div className="mono text-[14px] font-semibold" style={{ color: c }}>
                  {v}
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-gold/30 bg-gold/[0.05] px-4 py-3 mb-3">
            <p className="text-[12.5px] text-muted leading-relaxed">
              All 6 distances equal <TeX>{"2\\sqrt2"}</TeX> ⟹ a <span className="text-gold font-semibold">regular
              tetrahedron</span> — the alternating demicube inscribed in <TeX>{"[-1,1]^3"}</TeX>. The
              dual tetrahedron with odd parity corners forms Kepler's <em>Stella Octangula</em>.
            </p>
          </div>
          <div className="rounded-xl border border-quantum/35 bg-quantum/[0.06] px-4 py-3.5">
            <div className="mono text-[10px] tracking-[0.2em] text-quantum font-bold mb-2">
              AND QUANTUM? IT CANNOT ESCAPE
            </div>
            <p className="text-[12.5px] text-muted leading-relaxed">
              For <TeX>{"N=3"}</TeX> pairwise orthogonality forces commuting projectors, so quantum
              states cannot violate the classical facet. The optimal quantum point is{" "}
              <TeX>{"(-\\tfrac13,-\\tfrac13,-\\tfrac13)"}</TeX> — the exact centroid of facet{" "}
              <TeX>{"F_1"}</TeX>, with slack{" "}
              <span className="mono text-quantum font-bold">{fmt(slack(facets[0], qp.x), 9)}</span>.
              To observe contextuality beyond classical facets, you need an odd cycle with a gap:{" "}
              <TeX>{"N=5"}</TeX> (KCBS pentagram).
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => setView("chsh")}
                className="chip !py-2 !px-4 cursor-pointer !text-ink hover:!text-quantum hover:!border-quantum/60 transition-colors"
              >
                stage 2 · CHSH <ArrowRight size={11} />
              </button>
              <button
                onClick={() => setView("hierarchy")}
                className="chip !py-2 !px-4 cursor-pointer hover:!text-ink hover:!border-line-bright transition-colors"
              >
                stage 3 · L ⊂ Q ⊂ NS <ArrowRight size={11} />
              </button>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal className="card !border-line px-6 py-4 flex items-start gap-3">
        <Info size={14} className="text-gold shrink-0 mt-0.5" />
        <p className="text-[12.5px] text-muted leading-relaxed">
          <span className="text-ink font-semibold">Fixed by the physics, not by you:</span> the number of
          variables, the pairwise-product structure <TeX>{"x_k = \\langle S_iS_j\\rangle"}</TeX>,
          the 4 classical vertices, and the 4 frustrated odd-parity corners. Those <em>are</em> the
          scenario — everything you can move above is a state, a mixture, or a viewpoint.
        </p>
      </Reveal>
    </div>
  );
}
