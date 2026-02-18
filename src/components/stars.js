import * as THREE from 'three';
import { starVertexShader } from '../shaders/stars.vert.js';
import { starFragmentShader } from '../shaders/stars.frag.js';
import { CONFIG } from '../config.js';

export function createStars(gridMat) {
    const starPos = []; const starSizes = [];
    for (let i = 0; i < 15000; i++) {
        starPos.push((Math.random() - 0.5) * 800, (Math.random() - 0.5) * 800, (Math.random() - 0.5) * 1000);
        starSizes.push(0.5 + Math.random() * 1.5);
    }
    const starsGeo = new THREE.BufferGeometry();
    starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    starsGeo.setAttribute('basePos', new THREE.Float32BufferAttribute(starPos, 3));
    starsGeo.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));
    const starsMat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 }, uCameraZ: { value: 0 }, uSpeed: { value: 0 }, uOpacity: { value: 0.0 },
            uMassPositions: { value: gridMat.uniforms.uMassPositions.value },
            uMassStrengths: { value: gridMat.uniforms.uMassStrengths.value },
            uCameraPos: { value: new THREE.Vector3() }, uLensing: { value: CONFIG.lensingStrength }
        },
        vertexShader: starVertexShader, fragmentShader: starFragmentShader,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    const starField = new THREE.Points(starsGeo, starsMat);
    starField.frustumCulled = false;
    return { starField, starsMat };
}
