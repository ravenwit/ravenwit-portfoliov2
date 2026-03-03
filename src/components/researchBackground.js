export let researchMouse = { x: -1000, y: -1000, px: -1000, py: -1000, vx: 0, vy: 0 };
export let hasInteractedResearch = false;

let width, height;
let strings = [];
let bgCanvas, ctx;

const stringCount = 90;
const pointsPerString = 170;
const baseRestoring = 0.00004;
const baseDamping = 0.9976;
const spongeWidth = 25;
const maxExtraDamping = 0.15;
const sourceAmplitude = 0.08;
const sourceFrequency = 0.003;
const sourceRadius = 400;
const waveNumber = 0.035;

class Point {
    constructor(x, y, gridX, gridY, w) {
        this.x = x; this.y = y; this.baseY = y; this.vy = 0;

        // 1. Dual-Hemisphere Refraction: Left side is dense/slow, Right side is fast
        this.c2 = (x < w / 2) ? 0.0015 : 0.006;

        this.localDamping = baseDamping;
        let minDist = Math.min(gridX, gridY);
        if (minDist < spongeWidth) {
            let penetration = (spongeWidth - minDist) / spongeWidth;
            this.localDamping = baseDamping - (maxExtraDamping * Math.pow(penetration, 2));
        }
    }
    update() {
        this.vy += (this.baseY - this.y) * baseRestoring;
        this.vy *= this.localDamping;
        this.y += this.vy;
    }
}

export function initResearchBG() {
    bgCanvas = document.getElementById('research-bg-canvas');
    if (!bgCanvas) return;

    ctx = bgCanvas.getContext('2d');
    width = bgCanvas.width = window.innerWidth;
    height = bgCanvas.height = window.innerHeight;

    strings = [];
    const xStep = width / (pointsPerString - 1);
    const yStep = height / (stringCount + 1);
    for (let i = 0; i < stringCount; i++) {
        let points = [];
        for (let j = 0; j < pointsPerString; j++) {
            points.push(new Point(j * xStep, (i + 1) * yStep, j, i, width));
        }
        strings.push(points);
    }
}

export function animateResearchBG(currentTime) {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // Draw dual-hemisphere scientific background
    ctx.fillStyle = 'rgba(12, 12, 12, 0.3)'; // Right (Cards)
    ctx.fillRect(width / 2, 0, width / 2, height);
    ctx.fillStyle = 'rgba(6, 6, 6, 0.3)'; // Left (Topology)
    ctx.fillRect(0, 0, width / 2, height);

    // Draw clinical guides
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2);
    ctx.stroke();

    const cX = width / 4, cY = height / 2;
    const r1 = Math.min(width, height) * 0.25;
    const r2 = Math.min(width, height) * 0.40;
    ctx.beginPath();
    ctx.arc(cX, cY, r1, 0, Math.PI * 2);
    ctx.arc(cX, cY, r2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    for (let a = 0; a < 360; a += 15) {
        let rad = (a * Math.PI) / 180;
        let tickDist = a % 90 === 0 ? 20 : 10;
        ctx.moveTo(cX + Math.cos(rad) * r2, cY + Math.sin(rad) * r2);
        ctx.lineTo(cX + Math.cos(rad) * (r2 + tickDist), cY + Math.sin(rad) * (r2 + tickDist));
    }
    ctx.stroke();

    researchMouse.vx *= 0.5; researchMouse.vy *= 0.5;
    const sourceX = width; const sourceY = height;

    for (let i = 0; i < stringCount; i++) {
        for (let j = 0; j < pointsPerString; j++) {
            let p = strings[i][j];

            // Mouse Interaction
            let dx = researchMouse.x - p.x, dy = researchMouse.y - p.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                let influence = 1 - (dist / 120);
                p.vy += researchMouse.vy * 0.05 * influence;
            }

            // Source Wave Generator
            let s_dx = sourceX - p.x, s_dy = sourceY - p.baseY;
            let s_dist = Math.sqrt(s_dx * s_dx + s_dy * s_dy);
            if (s_dist < sourceRadius) {
                let s_influence = Math.pow(1 - (s_dist / sourceRadius), 2);
                let projected_d = (s_dx + s_dy) / Math.SQRT2;
                p.vy += Math.cos(currentTime * sourceFrequency - waveNumber * projected_d) * sourceAmplitude * s_influence;
            }

            // Displacement Laplacian Approximation
            let u = p.y - p.baseY;
            let forceLeft = (j > 0) ? (strings[i][j - 1].y - p.y) : (strings[i][j + 1].y - p.y);
            let forceRight = (j < pointsPerString - 1) ? (strings[i][j + 1].y - p.y) : (strings[i][j - 1].y - p.y);
            let u_up = (i > 0) ? (strings[i - 1][j].y - strings[i - 1][j].baseY) : (strings[i + 1][j].y - strings[i + 1][j].baseY);
            let u_down = (i < stringCount - 1) ? (strings[i + 1][j].y - strings[i + 1][j].baseY) : (strings[i - 1][j].y - strings[i - 1][j].baseY);

            p.vy += (forceLeft + forceRight + (u_up - u) + (u_down - u)) * p.c2;
        }
    }

    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.0; ctx.globalAlpha = 0.08;
    for (let i = 0; i < stringCount; i++) {
        ctx.beginPath();
        for (let j = 0; j < pointsPerString; j++) {
            let p = strings[i][j]; p.update();
            j === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
}

let hasBoundMouse = false;

window.addEventListener('resize', () => {
    if (document.getElementById('ui-research') && document.getElementById('ui-research').style.display !== 'none') {
        initResearchBG();
    }
});

export function bindResearchMouse() {
    if (hasBoundMouse) return;
    window.addEventListener('mousemove', e => {
        if (!hasInteractedResearch) {
            researchMouse.px = researchMouse.x = e.clientX;
            researchMouse.py = researchMouse.y = e.clientY;
            hasInteractedResearch = true; return;
        }
        researchMouse.px = researchMouse.x; researchMouse.py = researchMouse.y;
        researchMouse.x = e.clientX; researchMouse.y = e.clientY;
        researchMouse.vx = researchMouse.x - researchMouse.px; researchMouse.vy = researchMouse.y - researchMouse.py;
    });
    hasBoundMouse = true;
}
