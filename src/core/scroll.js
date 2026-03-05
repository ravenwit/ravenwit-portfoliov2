// --- Virtual Momentum Scroll ---
// Provides Lenis-quality momentum smoothing for the virtual scroll
// without requiring scrollable DOM content.
//
// Lenis is installed but deferred to the SPA Router phase where
// actual page scrolling will benefit from it.

import { STATE } from '../state.js';
import { initiateTransition, initiateBackToHero, initiateResearchTransition, initiateTimelineReturn } from './transitions.js';
import { toggleCard } from '../components/nodes.js';
import gsap from 'gsap';

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
    STATE.targetScrollY = val;
    STATE.scrollY = val;
}

export function initGlobalNav() {
    const navNodes = document.querySelectorAll('.nav-node');
    navNodes.forEach(node => {
        node.addEventListener('click', (e) => {
            if (STATE.transitioning) return;
            const scrollTarget = parseInt(node.getAttribute('data-target'));

            // Store previous phase
            const previousPhase = STATE.phase;

            // If we are currently in HERO and clicking a timeline or topology node
            if (previousPhase === 'HERO' && scrollTarget > 0) {
                setScrollTargetY(scrollTarget);
                const { cameraPath, torusMat, gridMat, starsMat, nodeGroup } = transitionDeps;
                initiateTransition(cameraPath, torusMat, gridMat, starsMat, nodeGroup);
                return;
            }

            // If we are deep in Research and clicking back to Hero or Chronology
            if (previousPhase === 'RESEARCH') {
                const { torusMat, gridMat, starsMat, nodeGroup, cameraPath, researchMesh } = transitionDeps;

                // Let the transition engine handle the camera swap
                initiateTimelineReturn(torusMat, gridMat, starsMat, nodeGroup, researchMesh, cameraPath);

                if (scrollTarget === 0) {
                    setScrollTargetY(0);
                    setTimeout(() => {
                        initiateBackToHero(torusMat, gridMat, starsMat, nodeGroup);
                    }, 2000);
                } else if (scrollTarget < 5700) {
                    setScrollTargetY(scrollTarget);
                }
                return;
            }

            // If we are on the Chronology Timeline and clicking Hero
            if (previousPhase === 'TIMELINE' && scrollTarget === 0) {
                setScrollTargetY(0);
                const { torusMat, gridMat, starsMat, nodeGroup } = transitionDeps;
                initiateBackToHero(torusMat, gridMat, starsMat, nodeGroup);
                return;
            }

            // If we are on the Chronology Timeline and clicking Topology (Research)
            if (previousPhase === 'TIMELINE' && scrollTarget >= 10000) {
                setScrollTargetY(10000);
                const { researchMesh } = transitionDeps;
                initiateResearchTransition(researchMesh);
                return;
            }

            // Standard Timeline Instanced Jump (Just warp!)
            if (previousPhase === 'TIMELINE') {
                setScrollTargetY(scrollTarget);
            }
        });
    });
}

export function initScroll(deps) {
    transitionDeps = deps;

    window.addEventListener('wheel', (e) => {
        e.preventDefault();

        // Critical block: Prevent input leaking during cinematic animations
        if (STATE.transitioning) return;

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
        } else if (STATE.phase === 'RESEARCH' && !STATE.transitioning) {
            // Check for exit bound
            if (STATE.researchScrollY <= 0.1 && e.deltaY < -20) {
                const { cameraPath, torusMat, gridMat, starsMat, nodeGroup, researchMesh } = transitionDeps;
                initiateTimelineReturn(torusMat, gridMat, starsMat, nodeGroup, researchMesh, cameraPath);
                return;
            }

            // Cinematic wheel normalization
            let delta = e.deltaY;
            if (e.deltaMode === 1) delta *= 40;
            if (e.deltaMode === 2) delta *= window.innerHeight;

            const impulse = Math.sign(delta) * Math.min(Math.abs(delta), 200);
            STATE.researchVelocity += impulse * 0.0006;
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
