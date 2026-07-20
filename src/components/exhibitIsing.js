// --- 2D Ising Model Exhibit ---
// Renders 200x200 Monte Carlo simulation using a Web Worker.
// Canvas2D for rendering: 800x800px (4px per spin).
// Red = spin up, Blue = spin down.
// Temperature slider, magnetization graph, reset button.

import { STATE } from '../state.js';

const N = 200;
const N2 = N * N;
const CANVAS_SIZE = 800;
const PIXEL_SIZE = CANVAS_SIZE / N; // 4

let worker = null;
let canvas, ctx, magCanvas, magCtx;
let currentGrid = null;
let magHistory = [];
let animating = false;
let initialized = false;
let workerBusy = false;  // Bug fix: prevent message queue overflow
let imageDataCache = null;  // Bug fix: reuse ImageData instead of allocating every frame

export function initIsingExhibit() {
    if (initialized) return;
    initialized = true;

    const container = document.getElementById('ising-container');
    if (!container) return;
    container.style.display = 'block';

    // Create canvas
    canvas = document.createElement('canvas');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    canvas.style.cssText = 'display:block; margin:20px auto; border:2px solid #333; border-radius:4px;';
    container.appendChild(canvas);
    ctx = canvas.getContext('2d');

    // Controls
    const controls = document.createElement('div');
    controls.style.cssText = 'position:absolute; bottom:40px; left:50%; transform:translateX(-50%); display:flex; align-items:center; gap:16px; background:rgba(0,0,0,0.7); padding:12px 20px; border:1px solid rgba(255,255,255,0.1); border-radius:8px; z-index:20;';
    
    controls.innerHTML = `
        <label style="font-family:'JetBrains Mono'; font-size:11px; color:#888;">
            Temperature: <span id="ising-temp-display" style="color:#fff;">3.0</span>
        </label>
        <input type="range" id="ising-temp-slider" min="0.1" max="5.0" step="0.1" value="3.0" style="width:150px;">
        <button id="ising-reset" style="background:transparent; border:1px solid #ff4444; color:#ff4444; padding:4px 12px; border-radius:4px; cursor:pointer; font-family:'JetBrains Mono'; font-size:11px;">Reset</button>
        <canvas id="ising-mag-graph" width="200" height="60" style="border:1px solid #444; border-radius:2px;"></canvas>
    `;
    container.appendChild(controls);

    // Magnetization graph
    magCanvas = document.getElementById('ising-mag-graph');
    magCtx = magCanvas.getContext('2d');

    // Wire controls
    const slider = document.getElementById('ising-temp-slider');
    const tempDisplay = document.getElementById('ising-temp-display');
    const resetBtn = document.getElementById('ising-reset');

    slider.addEventListener('input', () => {
        const temp = parseFloat(slider.value);
        STATE.isingTemperature = temp;
        tempDisplay.textContent = temp.toFixed(1);
        if (worker) worker.postMessage({ type: 'setTemp', value: temp });
    });

    resetBtn.addEventListener('click', () => {
        magHistory = [];
        if (worker) worker.postMessage({ type: 'reset' });
    });

    // Start worker
    worker = new Worker(new URL('../workers/ising.worker.js', import.meta.url), { type: 'module' });

    worker.onmessage = (e) => {
        if (e.data.type === 'frame') {
            currentGrid = new Uint8Array(e.data.data);
            magHistory.push(e.data.mag);
            if (magHistory.length > 200) magHistory.shift();
            STATE.isingGrid = currentGrid;
            STATE.isingMagnetization = magHistory;
            workerBusy = false;  // Bug fix: mark worker as available for next sweep
        }
    };

    // Start animation loop
    animating = true;
    function render() {
        if (!animating) return;
        
        if (currentGrid) {
            renderGrid(currentGrid);
        }
        
        drawMagGraph(magHistory);
        
        // Bug fix: only post next sweep if worker is not busy
        // This prevents unbounded message queue growth when worker < 60fps
        if (worker && !workerBusy) {
            workerBusy = true;
            worker.postMessage({ type: 'sweep' });
        }
        
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function renderGrid(grid) {
    // Bug fix: reuse ImageData to avoid GC pressure at 60fps
    if (!imageDataCache) {
        imageDataCache = ctx.createImageData(CANVAS_SIZE, CANVAS_SIZE);
    }
    const data = imageDataCache.data;

    for (let i = 0; i < N2; i++) {
        const color = grid[i] === 1 ? [200, 60, 60] : [60, 60, 200]; // Red or Blue
        const px = (i % N) * PIXEL_SIZE;
        const py = Math.floor(i / N) * PIXEL_SIZE;

        for (let dy = 0; dy < PIXEL_SIZE; dy++) {
            for (let dx = 0; dx < PIXEL_SIZE; dx++) {
                const idx = ((px + dx) + (py + dy) * CANVAS_SIZE) * 4;
                data[idx] = color[0];
                data[idx + 1] = color[1];
                data[idx + 2] = color[2];
                data[idx + 3] = 255;
            }
        }
    }

    ctx.putImageData(imageDataCache, 0, 0);
}

function drawMagGraph(history) {
    if (!magCtx) return;
    const w = magCanvas.width;
    const h = magCanvas.height;

    magCtx.clearRect(0, 0, w, h);

    // Background
    magCtx.fillStyle = 'rgba(0,0,0,0.3)';
    magCtx.fillRect(0, 0, w, h);

    if (history.length < 2) return;

    // Draw axes
    magCtx.strokeStyle = '#444';
    magCtx.lineWidth = 1;
    magCtx.beginPath();
    magCtx.moveTo(0, h); magCtx.lineTo(w, h);
    magCtx.moveTo(0, 0); magCtx.lineTo(0, h);
    magCtx.stroke();

    // Draw line
    magCtx.strokeStyle = '#4ade80';
    magCtx.lineWidth = 1.5;
    magCtx.beginPath();

    for (let i = 0; i < history.length; i++) {
        const x = (i / 200) * w;
        const y = (1 - history[i]) * (h - 2);
        i === 0 ? magCtx.moveTo(x, y) : magCtx.lineTo(x, y);
    }
    magCtx.stroke();

    // Labels
    magCtx.fillStyle = '#888';
    magCtx.font = '8px monospace';
    magCtx.fillText('M', 3, 10);
    magCtx.fillText('t', w - 15, h - 3);
}

export function destroyIsingExhibit() {
    initialized = false;
    animating = false;
    if (worker) {
        worker.terminate();
        worker = null;
    }
    const container = document.getElementById('ising-container');
    if (container) {
        container.style.display = 'none';
        container.innerHTML = '';
    }
}