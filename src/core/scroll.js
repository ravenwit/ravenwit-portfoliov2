// --- Virtual Momentum Scroll & Magnetic Timeline Snapping ---
// Provides Lenis-quality momentum smoothing and magnetic snap points
// for guided timeline navigation.

import { STATE } from '../state.js';
import { CAREER_NODES } from '../config.js';
import { toggleCard, fadeSkillLabels, collapseAllCards } from '../components/nodes.js';
import gsap from 'gsap';

// Momentum & Snap state
let currentJoystickOffset = 0;
let targetY = 0;
let currentY = 0;
const LERP = 0.095;
const WHEEL_SCALE = 0.25;
const MAX_SCROLL = 8000;
const SNAP_RADIUS = 220; // Scroll units window for magnetic capture
const BREAKOUT_THRESHOLD = 90; // Accumulation threshold to break snap lock

export function setScrollTargetY(val) {
    currentY = val;
    targetY = val;
}

export function computeSnapTargets(cameraPath) {
    if (!CAREER_NODES || CAREER_NODES.length === 0) return;

    STATE.snapTargets = CAREER_NODES.map((node) => {
        let bestU = 0;
        let minDiff = Infinity;
        // Position camera 45 Z-units in front of the milestone for closer framing
        const targetZ = node.z + 45;
        for (let i = 0; i <= 2000; i++) {
            const u = i / 2000;
            const pt = cameraPath.getPointAt(u);
            const diff = Math.abs(pt.z - targetZ);
            if (diff < minDiff) {
                minDiff = diff;
                bestU = u;
            }
        }
        return bestU * MAX_SCROLL;
    });
}

export function jumpToMilestone(index) {
    if (!STATE.snapTargets || STATE.snapTargets.length === 0) return;
    const clampedIdx = Math.max(0, Math.min(index, STATE.snapTargets.length - 1));
    const snapY = STATE.snapTargets[clampedIdx];

    collapseAllCards();
    fadeSkillLabels();

    STATE.activeSnapIndex = clampedIdx;
    STATE.isSnapped = true;
    STATE.breakoutAccumulator = 0;

    gsap.to({ y: targetY }, {
        y: snapY,
        duration: 0.8,
        ease: 'power2.out',
        onUpdate: function () {
            targetY = this.targets()[0].y;
        }
    });
}

export function initScroll() {

    function handleScrollInput(deltaY, rawDeltaY = deltaY) {
        if (STATE.transitioning) return;

        if (STATE.phase === 'TIMELINE' && !STATE.transitioning) {
            if (Math.abs(rawDeltaY) > 5) {
                fadeSkillLabels();
                collapseAllCards();
            }
            if (STATE.isSnapped && STATE.activeSnapIndex >= 0) {
                STATE.breakoutAccumulator += Math.abs(rawDeltaY);

                if (STATE.breakoutAccumulator > BREAKOUT_THRESHOLD) {
                    // Release snap lock
                    STATE.isSnapped = false;
                    STATE.breakoutAccumulator = 0;
                    targetY += Math.sign(rawDeltaY) * 60;
                } else {
                    // Soft spring tether back to snap target
                    const snapY = STATE.snapTargets[STATE.activeSnapIndex];
                    targetY = snapY + (Math.sign(rawDeltaY) * (STATE.breakoutAccumulator * 0.4));
                    return;
                }
            } else {
                // Accumulate target
                targetY += rawDeltaY * WHEEL_SCALE;
                targetY = Math.max(0, Math.min(targetY, MAX_SCROLL));

                // Check for magnetic capture
                if (STATE.snapTargets && STATE.snapTargets.length > 0) {
                    for (let i = 0; i < STATE.snapTargets.length; i++) {
                        const snapY = STATE.snapTargets[i];
                        if (Math.abs(targetY - snapY) < SNAP_RADIUS) {
                            STATE.isSnapped = true;
                            STATE.activeSnapIndex = i;
                            STATE.breakoutAccumulator = 0;
                            targetY = snapY;
                            break;
                        }
                    }
                }
            }
        } else if (STATE.phase === 'RESEARCH' && !STATE.transitioning) {
            const impulse = Math.sign(deltaY) * Math.min(Math.abs(deltaY), 200);
            STATE.researchVelocity += impulse * 0.0006;
        }
    }

    window.addEventListener('wheel', (e) => {
        // If scrolling inside an expanded card, card-logs container, or readme modal, allow natural DOM scroll
        if (e.target.closest('.card-logs') || e.target.closest('.hud-card.expanded') || e.target.closest('#readme-modal-overlay')) {
            return;
        }

        e.preventDefault();

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
        if (e.target.closest('.card-logs') || e.target.closest('.hud-card.expanded') || e.target.closest('#readme-modal-overlay')) {
            return;
        }
        e.preventDefault();
        if (e.touches.length > 0) {
            const touchY = e.touches[0].clientY;
            let deltaY = (touchStartY - touchY) * 1.5;
            touchStartY = touchY;

            handleScrollInput(deltaY, deltaY);
        }
    }, { passive: false });

    // Keyboard Shortcuts for Timeline Navigation
    window.addEventListener('keydown', (e) => {
        if (STATE.phase !== 'TIMELINE' || STATE.transitioning) return;

        const activeIdx = STATE.activeSnapIndex >= 0 ? STATE.activeSnapIndex : 0;

        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            jumpToMilestone(activeIdx + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            jumpToMilestone(activeIdx - 1);
        } else if (e.key === 'Home') {
            e.preventDefault();
            jumpToMilestone(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            jumpToMilestone(STATE.snapTargets.length - 1);
        }
    });

    // --- Spring-Loaded Timeline Joystick Logic ---
    let isDraggingJoystick = false;
    let joystickStartY = 0;

    window.addEventListener('mousedown', (e) => {
        if (STATE.phase !== 'TIMELINE' || STATE.transitioning) return;
        if (e.target.closest('#timeline-player')) {
            isDraggingJoystick = true;
            joystickStartY = e.clientY - currentJoystickOffset;
            e.preventDefault();
            gsap.killTweensOf('#timeline-player');
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDraggingJoystick) return;

        let offset = e.clientY - joystickStartY;
        offset = Math.max(-120, Math.min(offset, 120));
        currentJoystickOffset = offset;

        gsap.set('#timeline-player', { y: currentJoystickOffset });
    });

    window.addEventListener('mouseup', () => {
        if (isDraggingJoystick) {
            isDraggingJoystick = false;
            gsap.to('#timeline-player', {
                y: 0,
                duration: 0.8,
                ease: 'elastic.out(1.2, 0.4)',
                onUpdate: function () {
                    currentJoystickOffset = gsap.getProperty('#timeline-player', 'y');
                }
            });
        }
    });
}

/** Call once per frame — applies momentum lerp to STATE.targetScrollY */
export function updateScroll(_time) {
    if (STATE.phase !== 'RESEARCH') {

        // --- Joystick Continuous Scrubbing ---
        if (STATE.phase === 'TIMELINE' && Math.abs(currentJoystickOffset) > 0.5) {
            const velocity = currentJoystickOffset * 0.4;
            targetY += velocity;
            targetY = Math.max(0, Math.min(targetY, MAX_SCROLL));
            STATE.isSnapped = false;
        }

        currentY += (targetY - currentY) * LERP;
        STATE.targetScrollY = currentY;
    }
}