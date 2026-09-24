// ==========================================================================
// Spacetime Portfolio — Relativistic Chrono-Dial Dock (Branch: mobile2)
// 5-Detent Knurled Rotary Bezel, Polar Kinematics, Critically Damped Snap
// Controls 5 Main Pages: BIO, TIMELINE, WORKS, ARSENAL, LAB
// ==========================================================================

import { STATE } from '../state.js';

export const SECTORS = [
    { id: 'BIO', label: 'HOME', code: '01', sub: 'ORIGIN' },
    { id: 'TIMELINE', label: 'TIMELINE', code: '02', sub: '2011-2026' },
    { id: 'WORKS', label: 'WORKS', code: '03', sub: 'EXHIBITS' },
    { id: 'ARSENAL', label: 'ARSENAL', code: '04', sub: 'SKILLS' },
    { id: 'EXPERIMENTS', label: 'LAB', code: '05', sub: 'SIMS' }
];

let canvas, ctx;
let activeSectorIndex = 0;
let currentNorm = 0; // Normalized dial position [0, 1] mapped across the 5 sectors
let targetNorm = 0;
let isDragging = false;
let startTouchAngle = 0;
let startDialNorm = 0;
let lastTouchTime = 0;
let angularVelocity = 0;
let animationFrameId = null;

// Callback for tab switching
let tabChangeCallback = null;

// Telemetry DOM elements
let elSectorCode, elSectorName, elCoordTime, elProperTime;

export function initChronoDial(onTabChange) {
    tabChangeCallback = onTabChange;

    const consoleContainer = document.getElementById('chrono-dial-console');
    if (!consoleContainer) return;

    consoleContainer.style.display = 'flex';
    consoleContainer.innerHTML = `
        <!-- Top Telemetry Strip -->
        <div class="chrono-telemetry-strip">
            <div class="chrono-telemetry-left">
                <span class="chrono-pulse-dot"></span>
                <span id="chrono-sector-code" class="chrono-code-tag">01</span>
                <span id="chrono-sector-name" class="chrono-name-tag">HOME</span>
                <span class="chrono-mode-tag">[TAB DOCK]</span>
            </div>
            <div class="chrono-telemetry-metrics">
                <span>t: <strong id="chrono-t" class="chrono-metric-tag">0.00</strong></span>
                <span>&tau;: <strong id="chrono-tau" class="chrono-metric-tag">0.00</strong></span>
            </div>
        </div>

        <!-- Rotary Dial Bezel Canvas Stage -->
        <div class="chrono-dial-stage" id="chrono-dial-stage">
            <canvas id="chronoDialCanvas"></canvas>
        </div>

        <!-- 5 Direct 1-Tap Detent Buttons -->
        <div class="chrono-detents-bar" id="chrono-detents-bar">
            ${SECTORS.map((s, idx) => `
                <button class="chrono-detent-btn ${idx === 0 ? 'active' : ''}" data-idx="${idx}" data-id="${s.id}" aria-label="Switch to ${s.label}">
                    <span class="detent-pip"></span>
                    <span class="detent-label">${s.label}</span>
                </button>
            `).join('')}
        </div>
    `;

    // Cache elements
    elSectorCode = document.getElementById('chrono-sector-code');
    elSectorName = document.getElementById('chrono-sector-name');
    elCoordTime = document.getElementById('chrono-t');
    elProperTime = document.getElementById('chrono-tau');

    canvas = document.getElementById('chronoDialCanvas');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Bind pointer gestures exclusively if available, otherwise touch fallback
    const stage = document.getElementById('chrono-dial-stage');
    if (stage) {
        if (window.PointerEvent) {
            stage.addEventListener('pointerdown', onPointerDown, { passive: false });
            window.addEventListener('pointermove', onPointerMove, { passive: false });
            window.addEventListener('pointerup', onPointerUp, { passive: false });
            window.addEventListener('pointercancel', onPointerUp, { passive: false });
        } else {
            stage.addEventListener('touchstart', onTouchStart, { passive: false });
            stage.addEventListener('touchmove', onTouchMove, { passive: false });
            stage.addEventListener('touchend', onTouchEnd, { passive: false });
            stage.addEventListener('touchcancel', onTouchEnd, { passive: false });
        }
    }

    // Bind direct 1-tap detent buttons
    const detentsBar = consoleContainer.querySelector('#chrono-detents-bar');
    if (detentsBar) {
        const btns = detentsBar.querySelectorAll('.chrono-detent-btn');
        btns.forEach(btn => {
            const handleSelect = (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.getAttribute('data-idx'), 10);
                if (!isNaN(idx) && idx >= 0 && idx < SECTORS.length) {
                    if (idx !== activeSectorIndex) {
                        triggerHaptic(15);
                        setSector(idx);
                    } else {
                        const activeView = document.querySelector('.mobile-tab-view');
                        if (activeView) activeView.scrollTo({ top: 0, behavior: 'smooth' });
                        triggerHaptic(8);
                    }
                }
            };
            btn.addEventListener('pointerdown', (e) => e.stopPropagation(), { passive: true });
            btn.addEventListener('click', handleSelect);
        });
    }

    // Initial position
    targetNorm = getSectorNorm(0);
    currentNorm = targetNorm;
    startRenderLoop();

    // Expose for external calls
    window.setMobileSector = setSector;
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
// POLAR TOUCH & POINTER KINEMATICS
// --------------------------------------------------------------------------
function getPointerAngle(evt) {
    const rect = canvas.getBoundingClientRect();
    const x0 = rect.left + rect.width / 2;
    // Virtual pivot below stage for comfortable ergonomic thumb arc
    const y0 = rect.top + rect.height + 60;
    const clientX = evt.clientX ?? (evt.touches && evt.touches[0] ? evt.touches[0].clientX : x0);
    const clientY = evt.clientY ?? (evt.touches && evt.touches[0] ? evt.touches[0].clientY : y0);
    const dx = clientX - x0;
    const dy = clientY - y0;
    return Math.atan2(dy, dx);
}

