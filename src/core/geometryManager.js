// --- Geometry Manager ---
// Coordinates Web Worker geometry generation and wraps results in Three.js objects.

import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { torusVertexShader } from '../shaders/torus.vert.js';
import { torusFragmentShader } from '../shaders/torus.frag.js';
import { gridVertexShader } from '../shaders/grid.vert.js';
import { gridFragmentShader } from '../shaders/grid.frag.js';
import { starVertexShader } from '../shaders/stars.vert.js';
import { starFragmentShader } from '../shaders/stars.frag.js';

/**
 * Spawn a geometry worker, request all three buffers in parallel,
 * and resolve with the fully assembled Three.js objects.
 */
export function generateGeometry(onProgress) {
    return new Promise((resolve) => {
        const worker = new Worker(
            new URL('../workers/geometry.worker.js', import.meta.url),
            { type: 'module' }
        );

        const results = {};
        let completed = 0;

        worker.onmessage = ({ data }) => {
            results[data.type] = data;
            completed++;
            if (onProgress) onProgress(data.type, completed);
            if (completed === 3) {
                worker.terminate();
                resolve(assemble(results));
            }
        };

        // Fire all three requests — worker handles them sequentially
        worker.postMessage({ type: 'torus' });
        worker.postMessage({
            type: 'grid',
            config: {
                gridZStart: CONFIG.gridZStart,
                gridZEnd: CONFIG.gridZEnd,
                gridWidth: CONFIG.gridWidth,
                gridDensity: CONFIG.gridDensity
            }
        });
        worker.postMessage({ type: 'stars' });
    });
}

function assemble(results) {
    // --- Torus ---
    const { positions: tPos, randoms } = results.torus;
    const torusGeo = new THREE.BufferGeometry();
    torusGeo.setAttribute('aLatticePos', new THREE.BufferAttribute(tPos, 3));
    torusGeo.setAttribute('position', new THREE.BufferAttribute(tPos.slice(), 3)); // clone since lattice is shared
    torusGeo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    const torusMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uNoiseTime: { value: 0 }, uTemperature: { value: 50.0 }, uStretch: { value: 0.0 } },
        vertexShader: torusVertexShader, fragmentShader: torusFragmentShader,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    const torusMesh = new THREE.Points(torusGeo, torusMat);

    // --- Grid ---
    const { positions: gPos } = results.grid;
    const gridGeo = new THREE.BufferGeometry();
    gridGeo.setAttribute('basePos', new THREE.BufferAttribute(gPos, 3));
    gridGeo.setAttribute('position', new THREE.BufferAttribute(gPos.slice(), 3));
    const gridMat = new THREE.ShaderMaterial({
        vertexShader: gridVertexShader, fragmentShader: gridFragmentShader,
        uniforms: {
            uTime: { value: 0 }, uOpacity: { value: 0.0 },
            uMassCount: { value: 0 },
            uMassPositions: { value: Array.from({ length: 10 }, () => new THREE.Vector3()) },
            uMassStrengths: { value: Array.from({ length: 10 }, () => 0) }
        },
        transparent: true, depthWrite: false, blending: THREE.NormalBlending
    });
    const gridMesh = new THREE.Points(gridGeo, gridMat);

    // --- Stars ---
    const { positions: sPos, sizes } = results.stars;
    const starsGeo = new THREE.BufferGeometry();
    starsGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    starsGeo.setAttribute('basePos', new THREE.BufferAttribute(sPos.slice(), 3));
    starsGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    const starsMat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 }, uCameraZ: { value: 0 }, uSpeed: { value: 0 }, uOpacity: { value: 0.0 },
            uMassCount: gridMat.uniforms.uMassCount, // share uniform reference
            uMassPositions: { value: gridMat.uniforms.uMassPositions.value },
            uMassStrengths: { value: gridMat.uniforms.uMassStrengths.value },
            uCameraPos: { value: new THREE.Vector3() }, uLensing: { value: CONFIG.lensingStrength }
        },
        vertexShader: starVertexShader, fragmentShader: starFragmentShader,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    const starField = new THREE.Points(starsGeo, starsMat);
    starField.frustumCulled = false;

    return { torusMesh, torusMat, gridMesh, gridMat, starField, starsMat };
}
