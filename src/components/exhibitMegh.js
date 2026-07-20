// --- Megh Cloud Upload Exhibit ---
// Canvas2D animation showing: file → encryption particles → cloud upload → success.
// Brutalist paper card aesthetic matching research section.

import { STATE } from '../state.js';

let canvas, ctx;
let animating = false;
let initialized = false;
let animState = {
    stage: 0,        // 0=file, 1=encrypting, 2=uploading, 3=success
    progress: 0,
    particles: [],
    time: 0,
};

const STAGE_DURATION = 2.0; // seconds per stage

export function initMeghExhibit() {
    if (initialized) return;
    initialized = true;

    const container = document.getElementById('works-exhibit-container');
    if (!container) return;

    // Create exhibit HTML
    container.innerHTML = `
        <div id="megh-exhibit" style="display:flex; align-items:center; justify-content:center; gap:40px; padding:40px; width:100%; height:100%;">
            <div style="position:relative;">
                <canvas id="megh-canvas" width="500" height="350" style="border:2px solid #111; box-shadow:12px 12px 0 #111; background:#f4f3ef;"></canvas>
                <button id="megh-replay" style="position:absolute; bottom:10px; right:10px; padding:6px 12px; border:1px solid #111; background:#fff; cursor:pointer; font-family:'JetBrains Mono'; font-size:10px; z-index:5;">↻ Replay</button>
            </div>
            <div class="megh-info" style="max-width:350px;">
                <h2 style="font-family:'Playfair Display', serif; font-size:2rem; color:#111; margin-bottom:0.5rem;">Megh</h2>
                <p style="font-family:'JetBrains Mono', monospace; font-size:0.75rem; color:#333; line-height:1.6; margin-bottom:1.5rem;">
                    Encrypted cloud file upload with zero-knowledge encryption, 
                    decentralized storage, and seamless sharing.
                </p>
                <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:1.5rem;">
                    <span class="res-tag">React</span>
                    <span class="res-tag">TypeScript</span>
                    <span class="res-tag">Encryption</span>
                    <span class="res-tag">Cloud</span>
                </div>
                <a href="https://megh-vault.vercel.app" target="_blank" style="display:inline-block; padding:10px 20px; background:#111; color:#fff; text-decoration:none; font-family:'JetBrains Mono', monospace; font-size:0.8rem; border:none; cursor:pointer;">
                    Visit Megh →
                </a>
            </div>
        </div>
    `;

    canvas = document.getElementById('megh-canvas');
    ctx = canvas.getContext('2d');

    document.getElementById('megh-replay').addEventListener('click', resetAnimation);

    resetAnimation();
    startAnimation();
}

function resetAnimation() {
    animState = {
        stage: 0,
        progress: 0,
        particles: [],
        time: 0,
    };
}

