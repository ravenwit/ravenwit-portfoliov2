// --- Virtual Momentum Scroll ---
// Provides Lenis-quality momentum smoothing for the virtual scroll
// without requiring scrollable DOM content.

import { STATE } from '../state.js';
import { toggleCard } from '../components/nodes.js';
import gsap from 'gsap';

// Momentum state
let currentJoystickOffset = 0;
let targetY = 0;
let currentY = 0;
const LERP = 0.095;
const WHEEL_SCALE = 0.25;
const MAX_SCROLL = 8000;

export function setScrollTargetY(val) {
    currentY = val;
    targetY = val;
}

export function initScroll() {

    function handleScrollInput(deltaY, rawDeltaY = deltaY) {
        if (STATE.transitioning) return;

        if (STATE.phase === 'TIMELINE' && !STATE.transitioning) {
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
            const impulse = Math.sign(deltaY) * Math.min(Math.abs(deltaY), 200);
            STATE.researchVelocity += impulse * 0.0006;
        }
        // HERO and WORKS phases: no scroll behavior (navigation via vortices/buttons)
    }

    window.addEventListener('wheel', (e) => {
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
        e.preventDefault();
        if (e.touches.length > 0) {
            const touchY = e.touches[0].clientY;
            let deltaY = (touchStartY - touchY) * 1.5;
            touchStartY = touchY;

            handleScrollInput(deltaY, deltaY);
        }
    }, { passive: false });

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
                onUpdate: function() {
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
        }

        currentY += (targetY - currentY) * LERP;
        STATE.targetScrollY = currentY;
    }
}