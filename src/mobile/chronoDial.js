// ==========================================================================
// Spacetime Portfolio — Relativistic Chrono-Dial Component (Branch: mobile2)
// Knurled Bezel, Polar Kinematics, Critically Damped Snap, Dual-Mode Engine
// ==========================================================================

import { STATE } from '../state.js';

export const SECTORS = [
    { id: 'HERO', label: 'ORIGIN', code: '00' },
    { id: 'TIMELINE', label: 'TIMELINE', code: '01' },
    { id: 'WORKS', label: 'HIGHLIGHTS', code: '02' },
    { id: 'RESEARCH', label: 'ARCHIVE', code: '03' }
];

let canvas, ctx;
let activeSectorIndex = 0;
let dialMode = 'MACRO'; // 'MACRO' or 'MICRO'
let currentAngle = 0; // Normalized dial position [0, 1]
let targetAngle = 0;
let isDragging = false;
let startTouchAngle = 0;
let startDialAngle = 0;
let lastTouchTime = 0;
let angularVelocity = 0;
let animationFrameId = null;

// Callbacks
let sectorChangeCallback = null;
let microScrubCallback = null;

// Telemetry DOM elements
let elSectorCode, elSectorName, elCoordTime, elProperTime, elResetBadge;

export function initChronoDial(onSectorChange, onMicroScrub) {
    sectorChangeCallback = onSectorChange;
    microScrubCallback = onMicroScrub;

    const consoleContainer = document.getElementById('chrono-dial-console');
    if (!consoleContainer) return;

    consoleContainer.style.display = 'flex';
    consoleContainer.innerHTML = `
        <div class="chrono-telemetry-strip">
            <div class="chrono-telemetry-left">
                <span class="chrono-pulse-dot"></span>
                <span id="chrono-sector-code">00</span>
                <span id="chrono-sector-name">ORIGIN</span>
                <span id="chrono-mode-tag" style="color: rgba(0,255,255,0.6); font-size: 8px;">[MACRO]</span>
            </div>
            <div class="chrono-telemetry-metrics">
                <span>t: <strong id="chrono-t" class="chrono-metric-tag">0.00</strong></span>
                <span>&tau;: <strong id="chrono-tau" class="chrono-metric-tag">0.00</strong></span>
                <button id="chrono-reset-btn" class="chrono-reset-badge" aria-label="Reset to Sector Mode">⟲ SECTOR</button>
            </div>
        </div>
        <div class="chrono-dial-stage" id="chrono-dial-stage">
            <canvas id="chronoDialCanvas"></canvas>
        </div>
    `;

    // Cache elements
    elSectorCode = document.getElementById('chrono-sector-code');
    elSectorName = document.getElementById('chrono-sector-name');
    elCoordTime = document.getElementById('chrono-t');
    elProperTime = document.getElementById('chrono-tau');
    elResetBadge = document.getElementById('chrono-reset-btn');

    canvas = document.getElementById('chronoDialCanvas');
    ctx = canvas.getContext('2d');

    // Setup canvas resolution
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Bind touch gestures on dial stage
    const stage = document.getElementById('chrono-dial-stage');
    stage.addEventListener('touchstart', onTouchStart, { passive: false });
    stage.addEventListener('touchmove', onTouchMove, { passive: false });
    stage.addEventListener('touchend', onTouchEnd, { passive: false });
    stage.addEventListener('touchcancel', onTouchEnd, { passive: false });

    // Mode reset button
    elResetBadge.addEventListener('click', (e) => {
        e.stopPropagation();
        setDialMode('MACRO');
        triggerHaptic(15);
    });

    // Initial position
    targetAngle = getSectorAngle(0);
    currentAngle = targetAngle;
    startRenderLoop();

    // Expose for external API / testing
    window.setMobileSector = setSector;
    window.setMobileDialMode = setDialMode;
}

function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
}

// --------------------------------------------------------------------------
// POLAR TOUCH KINEMATICS
// --------------------------------------------------------------------------
function getTouchAngle(touch) {
    const rect = canvas.getBoundingClientRect();
    const x0 = rect.left + rect.width / 2;
    // Anchor center slightly below stage for a comfortable sweep
    const y0 = rect.top + rect.height + 70;
    const dx = touch.clientX - x0;
    const dy = touch.clientY - y0;
    return Math.atan2(dy, dx);
}

function onTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 0) return;
    isDragging = true;
    startTouchAngle = getTouchAngle(e.touches[0]);
    startDialAngle = currentAngle;
    lastTouchTime = performance.now();
    angularVelocity = 0;
}

function onTouchMove(e) {
    if (!isDragging || e.touches.length === 0) return;
    e.preventDefault();

    const touchAngle = getTouchAngle(e.touches[0]);
    const dTheta = touchAngle - startTouchAngle;
    const now = performance.now();
    const dt = Math.max((now - lastTouchTime) / 1000, 0.008);

    // Calculate angular velocity with deadband
    if (Math.abs(dTheta) > 0.015) {
        angularVelocity = (dTheta / dt);
        // Velocity clamping (max 12 rad/s)
        angularVelocity = Math.max(-12.0, Math.min(12.0, angularVelocity));
    }

    lastTouchTime = now;

    // Map angular delta: full travel is roughly 1.6 radians
    const travelScale = 0.65;
    let newAngle = startDialAngle + (dTheta * travelScale);

    if (dialMode === 'MACRO') {
        newAngle = Math.max(-0.08, Math.min(1.08, newAngle));
        currentAngle = newAngle;
        targetAngle = newAngle;
    } else {
        // Micro-scrub mode: continuous fine scrub
        newAngle = Math.max(0, Math.min(1.0, newAngle));
        currentAngle = newAngle;
        targetAngle = newAngle;
        dispatchMicroScrub(currentAngle);
    }
}

function onTouchEnd(e) {
    if (!isDragging) return;
    isDragging = false;

    if (dialMode === 'MACRO') {
        // Snap to nearest of the 4 sectors with momentum
        const momentumOffset = angularVelocity * 0.04;
        const projectedAngle = currentAngle + momentumOffset;
        
        let bestIndex = 0;
        let minDiff = 999;
        for (let i = 0; i < SECTORS.length; i++) {
            const secAngle = getSectorAngle(i);
            const diff = Math.abs(projectedAngle - secAngle);
            if (diff < minDiff) {
                minDiff = diff;
                bestIndex = i;
            }
        }

        targetAngle = getSectorAngle(bestIndex);
        if (bestIndex !== activeSectorIndex) {
            triggerHaptic(18);
            setSector(bestIndex);
        } else {
            triggerHaptic(8);
        }
    } else {
        // Micro-scrub release snap if needed
        triggerHaptic(8);
    }
}

function getSectorAngle(index) {
    return index / (SECTORS.length - 1);
}

export function setSector(index) {
    if (index < 0 || index >= SECTORS.length) return;
    activeSectorIndex = index;
    targetAngle = getSectorAngle(index);

    const sec = SECTORS[index];
    if (elSectorCode) elSectorCode.innerText = sec.code;
    if (elSectorName) elSectorName.innerText = sec.label;

    if (sectorChangeCallback) {
        sectorChangeCallback(sec.id, index);
    }

    // Automatically transition to MICRO mode after sector settles
    setTimeout(() => {
        if (!isDragging && activeSectorIndex === index) {
            setDialMode('MICRO');
        }
    }, 450);
}

export function setDialMode(mode) {
    dialMode = mode;
    STATE.mobileDialMode = mode;
    const modeTag = document.getElementById('chrono-mode-tag');
    if (modeTag) {
        modeTag.innerText = `[${mode}]`;
        modeTag.style.color = mode === 'MICRO' ? '#00ffaa' : 'rgba(0,255,255,0.6)';
    }
}

function dispatchMicroScrub(val) {
    if (microScrubCallback) {
        microScrubCallback(SECTORS[activeSectorIndex].id, val);
    }
}

export function updateChronoTelemetry(t, tau) {
    if (elCoordTime) elCoordTime.innerText = Number(t).toFixed(2);
    if (elProperTime) elProperTime.innerText = Number(tau).toFixed(2);
}

function triggerHaptic(duration = 12) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
            navigator.vibrate(duration);
        } catch (err) {
            // Silently ignore browser restrictions
        }
    }
}

