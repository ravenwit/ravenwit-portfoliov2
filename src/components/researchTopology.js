import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export let researchMaterialUniforms = { uScroll: { value: 0.0 } };
export let researchParticle;
export let researchNormalArrow;
export let baseResearchMesh;
export let researchLights;

export let researchScene;
export let researchCamera;
export let researchRenderer;
export let researchControls;

export function initResearchTopology() {
    const leftHemi = document.getElementById('left-hemi');
    if (!leftHemi) return null;

    // Independent Scene Setup
    researchScene = new THREE.Scene();
    researchCamera = new THREE.PerspectiveCamera(45, (window.innerWidth / 2) / window.innerHeight, 0.1, 100);
    researchCamera.position.set(8, 6, 8);

    researchRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    researchRenderer.setSize(window.innerWidth / 2, window.innerHeight);
    researchRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    leftHemi.appendChild(researchRenderer.domElement);

    researchControls = new OrbitControls(researchCamera, researchRenderer.domElement);
    researchControls.enableDamping = true;
    researchControls.enableZoom = false;
    researchControls.enablePan = false;

    // Geometry Generation
    const R = 3.0, segmentsU = 150, segmentsV = 60;
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array((segmentsU + 1) * (segmentsV + 1) * 3);
    const uvs = new Float32Array((segmentsU + 1) * (segmentsV + 1) * 2);
    const indices = [];
    let index3 = 0, index2 = 0;
    for (let i = 0; i <= segmentsU; i++) {
        for (let j = 0; j <= segmentsV; j++) {
            vertices[index3++] = 0; vertices[index3++] = 0; vertices[index3++] = 0;
            uvs[index2++] = i / segmentsU; uvs[index2++] = j / segmentsV;
        }
    }
    for (let i = 0; i < segmentsU; i++) {
        for (let j = 0; j < segmentsV; j++) {
            let a = i * (segmentsV + 1) + j, b = a + (segmentsV + 1), c = a + 1, d = b + 1;
            indices.push(a, b, d); indices.push(a, d, c);
        }
    }
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    // Prevent frustum culling since vertices are calculated in shader
    geometry.computeBoundingSphere();
    geometry.boundingSphere.radius = 10;

    const material = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa, roughness: 0.1, metalness: 0.8,
        side: THREE.DoubleSide, transparent: true, opacity: 0.8, wireframe: true
    });
    material.defines = { 'USE_UV': '' };

    material.onBeforeCompile = (shader) => {
        shader.uniforms.uScroll = researchMaterialUniforms.uScroll;

        shader.vertexShader = shader.vertexShader.replace(
            '#include <common>',
            `#include <common>
            uniform float uScroll;

            vec3 evaluateMasterEquation(float u_norm, float v_norm, float T_val) {
                float u = u_norm * 2.0 * PI;
                float geomT = min(T_val, 4.0);
                
                // Divide 4.0 scroll units into 2 main phases (Flatten, then Twist)
                float phase = floor(geomT / 2.0);
                if (phase >= 2.0) phase = 1.0;
                
                // Normalize lambda scale 0->1 per 2.0 duration phase
                float rawLambda = (geomT - phase * 2.0) / 2.0;
                if (geomT >= 4.0) rawLambda = 1.0;
                float lambda = rawLambda * rawLambda * (3.0 - 2.0 * rawLambda); // smoothstep

                // Kaizen Phase: Inflate as a non-orientable topology
                float inflateLambda = 0.0;
                if (T_val > 9.0) {
                    float rawInflate = min((T_val - 9.0) / 2.0, 1.0);
                    inflateLambda = rawInflate * rawInflate * (3.0 - 2.0 * rawInflate);
                }

                float f1, f2, tau;
                float vmax = 2.0 * PI; // Vmax is locked to 2*PI permanently
                float v = v_norm * vmax;
                
                if (phase < 0.5) { // Phase 0 (0-2.0): Flatten the Tube to a Ribbon
                    f1 = (1.0 - lambda) * cos(v) + lambda * sin(v); 
                    f2 = sin(v); 
                    tau = 0.0;
                } else { // Phase 1 (2.0-4.0): Perform the Half Twist
                    f1 = mix(sin(v), cos(v), inflateLambda); // Inflates back to cos(v) between S=9 and S=11
                    f2 = sin(v); 
                    tau = 0.5 * lambda;
                }

                float twistAngle = tau * u;
                float x_prime = f1 * cos(twistAngle) - f2 * sin(twistAngle);
                float z_prime = f1 * sin(twistAngle) + f2 * cos(twistAngle);
                
                float R = 3.0;
                return vec3((R + x_prime) * cos(u), z_prime, -(R + x_prime) * sin(u));
            }

            vec3 calculateNormal(float u_norm, float v_norm, float T_val, vec3 pos) {
                float d = 0.001;
                vec3 pU = evaluateMasterEquation(u_norm + d, v_norm, T_val);
                vec3 pV = evaluateMasterEquation(u_norm, v_norm + d, T_val);
                vec3 Tu = pU - pos;
                vec3 Tv = pV - pos;
                return normalize(cross(Tu, Tv));
            }
            `
        );

        shader.vertexShader = shader.vertexShader.replace(
            '#include <beginnormal_vertex>',
            `
            vec3 computedPos = evaluateMasterEquation(uv.x, uv.y, uScroll);
            vec3 objectNormal = calculateNormal(uv.x, uv.y, uScroll, computedPos);
            #ifdef USE_TANGENT
                vec3 objectTangent = vec3( tangent.xyz );
            #endif
            `
        );

        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `
            vec3 transformed = computedPos; 
            `
        );
    };

    baseResearchMesh = new THREE.Mesh(geometry, material);
    baseResearchMesh.frustumCulled = false;
    researchScene.add(baseResearchMesh);

    // Hidden initially
    baseResearchMesh.visible = false;

    researchParticle = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), new THREE.MeshBasicMaterial({ color: 0xFF3300 }));
    baseResearchMesh.add(researchParticle);
    researchNormalArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 1.5, 0xFF3300, 0.3, 0.2);
    baseResearchMesh.add(researchNormalArrow);

    researchParticle.visible = false;
    researchNormalArrow.visible = false;

    // Local Lights matching original prototype perfectly
    researchLights = new THREE.Group();
    researchLights.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dir1 = new THREE.DirectionalLight(0x00ffcc, 2.5); dir1.position.set(5, 5, 5); researchLights.add(dir1);
    const dir2 = new THREE.DirectionalLight(0xff0066, 2.0); dir2.position.set(-5, -2, -5); researchLights.add(dir2);

    researchScene.add(researchLights);

    return baseResearchMesh;
}

