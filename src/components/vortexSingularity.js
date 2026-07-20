// --- Black Hole Vortex Singularity ---
// A 3D accretion disk + event horizon rendered in the hero scene.
// Two instances: Timeline (cyan) and Works (amber).
// Hover: accretion disk spins faster, glows brighter.
// Click: triggers black hole zoom transition.

import * as THREE from 'three';

export const vortexInstances = [];

export function createVortex(config) {
    const { color, position, targetPhase, scene } = config;
    const colorObj = new THREE.Color(color);

    const group = new THREE.Group();
    group.position.copy(position);

    // --- Accretion Disk (Particle System) ---
    const diskParticleCount = 5000;
    const diskGeo = new THREE.BufferGeometry();
    const diskPositions = new Float32Array(diskParticleCount * 3);
    const diskSizes = new Float32Array(diskParticleCount);
    const diskRandoms = new Float32Array(diskParticleCount);

    for (let i = 0; i < diskParticleCount; i++) {
        const radius = 1.5 + Math.random() * 6.0;
        const angle = Math.random() * Math.PI * 2 + (radius * 0.5);
        const height = (Math.random() - 0.5) * 0.8 * (1 - (radius - 1.5) / 6.0);
        
        diskPositions[i * 3] = Math.cos(angle) * radius;
        diskPositions[i * 3 + 1] = height;
        diskPositions[i * 3 + 2] = Math.sin(angle) * radius;
        
        diskSizes[i] = 0.05 + Math.random() * 0.15;
        diskRandoms[i] = Math.random();
    }

    diskGeo.setAttribute('position', new THREE.BufferAttribute(diskPositions, 3));
    diskGeo.setAttribute('size', new THREE.BufferAttribute(diskSizes, 1));
    diskGeo.setAttribute('aRandom', new THREE.BufferAttribute(diskRandoms, 1));

    const diskMat = new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: colorObj },
            uSpin: { value: 0.0 },
            uHover: { value: 0.0 },
            uTime: { value: 0.0 },
        },
        vertexShader: `
            uniform float uSpin;
            uniform float uHover;
            uniform float uTime;
            attribute float size;
            attribute float aRandom;
            varying float vAlpha;
            
            void main() {
                vec3 pos = position;
                
                float angle = uSpin + uHover * 2.0;
                float radius = length(pos.xz);
                float rotAngle = angle * (1.0 + (radius - 1.5) * 0.1);
                float c = cos(rotAngle);
                float s = sin(rotAngle);
                vec3 rotated = vec3(pos.x * c - pos.z * s, pos.y, pos.x * s + pos.z * c);
                
                float pull = uHover * 0.3;
                rotated.x *= (1.0 - pull);
                rotated.z *= (1.0 - pull);
                
                float pulse = 0.8 + 0.2 * sin(uTime * 2.0 + aRandom * 6.28);
                float hoverBright = 0.5 + 0.5 * uHover;
                vAlpha = pulse * hoverBright * (1.0 - (radius - 1.5) / 6.0);
                
                vec4 mvPosition = modelViewMatrix * vec4(rotated, 1.0);
                gl_PointSize = size * (80.0 / -mvPosition.z) * (1.0 + uHover * 0.5);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 uColor;
            varying float vAlpha;
            
            void main() {
                vec2 center = gl_PointCoord - 0.5;
                float dist = length(center);
                if (dist > 0.5) discard;
                
                float glow = exp(-dist * 6.0);
                float core = 1.0 - smoothstep(0.0, 0.5, dist);
                float alpha = vAlpha * (core * 0.4 + glow * 0.6);
                
                gl_FragColor = vec4(uColor, alpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    const diskMesh = new THREE.Points(diskGeo, diskMat);
    group.add(diskMesh);

    // --- Event Horizon (Inner Sphere) ---
    const horizonGeo = new THREE.SphereGeometry(0.6, 24, 24);
    const horizonMat = new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: colorObj },
            uHover: { value: 0.0 },
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vViewDir;
            uniform float uHover;
            
            void main() {
                vec3 pos = position;
                float scale = 1.0 + uHover * 0.1;
                pos *= scale;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                vNormal = normalize(normalMatrix * normal);
                vViewDir = normalize(-mvPosition.xyz);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 uColor;
            varying vec3 vNormal;
            varying vec3 vViewDir;
            
            void main() {
                float rim = 1.0 - max(dot(vNormal, vViewDir), 0.0);
                rim = pow(rim, 3.0);
                
                vec3 darkCenter = vec3(0.0, 0.0, 0.0);
                vec3 rimColor = uColor * 1.5;
                
                vec3 finalColor = mix(darkCenter, rimColor, rim);
                float alpha = 0.3 + rim * 0.7;
                
                gl_FragColor = vec4(finalColor, alpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        side: THREE.FrontSide,
    });

    const horizonMesh = new THREE.Mesh(horizonGeo, horizonMat);
    group.add(horizonMesh);

    // --- Glow Plane ---
    const glowGeo = new THREE.PlaneGeometry(3.0, 3.0);
    const glowMat = new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: colorObj },
            uHover: { value: 0.0 },
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 uColor;
            uniform float uHover;
            varying vec2 vUv;
            
            void main() {
                vec2 center = vUv - 0.5;
                float dist = length(center);
                float glow = exp(-dist * 4.0) * (0.3 + uHover * 0.5);
                gl_FragColor = vec4(uColor, glow * 0.15);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
    });

    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.rotation.x = -Math.PI / 2;
    glowMesh.position.y = -0.1;
    group.add(glowMesh);

    scene.add(group);

    // --- Interaction State ---
    let hovered = false;
    let hoverProgress = 0;
    let onClick = null;
    let cameraRef = null;

    // Simple 2D screen-space distance check for hover/click
    // This checks if the mouse cursor is within a radius of the vortex's screen position
    function isMouseNearVortex(mousePos) {
        if (!mousePos || !cameraRef) return false;
        
        // Get the vortex's world position
        const worldPos = new THREE.Vector3();
        group.getWorldPosition(worldPos);
        
        // Project to screen coordinates
        const vector = worldPos.clone().project(cameraRef);
        
        // Convert to pixel coordinates
        const sx = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const sy = (-vector.y * 0.5 + 0.5) * window.innerHeight;
        
        // mousePos is in normalized coordinates (-1 to 1)
        const mx = (mousePos.x * 0.5 + 0.5) * window.innerWidth;
        const my = (-mousePos.y * 0.5 + 0.5) * window.innerHeight;
        
        const dx = mx - sx;
        const dy = my - sy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        return dist < 100; // 100px click radius
    }

    const instance = {
        group,
        setCamera: (cam) => { cameraRef = cam; },
        update: (dt, mousePos) => {
            // Spin
            diskMat.uniforms.uSpin.value += dt * 0.3;
            diskMat.uniforms.uTime.value += dt;
            
            // Hover interpolation
            const isHovered = isMouseNearVortex(mousePos);
            if (isHovered && !hovered) {
                hovered = true;
                document.body.style.cursor = 'pointer';
            } else if (!isHovered && hovered) {
                hovered = false;
                document.body.style.cursor = 'default';
            }
            
            hoverProgress += (hovered ? 1 : -1) * dt * 3;
            hoverProgress = Math.max(0, Math.min(1, hoverProgress));
            
            diskMat.uniforms.uHover.value = hoverProgress;
            horizonMat.uniforms.uHover.value = hoverProgress;
            glowMat.uniforms.uHover.value = hoverProgress;
            
            // Gentle float
            group.position.y = position.y + Math.sin(Date.now() * 0.001) * 0.3;
        },
        set onClick(handler) {
            onClick = handler;
        },
        get onClick() {
            return onClick;
        },
        handleClick: (mousePos) => {
            if (isMouseNearVortex(mousePos) && onClick) {
                onClick();
                return true;
            }
            return false;
        },
        dispose: () => {
            scene.remove(group);
            diskGeo.dispose();
            diskMat.dispose();
            horizonGeo.dispose();
            horizonMat.dispose();
            glowGeo.dispose();
            glowMat.dispose();
            vortexInstances.splice(vortexInstances.indexOf(instance), 1);
        }
    };

    vortexInstances.push(instance);
    return instance;
}