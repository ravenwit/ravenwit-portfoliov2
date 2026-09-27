import React, { useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { compile } from 'mathjs';
import { ParamState } from '../types';

interface SceneProps {
  params: ParamState;
  wireframe: boolean;
  resolution: number;
}

function ParametricSurface({ params, wireframe, resolution, onError }: SceneProps & { onError: (err: string | null) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const compiledMath = useMemo(() => {
    try {
      return {
        f1: compile(params.f1),
        f2: compile(params.f2),
        uMin: compile(params.uMin),
        uMax: compile(params.uMax),
        vMin: compile(params.vMin),
        vMax: compile(params.vMax),
        error: null
      };
    } catch (err: any) {
      return { error: err.message };
    }
  }, [params.f1, params.f2, params.uMin, params.uMax, params.vMin, params.vMax]);

  const { geometry, error } = useMemo(() => {
    if (compiledMath.error) return { geometry: null, error: compiledMath.error };

    try {
      const { f1, f2, uMin: uMinC, uMax: uMaxC, vMin: vMinC, vMax: vMaxC } = compiledMath as any;

      const uMin = uMinC.evaluate();
      const uMax = uMaxC.evaluate();
      const vMin = vMinC.evaluate();
      const vMax = vMaxC.evaluate();

      const geom = new THREE.BufferGeometry();
      const vertices = [];
      const indices = [];
      const uvs = [];

      const slices = resolution;
      const stacks = resolution;

      const R = params.R;
      const tau = params.tau;
      const scope = { u: 0, v: 0 };

      for (let i = 0; i <= slices; i++) {
        const uNorm = i / slices;
        const u = uMin + uNorm * (uMax - uMin);
        scope.u = u;

        // Hoist u-dependent trigonometry out of the inner loop
        const cos_tau_u = Math.cos(tau * u);
        const sin_tau_u = Math.sin(tau * u);
        const cos_u = Math.cos(u);
        const sin_u = Math.sin(u);

        for (let j = 0; j <= stacks; j++) {
          const vNorm = j / stacks;
          const v = vMin + vNorm * (vMax - vMin);
          scope.v = v;

          const f1Val = f1.evaluate(scope);
          const f2Val = f2.evaluate(scope);

          const x = (R + f1Val * cos_tau_u - f2Val * sin_tau_u) * cos_u;
          const y = (R + f1Val * cos_tau_u - f2Val * sin_tau_u) * sin_u;
          const z = f1Val * sin_tau_u + f2Val * cos_tau_u;

          vertices.push(x, y, z);
          uvs.push(uNorm, vNorm);
        }
      }

      for (let i = 0; i < slices; i++) {
        for (let j = 0; j < stacks; j++) {
          const a = i * (stacks + 1) + j;
          const b = i * (stacks + 1) + j + 1;
          const c = (i + 1) * (stacks + 1) + j;
          const d = (i + 1) * (stacks + 1) + j + 1;

          indices.push(a, b, d);
          indices.push(a, d, c);
        }
      }

      geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geom.setIndex(indices);
      geom.computeVertexNormals();

      return { geometry: geom, error: null };
    } catch (err: any) {
      console.error("Math evaluation error:", err);
      return { geometry: null, error: err.message };
    }
  }, [compiledMath, params.R, params.tau, resolution]);

  React.useEffect(() => {
    onError(error);
  }, [error, onError]);

  React.useEffect(() => {
    // Prevent WebGL memory leaks by disposing of orphaned geometries
    return () => {
      if (geometry) {
        geometry.dispose();
      }
    };
  }, [geometry]);

  if (!geometry) {
    return null;
  }

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        color="#818cf8"
        side={THREE.DoubleSide}
        wireframe={wireframe}
        roughness={0.2}
        metalness={0.1}
      />
    </mesh>
  );
}

export function Scene({ params, wireframe, resolution }: SceneProps) {
  const [error, setError] = React.useState<string | null>(null);

  return (
    <div className="w-full h-full bg-zinc-950 relative">
      <Canvas camera={{ position: [8, 8, 8], fov: 45 }}>
        <color attach="background" args={['#09090b']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        
        <ParametricSurface params={params} wireframe={wireframe} resolution={resolution} onError={setError} />
        
        <OrbitControls 
          makeDefault 
          autoRotate 
          autoRotateSpeed={0.5} 
          enableDamping 
          dampingFactor={0.05} 
        />
        <gridHelper args={[20, 20, '#27272a', '#18181b']} position={[0, -5, 0]} />
        <axesHelper args={[5]} />
      </Canvas>
      
      {error && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm font-mono z-10">
          Error evaluating expression: {error}
        </div>
      )}
    </div>
  );
}
