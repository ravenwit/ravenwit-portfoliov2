import * as THREE from 'three';
import { scalarVertexShader } from '../shaders/scalar.vert.js';
import { scalarFragmentShader } from '../shaders/scalar.frag.js';

export function createScalarField(positionsArray) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positionsArray, 3));

    const material = new THREE.ShaderMaterial({
        vertexShader: scalarVertexShader,
        fragmentShader: scalarFragmentShader,
        uniforms: {
            uTime: { value: 0 },
            uStretch: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uGlobalTemp: { value: 50.0 }
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const mesh = new THREE.Points(geometry, material);
    return { mesh, material };
}
