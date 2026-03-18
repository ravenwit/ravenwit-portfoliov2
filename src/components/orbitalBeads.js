// --- Semi-Circle Social Beads with Pluckable Strings ---
// Icons/beads form a downward semi-circle below the Fourier epicycles.
// CV and Resume anchor the two ends. Strings connect adjacent beads
// and can be "plucked" on hover with physics + sound.

export function initOrbitalBeads() {
    const heroLayer = document.getElementById('ui-hero');
    if (!heroLayer) return;

    // ── Data ───────────────────────────────────────────────
    // Order: CV (left end) → socials → Resume (right end)
    const beadsData = [
        { label: "CV", url: "/cv.pdf", iconPath: "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z", type: 'document', brandColor: '#c084fc' },
        { label: "GITHUB", url: "https://github.com/ravenwit", iconPath: "M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.45-1.15-1.11-1.46-1.11-1.46c-.9-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z", type: 'social', brandColor: '#b0b0b0' },
        { label: "LINKEDIN", url: "https://linkedin.com/in/shakir-ahmed-raven", iconPath: "M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z", type: 'social', brandColor: '#0A66C2' },
        { label: "RESEARCHGATE", url: "https://www.researchgate.net/profile/Shakir-Ahmed-5", iconPath: "M19.58 2.09c8.53 0 12.33 6.13 12.33 11.91 0 5.86-3.95 11.83-12.72 11.83H2.09V2.09h17.49zm-.4 19.34c5.05 0 8.04-3.8 8.04-8.08 0-4.49-3.23-8.32-8.35-8.32H6.96v16.4h12.23zm-.08-11.23h-6.28V7.27h6.28c2.4 0 3.73 1.16 3.73 2.92 0 1.94-1.55 3.01-3.73 3.01zm-6.28 2.24h.93c.15 0 .31-.08.31-.23v-1.94h-1.24v2.17zm9.64.93c.31.23.47.62.47 1.01 0 1-.93 1.63-2.17 1.63h-1.63v-5.11h2.25c1.16 0 1.86.54 1.86 1.4 0 .46-.23.85-.78 1.07", type: 'social', brandColor: '#00D0AF' },
        { label: "TWITTER", url: "https://twitter.com/shakir7733", iconPath: "M22.46 6c-.77.35-1.6.58-2.46.69c.88-.53 1.56-1.37 1.88-2.38c-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29c0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15c0 1.49.75 2.81 1.91 3.56c-.71 0-1.37-.2-1.95-.5v.05c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07a4.28 4.28 0 0 0 4 2.98a8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21C16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56c.84-.6 1.56-1.36 2.14-2.23Z", type: 'social', brandColor: '#1DA1F2' },
        { label: "INSTA", url: "https://www.instagram.com/raven.shakir", iconPath: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3Z", type: 'social', brandColor: '#E1306C' },
        { label: "RESUME", url: "/resume.pdf", iconPath: "M15 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9l-7-7zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm-1-8C12.45 5 12 4.55 12 4s.45-1 1-1 1 .45 1 1-.45 1-1 1z", type: 'document', brandColor: '#c084fc' },
    ];

    // ── Layout Config ──────────────────────────────────────
    let arcRadius = 100;            // Radius of the semi-circle arc (updates on resize)
    let cx = 210;                   // Arc center X (updates on resize)
    let cy = 60;                    // Arc center Y (updates on resize)
    const startAngle = Math.PI;     // Left end (180°)
    const endAngle = 0;             // Right end (0°) → forms a downward-opening semicircle

    // ── Create Container ───────────────────────────────────
    const cradle = document.createElement('div');
    cradle.id = 'string-cradle';
    // Position: center of epicycles is roughly at 50%,calc(50%+30px) in #ui-hero
    // The arc center is offset below that

    // ── String Canvas ──────────────────────────────────────
    const stringCanvas = document.createElement('canvas');
    stringCanvas.id = 'string-canvas';
    stringCanvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
    cradle.appendChild(stringCanvas);

    // ── Compute Bead Positions ─────────────────────────────
    const numBeads = beadsData.length;
    const beadPositions = []; // {x,y} relative to cradle center

    beadsData.forEach((data, i) => {
        // Evenly distribute from startAngle to endAngle
        const t = i / (numBeads - 1);
        const angle = startAngle + t * (endAngle - startAngle);
        const x = arcRadius * Math.cos(angle);
        const y = arcRadius * Math.sin(angle); // positive = downward in screen coords
        beadPositions.push({ x, y });
    });

    // ── Create Bead DOM Elements ───────────────────────────
    const beadElements = [];
    beadsData.forEach((data, i) => {
        const pos = beadPositions[i];

        const bead = document.createElement('a');
        bead.className = `orbital-bead ${data.type === 'document' ? 'document-bead' : ''}`;
        bead.href = data.url;
        bead.target = '_blank';
        bead.rel = 'noopener noreferrer';
        bead.style.position = 'absolute';
        // Position from cradle top-center. Arc center is (cx, cy) so endpoints are near top, arc hangs down
        const beadSize = data.type === 'document' ? 52 : 42;
        bead.style.left = `${cx + pos.x - beadSize / 2}px`;
        bead.style.top = `${cy + pos.y - beadSize / 2}px`;

        // Set brand color as CSS custom property for border/hover effects
        bead.style.setProperty('--brand-color', data.brandColor);
        bead.style.borderColor = data.brandColor + '66'; // 40% opacity

        const beadCore = document.createElement('div');
        beadCore.className = 'bead-core';

        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("class", "bead-icon");
        svg.style.fill = data.brandColor; // Brand color fill
        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", data.iconPath);
        svg.appendChild(path);

        const tooltip = document.createElement('span');
        tooltip.className = 'bead-label' + (data.type === 'document' ? ' label-above' : '');
        tooltip.style.color = data.brandColor;
        tooltip.style.textShadow = `0 0 6px ${data.brandColor}88`;
        tooltip.dataset.text = data.label;
        tooltip.innerText = data.label;

        bead.addEventListener('mouseenter', () => scrambleText(tooltip, data.label));

        beadCore.appendChild(svg);
        bead.appendChild(beadCore);
        bead.appendChild(tooltip);
        cradle.appendChild(bead);
        beadElements.push(bead);
    });

    heroLayer.appendChild(cradle);

    // ── String Physics State ───────────────────────────────
    // Each "string" connects bead i to bead i+1
    const NUM_STRING_POINTS = 30; // points per string for simulation
    const strings = [];

    for (let i = 0; i < numBeads - 1; i++) {
        const p0 = beadPositions[i];
        const p1 = beadPositions[i + 1];
        const points = [];
        for (let j = 0; j <= NUM_STRING_POINTS; j++) {
            const t = j / NUM_STRING_POINTS;
            points.push({
                x: p0.x + t * (p1.x - p0.x),
                y: p0.y + t * (p1.y - p0.y),
                vy: 0, // velocity perpendicular to string
                displacement: 0, // current perpendicular displacement
            });
        }
        strings.push({
            points,
            p0, p1,
            isPlucked: false,
            pluckTime: 0,
            // perpendicular direction (unit vector)
            dx: p1.x - p0.x,
            dy: p1.y - p0.y,
        });
    }

    // Compute perpendicular normals for each string
    strings.forEach(s => {
        const len = Math.sqrt(s.dx * s.dx + s.dy * s.dy);
        // Normal: perpendicular to the string direction
        s.nx = -s.dy / len;
        s.ny = s.dx / len;
        s.length = len;
    });

    // ── Web Audio Setup ────────────────────────────────────
    let audioCtx = null;
    function getAudioCtx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtx;
    }

    // Browsers block audio until user interacts (clicks, taps, etc.)
    const unlockAudio = () => {
        const ctx = getAudioCtx();
        if (ctx.state === 'suspended') ctx.resume();
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    let isMuted = true; // Default to muted until user actively enables sound
    const audioToggleBtn = document.getElementById('audio-toggle');
    const iconOff = document.getElementById('icon-sound-off');
    const iconOn = document.getElementById('icon-sound-on');
    const audioTooltip = audioToggleBtn ? audioToggleBtn.querySelector('.audio-tooltip') : null;

    if (audioToggleBtn) {
        audioToggleBtn.classList.add('muted');
        
        audioToggleBtn.addEventListener('click', (e) => {
            // Stop click from bubbling up to document and causing other interactions if needed
            e.stopPropagation();

            isMuted = !isMuted;
            audioToggleBtn.classList.add('interacted'); // stops pulsing
            
            const ctx = getAudioCtx();
            if (ctx.state === 'suspended') ctx.resume();

            if (isMuted) {
                iconOff.style.display = 'block';
                iconOn.style.display = 'none';
                if(audioTooltip) audioTooltip.innerText = "SOUND: OFF";
                audioToggleBtn.classList.add('muted');
            } else {
                iconOff.style.display = 'none';
                iconOn.style.display = 'block';
                if(audioTooltip) audioTooltip.innerText = "SOUND: ON";
                audioToggleBtn.classList.remove('muted');
            }
        });
    }

    function playPluckSound(stringIndex) {
        if (isMuted) return;

        try {
            const ctx = getAudioCtx();
            // Fallback resume if possible
            if (ctx.state === 'suspended') ctx.resume();
            // Base frequency varies by string position for musical variation
            const baseFreqs = [130.81, 164.81, 196.00, 220.00, 261.63, 329.63]; // C3-E4 range
            const freq = baseFreqs[stringIndex % baseFreqs.length];

            // Create a short noise burst filtered to simulate a pluck
            const duration = 0.8;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            // Slight detuning for organic feel
            osc.detune.setValueAtTime(Math.random() * 10 - 5, ctx.currentTime);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + duration);

            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            // Add a second harmonic for richness
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(freq * 2, ctx.currentTime);
            gain2.gain.setValueAtTime(0.05, ctx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * 0.6);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc2.connect(gain2);
            gain2.connect(ctx.destination);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
            osc2.start(ctx.currentTime);
            osc2.stop(ctx.currentTime + duration * 0.6);
        } catch (e) {
            // Audio fails silently — no big deal
        }
    }

    // ── Pluck Detection via Mouse ──────────────────────────
    let mousePos = { x: 0, y: 0 };
    let mouseInCradle = false;

    cradle.addEventListener('mousemove', (e) => {
        const rect = cradle.getBoundingClientRect();
        // Use dynamically computed cx, cy
        const arcScreenX = rect.left + cx;
        const arcScreenY = rect.top + cy;
        mousePos.x = e.clientX - arcScreenX;
        mousePos.y = e.clientY - arcScreenY;
        mouseInCradle = true;
    });

    cradle.addEventListener('mouseleave', () => {
        mouseInCradle = false;
    });

    // ── Canvas Rendering + Physics Loop ────────────────────
    let animating = true;

    function resizeCanvas() {
        const rect = cradle.getBoundingClientRect();
        if (rect.width === 0) return;

        const dpr = window.devicePixelRatio || 1;
        stringCanvas.width = rect.width * dpr;
        stringCanvas.height = rect.height * dpr;
        stringCanvas.style.width = rect.width + 'px';
        stringCanvas.style.height = rect.height + 'px';
        const sctx = stringCanvas.getContext('2d');
        sctx.scale(dpr, dpr);

        // Update responsive layout parameters based on cradle width
        // Cradle width is e.g. 35vw (max 480px, min 300px).
        // Arc radius is roughly 35% of the container width to fit nicely
        arcRadius = rect.width * 0.35;

        // Update arc center
        cx = rect.width / 2;
        cy = rect.height * 0.2; // 20% from top

        // Update bead positions
        beadsData.forEach((data, i) => {
            const t = i / (numBeads - 1);
            const angle = startAngle + t * (endAngle - startAngle);
            const x = arcRadius * Math.cos(angle);
            const y = arcRadius * Math.sin(angle);

            beadPositions[i] = { x, y };

            const bead = beadElements[i];
            const beadSize = data.type === 'document' ? 52 : 42;
            bead.style.left = `${cx + x - beadSize / 2}px`;
            bead.style.top = `${cy + y - beadSize / 2}px`;
        });

        // Re-update string endpoints and lengths
        strings.forEach((s, i) => {
            s.p0 = beadPositions[i];
            s.p1 = beadPositions[i + 1];
            s.dx = s.p1.x - s.p0.x;
            s.dy = s.p1.y - s.p0.y;
            const len = Math.sqrt(s.dx * s.dx + s.dy * s.dy);
            s.nx = -s.dy / len;
            s.ny = s.dx / len;
            s.length = len;
        });
    }

    // We need to wait for the cradle to be laid out
    requestAnimationFrame(() => {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    });

    function tick() {
        if (!animating) return;
        requestAnimationFrame(tick);

        const rect = cradle.getBoundingClientRect();
        if (rect.width === 0) return;

        const sctx = stringCanvas.getContext('2d');
        const cw = rect.width;
        const ch = rect.height;
        // cx and cy point to the dynamically updated outer variables

        // Reset canvas manually (avoid scale issues)
        const dpr = window.devicePixelRatio || 1;
        sctx.save();
        sctx.setTransform(1, 0, 0, 1, 0, 0);
        sctx.clearRect(0, 0, stringCanvas.width, stringCanvas.height);
        sctx.restore();

        // Physics constants
        const tension = 0.3;
        const damping = 0.96;
        const pluckStrength = 12;

        // ── Pluck detection ────────────────────────────
        if (mouseInCradle) {
            strings.forEach((s, idx) => {
                // Check if mouse is near this string
                const mx = mousePos.x;
                const my = mousePos.y;

                // Project mouse onto the string line segment
                const apx = mx - s.p0.x;
                const apy = my - s.p0.y;
                const abx = s.p1.x - s.p0.x;
                const aby = s.p1.y - s.p0.y;
                const abLenSq = abx * abx + aby * aby;
                const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / abLenSq));

                const closestX = s.p0.x + t * abx;
                const closestY = s.p0.y + t * aby;
                const distSq = (mx - closestX) ** 2 + (my - closestY) ** 2;
                const dist = Math.sqrt(distSq);

                // If mouse is within pluck range and string isn't already vibrating much
                if (dist < 25 && t > 0.1 && t < 0.9) {
                    const now = performance.now();
                    if (now - s.pluckTime > 400) { // Cooldown so we don't re-pluck instantly
                        s.pluckTime = now;
                        s.isPlucked = true;
                        playPluckSound(idx);

                        // Apply displacement at the point closest to mouse
                        const hitIndex = Math.round(t * NUM_STRING_POINTS);
                        for (let j = 1; j < NUM_STRING_POINTS; j++) {
                            // Triangular impulse centered at hitIndex
                            const d = Math.abs(j - hitIndex);
                            const influence = Math.max(0, 1 - d / (NUM_STRING_POINTS * 0.4));
                            // Determine pluck direction based on which side mouse is on
                            const side = (mx - closestX) * s.nx + (my - closestY) * s.ny > 0 ? 1 : -1;
                            s.points[j].displacement += side * pluckStrength * influence;
                        }
                    }
                }
            });
        }

        // ── Physics update ─────────────────────────────
        strings.forEach(s => {
            const pts = s.points;
            // Wave equation: acceleration = tension * (left + right - 2*current)
            for (let j = 1; j < NUM_STRING_POINTS; j++) {
                const left = pts[j - 1].displacement;
                const right = pts[j + 1] ? pts[j + 1].displacement : 0;
                const current = pts[j].displacement;
                const accel = tension * (left + right - 2 * current);
                pts[j].vy += accel;
                pts[j].vy *= damping;
            }
            for (let j = 1; j < NUM_STRING_POINTS; j++) {
                pts[j].displacement += pts[j].vy;
            }
            // Endpoints are fixed
            pts[0].displacement = 0;
            pts[NUM_STRING_POINTS].displacement = 0;
        });

        // ── Draw strings ───────────────────────────────
        strings.forEach((s, idx) => {
            const pts = s.points;

            // Compute draw coordinates for each point
            const drawCoords = [];
            for (let j = 0; j <= NUM_STRING_POINTS; j++) {
                const t = j / NUM_STRING_POINTS;
                const rx = s.p0.x + t * (s.p1.x - s.p0.x);
                const ry = s.p0.y + t * (s.p1.y - s.p0.y);
                const sag = Math.sin(t * Math.PI) * 8;
                const disp = pts[j].displacement;
                drawCoords.push({
                    x: cx + rx + s.nx * (disp + sag),
                    y: cy + ry + s.ny * (disp + sag),
                });
            }

            // Create gradient between endpoint brand colors
            const startColor = beadsData[idx].brandColor;
            const endColor = beadsData[idx + 1].brandColor;
            const grad = sctx.createLinearGradient(
                drawCoords[0].x, drawCoords[0].y,
                drawCoords[NUM_STRING_POINTS].x, drawCoords[NUM_STRING_POINTS].y
            );

            // Glow intensity based on vibration energy
            let energy = 0;
            for (let j = 0; j <= NUM_STRING_POINTS; j++) {
                energy += Math.abs(pts[j].displacement);
            }
            const glowAlpha = Math.min(1, 0.35 + energy * 0.05);

            // Use hex-to-rgba helper for gradient stops
            grad.addColorStop(0, hexToRgba(startColor, glowAlpha));
            grad.addColorStop(1, hexToRgba(endColor, glowAlpha));

            sctx.beginPath();
            for (let j = 0; j <= NUM_STRING_POINTS; j++) {
                if (j === 0) sctx.moveTo(drawCoords[j].x, drawCoords[j].y);
                else sctx.lineTo(drawCoords[j].x, drawCoords[j].y);
            }

            sctx.strokeStyle = grad;
            sctx.lineWidth = 1.5;
            // Mix the two colors for glow
            const glowColor = energy > 1 ? startColor : 'transparent';
            sctx.shadowBlur = energy > 1 ? Math.min(15, energy * 2) : 0;
            sctx.shadowColor = glowColor;
            sctx.stroke();
            sctx.shadowBlur = 0;
        });
    }

    requestAnimationFrame(tick);

    // ── Cleanup hook (for hot-reloading) ───────────────────
    if (import.meta.hot) {
        import.meta.hot.dispose(() => { animating = false; });
    }
}

// ── Scramble text effect ───────────────────────────────────
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
function scrambleText(element, finalString) {
    let iterations = 0;
    const interval = setInterval(() => {
        element.innerText = finalString.split('').map((char, index) => {
            if (index < iterations) return finalString[index];
            return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        if (iterations >= finalString.length) clearInterval(interval);
        iterations += 1 / 2;
    }, 20);
}
// ── Helper ─────────────────────────────────────────────────
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
