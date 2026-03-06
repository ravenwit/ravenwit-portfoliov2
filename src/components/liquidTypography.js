export function initLiquidTypography(canvasId, textDefault = "SHAKIR AHMED", textHover = "RAVENWIT") {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    let width, height;
    let particles = [];
    let mouse = { x: -1000, y: -1000, radius: 100 };

    // Physics constants
    const stiffness = 0.05;
    const drag = 0.85;
    const repulsionA = 50;

    function resize() {
        const container = canvas.parentElement;
        width = container.clientWidth || 500;
        height = container.clientHeight || 120;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        // Re-init with default text upon resize
        updateTargets(textDefault, true);
    }

    class Particle {
        constructor(x, y, isNew = false) {
            this.targetX = x;
            this.targetY = y;

            // If new particle being spawned mid-morph, spawn from center or random
            if (isNew) {
                this.x = width / 2 + (Math.random() - 0.5) * width;
                this.y = height / 2 + (Math.random() - 0.5) * height;
            } else {
                this.x = x + (Math.random() - 0.5) * 50;
                this.y = y + (Math.random() - 0.5) * 50;
            }

            this.vx = 0;
            this.vy = 0;

            this.radius = Math.random() * 1.5 + 0.5;
            this.color = `rgba(0, 255, 255, ${Math.random() * 0.5 + 0.5})`;
        }

        update() {
            let dx = this.targetX - this.x;
            let dy = this.targetY - this.y;
            let ax = dx * stiffness;
            let ay = dy * stiffness;

            let mdx = this.x - mouse.x;
            let mdy = this.y - mouse.y;
            let mDistSq = mdx * mdx + mdy * mdy;
            let mDist = Math.sqrt(mDistSq);

            if (mDist < mouse.radius && mDist > 0) {
                let nx = mdx / mDist;
                let ny = mdy / mDist;
                let force = repulsionA / (mDistSq + 10);
                ax += nx * force;
                ay += ny * force;
            }

            this.vx += ax;
            this.vy += ay;

            this.vx *= drag;
            this.vy *= drag;

            this.x += this.vx;
            this.y += this.vy;
        }

        draw(context) {
            context.beginPath();
            context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            context.fillStyle = this.color;
            context.fill();
        }
    }

    function updateTargets(newText, forceInit = false) {
        const offscreen = document.createElement('canvas');
        offscreen.width = width;
        offscreen.height = height;
        const octx = offscreen.getContext('2d');

        octx.fillStyle = 'white';
        // Compute dynamic font size based on container width so it doesn't clip
        const fontSize = Math.min((width * 0.9) / newText.length, height * 0.5);
        octx.font = `bold ${fontSize}px "Sixtyfour", "Courier New", monospace`;
        octx.textAlign = 'center';
        octx.textBaseline = 'middle';
        octx.fillText(newText, width / 2, height / 2);

        const textData = octx.getImageData(0, 0, width, height).data;
        const step = 3;

        let newTargets = [];
        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                const index = (y * width + x) * 4;
                const alpha = textData[index + 3];

                if (alpha > 128) {
                    newTargets.push({ x, y });
                }
            }
        }

        // Shuffle targets so particles cross over each other optimally for a "fluid" morph
        newTargets.sort(() => Math.random() - 0.5);

        if (forceInit) {
            particles = [];
            for (let i = 0; i < newTargets.length; i++) {
                particles.push(new Particle(newTargets[i].x, newTargets[i].y));
            }
        } else {
            // Morph existing particles to new targets
            for (let i = 0; i < Math.max(particles.length, newTargets.length); i++) {
                if (i < particles.length && i < newTargets.length) {
                    // Reassign target
                    particles[i].targetX = newTargets[i].x;
                    particles[i].targetY = newTargets[i].y;
                } else if (i >= particles.length) {
                    // Need more particles
                    particles.push(new Particle(newTargets[i].x, newTargets[i].y, true)); // Spawn randomly for transition
                } else {
                    // Too many particles, scatter them offscreen slowly so they disappear
                    particles[i].targetX = width / 2 + (Math.random() - 0.5) * width * 3;
                    particles[i].targetY = height / 2 + (Math.random() - 0.5) * height * 3;
                }
            }
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw(ctx);
        }
    }

    // Event Listeners
    window.addEventListener('resize', resize);

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    // Handle liquid morph interaction
    canvas.addEventListener('mouseenter', () => {
        updateTargets(textHover);
    });

    canvas.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
        updateTargets(textDefault);
    });

    // Start
    resize();
    animate();
}