// --------------------------------------------------------------------------
// RENDER LOOP & KNURLED BEZEL DRAWING
// --------------------------------------------------------------------------
function startRenderLoop() {
    function loop() {
        animationFrameId = requestAnimationFrame(loop);

        // Critically damped spring snap: dAngle = target - current
        if (!isDragging) {
            const springK = 0.22;
            currentAngle += (targetAngle - currentAngle) * springK;
        }

        renderDialGraphics();
    }
    loop();
}

function renderDialGraphics() {
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h + 65;
    const radius = Math.min(w * 0.46, 175);

    // Start & End Angles for Bezel Arc
    const startArc = -Math.PI * 0.82;
    const endArc = -Math.PI * 0.18;
    const totalArc = endArc - startArc;

    // 1. Draw Background Metal Track Arc
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startArc, endArc);
    ctx.lineWidth = 14;
    ctx.strokeStyle = 'rgba(8, 16, 24, 0.9)';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, radius, startArc, endArc);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.25)';
    ctx.stroke();
    ctx.restore();

    // 2. Draw 40 Knurled Teeth along the arc
    const totalTeeth = 42;
    ctx.save();
    for (let i = 0; i <= totalTeeth; i++) {
        const t = i / totalTeeth;
        const angle = startArc + t * totalArc;
        const isMajor = i % 14 === 0;

        const innerR = radius - (isMajor ? 12 : 6);
        const outerR = radius + (isMajor ? 12 : 6);

        const x1 = cx + Math.cos(angle) * innerR;
        const y1 = cy + Math.sin(angle) * innerR;
        const x2 = cx + Math.cos(angle) * outerR;
        const y2 = cy + Math.sin(angle) * outerR;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = isMajor ? 2.2 : 1.2;
        ctx.strokeStyle = isMajor ? 'rgba(0, 255, 255, 0.7)' : 'rgba(0, 255, 255, 0.2)';
        ctx.stroke();
    }
    ctx.restore();

    // 3. Draw the 4 Sector Detents & Phosphor Labels
    ctx.save();
    for (let i = 0; i < SECTORS.length; i++) {
        const t = getSectorAngle(i);
        const angle = startArc + t * totalArc;
        const isActive = activeSectorIndex === i;

        const detentR = radius;
        const dx = cx + Math.cos(angle) * detentR;
        const dy = cy + Math.sin(angle) * detentR;

        // Glowing Detent Pip
        ctx.beginPath();
        ctx.arc(dx, dy, isActive ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? '#00ffff' : 'rgba(0, 255, 255, 0.4)';
        if (isActive) {
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 10;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label above detent
        const labelR = radius - 24;
        const lx = cx + Math.cos(angle) * labelR;
        const ly = cy + Math.sin(angle) * labelR;

        ctx.font = `600 ${isActive ? '9px' : '8px'} 'JetBrains Mono', monospace`;
        ctx.fillStyle = isActive ? '#00ffff' : 'rgba(255, 255, 255, 0.45)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(SECTORS[i].label, lx, ly);
    }
    ctx.restore();

    // 4. Draw Active Knurled Thumb Indicator (Needle Bezel)
    ctx.save();
    const clampedVal = Math.max(0, Math.min(1, currentAngle));
    const cursorAngle = startArc + clampedVal * totalArc;

    const needleInnerR = radius - 18;
    const needleOuterR = radius + 18;
    const nx1 = cx + Math.cos(cursorAngle) * needleInnerR;
    const ny1 = cy + Math.sin(cursorAngle) * needleInnerR;
    const nx2 = cx + Math.cos(cursorAngle) * needleOuterR;
    const ny2 = cy + Math.sin(cursorAngle) * needleOuterR;

    // Outer Glow Needle
    ctx.beginPath();
    ctx.moveTo(nx1, ny1);
    ctx.lineTo(nx2, ny2);
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = dialMode === 'MICRO' ? '#00ffaa' : '#00ffff';
    ctx.shadowColor = dialMode === 'MICRO' ? '#00ffaa' : '#00ffff';
    ctx.shadowBlur = 14;
    ctx.stroke();

    // Center Core Needle
    ctx.beginPath();
    ctx.moveTo(nx1, ny1);
    ctx.lineTo(nx2, ny2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.restore();
}
