// --- 2D Ising Model Exhibit ---
// Renders 200x200 Monte Carlo simulation using a Web Worker.
// Canvas2D for rendering: 800x800px (4px per spin).
// Red = spin up, Blue = spin down.
// Temperature slider, Energy graph, Autocorrelation graph, reset button.

import { STATE } from '../state.js';

const N = 200;
const N2 = N * N;
const CANVAS_SIZE = 800;
const PIXEL_SIZE = CANVAS_SIZE / N; // 4

let worker = null;
let canvas, ctx, energyCanvas, energyCtx, acfCanvas, acfCtx;
let currentGrid = null;
let energyHistory = [];
let magBuffer = [];
let animating = false;
let initialized = false;
let workerBusy = false;
let imageDataCache = null;

export function initIsingExhibit() {
    if (initialized) return;
    initialized = true;

    const container = document.getElementById('ising-container');
    if (!container) return;
    container.style.display = 'block';

    // Create Layout
    container.innerHTML = `
        <style>
        .ising-modern-layout {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none;
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            overflow: hidden;
        }
        .ising-canvas-target {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            z-index: 1;
            pointer-events: auto;
            background: #000;
        }
        .ising-left-panel {
            position: absolute;
            left: 40px;
            top: 50%;
            transform: translateY(-50%);
            width: 400px;
            max-width: calc(100vw - 80px);
            z-index: 10;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(12px);
            padding: 30px;
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.1);
            pointer-events: auto;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .ising-right-panel {
            position: absolute;
            right: 40px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 10;
            pointer-events: auto;
            display: flex;
            flex-direction: column;
            gap: 40px;
        }
        
        .ising-title {
            font-size: 2rem;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin: 0;
            color: #fff;
        }
        .ising-desc {
            font-size: 1rem;
            color: #ccc;
            line-height: 1.6;
            margin: 0;
        }
        
        .modern-controls {
            display: flex;
            align-items: center;
            gap: 15px;
            background: rgba(255, 255, 255, 0.05);
            padding: 15px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.05);
        }
        .modern-slider {
            flex: 1;
            -webkit-appearance: none;
            height: 4px;
            background: rgba(255,255,255,0.2);
            border-radius: 2px;
            outline: none;
            cursor: pointer;
        }
        .modern-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #fff;
            cursor: pointer;
        }
        
        .telemetry-card {
            background: rgba(15, 15, 15, 0.85);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 16px;
            padding: 24px;
            box-sizing: border-box;
            width: 348px;
            max-width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.8);
            gap: 16px;
        }
        .telemetry-label {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            color: #aaa;
            text-transform: uppercase;
            letter-spacing: 1px;
            align-self: flex-start;
            margin: 0;
        }

        
        @media (max-width: 900px) {
            .ising-left-panel { top: 20px; left: 20px; transform: none; width: calc(100% - 40px); }
            .ising-right-panel { top: auto; bottom: 80px; right: 20px; transform: none; width: calc(100% - 40px); flex-direction: row; flex-wrap: wrap; }
            .telemetry-card { flex: 1; min-width: 150px; }
        }
        </style>
        
        <div class="ising-modern-layout">
            <div class="ising-canvas-target" id="ising-canvas-target"></div>
            
            <div class="ising-left-panel">
                <h1 class="ising-title">SPIN LATTICE</h1>
                <p class="ising-desc">
                    My interest in statistical physics stems from analyzing phase transitions and critical phenomena. Past projects include simulating ferromagnetic and anti-ferromagnetic Ising chains, solving the inverse Ising problem to infer connections in salamander brains, and using tensor networks to find gapless ground states in the quantum XXZ model.
                </p>
                
                <div class="modern-controls">
                    <label style="font-family:'JetBrains Mono'; font-size:12px; color:#aaa; min-width: 40px;">T: <span id="ising-temp-display" style="color:#fff;">3.0</span></label>
                    <input type="range" id="ising-temp-slider" class="modern-slider" min="0.1" max="5.0" step="0.1" value="3.0">
                    <button id="ising-reset" style="background:transparent; border:1px solid #ff4444; color:#ff4444; padding:6px 12px; border-radius:6px; cursor:pointer; font-family:'JetBrains Mono'; font-size:12px; transition: 0.2s;">Reset</button>
                </div>
            </div>
            
            <div class="ising-right-panel">
                <div class="telemetry-card">
                    <span class="telemetry-label">Energy Thermalization</span>
                    <canvas id="ising-energy-graph" width="600" height="400" style="width: 100%; max-width: 300px; aspect-ratio: 3 / 2; display: block; border-radius: 4px;"></canvas>
                </div>
                <div class="telemetry-card">
                    <span class="telemetry-label">Autocorrelation C(τ)</span>
                    <canvas id="ising-acf-graph" width="600" height="400" style="width: 100%; max-width: 300px; aspect-ratio: 3 / 2; display: block; border-radius: 4px;"></canvas>
                </div>
            </div>
        </div>
    `;

    // Create canvas
    const canvasTarget = document.getElementById('ising-canvas-target');
    canvas = document.createElement('canvas');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    canvas.style.cssText = 'width: 100%; height: 100%; object-fit: cover; image-rendering: pixelated; opacity: 0.8;';
    canvasTarget.appendChild(canvas);
    ctx = canvas.getContext('2d');

    // Telemetry graphs
    energyCanvas = document.getElementById('ising-energy-graph');
    energyCtx = energyCanvas.getContext('2d');
    acfCanvas = document.getElementById('ising-acf-graph');
    acfCtx = acfCanvas.getContext('2d');

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
        energyHistory = [];
        magBuffer = [];
        if (worker) worker.postMessage({ type: 'reset' });
    });

    // Start worker
    worker = new Worker(new URL('../workers/ising.worker.js', import.meta.url), { type: 'module' });

    worker.onmessage = (e) => {
        if (e.data.type === 'frame') {
            currentGrid = new Uint8Array(e.data.data);
            
            energyHistory.push(e.data.energy);
            if (energyHistory.length > 200) energyHistory.shift();
            
            magBuffer.push(e.data.mag);
            if (magBuffer.length > 400) magBuffer.shift();

            workerBusy = false;
        }
    };

    // Start animation loop
    animating = true;
    function render() {
        if (!animating) return;
        
        if (currentGrid) renderGrid(currentGrid);
        
        drawEnergyGraph(energyHistory);
        drawAcfGraph(magBuffer);
        
        if (worker && !workerBusy) {
            workerBusy = true;
            worker.postMessage({ type: 'sweep' });
        }
        
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function renderGrid(grid) {
    if (!imageDataCache) {
        imageDataCache = ctx.createImageData(CANVAS_SIZE, CANVAS_SIZE);
    }
    const data = imageDataCache.data;

    for (let i = 0; i < N2; i++) {
        const color = grid[i] === 1 ? [200, 60, 60] : [60, 60, 200];
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

function drawEnergyGraph(history) {
    if (!energyCtx) return;
    const w = energyCanvas.width;
    const h = energyCanvas.height;
    
    const padL = 60, padR = 20, padT = 30, padB = 40;
    const graphW = w - padL - padR;
    const graphH = h - padT - padB;

    energyCtx.clearRect(0, 0, w, h);
    if (history.length < 2) return;

    // Draw Axes
    energyCtx.strokeStyle = 'rgba(255,255,255,0.4)';
    energyCtx.lineWidth = 2;
    energyCtx.beginPath();
    energyCtx.moveTo(padL, padT);
    energyCtx.lineTo(padL, h - padB);
    energyCtx.lineTo(w - padR, h - padB);
    energyCtx.stroke();
    
    // Axis Labels
    energyCtx.fillStyle = '#888';
    energyCtx.font = '16px monospace';
    energyCtx.textAlign = 'right';
    energyCtx.fillText('0', padL - 12, padT + 6);
    energyCtx.fillText('-2', padL - 12, padT + graphH + 6);
    
    energyCtx.textAlign = 'center';
    energyCtx.fillText('Time', padL + graphW/2, h - 15);

    const getY = (e) => padT + graphH - ((e + 2.2) / 2.4) * graphH;

    // Draw zero line
    energyCtx.strokeStyle = 'rgba(255,255,255,0.2)';
    energyCtx.lineWidth = 2;
    energyCtx.beginPath();
    const y0 = getY(0);
    energyCtx.moveTo(padL, y0); energyCtx.lineTo(w - padR, y0);
    energyCtx.stroke();

    // Data Line
    energyCtx.strokeStyle = '#ff4d4d';
    energyCtx.lineWidth = 3;
    energyCtx.beginPath();

    for (let i = 0; i < history.length; i++) {
        const x = padL + (i / 200) * graphW;
        const y = getY(history[i]); 
        i === 0 ? energyCtx.moveTo(x, y) : energyCtx.lineTo(x, y);
    }
    energyCtx.stroke();
    
    // Label last E value
    const lastE = history[history.length-1].toFixed(3);
    energyCtx.fillStyle = '#ff4d4d';
    energyCtx.textAlign = 'right';
    energyCtx.font = 'bold 24px monospace';
    energyCtx.fillText('E=' + lastE, w - padR, padT + 20);
}

function drawAcfGraph(history) {
    if (!acfCtx) return;
    const w = acfCanvas.width;
    const h = acfCanvas.height;
    
    const padL = 60, padR = 20, padT = 30, padB = 40;
    const graphW = w - padL - padR;
    const graphH = h - padT - padB;

    acfCtx.clearRect(0, 0, w, h);
    if (history.length < 50) return;

    const N = history.length;
    const maxLag = Math.min(100, Math.floor(N / 2));
    
    let mean = 0;
    for (let i = 0; i < N; i++) mean += history[i];
    mean /= N;
    
    const acf = [];
    let c0 = 0;
    for (let lag = 0; lag < maxLag; lag++) {
        let sum = 0;
        for (let i = 0; i < N - lag; i++) {
            sum += (history[i] - mean) * (history[i + lag] - mean);
        }
        let c_lag = sum / (N - lag);
        if (lag === 0) c0 = c_lag;
        acf.push(c0 > 1e-6 ? c_lag / c0 : 0);
    }

    // Axes
    acfCtx.strokeStyle = 'rgba(255,255,255,0.4)';
    acfCtx.lineWidth = 2;
    acfCtx.beginPath();
    acfCtx.moveTo(padL, padT);
    acfCtx.lineTo(padL, h - padB);
    acfCtx.lineTo(w - padR, h - padB);
    acfCtx.stroke();
    
    // Labels
    acfCtx.fillStyle = '#888';
    acfCtx.font = '16px monospace';
    acfCtx.textAlign = 'right';
    acfCtx.fillText('1', padL - 12, padT + 6);
    acfCtx.fillText('0', padL - 12, padT + graphH + 6);
    
    acfCtx.textAlign = 'center';
    acfCtx.fillText('Lag (τ)', padL + graphW/2, h - 15);

    // Data Line
    acfCtx.strokeStyle = '#3b82f6';
    acfCtx.lineWidth = 3;
    acfCtx.beginPath();

    for (let i = 0; i < acf.length; i++) {
        const x = padL + (i / maxLag) * graphW;
        const val = Math.max(0, Math.min(1, acf[i]));
        const y = padT + graphH - val * graphH; 
        i === 0 ? acfCtx.moveTo(x, y) : acfCtx.lineTo(x, y);
    }
    acfCtx.stroke();
    
    // Show rough integral of ACF (autocorrelation time tau)
    let tau_int = 0;
    for (let i = 0; i < acf.length; i++) {
        if (acf[i] < 0.05) break; // truncate integral when noise hits
        tau_int += acf[i];
    }
    
    acfCtx.fillStyle = '#3b82f6';
    acfCtx.textAlign = 'right';
    acfCtx.font = 'bold 24px monospace';
    acfCtx.fillText('τ≈' + tau_int.toFixed(1), w - padR, padT + 20);
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