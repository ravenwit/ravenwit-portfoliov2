// --- Virtual Momentum Scroll ---
// Provides Lenis-quality momentum smoothing for the virtual scroll
// without requiring scrollable DOM content.
//
// Lenis is installed but deferred to the SPA Router phase where
// actual page scrolling will benefit from it.

import { STATE } from '../state.js';
import { initiateTransition, initiateBackToHero } from './transitions.js';
import { toggleCard } from '../components/nodes.js';

let transitionDeps = null;

// Momentum state
let targetY = 0;
let currentY = 0;
const LERP = 0.08;           // 0.05 = heavy momentum, 0.15 = responsive
const WHEEL_SCALE = 0.25;    // Raw delta → virtual scroll units
const MAX_SCROLL = 8000;     // Total virtual scroll range

export function initScroll(deps) {
    transitionDeps = deps;

    window.addEventListener('wheel', (e) => {
        e.preventDefault();

        if (STATE.phase === 'HERO') {
            if (e.deltaY > 0) {
                const { cameraPath, torusMat, gridMat, starsMat, nodeGroup } = transitionDeps;
                initiateTransition(cameraPath, torusMat, gridMat, starsMat, nodeGroup);
            }
        } else if (STATE.phase === 'TIMELINE' && !STATE.transitioning) {
            // Back-to-hero check first
            if (currentY < 5 && e.deltaY < -20) {
                const { torusMat, gridMat, starsMat, nodeGroup } = transitionDeps;
                initiateBackToHero(torusMat, gridMat, starsMat, nodeGroup);
                return;
            }

            // Close expanded cards on scroll
            if (Math.abs(e.deltaY) > 5) {
                document.querySelectorAll('.hud-card.expanded').forEach(card => {
                    const idx = card.id.split('-')[1]; toggleCard(idx);
                });
            }

            // Accumulate target — actual movement is lerped per frame
            targetY += e.deltaY * WHEEL_SCALE;
            targetY = Math.max(0, Math.min(targetY, MAX_SCROLL));
        }
    }, { passive: false });
}

/** Call once per frame — applies momentum lerp to STATE.targetScrollY */
export function updateScroll(_time) {
    currentY += (targetY - currentY) * LERP;
    STATE.targetScrollY = currentY;
}
