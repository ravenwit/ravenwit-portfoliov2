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

let lastJumpTime = 0;
let wheelAccumulator = 0;
let wheelResetTimeout = null;

export function jumpToMilestone(index, duration = 0.65) {
    if (!STATE.snapTargets || STATE.snapTargets.length === 0) return;
    const clampedIdx = Math.max(0, Math.min(index, STATE.snapTargets.length - 1));
    const snapY = STATE.snapTargets[clampedIdx];

    collapseAllCards();
    fadeSkillLabels();

    STATE.activeSnapIndex = clampedIdx;
    STATE.isSnapped = true;
    STATE.breakoutAccumulator = 0;
    lastJumpTime = Date.now();

    const scrollHint = document.getElementById('timeline-scroll-hint');
    if (scrollHint) {
        scrollHint.style.opacity = '0';
        scrollHint.style.pointerEvents = 'none';
    }

    gsap.killTweensOf(STATE);
    gsap.to({ y: targetY }, {
        y: snapY,
        duration: duration,
        ease: 'power2.inOut',
        onUpdate: function () {
            targetY = this.targets()[0].y;
        },
        onComplete: function () {
            targetY = snapY;
        }
    });
}

export function initScroll() {

    function handleScrollInput(deltaY, rawDeltaY = deltaY) {
        if (STATE.transitioning) return;

        if (STATE.phase === 'TIMELINE' && !STATE.transitioning) {
            const now = Date.now();
            if (now - lastJumpTime < 420) {
                return;
            }

            wheelAccumulator += rawDeltaY;

            clearTimeout(wheelResetTimeout);
            wheelResetTimeout = setTimeout(() => {
                wheelAccumulator = 0;
            }, 180);

            const SCROLL_THRESHOLD = 20;
            if (Math.abs(wheelAccumulator) >= SCROLL_THRESHOLD) {
                const direction = wheelAccumulator > 0 ? 1 : -1;
                wheelAccumulator = 0;
                const currentIdx = STATE.activeSnapIndex >= 0 ? STATE.activeSnapIndex : 0;
                jumpToMilestone(currentIdx + direction);
            }
        } else if (STATE.phase === 'RESEARCH' && !STATE.transitioning) {
            const impulse = Math.sign(deltaY) * Math.min(Math.abs(deltaY), 200);
            STATE.researchVelocity += impulse * 0.0006;
        }
    }

    const NATIVE_SCROLL_SELECTORS = '.card-logs, .hud-card.expanded, #readme-modal-overlay, .archive-catalog-panel, #archive-catalog-scroll, .playground-panel, #playground-bento-grid, #playground-modal, .playground-iframe-container, #terminal-overlay, #mobile-app-root, .mobile-tab-view, .mobile-tab-viewport, .mobile-archive-drawer, .archive-drawer-list, .mobile-sim-modal';

    window.addEventListener('wheel', (e) => {
        // In mobile mode, allow full native DOM scrolling
        if (STATE.isMobile || window.innerWidth <= 768) {
            return;
        }

        // If scrolling inside any scrollable overlay or panel, allow natural DOM scroll
        if (e.target.closest(NATIVE_SCROLL_SELECTORS)) {
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
        // In mobile mode, allow full native DOM touch scrolling
        if (STATE.isMobile || window.innerWidth <= 768 || e.target.closest(NATIVE_SCROLL_SELECTORS)) {
            return;
        }
        if (e.touches.length > 0) {
            touchStartY = e.touches[0].clientY;
        }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        // In mobile mode, allow full native DOM touch scrolling
        if (STATE.isMobile || window.innerWidth <= 768 || e.target.closest(NATIVE_SCROLL_SELECTORS)) {
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
        if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        const activeIdx = STATE.activeSnapIndex >= 0 ? STATE.activeSnapIndex : 0;
        const key = e.key.toLowerCase();

        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'ArrowRight' || key === 'j') {
            e.preventDefault();
            jumpToMilestone(activeIdx + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'ArrowLeft' || key === 'k') {
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

            if (STATE.snapTargets && STATE.snapTargets.length > 0) {
                let nearestIdx = 0;
                let minDist = Infinity;
                STATE.snapTargets.forEach((target, i) => {
                    const dist = Math.abs(targetY - target);
                    if (dist < minDist) {
                        minDist = dist;
                        nearestIdx = i;
                    }
                });
                jumpToMilestone(nearestIdx, 0.5);
            }
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