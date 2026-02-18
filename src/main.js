// --- Spacetime Portfolio | Modular Entry Point ---

import { STATE } from './state.js';
import { scene, camera, initRenderer, setupResize } from './core/scene.js';
import { buildCameraPath } from './core/cameraPath.js';
import { createTorus } from './components/torus.js';
import { createGrid } from './components/grid.js';
import { createStars } from './components/stars.js';
import { createNodes, toggleCard, startTypingInterval } from './components/nodes.js';
import { initiateTransition, initiateBackToHero } from './core/transitions.js';
import { startAnimationLoop } from './core/animate.js';

// --- 1. INIT RENDERER ---
initRenderer();

// --- 2. CREATE 3D OBJECTS ---
const { torusMesh, torusMat } = createTorus();
scene.add(torusMesh);

const { gridMesh, gridMat } = createGrid();
scene.add(gridMesh);

const { starField, starsMat } = createStars(gridMat);
scene.add(starField);

const nodeGroup = createNodes(gridMat);
scene.add(nodeGroup);

// --- 3. CAMERA PATH ---
const cameraPath = buildCameraPath();

// --- 4. TYPING EFFECT ---
startTypingInterval();

// --- 5. EVENT LISTENERS ---
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

setupResize();

// --- 6. START ---
startAnimationLoop(torusMesh, torusMat, gridMat, starsMat, nodeGroup, cameraPath);