let hasMovedSignificantly = false;
let startPointerX = 0;
let startPointerY = 0;

function onPointerDown(e) {
    isDragging = true;
    hasMovedSignificantly = false;
    startPointerX = e.clientX;
    startPointerY = e.clientY;
    startTouchAngle = getPointerAngle(e);
    startDialNorm = currentNorm;
    lastTouchTime = performance.now();
    angularVelocity = 0;
}

function onPointerMove(e) {
    if (!isDragging) return;
    if (Math.hypot(e.clientX - startPointerX, e.clientY - startPointerY) > 6) {
        hasMovedSignificantly = true;
    }

    const touchAngle = getPointerAngle(e);
    const dTheta = touchAngle - startTouchAngle;
    const now = performance.now();
    const dt = Math.max((now - lastTouchTime) / 1000, 0.008);

    if (Math.abs(dTheta) > 0.01) {
        angularVelocity = (dTheta / dt);
        angularVelocity = Math.max(-10.0, Math.min(10.0, angularVelocity));
    }
    lastTouchTime = now;

    // Full thumb sweep across arc (~2.04 radians = 0.65*PI) maps 1:1 to [0, 1]
    const travelScale = 0.49;
    let newNorm = startDialNorm + (dTheta * travelScale);
    newNorm = Math.max(-0.06, Math.min(1.06, newNorm));

    currentNorm = newNorm;
    targetNorm = newNorm;
}

function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;

    // If tap without significant drag, resolve detent directly from tap position
    if (!hasMovedSignificantly) {
        const rect = canvas.getBoundingClientRect();
        if (rect.width > 0) {
            const clientX = e.clientX ?? (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : rect.left + rect.width / 2);
            const tapNorm = (clientX - rect.left) / rect.width;
            const tapIndex = Math.max(0, Math.min(SECTORS.length - 1, Math.floor(tapNorm * SECTORS.length)));
            if (tapIndex !== activeSectorIndex) {
                triggerHaptic(18);
                setSector(tapIndex);
                return;
            }
        }
    }

    // Snap to nearest of the 5 detents with damped momentum
    // Spacing between sectors is 0.25; clamp momentum to +/- 0.14 so it cannot skip past an adjacent sector
    const momentumOffset = Math.max(-0.14, Math.min(0.14, angularVelocity * 0.012));
    const projectedNorm = currentNorm + momentumOffset;

    let bestIndex = 0;
    let minDiff = 999;
    for (let i = 0; i < SECTORS.length; i++) {
        const secNorm = getSectorNorm(i);
        const diff = Math.abs(projectedNorm - secNorm);
        if (diff < minDiff) {
            minDiff = diff;
            bestIndex = i;
        }
    }

    targetNorm = getSectorNorm(bestIndex);
    if (bestIndex !== activeSectorIndex) {
        triggerHaptic(18);
        setSector(bestIndex);
    } else {
        triggerHaptic(8);
    }
}

function onTouchStart(e) {
    if (e.touches.length === 0) return;
    onPointerDown(e.touches[0]);
}

function onTouchMove(e) {
    if (e.touches.length === 0) return;
    onPointerMove(e.touches[0]);
}

function onTouchEnd(e) {
    onPointerUp(e.changedTouches ? e.changedTouches[0] : e);
}

function getSectorNorm(index) {
    return index / (SECTORS.length - 1);
}

export function setLiveSwipeNorm(norm) {
    targetNorm = Math.max(-0.06, Math.min(1.06, norm));
}

