import { STATE } from '../state.js';
import * as THREE from 'three';
import { geofnoScene, initGeofnoRenderer, clearGeofnoRenderer } from '../core/scene.js';
import { createTorusPressureMaterial } from './torusPressureShader.js';

// --- GeoFNO Torus Exhibit ---
const TORUS_R = 1.0;
const TORUS_r = 0.4;
const TORUS_SEGMENTS_TUBULAR = 128;
const TORUS_SEGMENTS_RADIAL = 32;

// Data config
const FRAME_SIZE = 128 * 128; 
let gtTexture, predTexture, errorTexture;
let gtTorus, predTorus, errorTorus;
let gtMaterial, predMaterial, errorMaterial;
let sliderEl, playBtn, frameDisplayEl, loadingOverlay;
let initialized = false;
let animFrameId = null;

export async function initGeofnoExhibit() {
    if (initialized) return;
    initialized = true;

    // Initialize state
    if (STATE.geofnoPlaying === undefined) STATE.geofnoPlaying = false;
    if (STATE.geofnoFrame === undefined) STATE.geofnoFrame = 0;
    if (STATE.geofnoSpeed === undefined) STATE.geofnoSpeed = 1.0;

    const container = document.getElementById('geofno-container');
    if (!container) return;
    container.style.display = 'block';

    // Create Modern Layout
    const canvasTarget = createModernLayout(container);

    // Init renderer using the inner target wrapper
    await initGeofnoRenderer(canvasTarget);

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
    Object.assign(gtTexture, texOptions);
    gtTexture.needsUpdate = true;
    
    predTexture = new THREE.DataTexture(new Float32Array(FRAME_SIZE), 128, 128, THREE.RedFormat, THREE.FloatType);
    Object.assign(predTexture, texOptions);
    predTexture.needsUpdate = true;
    
    errorTexture = new THREE.DataTexture(new Float32Array(FRAME_SIZE), 128, 128, THREE.RedFormat, THREE.FloatType);
    Object.assign(errorTexture, texOptions);
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
    errorTorus.position.set(0, -2.1, 0);
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

    // Start streaming data
    loadDataStreaming();

    // Load initial frame
    updateFrame(0);
}

export function createModernLayout(container) {
    container.innerHTML = `
        <style>
        .geofno-modern-layout {
            display: flex;
            flex-direction: column;
            gap: 20px;
            width: 100%;
            height: 100%;
            padding: 40px;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #fff;
            align-items: center;
            justify-content: center;
        }
        
        @media (min-width: 768px) {
            .geofno-modern-layout {
                flex-direction: row;
                gap: 40px;
            }
        }

        .geofno-text-panel {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            max-width: 500px;
        }

        .geofno-title {
            font-size: clamp(2rem, 4vw, 3rem);
            font-weight: 800;
            letter-spacing: -1px;
            margin: 0 0 1rem 0;
            line-height: 1.1;
        }

        .geofno-desc {
            font-size: 1.1rem;
            color: #8888aa;
            line-height: 1.6;
            margin: 0 0 2rem 0;
        }

        .geofno-link {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 12px 24px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 30px;
            color: #fff;
            text-decoration: none;
            font-weight: 600;
            font-size: 0.9rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid rgba(255,255,255,0.2);
            width: fit-content;
            margin-bottom: 3rem;
            backdrop-filter: blur(10px);
        }

        .geofno-link:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }

        .geofno-3d-wrapper {
            flex: 1.5;
            height: 100%;
            max-height: 600px;
            border-radius: 24px;
            background: #050510;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        
        .geofno-canvas-target {
            flex: 1;
            width: 100%;
            height: 100%;
            position: relative;
        }

        .modern-controls {
            display: flex;
            align-items: center;
            gap: 15px;
            background: rgba(255,255,255,0.05);
            padding: 15px 25px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
        }

        .modern-play-btn {
            background: #fff;
            color: #000;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 16px;
            transition: transform 0.2s;
        }
        .modern-play-btn:hover {
            transform: scale(1.1);
        }

        .modern-slider {
            flex: 1;
            -webkit-appearance: none;
            height: 4px;
            background: rgba(255,255,255,0.2);
            border-radius: 2px;
            outline: none;
        }
        .modern-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #fff;
            cursor: pointer;
        }

        .modern-frame-display {
            font-variant-numeric: tabular-nums;
            font-size: 0.85rem;
            color: #8888aa;
            min-width: 60px;
            text-align: right;
        }

        .modern-labels-top {
            position: absolute;
            top: 30px;
            left: 0;
            width: 100%;
            display: flex;
            justify-content: space-evenly;
            pointer-events: none;
        }

        .modern-labels-error {
            position: absolute;
            top: 72%;
            left: 0;
            width: 100%;
            display: flex;
            justify-content: center;
            pointer-events: none;
        }

        .modern-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
            color: rgba(255,255,255,0.7);
        }

        #geofno-loading {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(5,5,16,0.8);
            backdrop-filter: blur(5px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 100;
            border-radius: 24px;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        </style>
        
        <div class="geofno-modern-layout">
            <div class="geofno-text-panel">
                <h1 class="geofno-title">NOMAD Geo-FNO</h1>
                <p class="geofno-desc">
                    A fully data driven Scientific Machine Learning (SciML) pipeline designed to formally simulate and predict acoustic wave propagation on a closed toroidal manifold (T²) utilizing a Geometry-Aware Fourier Neural Operator.
                </p>
                <a href="https://github.com/ravenwit/NOMAD" target="_blank" class="geofno-link">
                    View on GitHub ↗
                </a>

                <div class="modern-controls">
                    <button id="geofno-play" class="modern-play-btn">▶</button>
                    <input type="range" id="geofno-slider" class="modern-slider" min="0" max="496" value="0">
                    <span id="geofno-frame-display" class="modern-frame-display">0 / 0</span>
                </div>
            </div>
            
            <div class="geofno-3d-wrapper">
                <div id="geofno-canvas-target" class="geofno-canvas-target"></div>
                <div class="modern-labels-top">
                    <div class="modern-label">Ground Truth</div>
                    <div class="modern-label">Prediction</div>
                </div>
                <div class="modern-labels-error">
                    <div class="modern-label">Error</div>
                </div>
            </div>
        </div>
    `;

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
    
    loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'geofno-loading';
    loadingOverlay.style.position = "absolute";
    loadingOverlay.style.top = "0";
    loadingOverlay.style.left = "0";
    loadingOverlay.style.width = "100%";
    loadingOverlay.style.height = "100%";
    loadingOverlay.style.display = "flex";
    loadingOverlay.style.flexDirection = "column";
    loadingOverlay.style.alignItems = "center";
    loadingOverlay.style.justifyContent = "center";
    loadingOverlay.style.background = "radial-gradient(circle at center, rgba(30,30,50,0.9) 0%, rgba(5,5,16,0.95) 100%)";
    loadingOverlay.style.zIndex = "10";
    loadingOverlay.style.backdropFilter = "blur(12px)";
    loadingOverlay.style.transition = "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)";

    loadingOverlay.innerHTML = `
        <style>
        .loading-ring {
            width: 48px;
            height: 48px;
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top: 3px solid #fff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 24px;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .geofno-loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            background: rgba(255, 255, 255, 0.03);
            padding: 40px;
            border-radius: 24px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 20px 40px rgba(0,0,0,0.3), inset 0 0 20px rgba(255,255,255,0.02);
        }
        .geofno-loading-text {
            color: #fff; 
            font-size: 1.1rem; 
            font-weight: 500; 
            letter-spacing: 0.5px;
            margin-bottom: 20px;
            text-align: center;
        }
        .geofno-loading-bar-wrapper {
            width: 240px; 
            height: 6px; 
            background: rgba(255,255,255,0.1); 
            border-radius: 3px; 
            overflow: hidden;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
            position: relative;
        }
        #geofno-loading-fill {
            width: 0%; 
            height: 100%; 
            background: linear-gradient(90deg, #4A90E2, #50E3C2);
            border-radius: 3px;
            transition: width 0.15s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 0 10px rgba(80,227,194,0.5);
        }
        </style>
        <div class="geofno-loading-container">
            <div class="loading-ring"></div>
            <div class="geofno-loading-text">Loading Manifold Topology</div>
            <div class="geofno-loading-bar-wrapper">
                <div id="geofno-loading-fill"></div>
            </div>
        </div>
    `;
    const wrapper = document.querySelector('.geofno-3d-wrapper');
    if (wrapper) wrapper.appendChild(loadingOverlay);
    
    return document.getElementById('geofno-canvas-target');
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

    // Force initial frame render now that data is loaded
    if (!STATE.geofnoPlaying) {
        updateFrame(STATE.geofnoFrame || 0);
    }
}

