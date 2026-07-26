// --- Vortex Singularity Module ---
// Navigation is now handled by the sleek Glassmorphic HUD Control Dock in Option B.
// Lightweight stub preserved for zero breaking changes across external imports.

import * as THREE from 'three';

export const vortexInstances = [];

export function createVortex(config) {
    const group = new THREE.Group();
    const instance = {
        group,
        setCamera: () => {},
        update: () => {},
        onClick: null,
        handleClick: () => false,
        dispose: () => {}
    };
    return instance;
}