export function evaluateResearchParticleMath(u_norm, v_norm, T_val) {
    const R = 3.0;
    const u = u_norm * 2.0 * Math.PI;
    const geomT = Math.min(T_val, 4.0);

    let phase = Math.floor(geomT / 2.0);
    if (phase >= 2.0) phase = 1.0;

    let rawLambda = (geomT - phase * 2.0) / 2.0;
    if (geomT >= 4.0) rawLambda = 1.0;
    const lambda = rawLambda * rawLambda * (3.0 - 2.0 * rawLambda);

    let inflateLambda = 0.0;
    if (T_val > 9.0) {
        let rawInflate = Math.min((T_val - 9.0) / 2.0, 1.0);
        inflateLambda = rawInflate * rawInflate * (3.0 - 2.0 * rawInflate);
    }

    let f1, f2, tau;
    const vmax = 2.0 * Math.PI;
    const v = v_norm * vmax;

    if (phase === 0) {
        f1 = (1.0 - lambda) * Math.cos(v) + lambda * Math.sin(v);
        f2 = Math.sin(v);
        tau = 0.0;
    } else {
        f1 = (1.0 - inflateLambda) * Math.sin(v) + inflateLambda * Math.cos(v);
        f2 = Math.sin(v);
        tau = 0.5 * lambda;
    }

    const twistAngle = tau * u;
    const x_prime = f1 * Math.cos(twistAngle) - f2 * Math.sin(twistAngle);
    const z_prime = f1 * Math.sin(twistAngle) + f2 * Math.cos(twistAngle);
    return { pos: new THREE.Vector3((R + x_prime) * Math.cos(u), z_prime, -(R + x_prime) * Math.sin(u)) };
}
