// --- Spacetime Portfolio | Modular Entry Point ---

import * as THREE from 'three';
import { STATE } from './state.js';
import { scene, camera, renderer, initRenderer, setupResize } from './core/scene.js';
import { buildCameraPath } from './core/cameraPath.js';
import { generateGeometry } from './core/geometryManager.js';
import { createNodes, toggleCard, startTypingInterval } from './components/nodes.js';
import { startAnimationLoop } from './core/animate.js';
import { initScroll } from './core/scroll.js';
import { CAREER_NODES } from './config.js';

async function init() {
    const statusDisp = document.getElementById('status-display');
    const updateLoading = (stage, progress) => {
        STATE.loadStage = stage;
        STATE.loadProgress = progress;
        if (statusDisp) statusDisp.innerText = stage;
        console.log(`[INIT] ${stage}: ${progress}%`);
    };

    window.addEventListener('click', (e) => {
        console.log("Global click registered on:", e.target, e.target.id, e.target.className);
    });

    // --- 0. FETCH DATA ---
    updateLoading('FETCHING_DATA', 5);
    try {
        const res = await fetch('/data/timeline.json');
        const timelineData = await res.json();

        let currentZ = -50;
        timelineData.forEach((item, index) => {
            item.x = index % 2 === 0 ? 25 : -30;
            item.y = 0;
            item.z = currentZ;

            // Algorithmic spacing based on node mass
            currentZ -= (90 + item.mass * 15);

            CAREER_NODES.push(item);
        });
    } catch (e) {
        console.error("Failed to load timeline data: ", e);
    }

    // --- 1. INIT RENDERER (10%) ---
    initRenderer();
    updateLoading('RENDERER_READY', 10);

    // --- 2-4. GENERATE GEOMETRY (WEB WORKER) ---
    // Offload heavy particle generation to a background thread
    const { torusMesh, torusMat, gridMesh, gridMat, starField, starsMat } = await generateGeometry((type, count) => {
        // Map worker progress to loading percentages (10% -> 75%)
        const map = { 'torus': 30, 'grid': 55, 'stars': 75 };
        const stageMap = { 'torus': 'TORUS_GENERATED', 'grid': 'GRID_GENERATED', 'stars': 'STARS_GENERATED' };
        if (map[type]) updateLoading(stageMap[type], map[type]);
    });

    scene.add(torusMesh);
    scene.add(gridMesh);
    scene.add(starField);

    // --- 5. CREATE NODES (15%) ---
    const nodeGroup = createNodes(gridMat);
    scene.add(nodeGroup);
    updateLoading('NODES_READY', 90);

    // --- 6. CAMERA PATH (5%) ---
    const cameraPath = buildCameraPath();
    updateLoading('COMPUTING_TRAJECTORY', 95);

    // --- 7. SHADER WARMUP (5%) ---
    renderer.compile(scene, camera);
    updateLoading('SYSTEM_WARMUP', 100);

    // --- 8. START LOGIC ---
    startTypingInterval();
    setupResize();

    // Lenis Smooth Scroll (replaces raw wheel events)
    initScroll({ cameraPath, torusMat, gridMat, starsMat, nodeGroup });

    // Initialize Fourier Canvas & Social Quanta
    import('./components/fourier.js').then(module => {
        module.initFourier('fourierCanvas');
    });

    import('./components/social.js').then(module => {
        module.initSocialQuanta();
    });

    startAnimationLoop(torusMesh, torusMat, gridMat, starsMat, nodeGroup, cameraPath);
}

// Start Initialization
init().catch(err => {
    console.error("Critical System Failure during initialization:", err);
    const statusDisp = document.getElementById('status-display');
    if (statusDisp) statusDisp.innerText = "FATAL_ERROR";
});
