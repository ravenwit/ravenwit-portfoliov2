// --- Spacetime Portfolio | Modular Entry Point ---

import * as THREE from 'three';
import { STATE } from './state.js';
import { scene, camera, renderer, initRenderer, setupResize } from './core/scene.js';
import { buildCameraPath } from './core/cameraPath.js';
import { createTorus } from './components/torus.js';
import { createGrid } from './components/grid.js';
import { createStars } from './components/stars.js';
import { createNodes, toggleCard, startTypingInterval } from './components/nodes.js';
import { initiateTransition, initiateBackToHero } from './core/transitions.js';
import { startAnimationLoop } from './core/animate.js';

async function init() {
    const statusDisp = document.getElementById('status-display');
    const updateLoading = (stage, progress) => {
        STATE.loadStage = stage;
        STATE.loadProgress = progress;
        if (statusDisp) statusDisp.innerText = stage;
        console.log(`[INIT] ${stage}: ${progress}%`);
    };

    // --- 1. INIT RENDERER (10%) ---
    initRenderer();
    updateLoading('RENDERER_READY', 10);

    // --- 2. CREATE TORUS (30%) ---
    const { torusMesh, torusMat } = createTorus();
    scene.add(torusMesh);
    updateLoading('TORUS_READY', 40);

    // --- 3. CREATE GRID (20%) ---
    const { gridMesh, gridMat } = createGrid();
    scene.add(gridMesh);
    updateLoading('GRID_READY', 60);

    // --- 4. CREATE STARS (15%) ---
    const { starField, starsMat } = createStars(gridMat);
    scene.add(starField);
    updateLoading('STARS_READY', 75);

    // --- 5. CREATE NODES (15%) ---
    const nodeGroup = createNodes(gridMat);
    scene.add(nodeGroup);
    updateLoading('NODES_READY', 90);

    // --- 6. CAMERA PATH (5%) ---
    const cameraPath = buildCameraPath();
    updateLoading('COMPUTING_TRAJECTORY', 95);

    // --- 7. SHADER WARMUP (5%) ---
    // Force a render pass to trigger shader compilation
    renderer.compile(scene, camera);
    updateLoading('SYSTEM_WARMUP', 100);

    // --- 8. START LOGIC ---
    startTypingInterval();
    setupResize();

    // Wire wheel events
    window.addEventListener('wheel', (e) => {
        if (STATE.phase === 'HERO') {
            if (e.deltaY > 0) initiateTransition(cameraPath, torusMat, gridMat, starsMat, nodeGroup);
        } else if (STATE.phase === 'TIMELINE' && !STATE.transitioning) {
            if (STATE.scrollY < 5 && e.deltaY < -20) {
                initiateBackToHero(torusMat, gridMat, starsMat, nodeGroup);
            } else {
                if (Math.abs(e.deltaY) > 5) {
                    document.querySelectorAll('.hud-card.expanded').forEach(card => {
                        const idx = card.id.split('-')[1]; toggleCard(idx);
                    });
                }
                STATE.targetScrollY += e.deltaY * 0.25;
                STATE.targetScrollY = Math.max(0, Math.min(STATE.targetScrollY, 8000));
            }
        }
    });

    startAnimationLoop(torusMesh, torusMat, gridMat, starsMat, nodeGroup, cameraPath);
}

// Start Initialization
init().catch(err => {
    console.error("Critical System Failure during initialization:", err);
    const statusDisp = document.getElementById('status-display');
    if (statusDisp) statusDisp.innerText = "FATAL_ERROR";
});
