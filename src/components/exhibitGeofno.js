// --- GeoFNO Dual Torus Comparison Exhibit ---
// Loads two 256x256 pressure field binary files and displays them
// on two side-by-side torus meshes with playback controls.

import * as THREE from 'three';
import { STATE } from '../state.js';
import { geofnoScene, geofnoCamera, geofnoRenderer, geofnoControls, initGeofnoRenderer, clearGeofnoRenderer } from '../core/scene.js';
import { createTorusPressureMaterial } from './torusPressureShader.js';

const FRAME_SIZE = 16384; // 128 * 128
const TORUS_R = 1.5;
const TORUS_r = 0.5;
const TORUS_SEGMENTS_RADIAL = 64;
const TORUS_SEGMENTS_TUBULAR = 64;

let gtTexture, predTexture, errorTexture;
let gtTorus, predTorus, errorTorus;
let gtMaterial, predMaterial, errorMaterial;
let sliderEl, playBtn, frameDisplayEl, loadingOverlay;
let initialized = false;
let animFrameId = null;

export async function initGeofnoExhibit() {
    if (initialized) return;
    initialized = true;

    const container = document.getElementById('geofno-container');
    if (!container) return;
    container.style.display = 'block';

    // Init renderer (now async — await OrbitControls import)
    await initGeofnoRenderer(container);

    // Create textures
    const texOptions = {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.RepeatWrapping,
        format: THREE.RedFormat,
        type: THREE.FloatType,
    };

    gtTexture = new THREE.DataTexture(new Float32Array(FRAME_SIZE), 128, 128, THREE.RedFormat, THREE.FloatType);
    gtTexture.needsUpdate = true;
    predTexture = new THREE.DataTexture(new Float32Array(FRAME_SIZE), 128, 128, THREE.RedFormat, THREE.FloatType);
    predTexture.needsUpdate = true;
    errorTexture = new THREE.DataTexture(new Float32Array(FRAME_SIZE), 128, 128, THREE.RedFormat, THREE.FloatType);
    errorTexture.needsUpdate = true;

    // Create materials
    gtMaterial = createTorusPressureMaterial({ intensity: 1.5, gain: 30.0 });
    gtMaterial.uniforms.dataTexture.value = gtTexture;

    predMaterial = createTorusPressureMaterial({ intensity: 1.5, gain: 30.0 });
    predMaterial.uniforms.dataTexture.value = predTexture;

    errorMaterial = createTorusPressureMaterial({ intensity: 2.0, gain: 1.0, isErrorMode: true });
    errorMaterial.uniforms.dataTexture.value = errorTexture;

    // Create torus meshes
    const torusGeo = new THREE.TorusGeometry(TORUS_R, TORUS_r, TORUS_SEGMENTS_RADIAL, TORUS_SEGMENTS_TUBULAR);

    gtTorus = new THREE.Mesh(torusGeo, gtMaterial);
    gtTorus.position.set(-2.2, 0, 0);
    geofnoScene.add(gtTorus);

    predTorus = new THREE.Mesh(torusGeo, predMaterial);
    predTorus.position.set(2.2, 0, 0);
    geofnoScene.add(predTorus);

    // Error PIP: smaller torus below
    const errorGeo = new THREE.TorusGeometry(TORUS_R * 0.5, TORUS_r * 0.5, 64, 64);
    errorTorus = new THREE.Mesh(errorGeo, errorMaterial);
    errorTorus.position.set(0, -2.8, 0);
    geofnoScene.add(errorTorus);

    // Stars background
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 50;
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.6 });
    const stars = new THREE.Points(starsGeo, starsMat);
    geofnoScene.add(stars);

    // Create labels (HTML overlays)
    createLabels(container);

    // Create controls
    createControls(container);

    // Create loading overlay
    createLoadingOverlay(container);

    // Start streaming data
    loadDataStreaming();

    // Load initial frame
    updateFrame(0);
}

