import * as THREE from 'three';
import { gridVertexShader } from '../shaders/grid.vert.js';
import { gridFragmentShader } from '../shaders/grid.frag.js';
import { CONFIG } from '../config.js';

export function createGrid() {
    const gridPoints = [];
    for (let z = CONFIG.gridZStart; z > CONFIG.gridZEnd; z -= CONFIG.gridDensity) {
        for (let x = -CONFIG.gridWidth / 2; x < CONFIG.gridWidth / 2; x += CONFIG.gridDensity) {
            gridPoints.push(x, 0, z);
        }
    }
    const gridGeo = new THREE.BufferGeometry();
    gridGeo.setAttribute('basePos', new THREE.Float32BufferAttribute(gridPoints, 3));
    gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPoints, 3));
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
    return { gridMesh, gridMat };
}