async function loadSingleStream(url, idx) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText} for ${url}`);
        }
        if (!response.body) throw new Error("ReadableStream not supported");

        const contentLengthHeader = response.headers.get('Content-Length');
        const contentLength = contentLengthHeader ? parseInt(contentLengthHeader, 10) : null;
        if (!contentLength || isNaN(contentLength)) {
            throw new Error(`Missing or invalid Content-Length for ${url}`);
        }
        const totalFloats = contentLength / 4;
        const buffer = new Float32Array(totalFloats);
        const reader = response.body.getReader();
        let loadedBytes = 0;

        const progressFill = document.getElementById('geofno-loading-fill');

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunkFloats = new Float32Array(value.buffer, value.byteOffset, value.byteLength / 4);
            buffer.set(chunkFloats, loadedBytes / 4);
            loadedBytes += value.byteLength;

            const pct = Math.round((loadedBytes / contentLength) * 100);
            
            // Just update the main single bar for whichever stream finishes last/updates most often
            if (progressFill) {
                progressFill.style.width = pct + '%';
            }
        }

        if (idx === 0) {
            STATE.geofnoGtData = buffer;
        } else {
            STATE.geofnoPredData = buffer;
        }

        // Dynamically compute total frames based on loaded buffer size
        if (STATE.geofnoGtData && STATE.geofnoPredData) {
            const minFloats = Math.min(STATE.geofnoGtData.length, STATE.geofnoPredData.length);
            STATE.geofnoTotalFrames = Math.floor(minFloats / FRAME_SIZE);
            if (sliderEl) {
                sliderEl.max = Math.max(0, STATE.geofnoTotalFrames - 1);
            }
            if (frameDisplayEl) {
                frameDisplayEl.textContent = `${STATE.geofnoFrame} / ${STATE.geofnoTotalFrames - 1}`;
            }
        }

    } catch (err) {
        console.error("Geofno data stream error:", err);
    }
}
export function updateGeofnoFrame(dt) {
    if (!STATE.geofnoPlaying || !STATE.geofnoGtData || !STATE.geofnoPredData) return;

    STATE.geofnoTotalFrames = Math.floor(STATE.geofnoGtData.length / FRAME_SIZE);
    
    if (STATE.geofnoTotalFrames <= 0) return;

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
    const totalFrames = Math.floor(STATE.geofnoGtData.length / FRAME_SIZE);
    if (sliderEl) sliderEl.value = frame;
    if (frameDisplayEl) frameDisplayEl.textContent = `Frame ${frame} / ${totalFrames}`;
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