function createLabels(container) {
    const labelsHTML = `
        <div class="geofno-label gt-label">Ground Truth</div>
        <div class="geofno-label pred-label">GeoFNO Prediction</div>
        <div class="geofno-label error-label" style="bottom:60px; top:auto; left:50%; transform:translateX(-50%); font-size:10px; color:#ff4444;">Absolute Error</div>
    `;
    const div = document.createElement('div');
    div.innerHTML = labelsHTML;
    div.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:5;';
    container.appendChild(div);
}

function createControls(container) {
    const controlsHTML = `
        <div id="geofno-controls">
            <button id="geofno-play">▶</button>
            <input type="range" id="geofno-slider" min="0" max="496" value="0">
            <span id="geofno-frame-display">Frame 0 / 496</span>
            <div class="geofno-speed-btns">
                <button data-speed="0.5">0.5×</button>
                <button data-speed="1" class="active">1×</button>
                <button data-speed="2">2×</button>
                <button data-speed="4">4×</button>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', controlsHTML);

    // Wire controls
    sliderEl = document.getElementById('geofno-slider');
    playBtn = document.getElementById('geofno-play');
    frameDisplayEl = document.getElementById('geofno-frame-display');

    sliderEl.addEventListener('input', () => {
        STATE.geofnoPlaying = false;
        if (playBtn) playBtn.textContent = '▶';
        STATE.geofnoFrame = parseInt(sliderEl.value);
        updateFrame(STATE.geofnoFrame);
    });

    playBtn.addEventListener('click', () => {
        STATE.geofnoPlaying = !STATE.geofnoPlaying;
        playBtn.textContent = STATE.geofnoPlaying ? '⏸' : '▶';
    });

    document.querySelectorAll('.geofno-speed-btns button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.geofno-speed-btns button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            STATE.geofnoSpeed = parseFloat(btn.dataset.speed);
        });
    });
}

function createLoadingOverlay(container) {
    loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'geofno-loading';
    loadingOverlay.innerHTML = `
        <p style="font-family:'JetBrains Mono'; color:#888; margin-bottom:12px;">Loading Simulation Data...</p>
        <div class="geofno-progress-bar"><div id="gt-progress-fill"></div></div>
        <p id="gt-label" style="font-family:'JetBrains Mono'; font-size:11px; color:#4466ff; margin:4px 0 8px;">GT: 0%</p>
        <div class="geofno-progress-bar"><div id="pred-progress-fill"></div></div>
        <p id="pred-label" style="font-family:'JetBrains Mono'; font-size:11px; color:#44ff66; margin:4px 0 8px;">Pred: 0%</p>
    `;
    container.appendChild(loadingOverlay);
}

async function loadDataStreaming() {
    // Skip if data already loaded (caching on re-entry)
    if (STATE.geofnoGtData && STATE.geofnoPredData) {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        return;
    }

    const urls = [
        '/data/complex_chaos_gt.bin',
        '/data/complex_chaos_pred.bin'
    ];

    await Promise.all(urls.map((url, idx) => loadSingleStream(url, idx)));
    
    // Hide loading overlay
    if (loadingOverlay) loadingOverlay.style.display = 'none';
}

async function loadSingleStream(url, idx) {
    try {
        const response = await fetch(url);
        // Bug fix: check HTTP status before proceeding
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText} for ${url}`);
        }
        if (!response.body) throw new Error("ReadableStream not supported");

        const contentLengthHeader = response.headers.get('Content-Length');
        // Bug fix: compute totalFloats from actual file size, no hardcoded fallback
        const contentLength = contentLengthHeader ? parseInt(contentLengthHeader, 10) : null;
        if (!contentLength || isNaN(contentLength)) {
            throw new Error(`Missing or invalid Content-Length for ${url}`);
        }
        const totalFloats = contentLength / 4;
        const buffer = new Float32Array(totalFloats);
        const reader = response.body.getReader();
        let loadedBytes = 0;

        const progressFill = document.getElementById(idx === 0 ? 'gt-progress-fill' : 'pred-progress-fill');
        const label = document.getElementById(idx === 0 ? 'gt-label' : 'pred-label');

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunkFloats = new Float32Array(value.buffer, value.byteOffset, value.byteLength / 4);
            buffer.set(chunkFloats, loadedBytes / 4);
            loadedBytes += value.byteLength;

            const pct = Math.round((loadedBytes / contentLength) * 100);
            if (progressFill) progressFill.style.width = pct + '%';
            if (label) label.textContent = (idx === 0 ? 'GT: ' : 'Pred: ') + pct + '%';

            // Store partial data so playback can begin before full load
            if (idx === 0) STATE.geofnoGtData = buffer;
            else STATE.geofnoPredData = buffer;
        }

        if (idx === 0) STATE.geofnoGtData = buffer;
        else STATE.geofnoPredData = buffer;

    } catch (err) {
        console.error(`Failed to load ${url}:`, err);
    }
}