export function getActiveSectorIndex() {
    return activeSectorIndex;
}

export { getSectorNorm, triggerHaptic };

export function setSector(index) {
    if (index < 0 || index >= SECTORS.length) return;
    activeSectorIndex = index;
    targetNorm = getSectorNorm(index);

    const sec = SECTORS[index];
    if (elSectorCode) elSectorCode.innerText = sec.code;
    if (elSectorName) elSectorName.innerText = sec.label;

    // Update active detent button state
    const detentBtns = document.querySelectorAll('.chrono-detent-btn');
    detentBtns.forEach((btn, idx) => {
        if (idx === index) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update telemetry metrics based on tab
    const tValues = [0.0, 5.2, 9.8, 12.4, 14.0];
    const t = tValues[index] || (index * 3.5);
    const tau = t * 0.87;
    updateChronoTelemetry(t, tau);

    if (tabChangeCallback) {
        tabChangeCallback(sec.id, index);
    }
}

export function updateChronoTelemetry(t, tau) {
    if (elCoordTime) elCoordTime.innerText = Number(t).toFixed(2);
    if (elProperTime) elProperTime.innerText = Number(tau).toFixed(2);
}

function triggerHaptic(durationMs = 15) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
            navigator.vibrate(durationMs);
        } catch (_) {}
    }
}

// --------------------------------------------------------------------------
// 60FPS CANVASES RENDER LOOP (Knurled Bezel & Detent Phosphor Arcs)
// --------------------------------------------------------------------------
function startRenderLoop() {
    let lastTime = performance.now();

    function render(now) {
        animationFrameId = requestAnimationFrame(render);
        if (!ctx || !canvas) return;

        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;

        // Critically damped spring towards targetNorm
        const springSpeed = isDragging ? 28.0 : 16.0;
        currentNorm += (targetNorm - currentNorm) * (1.0 - Math.exp(-springSpeed * dt));

        drawDial(currentNorm);
    }

    render(performance.now());
}

function drawDial(norm) {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h + 42; // Virtual center below canvas
    const rOuter = h + 36;
    const rInner = rOuter - 22;

    // Arc boundaries
    const arcSpan = Math.PI * 0.65; // ~117 degrees total sweep
    const baseAngle = -Math.PI / 2;
    const startArc = baseAngle - arcSpan / 2;
    const endArc = baseAngle + arcSpan / 2;

    // 1. Background Arc Track
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, startArc, endArc);
    ctx.strokeStyle = 'rgba(236, 231, 219, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, rInner, startArc, endArc);
    ctx.strokeStyle = 'rgba(236, 231, 219, 0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 2. Knurled Gear Teeth
    const teethCount = 36;
    for (let i = 0; i <= teethCount; i++) {
        const f = i / teethCount;
        const theta = startArc + f * arcSpan;
        const isMajor = i % 7 === 0;

        const len = isMajor ? 9 : 4;
        const x1 = cx + (rOuter - len) * Math.cos(theta);
        const y1 = cy + (rOuter - len) * Math.sin(theta);
        const x2 = cx + rOuter * Math.cos(theta);
        const y2 = cy + rOuter * Math.sin(theta);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = isMajor ? 'rgba(111, 220, 247, 0.45)' : 'rgba(236, 231, 219, 0.12)';
        ctx.lineWidth = isMajor ? 1.5 : 1;
        ctx.stroke();
    }

    // 3. 5 Detent Pips & Glow
    for (let i = 0; i < SECTORS.length; i++) {
        const secNorm = getSectorNorm(i);
        const theta = startArc + secNorm * arcSpan;
        const isActive = i === activeSectorIndex;

        const pipR = rOuter - 11;
        const px = cx + pipR * Math.cos(theta);
        const py = cy + pipR * Math.sin(theta);

        ctx.beginPath();
        ctx.arc(px, py, isActive ? 4 : 2, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? '#6fdcf7' : 'rgba(236, 231, 219, 0.28)';
        if (isActive) {
            ctx.shadowColor = '#6fdcf7';
            ctx.shadowBlur = 6;
        } else {
            ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // 4. Dial Needle / Active Sector Cursor
    const needleTheta = startArc + norm * arcSpan;
    const nx1 = cx + (rInner - 4) * Math.cos(needleTheta);
    const ny1 = cy + (rInner - 4) * Math.sin(needleTheta);
    const nx2 = cx + (rOuter + 3) * Math.cos(needleTheta);
    const ny2 = cy + (rOuter + 3) * Math.sin(needleTheta);

    ctx.beginPath();
    ctx.moveTo(nx1, ny1);
    ctx.lineTo(nx2, ny2);
    ctx.strokeStyle = '#e8b45c';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(232, 180, 92, 0.5)';
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;
}
