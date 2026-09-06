export function initLiquidTypography(canvasId, textDefault = "SHAKIR AHMED", textHover = "RAVENWIT") {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    let width = 500;
    let height = 120;
    let particles = [];
    let annotations = [];
    let mouse = { x: -1000, y: -1000, prevX: -1000, prevY: -1000, radius: 85, radiusSq: 85 * 85, speed: 0 };
    let currentText = textDefault;
    let lastAnnotationFrame = 0;
    let frameCount = 0;

    // Physics constants (Hooke's law + aerodynamic drag + repulsion)
    const stiffness = 0.055;
    const drag = 0.84;
    const repulsionA = 65;

    // Ephemeral scientific Dadaist callouts
    const DADA_ANNOTATIONS = [
        "[ENTROPY: +1.42]",
        "∇ × v ≠ 0",
        "[TOLERANCE: ±∞]",
        "Ω = 0.88c",
        "[DADA: ALEATORIC]",
        "∮ p·dq = h",
        "[CHANCE: ARP-1916]",
        "[METRIC: KERR]",
        "[KINEMATIC SHEAR]",
        "Ψ(x) ⊗ Ψ(p)",
        "[ABSURDIST LEVER]"
    ];

    // Typographic Assemblage Recipes (Historical scientific, constructivist, & code foundries)
    const DADA_RECIPES = {
        "SHAKIR AHMED": [
            // S: 18th-century treatise serif (Euler/Newton manuscript)
            { char: 'S', font: 'italic 700 {size}px "Playfair Display", serif', scale: 1.14, yOff: -0.02, tilt: -0.04, mark: 'bracket-l' },
            // H: Heavy Constructivist Sans
            { char: 'H', font: '900 {size}px "Orbitron", sans-serif', scale: 0.94, yOff: 0.01, tilt: 0.02, mark: 'tick-top' },
            // A: Early CRT phosphor dot-matrix
            { char: 'A', font: '800 {size}px "Micro 5 Charted", "Doto", monospace', scale: 1.25, yOff: -0.03, tilt: 0, mark: 'none' },
            // K: Precision code terminal
            { char: 'K', font: '700 {size}px "JetBrains Mono", monospace', scale: 0.92, yOff: 0.02, tilt: -0.03, mark: 'none' },
            // I: Architectural drafting axis
            { char: 'I', font: '700 {size}px "JetBrains Mono", monospace', scale: 0.94, yOff: 0, tilt: 0, mark: 'crosshair' },
            // R: Tilted constructivist plate
            { char: 'R', font: '700 {size}px "Space Grotesk", sans-serif', scale: 1.0, yOff: 0.03, tilt: 0.04, mark: 'stamp' },
            // Kerning Space
            { char: ' ', font: '400 {size}px monospace', scale: 0.45, yOff: 0, tilt: 0, mark: 'sep' },
            // A: Modern geometric sans
            { char: 'A', font: '700 {size}px "Space Grotesk", sans-serif', scale: 0.98, yOff: -0.02, tilt: -0.02, mark: 'none' },
            // H: Monospace teletype
            { char: 'H', font: '700 {size}px "JetBrains Mono", monospace', scale: 0.92, yOff: 0.02, tilt: 0.03, mark: 'none' },
            // M: Wide classical serif
            { char: 'M', font: '700 {size}px "Playfair Display", serif', scale: 1.10, yOff: -0.01, tilt: 0, mark: 'none' },
            // E: High-density phosphor grid
            { char: 'E', font: '800 {size}px "Micro 5 Charted", "Doto", monospace', scale: 1.25, yOff: -0.03, tilt: -0.03, mark: 'tick-top' },
            // D: Constructivist terminal anchor
            { char: 'D', font: '900 {size}px "Orbitron", sans-serif', scale: 0.96, yOff: 0.01, tilt: 0.02, mark: 'bracket-r' }
        ],
        "RAVENWIT": [
            // R: Heavy constructivist anchor
            { char: 'R', font: '900 {size}px "Orbitron", sans-serif', scale: 1.05, yOff: 0.01, tilt: -0.03, mark: 'bracket-l' },
            // A: Classical mathematical serif
            { char: 'A', font: 'italic 700 {size}px "Playfair Display", serif', scale: 1.12, yOff: -0.02, tilt: 0.03, mark: 'none' },
            // V: Sharp architectural vector
            { char: 'V', font: '700 {size}px "Space Grotesk", sans-serif', scale: 0.98, yOff: 0.02, tilt: -0.02, mark: 'stamp' },
            // E: CRT phosphor matrix
            { char: 'E', font: '800 {size}px "Micro 5 Charted", "Doto", monospace', scale: 1.28, yOff: -0.03, tilt: 0, mark: 'tick-top' },
            // N: Monospace telemetry
            { char: 'N', font: '700 {size}px "JetBrains Mono", monospace', scale: 0.95, yOff: 0.01, tilt: 0.04, mark: 'none' },
            // W: Wide treatise serif
            { char: 'W', font: '700 {size}px "Playfair Display", serif', scale: 1.12, yOff: -0.01, tilt: -0.02, mark: 'none' },
            // I: Technical axis with crosshair
            { char: 'I', font: '700 {size}px "JetBrains Mono", monospace', scale: 0.95, yOff: 0, tilt: 0, mark: 'crosshair' },
            // T: Heavy constructivist crown
            { char: 'T', font: '900 {size}px "Orbitron", sans-serif', scale: 1.02, yOff: 0.02, tilt: 0.03, mark: 'bracket-r' }
        ]
    };

    function resize() {
        const container = canvas.parentElement;
        width = container ? (container.clientWidth || 500) : 500;
        height = container ? (container.clientHeight || 120) : 120;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.resetTransform();
        ctx.scale(dpr, dpr);

        updateTargets(currentText, true);
    }

    class Particle {
        constructor(x, y, isNew = false) {
            this.targetX = x;
            this.targetY = y;

            if (isNew) {
                this.x = width / 2 + (Math.random() - 0.5) * width;
                this.y = height / 2 + (Math.random() - 0.5) * height;
            } else {
                this.x = x + (Math.random() - 0.5) * 35;
                this.y = y + (Math.random() - 0.5) * 35;
            }

            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;

            // Dadaist heterogeneous particle palette:
            // 68% luminescent cyan phosphor, 22% stark paper white, 10% amber telemetry
            const roll = Math.random();
            if (roll < 0.68) {
                this.radius = Math.random() * 1.3 + 0.6;
                this.color = `rgba(0, 243, 255, ${(Math.random() * 0.45 + 0.55).toFixed(2)})`;
            } else if (roll < 0.90) {
                this.radius = Math.random() * 1.1 + 0.5;
                this.color = `rgba(240, 248, 255, ${(Math.random() * 0.4 + 0.5).toFixed(2)})`;
            } else {
                this.radius = Math.random() * 1.4 + 0.7;
                this.color = `rgba(255, 170, 0, ${(Math.random() * 0.5 + 0.5).toFixed(2)})`;
            }
            this.isSquare = Math.random() < 0.12;
        }

        update() {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            let ax = dx * stiffness;
            let ay = dy * stiffness;

            const mdx = this.x - mouse.x;
            const mdy = this.y - mouse.y;
            const mDistSq = mdx * mdx + mdy * mdy;

            if (mDistSq < mouse.radiusSq && mDistSq > 0) {
                const mDist = Math.sqrt(mDistSq);
                const force = repulsionA / (mDistSq + 25);
                ax += (mdx / mDist) * force;
                ay += (mdy / mDist) * force;
            }

            this.vx = (this.vx + ax) * drag;
            this.vy = (this.vy + ay) * drag;

            this.x += this.vx;
            this.y += this.vy;
        }

        draw(context) {
            context.fillStyle = this.color;
            if (this.isSquare) {
                context.fillRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            } else {
                context.beginPath();
                context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                context.fill();
            }
        }
    }

    function renderDadaCollageToOffscreen(text) {
        const offscreen = document.createElement('canvas');
        offscreen.width = width;
        offscreen.height = height;
        const octx = offscreen.getContext('2d');

        const recipe = DADA_RECIPES[text] || text.split('').map(c => ({
            char: c,
            font: '700 {size}px "JetBrains Mono", monospace',
            scale: 1.0,
            yOff: 0,
            tilt: 0,
            mark: 'none'
        }));

        // Mathematical scaling: base font size guarantees zero clipping across mobile & desktop
        const baseSize = Math.max(18, Math.min((width * 0.82) / Math.max(recipe.length * 0.75, 7), height * 0.48));

        // Step 1: Measure layout metrics with designated fonts
        const measuredChars = recipe.map(item => {
            const resolvedFont = item.font.replace('{size}', Math.round(baseSize * item.scale));
            octx.font = resolvedFont;
            const measuredWidth = item.char === ' ' ? baseSize * 0.4 : octx.measureText(item.char).width;
            return {
                ...item,
                fontResolved: resolvedFont,
                w: measuredWidth
            };
        });

        const letterSpacing = Math.max(2, baseSize * 0.07);
        const totalTextWidth = measuredChars.reduce((sum, c) => sum + c.w + letterSpacing, 0) - letterSpacing;
        let curX = (width - totalTextWidth) / 2;
        const centerY = height / 2;

        octx.fillStyle = '#ffffff';
        octx.strokeStyle = '#ffffff';
        octx.textBaseline = 'middle';

        // Step 2: Render each character as an avant-garde cutout assemblage
        measuredChars.forEach(item => {
            if (item.char === ' ') {
                curX += item.w + letterSpacing;
                return;
            }

            const charCenterX = curX + item.w / 2;
            const charCenterY = centerY + (item.yOff * baseSize);

            octx.save();
            octx.translate(charCenterX, charCenterY);
            if (item.tilt) {
                octx.rotate(item.tilt);
            }

            // Dadaist Decorative Assemblage Markings
            if (item.mark === 'stamp') {
                octx.save();
                octx.lineWidth = 1;
                octx.setLineDash([2, 2]);
                octx.strokeRect(-item.w / 2 - 3, -baseSize * 0.55, item.w + 6, baseSize * 1.1);
                octx.restore();
            } else if (item.mark === 'bracket-l') {
                octx.save();
                octx.lineWidth = 1.2;
                octx.beginPath();
                octx.moveTo(-item.w / 2 - 1, -baseSize * 0.45);
                octx.lineTo(-item.w / 2 - 5, -baseSize * 0.45);
                octx.lineTo(-item.w / 2 - 5, baseSize * 0.45);
                octx.lineTo(-item.w / 2 - 1, baseSize * 0.45);
                octx.stroke();
                octx.restore();
            } else if (item.mark === 'bracket-r') {
                octx.save();
                octx.lineWidth = 1.2;
                octx.beginPath();
                octx.moveTo(item.w / 2 + 1, -baseSize * 0.45);
                octx.lineTo(item.w / 2 + 5, -baseSize * 0.45);
                octx.lineTo(item.w / 2 + 5, baseSize * 0.45);
                octx.lineTo(item.w / 2 + 1, baseSize * 0.45);
                octx.stroke();
                octx.restore();
            } else if (item.mark === 'crosshair') {
                octx.save();
                octx.lineWidth = 1;
                octx.beginPath();
                // Top tick
                octx.moveTo(0, -baseSize * 0.55);
                octx.lineTo(0, -baseSize * 0.45);
                // Bottom tick
                octx.moveTo(0, baseSize * 0.45);
                octx.lineTo(0, baseSize * 0.55);
                octx.stroke();
                octx.restore();
            } else if (item.mark === 'tick-top') {
                octx.save();
                octx.lineWidth = 1;
                octx.beginPath();
                octx.moveTo(-2, -baseSize * 0.52);
                octx.lineTo(2, -baseSize * 0.52);
                octx.stroke();
                octx.restore();
            }

            // Draw Glyph
            octx.font = item.fontResolved;
            octx.fillText(item.char, -item.w / 2, 0);
            octx.restore();

            curX += item.w + letterSpacing;
        });

        return octx.getImageData(0, 0, width, height).data;
    }

    function updateTargets(newText, forceInit = false) {
        currentText = newText;
        const textData = renderDadaCollageToOffscreen(newText);
        const step = 3;
        const newTargets = [];

        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                const index = (y * width + x) * 4;
                const alpha = textData[index + 3];

                if (alpha > 105) {
                    newTargets.push({ x, y });
                }
            }
        }

        // Aleatoric shuffle: particles cross paths during transition like torn paper shreds
        newTargets.sort(() => Math.random() - 0.5);

        if (forceInit) {
            particles = [];
            for (let i = 0; i < newTargets.length; i++) {
                particles.push(new Particle(newTargets[i].x, newTargets[i].y));
            }
        } else {
            // Morph existing particles to new collage targets
            const maxLen = Math.max(particles.length, newTargets.length);
            for (let i = 0; i < maxLen; i++) {
                if (i < particles.length && i < newTargets.length) {
                    particles[i].targetX = newTargets[i].x;
                    particles[i].targetY = newTargets[i].y;
                    // Aleatoric kinetic flutter on morph
                    particles[i].vx += (Math.random() - 0.5) * 5.0;
                    particles[i].vy += (Math.random() - 0.5) * 5.0;
                } else if (i >= particles.length) {
                    particles.push(new Particle(newTargets[i].x, newTargets[i].y, true));
                } else {
                    // Softly scatter excess particles into the quantum field
                    particles[i].targetX = width / 2 + (Math.random() - 0.5) * width * 2.5;
                    particles[i].targetY = height / 2 + (Math.random() - 0.5) * height * 2.5;
                }
            }
        }
    }

    // Draw Duchampian Kinematic Linkages between displaced particle clusters
    function drawKinematicLinkages() {
        const displaced = [];
        const dispThresholdSq = 16; // Displaced > 4px from rest

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const dtx = p.x - p.targetX;
            const dty = p.y - p.targetY;
            if (dtx * dtx + dty * dty > dispThresholdSq) {
                displaced.push(p);
                if (displaced.length > 70) break; // Bounded for high-performance 60/120 FPS
            }
        }

        if (displaced.length < 2) return;

        ctx.save();
        ctx.lineWidth = 0.6;
        let drawnLinks = 0;
        const maxLinks = 90;
        const maxDistSq = 22 * 22;

        for (let i = 0; i < displaced.length && drawnLinks < maxLinks; i++) {
            const p1 = displaced[i];
            let linksForP1 = 0;

            for (let j = i + 1; j < displaced.length && drawnLinks < maxLinks; j++) {
                if (linksForP1 >= 2) break;
                const p2 = displaced[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < maxDistSq && distSq > 36) {
                    const dist = Math.sqrt(distSq);
                    const alpha = (1 - dist / 22) * 0.28;
                    ctx.strokeStyle = `rgba(0, 243, 255, ${alpha.toFixed(2)})`;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();

                    // Faux mechanical center vernier tick
                    if (dist > 14) {
                        const midX = (p1.x + p2.x) * 0.5;
                        const midY = (p1.y + p2.y) * 0.5;
                        ctx.fillStyle = `rgba(255, 170, 0, ${(alpha * 1.5).toFixed(2)})`;
                        ctx.fillRect(midX - 0.75, midY - 0.75, 1.5, 1.5);
                    }

                    drawnLinks++;
                    linksForP1++;
                }
            }
        }
        ctx.restore();
    }

    // Ephemeral Dadaist Annotations handling
    function updateAndDrawAnnotations() {
        if (annotations.length === 0) return;

        ctx.save();
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = annotations.length - 1; i >= 0; i--) {
            const a = annotations[i];
            a.life--;
            a.y += a.vy;

            const currentAlpha = (a.life / a.maxLife) * 0.85;
            if (a.life <= 0) {
                annotations.splice(i, 1);
                continue;
            }

            ctx.fillStyle = `rgba(${a.isAmber ? '255, 170, 0' : '0, 243, 255'}, ${currentAlpha.toFixed(2)})`;
            ctx.fillText(a.text, a.x, a.y);
        }
        ctx.restore();
    }

    function animate() {
        requestAnimationFrame(animate);
        frameCount++;
        ctx.clearRect(0, 0, width, height);

        // Update mouse speed & trigger spontaneous Dada annotations
        if (mouse.x > 0 && mouse.prevX > 0) {
            const mdx = mouse.x - mouse.prevX;
            const mdy = mouse.y - mouse.prevY;
            mouse.speed = Math.sqrt(mdx * mdx + mdy * mdy);

            if (mouse.speed > 2.5 && (frameCount - lastAnnotationFrame > 28) && annotations.length < 2) {
                const choice = DADA_ANNOTATIONS[Math.floor(Math.random() * DADA_ANNOTATIONS.length)];
                annotations.push({
                    text: choice,
                    x: Math.min(Math.max(mouse.x + (Math.random() - 0.5) * 30, 45), width - 45),
                    y: Math.max(mouse.y - 14, 15),
                    vy: -0.25,
                    life: 48,
                    maxLife: 48,
                    isAmber: Math.random() < 0.35
                });
                lastAnnotationFrame = frameCount;
            }
        }
        mouse.prevX = mouse.x;
        mouse.prevY = mouse.y;

        // Draw mechanical linkages first (behind particles)
        drawKinematicLinkages();

        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw(ctx);
        }

        // Draw floating absurdist annotations
        updateAndDrawAnnotations();
    }

    // Event Listeners
    window.addEventListener('resize', resize);

    function handlePointerMove(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = clientX - rect.left;
        mouse.y = clientY - rect.top;
    }

    canvas.addEventListener('mousemove', (e) => {
        handlePointerMove(e.clientX, e.clientY);
    });

    canvas.addEventListener('mouseenter', () => {
        updateTargets(textHover);
    });

    canvas.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
        mouse.prevX = -1000;
        mouse.prevY = -1000;
        updateTargets(textDefault);
    });

    // Touch Support for Mobile / Tablet
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) {
            handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
            updateTargets(textHover);
        }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
            handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    canvas.addEventListener('touchend', () => {
        mouse.x = -1000;
        mouse.y = -1000;
        updateTargets(textDefault);
    });

    // Start
    resize();
    animate();
}