export function updateGeofnoFrame(dt) {
    if (!STATE.geofnoPlaying || !STATE.geofnoGtData || !STATE.geofnoPredData) return;

    const advance = dt * 30 * STATE.geofnoSpeed;
    STATE.geofnoFrame = (STATE.geofnoFrame + advance) % STATE.geofnoTotalFrames;
    
    const frame = Math.floor(STATE.geofnoFrame);
    updateFrame(frame);
}

function updateFrame(frame) {
    if (!STATE.geofnoGtData || !STATE.geofnoPredData) return;
    
    const offset = frame * FRAME_SIZE;
    if (offset + FRAME_SIZE > STATE.geofnoGtData.length) return;

    const gtFrame = STATE.geofnoGtData.subarray(offset, offset + FRAME_SIZE);
    const predFrame = STATE.geofnoPredData.subarray(offset, offset + FRAME_SIZE);

    // Compute error frame
    const errorData = errorTexture.image.data;
    let maxError = 0;
    for (let i = 0; i < FRAME_SIZE; i++) {
        const err = Math.abs(predFrame[i] - gtFrame[i]);
        errorData[i] = err;
        if (err > maxError) maxError = err;
    }

    // Update textures
    gtTexture.image.data.set(gtFrame);
    gtTexture.needsUpdate = true;
    predTexture.image.data.set(predFrame);
    predTexture.needsUpdate = true;
    errorTexture.needsUpdate = true;

    // Update gain
    if (maxError > 0) {
        errorMaterial.uniforms.gain.value = 1.0 / maxError;
    }

    // Auto-normalize gain for GT and Pred
    let maxAbs = 0;
    for (let i = 0; i < FRAME_SIZE; i++) {
        const absVal = Math.abs(gtFrame[i]);
        if (absVal > maxAbs) maxAbs = absVal;
    }
    if (maxAbs > 0) gtMaterial.uniforms.gain.value = 1.0 / maxAbs;

    maxAbs = 0;
    for (let i = 0; i < FRAME_SIZE; i++) {
        const absVal = Math.abs(predFrame[i]);
        if (absVal > maxAbs) maxAbs = absVal;
    }
    if (maxAbs > 0) predMaterial.uniforms.gain.value = 1.0 / maxAbs;

    // Update UI
    if (sliderEl) sliderEl.value = frame;
    if (frameDisplayEl) frameDisplayEl.textContent = `Frame ${frame} / 496`;
}

export function destroyGeofnoExhibit() {
    initialized = false;
    const container = document.getElementById('geofno-container');
    if (container) {
        container.style.display = 'none';
        container.innerHTML = '';
    }
    clearGeofnoRenderer();
    // Clear geofnoScene (lights, stars, torus meshes)
    while (geofnoScene.children.length > 0) {
        const child = geofnoScene.children[0];
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
            if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
            else child.material.dispose();
        }
        geofnoScene.remove(child);
    }
}
