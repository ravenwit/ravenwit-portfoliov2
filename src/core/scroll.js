// --- Virtual Momentum Scroll ---
// Provides Lenis-quality momentum smoothing for the virtual scroll
// without requiring scrollable DOM content.
//
// Lenis is installed but deferred to the SPA Router phase where
// actual page scrolling will benefit from it.

import { STATE } from '../state.js';
import { initiateTransition, initiateBackToHero, initiateResearchTransition, initiateTimelineReturn } from './transitions.js';
import { toggleCard } from '../components/nodes.js';

let transitionDeps = null;

// Momentum state
let targetY = 0;
let currentY = 0;
const LERP = 0.095;           // 0.05 = heavy momentum, 0.15 = responsive
const WHEEL_SCALE = 0.25;    // Raw delta → virtual scroll units
const MAX_SCROLL = 8000;     // Total virtual scroll range

export function setScrollTargetY(val) {
    currentY = val;
    targetY = val;
}

export function initScroll(deps) {
    transitionDeps = deps;

    function handleScrollInput(deltaY, rawDeltaY = deltaY) {
        // Critical block: Prevent input leaking during cinematic animations
        if (STATE.transitioning) return;

        if (STATE.phase === 'HERO') {
            if (rawDeltaY > 0) {
                const { cameraPath, torusMat, gridMat, starsMat, nodeGroup } = transitionDeps;
                initiateTransition(cameraPath, torusMat, gridMat, starsMat, nodeGroup);
            }
        } else if (STATE.phase === 'TIMELINE' && !STATE.transitioning) {
            // Back-to-hero check first
            if (currentY < 5 && rawDeltaY < -20) {
                const { torusMat, gridMat, starsMat, nodeGroup } = transitionDeps;
                initiateBackToHero(torusMat, gridMat, starsMat, nodeGroup);
                return;
            }

            // Close expanded cards on scroll
            if (Math.abs(rawDeltaY) > 5) {
                document.querySelectorAll('.hud-card.expanded').forEach(card => {
                    const idx = card.id.split('-')[1]; toggleCard(idx);
                });
            }

            // Accumulate target — actual movement is lerped per frame
            targetY += rawDeltaY * WHEEL_SCALE;
            targetY = Math.max(0, Math.min(targetY, MAX_SCROLL));
        } else if (STATE.phase === 'RESEARCH' && !STATE.transitioning) {
            // Check for exit bound
            if (STATE.researchScrollY <= 0.1 && rawDeltaY < -20) {
                const { cameraPath, torusMat, gridMat, starsMat, nodeGroup, researchMesh } = transitionDeps;
                initiateTimelineReturn(torusMat, gridMat, starsMat, nodeGroup, researchMesh, cameraPath);
                return;
            }

            const impulse = Math.sign(deltaY) * Math.min(Math.abs(deltaY), 200);
            STATE.researchVelocity += impulse * 0.0006;
        }
    }

    window.addEventListener('wheel', (e) => {
        e.preventDefault();

        // Cinematic wheel normalization
        let delta = e.deltaY;
        if (e.deltaMode === 1) delta *= 40;
        if (e.deltaMode === 2) delta *= window.innerHeight;

        handleScrollInput(delta, e.deltaY);
    }, { passive: false });

    // Touch support for tablets/mobile
    let touchStartY = 0;

    window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
            touchStartY = e.touches[0].clientY;
        }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        e.preventDefault(); // Prevent native scroll / bounce
        if (e.touches.length > 0) {
            const touchY = e.touches[0].clientY;
            // deltaY is positive when swiping up (scrolling down)
            // Multiply by a touch multiplier for better feel
            let deltaY = (touchStartY - touchY) * 1.5;
            touchStartY = touchY;

            handleScrollInput(deltaY, deltaY);
        }
    }, { passive: false });
}

/** Call once per frame — applies momentum lerp to STATE.targetScrollY */
export function updateScroll(_time) {
    if (STATE.phase !== 'RESEARCH') {
        currentY += (targetY - currentY) * LERP;
        STATE.targetScrollY = currentY;
    }
}
