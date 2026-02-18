import * as THREE from 'three';
import { torusVertexShader } from '../shaders/torus.vert.js';
import { torusFragmentShader } from '../shaders/torus.frag.js';

export function createTorus() {
    const torusGeo = new THREE.BufferGeometry();
    const positions = []; const randoms = [];
    const R = 35; const r = 12;
    for (let i = 0; i < 40000; i++) {
        const u = Math.random() * Math.PI * 2; const v = Math.random() * Math.PI * 2;
        positions.push((R + r * Math.cos(v)) * Math.cos(u), (R + r * Math.cos(v)) * Math.sin(u), r * Math.sin(v));
        randoms.push(Math.random());
    }
    torusGeo.setAttribute('aLatticePos', new THREE.Float32BufferAttribute(positions, 3));
    torusGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    torusGeo.setAttribute('aRandom', new THREE.Float32BufferAttribute(randoms, 1));
    const torusMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uNoiseTime: { value: 0 }, uTemperature: { value: 50.0 }, uStretch: { value: 0.0 } },
        vertexShader: torusVertexShader, fragmentShader: torusFragmentShader,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    const torusMesh = new THREE.Points(torusGeo, torusMat);
    return { torusMesh, torusMat };
}
