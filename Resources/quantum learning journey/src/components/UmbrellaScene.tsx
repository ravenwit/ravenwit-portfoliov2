import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, Line, OrbitControls, Sparkles } from "@react-three/drei";
import { coneVectors, projProbs, psiFromAngles, type ConeSpec, type Vec3 } from "../lib/kcbs";

const t3 = (v: Vec3): [number, number, number] => [v[0], v[2], v[1]];

const SUB = ["₁","₂","₃","₄","₅","₆","₇","₈","₉","₁₀","₁₁","₁₂"];
const GOLD = "#e8b45c";
const CYAN = "#6fdcf7";
const ROSE = "#fb5c7a";

function Label({ position, children, tint }: { position: [number, number, number]; children: React.ReactNode; tint: string }) {
  return (
    <Html position={position} center distanceFactor={15} zIndexRange={[20, 0]}>
      <div
        className="mono pointer-events-none select-none whitespace-nowrap"
        style={{
          fontSize: 10,
          letterSpacing: "0.06em",
          color: tint,
          background: "rgba(6,6,12,0.55)",
          border: `1px solid ${tint}33`,
          padding: "1px 6px",
          borderRadius: 999,
          backdropFilter: "blur(6px)",
        }}
      >
        {children}
      </div>
    </Html>
  );
}

function Scene({
  spec, thetaDeg, phiDeg, selected, onSelect,
}: {
  spec: ConeSpec;
  thetaDeg: number;
  phiDeg: number;
  selected: number;
  onSelect: (e: number) => void;
}) {
  const N = spec.N;
  const rays = useMemo(() => coneVectors(spec), [spec]);
  const psi = useMemo(() => psiFromAngles(thetaDeg, phiDeg), [thetaDeg, phiDeg]);
  const probs = useMemo(() => projProbs(rays, psi), [rays, psi]);
  const { r, h } = spec;

  const ringPts = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 96; i++) {
      const a = (2 * Math.PI * i) / 96;
      pts.push([r * Math.cos(a), h, r * Math.sin(a)]);
    }
    return pts;
  }, [r, h]);

  const psiEnd = t3(psi);
  const maxP = Math.max(...probs.concat(0.05));

  return (
    <group>
      {/* ghost cone */}
      <mesh position={[0, h / 2, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[r, h, Math.max(24, N * 6), 1, true]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.05} side={2} depthWrite={false} />
      </mesh>
      <mesh position={[0, h / 2, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[r, h, 12, 1, true]} />
        <meshBasicMaterial color={CYAN} wireframe transparent opacity={0.06} depthWrite={false} />
      </mesh>

      {/* base ring */}
      <Line points={ringPts} color={GOLD} lineWidth={1} transparent opacity={0.45} />

      {/* z-axis reference */}
      <Line points={[[0, 0, 0], [0, 1.22, 0]]} color="#8f8d9c" lineWidth={1} dashed dashSize={0.04} gapSize={0.03} transparent opacity={0.65} />
      <Label position={[0, 1.3, 0]} tint="#8f8d9c">ẑ (handle)</Label>

      {/* probe state |ψ⟩ */}
      <Line points={[[0, 0, 0], [psiEnd[0] * 1.12, psiEnd[1] * 1.12, psiEnd[2] * 1.12]]} color={CYAN} lineWidth={2.6} />
      <mesh position={[psiEnd[0] * 1.16, psiEnd[1] * 1.16, psiEnd[2] * 1.16]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color={CYAN} />
      </mesh>
      <Label position={[psiEnd[0] * 1.28, psiEnd[1] * 1.28, psiEnd[2] * 1.28]} tint={CYAN}>|ψ⟩</Label>

      {/* rays — tip glow scales with the event probability p_i = |⟨ψ|vᵢ⟩|² */}
      {rays.map((v, k) => {
        const tip = t3(v);
        const pk = probs[k];
        const heat = pk / maxP;
        return (
          <group key={k}>
            <Line points={[[0, 0, 0], tip]} color={GOLD} lineWidth={1.8} transparent opacity={0.9} />
            <mesh position={tip}>
              <sphereGeometry args={[0.02 + 0.012 * (pk > 0.3 ? 1 : 0.4), 20, 20]} />
              <meshBasicMaterial color="#f6d9a0" />
            </mesh>
            <mesh position={tip}>
              <sphereGeometry args={[0.03 + 0.11 * heat, 16, 16]} />
              <meshBasicMaterial color={CYAN} transparent opacity={0.10 + 0.30 * heat} depthWrite={false} />
            </mesh>
            {N <= 9 && (
              <Label position={[tip[0] * 1.18, tip[1] + 0.02, tip[2] * 1.18]} tint={GOLD}>
                v{SUB[k]}
              </Label>
            )}
          </group>
        );
      })}

      {/* context edges (orthogonality graph = C_N) */}
      {rays.map((v, k) => {
        const a = t3(v);
        const b = t3(rays[(k + 1) % N]);
        const mid: [number, number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
        const sel = selected === k;
        return (
          <group key={`e${k}`}>
            <Line
              points={[a, b]}
              color={sel ? ROSE : CYAN}
              lineWidth={sel ? 3.4 : 1.7}
              transparent
              opacity={sel ? 1 : 0.6}
              onPointerDown={(e) => { e.stopPropagation(); onSelect(k); }}
            />
            <mesh position={mid} onPointerDown={(e) => { e.stopPropagation(); onSelect(k); }}>
              <sphereGeometry args={[0.13, 8, 8]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
            {sel && (
              <Html position={mid} center distanceFactor={17} zIndexRange={[19, 0]}>
                <div className="mono pointer-events-none select-none" style={{ fontSize: 9.5, color: ROSE, letterSpacing: "0.06em" }}>
                  ⟨v{SUB[k]}|v{SUB[(k + 1) % N]}⟩ = 0
                </div>
              </Html>
            )}
          </group>
        );
      })}

      <mesh>
        <sphereGeometry args={[0.028, 16, 16]} />
        <meshBasicMaterial color="#ece7db" />
      </mesh>

      <Sparkles count={70} scale={[6.5, 3.6, 6.5]} size={1.3} speed={0.12} opacity={0.4} color="#7dd3fc" position={[0, 0.8, 0]} />
    </group>
  );
}

export function UmbrellaScene({
  spec, thetaDeg, phiDeg, selected, onSelect, className,
}: {
  spec: ConeSpec;
  thetaDeg: number;
  phiDeg: number;
  selected: number;
  onSelect: (e: number) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [3.2, 2.2, 3.2], fov: 40 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <Scene spec={spec} thetaDeg={thetaDeg} phiDeg={phiDeg} selected={selected} onSelect={onSelect} />
        </Suspense>
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={2.2}
          maxDistance={10}
          target={[0, Math.max(0.35, spec.h * 0.7), 0]}
          autoRotate
          autoRotateSpeed={0.5}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
}