function startAnimation() {
    animating = true;
    let lastTime = performance.now();
    function loop(timestamp) {
        if (!animating) return;
        // Bug fix: use actual delta time instead of fixed 16ms
        const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // cap at 50ms to avoid spiral
        lastTime = timestamp;
        animState.time += dt;
        animState.progress += dt / STAGE_DURATION;
        
        if (animState.progress >= 1.0) {
            animState.progress = 0;
            animState.stage = (animState.stage + 1) % 4;
        }
        
        render();
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}

function render() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#f4f3ef';
    ctx.fillRect(0, 0, w, h);

    // Grid lines (subtle)
    ctx.strokeStyle = 'rgba(17,17,17,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    const t = animState.progress;
    const stage = animState.stage;

    // File icon (center-left)
    const fileX = 150;
    const fileY = 175;
    const fileW = 60;
    const fileH = 80;

    // Cloud icon (center-right)
    const cloudX = 350;
    const cloudY = 160;
    const cloudR = 50;

    // Draw based on stage
    switch (stage) {
        case 0: // File appears, floating
            drawFile(fileX, fileY, fileW, fileH, 1.0);
            drawCloud(cloudX, cloudY, cloudR, 0.3);
            drawArrow(fileX + fileW, fileY, cloudX - cloudR, fileY, 0.2);
            break;

        case 1: // Encryption particles
            drawFile(fileX, fileY, fileW, fileH, 1.0);
            drawCloud(cloudX, cloudY, cloudR, 0.3);
            drawEncryptionParticles(fileX + fileW/2, fileY + fileH/2, t);
            break;

        case 2: // Uploading (file moves to cloud)
            const lerpX = fileX + (cloudX - fileX) * t;
            const lerpY = fileY + (cloudY - fileY) * t;
            const scale = 1 - t * 0.3;
            drawFile(lerpX, lerpY, fileW * scale, fileH * scale, 1 - t * 0.3);
            drawCloud(cloudX, cloudY, cloudR, 0.5 + t * 0.5);
            drawUploadTrail(fileX + fileW/2, fileY + fileH/2, lerpX + fileW*scale/2, lerpY + fileH*scale/2, t);
            break;

        case 3: // Success
            drawCloud(cloudX, cloudY, cloudR, 1.0);
            drawCheckmark(cloudX, cloudY, t);
            break;
    }

    // Stage label
    const labels = ['📄 Ready', '🔒 Encrypting', '☁️ Uploading', '✓ Complete'];
    ctx.fillStyle = '#111';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(labels[stage], w/2, h - 20);
}

function drawFile(x, y, w, h, opacity) {
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    
    // File shape
    // Bug fix: use manual rounded rect for broader browser compatibility
    const r = 4;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Lines on file
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 20 + i * 18);
        ctx.lineTo(x + w - 10, y + 20 + i * 18);
        ctx.stroke();
    }

    ctx.globalAlpha = 1;
}

function drawCloud(x, y, r, opacity) {
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#e0e0e0';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;

    // Cloud shape (three overlapping circles)
    ctx.beginPath();
    ctx.arc(x, y + 10, r * 0.6, 0, Math.PI * 2);
    ctx.arc(x - r * 0.5, y + 5, r * 0.5, 0, Math.PI * 2);
    ctx.arc(x + r * 0.5, y + 5, r * 0.5, 0, Math.PI * 2);
    ctx.arc(x, y - r * 0.3, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.globalAlpha = 1;
}

function drawArrow(x1, y1, x2, y2, opacity) {
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
}

function drawEncryptionParticles(cx, cy, t) {
    const count = 20;
    const radius = 40;

    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + t * Math.PI * 2;
        const dist = radius + Math.sin(t * Math.PI * 4 + i) * 10;
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist;

        ctx.fillStyle = `hsl(${(i / count) * 360}, 80%, 50%)`;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Lock icon in center
    ctx.fillStyle = '#111';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔒', cx, cy);
}

function drawUploadTrail(x1, y1, x2, y2, t) {
    const steps = 20;
    for (let i = 0; i < steps; i++) {
        const p = i / steps;
        const x = x1 + (x2 - x1) * p;
        const y = y1 + (y2 - y1) * p;
        const alpha = Math.sin(p * Math.PI) * 0.5;
        
        ctx.fillStyle = `rgba(0, 100, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, 2 + Math.sin(t * Math.PI * 4 + i) * 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawCheckmark(cx, cy, t) {
    const size = 30;
    const progress = Math.min(1, t * 2);

    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.4, cy);
    ctx.lineTo(cx - size * 0.1, cy + size * 0.4);
    ctx.lineTo(cx + size * 0.5, cy - size * 0.3);
    ctx.stroke();

    // Glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#4ade80';
    ctx.stroke();
    ctx.shadowBlur = 0;
}

export function destroyMeghExhibit() {
    initialized = false;
    animating = false;
    const container = document.getElementById('works-exhibit-container');
    if (container) container.innerHTML = '';
}